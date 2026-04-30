import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const roomsTable = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hostId: text("host_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  isPrivate: boolean("is_private").notNull().default(false),
  password: text("password"),
  capacity: integer("capacity").notNull().default(11),
  status: text("status").notNull().default("waiting"),
  livekitRoom: text("livekit_room").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Room = typeof roomsTable.$inferSelect;
