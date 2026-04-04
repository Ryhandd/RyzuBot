const axios = require("axios")

module.exports = {
  name: "translate",
  alias: ["tr", "ts"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply(`Kirim teks yang ingin diterjemahkan!\nContoh: *.${command} en|halo apa kabar*`)

    try {
      const VELIXS_KEY = process.env.VELIXS_KEY
      
      let target = "en"
      let text = q
      
      if (q.includes("|")) {
        const parts = q.split("|")
        target = parts.trim()
        text = parts.trim()
      }

      await ryzu.sendMessage(from, { text: `⌛ Sedang menerjemahkan ke *${target.toUpperCase()}*...` }, { quoted: msg })

      const res = await axios.get("https://api.velixs.com/google-translate", {
        params: {
          to: target,
          text: text
        },
        headers: {
          "X-VelixsAPI-Key": VELIXS_KEY
        }
      })

      if (res.data.status) {
        const result = res.data.result
        const message = `*─── [ TRANSLATE ] ───*\n\n` +
                        `*Dari:* ${result.from}\n` +
                        `*Ke:* ${target}\n` +
                        `*Hasil:* ${result.text}`
        
        await reply(message)
      } else {
        reply("❌ Gagal menerjemahkan. Pastikan kode bahasa benar.")
      }

    } catch (err) {
      console.error("TRANSLATE ERROR:", err)
      reply("❌ Terjadi kesalahan pada server translate.")
    }
  }
}