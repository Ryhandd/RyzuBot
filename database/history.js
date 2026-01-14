const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), "database", "history.db");
const db = new Database(dbPath);

// INIT TABLE
db.prepare(`
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT,
  sender TEXT,
  text TEXT,
  media_type TEXT,
  media_path TEXT,
  timestamp INTEGER
)
`).run();

module.exports = db;
