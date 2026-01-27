const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')
const path = require('path')

const file = path.join(__dirname, '../data/database.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

async function initDB() {
    await db.read()
    db.data ||= { users: {} }
    await db.write()
}

module.exports = { db, initDB }
