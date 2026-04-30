import type { Request, Response, NextFunction } from "express";
import type { User } from "@workspace/db";
import { getUserBySession } from "../lib/auth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      sessionToken?: string;
    }
  }
}

export function getTokenFromReq(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const cookieToken = req.cookies?.["mafia_session"];
  if (cookieToken) return cookieToken;
  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = getTokenFromReq(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const user = await getUserBySession(token);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: "banned" });
    return;
  }
  req.user = user;
  req.sessionToken = token;
  next();
}
