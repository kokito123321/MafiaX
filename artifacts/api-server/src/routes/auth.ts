import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  publicUser,
  newUserId,
} from "../lib/auth";
import { requireAuth, getTokenFromReq } from "../middlewares/requireAuth";

const router: IRouter = Router();

const emailSchema = z.string().email().max(200);
const passwordSchema = z.string().min(6).max(200);
const nameSchema = z.string().min(1).max(50);

const REGISTRATION_GIFT = 200;

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 30,
};

router.post("/register", async (req, res) => {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema, name: nameSchema })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }
  const { email, password, name } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "email_in_use" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      id: newUserId(),
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      balance: REGISTRATION_GIFT,
    })
    .returning();
  if (!user) {
    res.status(500).json({ error: "create_failed" });
    return;
  }
  const token = await createSession(user.id);
  res.cookie("mafia_session", token, cookieOpts);
  res.json({ user: publicUser(user), token, gift: REGISTRATION_GIFT });
});

router.post("/login", async (req, res) => {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  const user = rows[0];
  if (!user) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: "banned" });
    return;
  }
  const token = await createSession(user.id);
  res.cookie("mafia_session", token, cookieOpts);
  res.json({ user: publicUser(user), token });
});

router.post("/logout", async (req, res) => {
  const token = getTokenFromReq(req);
  if (token) await deleteSession(token);
  res.clearCookie("mafia_session", { path: "/" });
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user!) });
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      name: nameSchema.optional(),
      avatar: z.string().max(500_000).nullable().optional(),
      balance: z.number().int().min(0).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }
  const { name, avatar, balance } = parsed.data;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update["name"] = name.trim();
  if (avatar !== undefined) update["avatar"] = avatar;
  if (balance !== undefined) update["balance"] = balance;
  if (Object.keys(update).length === 0) {
    res.json({ user: publicUser(req.user!) });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set(update)
    .where(eq(usersTable.id, req.user!.id))
    .returning();
  res.json({ user: publicUser(updated!) });
});

export default router;
