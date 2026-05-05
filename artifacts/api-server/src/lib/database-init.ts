import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    
    // Check if tables exist and create them if needed
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = result.rows.map((row: any) => row.table_name);
    console.log("Existing tables:", existingTables);
    
    if (existingTables.length === 0) {
      console.log("No tables found, creating schema...");
      // Run migration if no tables exist
      await runMigrations();
    } else {
      console.log("Database tables already exist");
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

async function runMigrations() {
  // Create tables in correct order
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      balance INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      is_banned BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      host_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_private BOOLEAN NOT NULL DEFAULT FALSE,
      password TEXT,
      capacity INTEGER NOT NULL DEFAULT 11,
      status TEXT NOT NULL DEFAULT 'waiting',
      livekit_room TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS room_members (
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seat_number INTEGER NOT NULL,
      is_muted BOOLEAN NOT NULL DEFAULT FALSE,
      is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
      has_camera BOOLEAN NOT NULL DEFAULT TRUE,
      has_mic BOOLEAN NOT NULL DEFAULT TRUE,
      joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      PRIMARY KEY (room_id, user_id)
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      text TEXT NOT NULL,
      is_system BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Create indexes
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)`);

  console.log("Database migrations completed");
}
