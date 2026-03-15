const Database = require("better-sqlite3")
const path = require("path")
const fs = require("fs")

const dbDir = path.join(process.cwd(), "database")
const dbPath = path.join(dbDir, "history.db")

let db

const initDB = () => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

      db = new Database(dbPath)

      // Enable WAL mode untuk performa lebih baik
      db.pragma("journal_mode = WAL")
      db.pragma("synchronous = NORMAL")

      db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          chat_id TEXT,
          sender TEXT,
          text TEXT,
          media_type TEXT,
          media_path TEXT,
          timestamp INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_chat_id ON messages(chat_id);
        CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp);
      `)

      console.log("✅ Database initialized")
      resolve()
    } catch (err) {
      console.error("DB init error:", err)
      reject(err)
    }
  })
}

/**
 * Adapter yang mirip API better-sqlite3
 * Tapi bungkus dalam Promise biar compatible sama code yang pakai await
 */
const prepare = (query) => {
  return {
    run: (...params) => {
      return new Promise((resolve, reject) => {
        try {
          const stmt = db.prepare(query)
          const result = stmt.run(...params)
          resolve(result)
        } catch (err) {
          // INSERT OR IGNORE yang gagal karena duplicate = bukan error
          if (err.message?.includes("UNIQUE constraint failed")) {
            resolve({ changes: 0 })
          } else {
            reject(err)
          }
        }
      })
    },
    get: (...params) => {
      try {
        return db.prepare(query).get(...params)
      } catch (err) {
        return null
      }
    },
    all: (...params) => {
      try {
        return db.prepare(query).all(...params)
      } catch (err) {
        return []
      }
    }
  }
}

module.exports = {
  initDB,
  db: { prepare }
}