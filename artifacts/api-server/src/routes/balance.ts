import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { publicUser } from "../lib/auth";

const router: IRouter = Router();

router.use(requireAuth);

router.post("/topup", async (req, res) => {
  const parsed = z
    .object({ amount: z.number().int().positive().max(100_000) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }
  const me = req.user!;
  const [updated] = await db
    .update(usersTable)
    .set({ balance: me.balance + parsed.data.amount })
    .where(eq(usersTable.id, me.id))
    .returning();
  res.json({ user: publicUser(updated!) });
});

export default router;
