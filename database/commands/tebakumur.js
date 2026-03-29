module.exports = {
    name: "tebakumur",
    alias: ["umur"],
    
    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .tebakumur Budi")
        try {
          const res = await axios.get(`https://agify.io/?name=${encodeURIComponent(q)}`)
          return reply(`🎂 *TEBAK UMUR*\n\nNama: *${q}*\nPerkiraan Umur: *${res.data.age} tahun*\nData dari: ${res.data.count.toLocaleString()} orang`)
        } catch (e) {
          return reply("❌ Gagal.")
        }
    }
}