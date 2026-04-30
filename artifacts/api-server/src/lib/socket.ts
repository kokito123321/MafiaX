import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { eq, and } from "drizzle-orm";
import {
  db,
  roomMembersTable,
  roomsTable,
  usersTable,
  messagesTable,
} from "@workspace/db";
import { getUserBySession } from "./auth";
import { logger } from "./logger";

export interface ServerToClientEvents {
  "room:state": (state: RoomState) => void;
  "room:message": (message: ChatMessage) => void;
  "room:kicked": (payload: { reason?: string }) => void;
}

export interface ClientToServerEvents {
  "room:join": (
    payload: { roomId: string },
    cb: (resp: { ok: boolean; error?: string; state?: RoomState }) => void,
  ) => void;
  "room:leave": (payload: { roomId: string }) => void;
  "room:send": (
    payload: { roomId: string; text: string },
    cb: (resp: { ok: boolean; error?: string }) => void,
  ) => void;
}

export interface SeatOccupant {
  userId: string;
  name: string;
  avatar: string | null;
  seatNumber: number;
  isMuted: boolean;
  isBlocked: boolean;
  hasCamera: boolean;
  hasMic: boolean;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  status: string;
  capacity: number;
  occupants: SeatOccupant[];
}

export interface ChatMessage {
  id: number;
  roomId: string;
  userId: string | null;
  authorName: string;
  text: string;
  isSystem: boolean;
  createdAt: string;
}

export type IO = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

let ioInstance: IO | null = null;

export function getIO(): IO {
  if (!ioInstance) throw new Error("socket.io not initialized");
  return ioInstance;
}

export async function buildRoomState(roomId: string): Promise<RoomState | null> {
  const roomRows = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, roomId))
    .limit(1);
  const room = roomRows[0];
  if (!room) return null;
  const memberRows = await db
    .select({
      userId: roomMembersTable.userId,
      name: usersTable.name,
      avatar: usersTable.avatar,
      seatNumber: roomMembersTable.seatNumber,
      isMuted: roomMembersTable.isMuted,
      isBlocked: roomMembersTable.isBlocked,
      hasCamera: roomMembersTable.hasCamera,
      hasMic: roomMembersTable.hasMic,
    })
    .from(roomMembersTable)
    .innerJoin(usersTable, eq(usersTable.id, roomMembersTable.userId))
    .where(eq(roomMembersTable.roomId, roomId));
  return {
    roomId: room.id,
    hostId: room.hostId,
    status: room.status,
    capacity: room.capacity,
    occupants: memberRows,
  };
}

export async function broadcastRoomState(roomId: string): Promise<void> {
  if (!ioInstance) return;
  const state = await buildRoomState(roomId);
  if (state) ioInstance.to(`room:${roomId}`).emit("room:state", state);
}

export async function broadcastSystemMessage(
  roomId: string,
  text: string,
): Promise<void> {
  const [row] = await db
    .insert(messagesTable)
    .values({ roomId, userId: null, authorName: "system", text, isSystem: true })
    .returning();
  if (row && ioInstance) {
    ioInstance.to(`room:${roomId}`).emit("room:message", {
      id: row.id,
      roomId: row.roomId,
      userId: null,
      authorName: row.authorName,
      text: row.text,
      isSystem: row.isSystem,
      createdAt: row.createdAt.toISOString(),
    });
  }
}

export function kickUser(roomId: string, userId: string, reason?: string): void {
  if (!ioInstance) return;
  // Notify all sockets in the user-room and force them to leave the channel
  const room = ioInstance.sockets.adapter.rooms.get(`user:${userId}`);
  if (!room) return;
  for (const socketId of room) {
    const sock = ioInstance.sockets.sockets.get(socketId);
    if (sock) {
      sock.emit("room:kicked", { reason });
      sock.leave(`room:${roomId}`);
    }
  }
}

interface SocketData {
  userId?: string;
  joinedRooms: Set<string>;
}

export function initSocket(httpServer: HttpServer): IO {
  const io: IO = new SocketIOServer(httpServer, {
    path: "/api/socket.io",
    cors: { origin: true, credentials: true },
  });

  io.use(async (socket: Socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.["token"] as string | undefined) ??
        (socket.handshake.query?.["token"] as string | undefined);
      if (!token) return next(new Error("unauthorized"));
      const user = await getUserBySession(token);
      if (!user) return next(new Error("unauthorized"));
      const data = socket.data as SocketData;
      data.userId = user.id;
      data.joinedRooms = new Set();
      next();
    } catch (err) {
      logger.error({ err }, "socket auth error");
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const data = socket.data as SocketData;
    if (!data.userId) {
      socket.disconnect();
      return;
    }
    socket.join(`user:${data.userId}`);

    socket.on("room:join", async ({ roomId }, cb) => {
      try {
        const member = await db
          .select()
          .from(roomMembersTable)
          .where(
            and(
              eq(roomMembersTable.roomId, roomId),
              eq(roomMembersTable.userId, data.userId!),
            ),
          )
          .limit(1);
        if (member.length === 0) {
          cb?.({ ok: false, error: "not_a_member" });
          return;
        }
        socket.join(`room:${roomId}`);
        data.joinedRooms.add(roomId);
        const state = await buildRoomState(roomId);
        cb?.({ ok: true, state: state ?? undefined });
        await broadcastRoomState(roomId);
      } catch (err) {
        logger.error({ err }, "room:join failed");
        cb?.({ ok: false, error: "internal" });
      }
    });

    socket.on("room:leave", async ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      data.joinedRooms.delete(roomId);
    });

    socket.on("room:send", async ({ roomId, text }, cb) => {
      try {
        if (!text || typeof text !== "string") {
          cb?.({ ok: false, error: "empty" });
          return;
        }
        const trimmed = text.trim().slice(0, 500);
        if (!trimmed) {
          cb?.({ ok: false, error: "empty" });
          return;
        }
        const member = await db
          .select({ blocked: roomMembersTable.isBlocked })
          .from(roomMembersTable)
          .where(
            and(
              eq(roomMembersTable.roomId, roomId),
              eq(roomMembersTable.userId, data.userId!),
            ),
          )
          .limit(1);
        if (member.length === 0) {
          cb?.({ ok: false, error: "not_a_member" });
          return;
        }
        if (member[0]!.blocked) {
          cb?.({ ok: false, error: "blocked" });
          return;
        }
        const userRows = await db
          .select({ name: usersTable.name })
          .from(usersTable)
          .where(eq(usersTable.id, data.userId!))
          .limit(1);
        const authorName = userRows[0]?.name ?? "Unknown";
        const [row] = await db
          .insert(messagesTable)
          .values({
            roomId,
            userId: data.userId!,
            authorName,
            text: trimmed,
            isSystem: false,
          })
          .returning();
        if (row) {
          io.to(`room:${roomId}`).emit("room:message", {
            id: row.id,
            roomId: row.roomId,
            userId: row.userId,
            authorName: row.authorName,
            text: row.text,
            isSystem: row.isSystem,
            createdAt: row.createdAt.toISOString(),
          });
        }
        cb?.({ ok: true });
      } catch (err) {
        logger.error({ err }, "room:send failed");
        cb?.({ ok: false, error: "internal" });
      }
    });

    socket.on("disconnect", () => {
      data.joinedRooms.clear();
    });
  });

  ioInstance = io;
  return io;
}
