import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { eq, and, gt } from "drizzle-orm";
import { db, sessionsTable, usersTable, type User, type PublicUser } from "@workspace/db";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export function publicUser(user: User): PublicUser {
  const { passwordHash: _drop, ...rest } = user;
  return rest;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({ token, userId, expiresAt });
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}

export async function getUserBySession(token: string): Promise<User | null> {
  const rows = await db
    .select({ user: usersTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export function newUserId(): string {
  return nanoid(16);
}
