import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  db,
  roomsTable,
  roomMembersTable,
  usersTable,
  messagesTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  buildRoomState,
  broadcastRoomState,
  broadcastSystemMessage,
  kickUser,
  getIO,
} from "../lib/socket";
import { createLiveKitToken, getLiveKitUrl } from "../lib/livekit";

const router: IRouter = Router();

const ROOM_ENTRY_FEE = 10;
const ROOM_CAPACITY = 11;

router.use(requireAuth);

router.get("/", async (_req, res) => {
  const rows = await db
    .select({
      id: roomsTable.id,
      name: roomsTable.name,
      hostId: roomsTable.hostId,
      isPrivate: roomsTable.isPrivate,
      capacity: roomsTable.capacity,
      status: roomsTable.status,
      createdAt: roomsTable.createdAt,
      hostName: usersTable.name,
      memberCount: sql<number>`COALESCE((SELECT COUNT(*)::int FROM ${roomMembersTable} m WHERE m.room_id = ${roomsTable.id}), 0)`,
    })
    .from(roomsTable)
    .innerJoin(usersTable, eq(usersTable.id, roomsTable.hostId))
    .orderBy(desc(roomsTable.createdAt));
  res.json({
    rooms: rows.map((r) => ({
      id: r.id,
      name: r.name,
      hostId: r.hostId,
      hostName: r.hostName,
      isPrivate: r.isPrivate,
      capacity: r.capacity,
      memberCount: r.memberCount,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

router.post("/", async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(1).max(80),
      isPrivate: z.boolean().optional(),
      password: z.string().max(40).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }
  const me = req.user!;
  if (me.balance < ROOM_ENTRY_FEE) {
    res.status(402).json({ error: "insufficient_balance" });
    return;
  }
  const id = nanoid(12);
  const livekitRoom = `mafia-${id}`;
  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ balance: me.balance - ROOM_ENTRY_FEE })
      .where(eq(usersTable.id, me.id));
    await tx.insert(roomsTable).values({
      id,
      name: parsed.data.name.trim(),
      hostId: me.id,
      isPrivate: parsed.data.isPrivate ?? false,
      password: parsed.data.password ?? null,
      capacity: ROOM_CAPACITY,
      livekitRoom,
    });
    await tx.insert(roomMembersTable).values({
      roomId: id,
      userId: me.id,
      seatNumber: 1,
    });
    await tx.insert(messagesTable).values({
      roomId: id,
      authorName: "system",
      text: `${me.name} created the room`,
      isSystem: true,
    });
  });
  res.json({ roomId: id });
});

router.get("/:id", async (req, res) => {
  const state = await buildRoomState(req.params.id);
  if (!state) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ state });
});

router.get("/:id/messages", async (req, res) => {
  const member = await db
    .select()
    .from(roomMembersTable)
    .where(
      and(
        eq(roomMembersTable.roomId, req.params.id),
        eq(roomMembersTable.userId, req.user!.id),
      ),
    )
    .limit(1);
  if (member.length === 0) {
    res.status(403).json({ error: "not_a_member" });
    return;
  }
  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.roomId, req.params.id))
    .orderBy(messagesTable.id)
    .limit(200);
  res.json({
    messages: rows.map((m) => ({
      id: m.id,
      roomId: m.roomId,
      userId: m.userId,
      authorName: m.authorName,
      text: m.text,
      isSystem: m.isSystem,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

router.post("/:id/join", async (req, res) => {
  const parsed = z
    .object({
      password: z.string().max(40).optional(),
      seatNumber: z.number().int().min(1).max(ROOM_CAPACITY).optional(),
      hasCamera: z.boolean().optional(),
      hasMic: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }
  const roomId = req.params.id;
  const me = req.user!;
  const roomRows = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, roomId))
    .limit(1);
  const room = roomRows[0];
  if (!room) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (room.isPrivate && room.password && room.password !== parsed.data.password) {
    res.status(401).json({ error: "wrong_password" });
    return;
  }
  const existing = await db
    .select()
    .from(roomMembersTable)
    .where(eq(roomMembersTable.roomId, roomId));
  const alreadyIn = existing.find((m) => m.userId === me.id);
  if (alreadyIn) {
    res.json({ ok: true, seatNumber: alreadyIn.seatNumber });
    return;
  }
  if (existing.length >= room.capacity) {
    res.status(409).json({ error: "room_full" });
    return;
  }
  if (me.balance < ROOM_ENTRY_FEE) {
    res.status(402).json({ error: "insufficient_balance" });
    return;
  }
  const occupied = new Set(existing.map((m) => m.seatNumber));
  let seat = parsed.data.seatNumber;
  if (!seat || occupied.has(seat)) {
    for (let i = 1; i <= room.capacity; i += 1) {
      if (!occupied.has(i)) {
        seat = i;
        break;
      }
    }
  }
  if (!seat) {
    res.status(409).json({ error: "room_full" });
    return;
  }
  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ balance: me.balance - ROOM_ENTRY_FEE })
      .where(eq(usersTable.id, me.id));
    await tx.insert(roomMembersTable).values({
      roomId,
      userId: me.id,
      seatNumber: seat!,
      hasCamera: parsed.data.hasCamera ?? true,
      hasMic: parsed.data.hasMic ?? true,
    });
  });
  await broadcastSystemMessage(roomId, `${me.name} joined the room`);
  await broadcastRoomState(roomId);
  res.json({ ok: true, seatNumber: seat });
});

router.post("/:id/leave", async (req, res) => {
  const roomId = req.params.id;
  const me = req.user!;
  const roomRows = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, roomId))
    .limit(1);
  const room = roomRows[0];
  if (!room) {
    res.json({ ok: true });
    return;
  }
  await db
    .delete(roomMembersTable)
    .where(
      and(eq(roomMembersTable.roomId, roomId), eq(roomMembersTable.userId, me.id)),
    );
  // If host leaves, delete the entire room
  if (room.hostId === me.id) {
    // Kick everyone via socket
    const remaining = await db
      .select({ userId: roomMembersTable.userId })
      .from(roomMembersTable)
      .where(eq(roomMembersTable.roomId, roomId));
    for (const r of remaining) {
      kickUser(roomId, r.userId, "host_left");
    }
    await db.delete(roomsTable).where(eq(roomsTable.id, roomId));
    try {
      getIO().to(`room:${roomId}`).emit("room:kicked", { reason: "host_left" });
    } catch {
      // socket not initialized in tests
    }
  } else {
    await broadcastSystemMessage(roomId, `${me.name} left the room`);
    await broadcastRoomState(roomId);
  }
  res.json({ ok: true });
});

router.post("/:id/livekit-token", async (req, res) => {
  const roomId = req.params.id;
  const me = req.user!;
  const roomRows = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, roomId))
    .limit(1);
  const room = roomRows[0];
  if (!room) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const memberRows = await db
    .select()
    .from(roomMembersTable)
    .where(
      and(eq(roomMembersTable.roomId, roomId), eq(roomMembersTable.userId, me.id)),
    )
    .limit(1);
  const member = memberRows[0];
  if (!member) {
    res.status(403).json({ error: "not_a_member" });
    return;
  }
  const canPublish = !member.isBlocked;
  const token = await createLiveKitToken({
    identity: me.id,
    name: me.name,
    roomName: room.livekitRoom,
    canPublish,
    canSubscribe: true,
  });
  res.json({ token, url: getLiveKitUrl(), roomName: room.livekitRoom });
});

const moderateAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("kick"), targetUserId: z.string() }),
  z.object({ action: z.literal("mute"), targetUserId: z.string() }),
  z.object({ action: z.literal("unmute"), targetUserId: z.string() }),
  z.object({ action: z.literal("block"), targetUserId: z.string() }),
  z.object({ action: z.literal("unblock"), targetUserId: z.string() }),
  z.object({ action: z.literal("ban"), targetUserId: z.string() }),
  z.object({
    action: z.literal("swap"),
    fromUserId: z.string(),
    toUserId: z.string(),
  }),
]);

router.post("/:id/moderate", async (req, res) => {
  const parsed = moderateAction.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }
  const roomId = req.params.id;
  const me = req.user!;
  const roomRows = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, roomId))
    .limit(1);
  const room = roomRows[0];
  if (!room) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (room.hostId !== me.id && parsed.data.action !== "swap") {
    res.status(403).json({ error: "host_only" });
    return;
  }
  const action = parsed.data.action;
  if (action === "kick") {
    await db
      .delete(roomMembersTable)
      .where(
        and(
          eq(roomMembersTable.roomId, roomId),
          eq(roomMembersTable.userId, parsed.data.targetUserId),
        ),
      );
    kickUser(roomId, parsed.data.targetUserId, "kicked");
    await broadcastSystemMessage(roomId, `Player kicked by host`);
  } else if (action === "mute" || action === "unmute") {
    await db
      .update(roomMembersTable)
      .set({ isMuted: action === "mute" })
      .where(
        and(
          eq(roomMembersTable.roomId, roomId),
          eq(roomMembersTable.userId, parsed.data.targetUserId),
        ),
      );
    await broadcastSystemMessage(
      roomId,
      action === "mute" ? "Player muted" : "Player unmuted",
    );
  } else if (action === "block" || action === "unblock") {
    await db
      .update(roomMembersTable)
      .set({ isBlocked: action === "block" })
      .where(
        and(
          eq(roomMembersTable.roomId, roomId),
          eq(roomMembersTable.userId, parsed.data.targetUserId),
        ),
      );
    await broadcastSystemMessage(
      roomId,
      action === "block" ? "Player blocked" : "Player unblocked",
    );
  } else if (action === "ban") {
    await db
      .update(usersTable)
      .set({ isBanned: true })
      .where(eq(usersTable.id, parsed.data.targetUserId));
    await db
      .delete(roomMembersTable)
      .where(
        and(
          eq(roomMembersTable.roomId, roomId),
          eq(roomMembersTable.userId, parsed.data.targetUserId),
        ),
      );
    kickUser(roomId, parsed.data.targetUserId, "banned");
    await broadcastSystemMessage(roomId, `Player banned by host`);
  } else if (action === "swap") {
    // Swap two seat numbers (anyone in the room can request a swap they're part of)
    if (
      parsed.data.fromUserId !== me.id &&
      parsed.data.toUserId !== me.id &&
      room.hostId !== me.id
    ) {
      res.status(403).json({ error: "not_allowed" });
      return;
    }
    const members = await db
      .select()
      .from(roomMembersTable)
      .where(eq(roomMembersTable.roomId, roomId));
    const a = members.find((m) => m.userId === parsed.data.fromUserId);
    const b = members.find((m) => m.userId === parsed.data.toUserId);
    if (!a || !b) {
      res.status(404).json({ error: "members_not_found" });
      return;
    }
    await db.transaction(async (tx) => {
      // Use a temporary seat to avoid PK conflicts
      await tx
        .update(roomMembersTable)
        .set({ seatNumber: -1 })
        .where(
          and(
            eq(roomMembersTable.roomId, roomId),
            eq(roomMembersTable.userId, a.userId),
          ),
        );
      await tx
        .update(roomMembersTable)
        .set({ seatNumber: a.seatNumber })
        .where(
          and(
            eq(roomMembersTable.roomId, roomId),
            eq(roomMembersTable.userId, b.userId),
          ),
        );
      await tx
        .update(roomMembersTable)
        .set({ seatNumber: b.seatNumber })
        .where(
          and(
            eq(roomMembersTable.roomId, roomId),
            eq(roomMembersTable.userId, a.userId),
          ),
        );
    });
    await broadcastSystemMessage(roomId, `Players swapped seats`);
  }
  await broadcastRoomState(roomId);
  res.json({ ok: true });
});

export default router;
