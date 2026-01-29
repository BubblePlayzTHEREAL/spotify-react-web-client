import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || './data/auth.db';
const dbDir = path.dirname(DB_PATH);

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  // Settings table for storing admin setup status, tokens, and password
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Guest sessions table for tracking authenticated guests
  db.exec(`
    CREATE TABLE IF NOT EXISTS guest_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_guest_sessions_token 
    ON guest_sessions(session_token)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires 
    ON guest_sessions(expires_at)
  `);

  console.log('Database initialized successfully');
}

// Settings operations
export const settingsDb = {
  get: (key: string): string | undefined => {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    return row?.value;
  },

  set: (key: string, value: string): void => {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) 
      DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(key, value, value);
  },

  delete: (key: string): void => {
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
    stmt.run(key);
  },

  exists: (key: string): boolean => {
    const stmt = db.prepare('SELECT 1 FROM settings WHERE key = ? LIMIT 1');
    return !!stmt.get(key);
  },
};

// Guest sessions operations
export const guestSessionsDb = {
  create: (sessionToken: string, expiresAt: Date): void => {
    const stmt = db.prepare(`
      INSERT INTO guest_sessions (session_token, expires_at) 
      VALUES (?, ?)
    `);
    stmt.run(sessionToken, expiresAt.toISOString());
  },

  get: (sessionToken: string) => {
    const stmt = db.prepare(`
      SELECT * FROM guest_sessions 
      WHERE session_token = ? AND expires_at > CURRENT_TIMESTAMP
    `);
    return stmt.get(sessionToken);
  },

  updateLastUsed: (sessionToken: string): void => {
    const stmt = db.prepare(`
      UPDATE guest_sessions 
      SET last_used_at = CURRENT_TIMESTAMP 
      WHERE session_token = ?
    `);
    stmt.run(sessionToken);
  },

  delete: (sessionToken: string): void => {
    const stmt = db.prepare('DELETE FROM guest_sessions WHERE session_token = ?');
    stmt.run(sessionToken);
  },

  deleteExpired: (): void => {
    const stmt = db.prepare('DELETE FROM guest_sessions WHERE expires_at < CURRENT_TIMESTAMP');
    stmt.run();
  },
};

export default db;
