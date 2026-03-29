const axios = require("axios");

module.exports = {
    name: "shorturl",
    
    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .shorturl https://google.com")
        try {
          const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`)
          return reply(`🔗 *SHORTEN URL*\n\nOriginal: ${q}\nShortened: ${res.data}`)
        } catch (e) {
          return reply("❌ Gagal shorten URL.")
        }
    }
}