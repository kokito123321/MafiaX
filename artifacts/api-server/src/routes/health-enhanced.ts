import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Basic health check
router.get("/", async (req, res) => {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: "connected",
        livekit: process.env.LIVEKIT_URL ? "configured" : "not_configured"
      }
    });
  } catch (error) {
    logger.error({ error }, "Health check failed");
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Database health check
router.get("/database", async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT COUNT(*) as total_users FROM users
    `);
    
    const roomCount = await db.execute(sql`
      SELECT COUNT(*) as total_rooms FROM rooms
    `);
    
    res.json({
      status: "healthy",
      database: "connected",
      stats: {
        users: parseInt(result.rows[0]?.total_users || "0"),
        rooms: parseInt(roomCount.rows[0]?.total_rooms || "0")
      }
    });
  } catch (error) {
    logger.error({ error }, "Database health check failed");
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// LiveKit health check
router.get("/livekit", async (req, res) => {
  try {
    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    
    if (!livekitUrl || !apiKey) {
      return res.status(503).json({
        status: "unhealthy",
        livekit: "not_configured",
        error: "LiveKit credentials not set"
      });
    }
    
    // Test LiveKit connectivity (simple ping)
    const response = await fetch(`${livekitUrl}/health`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      res.json({
        status: "healthy",
        livekit: "connected",
        url: livekitUrl
      });
    } else {
      res.status(503).json({
        status: "unhealthy",
        livekit: "disconnected",
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    logger.error({ error }, "LiveKit health check failed");
    res.status(503).json({
      status: "unhealthy",
      livekit: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
