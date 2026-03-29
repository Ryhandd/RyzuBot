const fs = require("fs")
const db = require("../history")

module.exports = {
  name: "who",
  alias: ["w"],
  execute: async ({ ryzu, from, msg, reply }) => {

    let ctx = msg.message?.extendedTextMessage?.contextInfo
    if (!ctx?.stanzaId) return reply("Reply pesan dulu.")

    const chatId = msg.key.remoteJid
    let currentId = ctx.stanzaId
    let targetMessage = null

    while (currentId) {
      const data = db.prepare(`
        SELECT * FROM messages
        WHERE id = ?
      `).get(currentId)

      if (!data) break

      targetMessage = data

      try {
        const parsed = JSON.parse(data.raw || "{}")

        const nextCtx =
          parsed?.message?.extendedTextMessage?.contextInfo ||
          parsed?.message?.imageMessage?.contextInfo ||
          parsed?.message?.videoMessage?.contextInfo

        if (nextCtx?.stanzaId) {
          currentId = nextCtx.stanzaId
        } else {
          break
        }

      } catch {
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