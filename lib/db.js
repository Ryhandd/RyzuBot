const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const dbPath = path.join(process.cwd(), 'database', 'history.db')

let db

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync('database')) fs.mkdirSync('database')

    db = new sqlite3.Database(dbPath, err => {
      if (err) return reject(err)

      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          chat_id TEXT,
          sender TEXT,
          text TEXT,
          media_type TEXT,
          media_path TEXT,
          timestamp INTEGER
        )
      `, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  })
}

/**
 * Adapter biar mirip better-sqlite3
 */
const prepare = (query) => {
  return {
    run: (...params) => {
      return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
          if (err) reject(err)
          else resolve(this)
        })
      })
    }
  }
}

module.exports = {
  initDB,
  db: {
    prepare
  }
}
