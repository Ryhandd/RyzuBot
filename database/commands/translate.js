const axios = require("axios");

module.exports = {
    name: "translate",
    alias: ["terjemahan"],
    
    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .translate en:id Hello World\n(en=dari bahasa apa, id=ke bahasa apa)")
        try {
          const match = q.match(/^([a-z]{2}):([a-z]{2})\s+(.+)$/i)
          if (!match) return reply("Format: .translate en:id teks yang mau ditranslate")
          const [, source, target, text] = match
          const res = await axios.post("https://translate.terraprint.co/translate", {
            q: text, source: source.toLowerCase(), target: target.toLowerCase(), format: "text"
          }, { timeout: 15000 })
          return reply(`🌐 *TRANSLATE*\n\n📤 ${source.toUpperCase()}: ${text}\n📥 ${target.toUpperCase()}: ${res.data.translatedText}`)
        } catch (e) {
          return reply("❌ Gagal translate. Coba lagi.")
        }
    }
}