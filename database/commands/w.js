const fs = require("fs")
const path = require("path")
const db = require("../history")

module.exports = {
  name: "who",
  alias: ["w"],
  execute: async ({ ryzu, from, msg, reply }) => {

    const ctx = msg.message?.extendedTextMessage?.contextInfo
    if (!ctx?.stanzaId) return reply("Reply pesan dulu.")

    const chatId = msg.key.remoteJid

    // ambil pesan yg direply
    const current = db.prepare(`
      SELECT * FROM messages
      WHERE id = ?
    `).get(ctx.stanzaId)

    if (!current) return reply("❌ Pesan tidak ditemukan.")

    // ambil pesan SEBELUMNYA
    const before = db.prepare(`
      SELECT * FROM messages
      WHERE chat_id = ?
      AND timestamp < ?
      ORDER BY timestamp DESC
      LIMIT 1
    `).get(chatId, current.timestamp)

    if (!before) return reply("❌ Tidak ada pesan sebelumnya.")

    // ==== KIRIM MEDIA JIKA ADA ====
    if (before.media_type && before.media_path && fs.existsSync(before.media_path)) {
      const media = fs.readFileSync(before.media_path)

      const payload = {}
      payload[before.media_type] = media
      if (before.text) payload.caption = before.text

      return ryzu.sendMessage(from, payload, { quoted: msg })
    }

    // ==== TEXT ONLY ====
    return ryzu.sendMessage(
      from,
      { text: before.text || "[Pesan kosong]" },
      { quoted: msg }
    )
  }
}
