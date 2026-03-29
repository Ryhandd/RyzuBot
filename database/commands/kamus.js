const axios = require("axios");

module.exports = {
    name: "kamus",
    alias: ["define"],
    
    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .kamus serendipity")
        try {
          const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`)
          const data = res.data[0]
          let text = `📖 *KAMUS - ${data.word.toUpperCase()}*\n\n`
          if (data.phonetics?.[0]?.text) text += `🔊 Fonetik: ${data.phonetics[0].text}\n\n`
          data.meanings.slice(0, 2).forEach((m) => {
            text += `📝 *${m.partOfSpeech.toUpperCase()}*\n`
            m.definitions.slice(0, 2).forEach((d, i) => {
              text += `${i + 1}. ${d.definition}\n`
              if (d.example) text += `   _"${d.example}"_\n`
            })
            text += "\n"
          })
          return reply(text)
        } catch (e) {
          return reply(`❌ Kata "${q}" tidak ditemukan di kamus.`)
        }
    }
}