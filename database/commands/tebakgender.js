const axios = require("axios");

module.exports = {
    name: "tebakgender",
    alias: ["gender"],
    
    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .tebakgender Ryzu")
        try {
          const res = await axios.get(`https://api.genderize.io/?name=${encodeURIComponent(q)}`)
          const icon = res.data.gender === "male" ? "♂️" : "♀️"
          const gender = res.data.gender === "male" ? "Laki-laki" : "Perempuan"
          const prob = (res.data.probability * 100).toFixed(1)
          return reply(`${icon} *TEBAK GENDER*\n\nNama: *${q}*\nGender: *${gender}*\nProbabilitas: *${prob}%*`)
        } catch (e) {
          return reply("❌ Gagal.")
        }
    }
}