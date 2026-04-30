import { pgTable, text, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { roomsTable } from "./rooms";

export const roomMembersTable = pgTable(
  "room_members",
  {
    roomId: text("room_id")
      .notNull()
      .references(() => roomsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    seatNumber: integer("seat_number").notNull(),
    isMuted: boolean("is_muted").notNull().default(false),
    isBlocked: boolean("is_blocked").notNull().default(false),
    hasCamera: boolean("has_camera").notNull().default(true),
    hasMic: boolean("has_mic").notNull().default(true),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roomId, t.userId] })],
);

export type RoomMember = typeof roomMembersTable.$inferSelect;
