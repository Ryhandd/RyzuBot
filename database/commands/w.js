const fs = require("fs")
const { db } = require("../../lib/db.js")

module.exports = {
  name: "who",
  alias: ["w"],
  execute: async ({ ryzu, from, msg, reply }) => {

    let ctx = msg.message?.extendedTextMessage?.contextInfo
    if (!ctx?.stanzaId) return reply("Reply pesan dulu.")

    let currentId = ctx.stanzaId
    let targetMessage = null

    while (currentId) {
      const data = db.prepare(`
        SELECT * FROM messages
        WHERE id = ?
      `).get(currentId)

      if (!data) break

      targetMessage = data

      let raw = null
      try {
        raw = JSON.parse(data.text || "")
      } catch {
        raw = null
      }

      // Cari stanzaId pesan yang di-reply oleh pesan terpilih (chain).
      // Schema `messages` tidak menyimpan contextInfo, jadi chain hanya
      // bisa ditelusuri bila `text` kebetulan JSON berisi message.
      const nextCtx =
        raw?.message?.extendedTextMessage?.contextInfo ||
        raw?.message?.imageMessage?.contextInfo ||
        raw?.message?.videoMessage?.contextInfo

      if (nextCtx?.stanzaId) {
        currentId = nextCtx.stanzaId
      } else {
        break
      }
    }

    if (!targetMessage) return reply("❌ Pesan tidak ditemukan.")

    if (
      targetMessage.media_type &&
      targetMessage.media_path &&
      fs.existsSync(targetMessage.media_path)
    ) {
      const media = fs.readFileSync(targetMessage.media_path)

      const payload = {}
      payload[targetMessage.media_type] = media
      if (targetMessage.text) payload.caption = targetMessage.text

      return ryzu.sendMessage(from, payload, { quoted: msg })
    }

    return ryzu.sendMessage(
      from,
      { text: targetMessage.text || "[Pesan kosong]" },
      { quoted: msg }
    )
  }
}
