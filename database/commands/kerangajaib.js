module.exports = {
  name: "kerangajaib",
  alias: ["kerang"],

  execute: async ({ q, reply }) => {
    if (!q) return reply("Contoh: .kerangajaib aku harus belajar?")

    const answers = [
      "Iya",
      "Tidak",
      "Mungkin suatu hari",
      "Coba tanya lagi",
      "Jawabannya tidak jelas",
      "Ikuti kata hatimu",
      "Sepertinya iya",
      "Sepertinya tidak",
      "Aku tidak yakin",
      "Lebih baik tidak usah",
      "Fokus dulu hidupmu",
      "Jangan berharap terlalu tinggi",
      "Coba lagi nanti",
      "Takdir berkata lain"
    ]

    const result = answers[Math.floor(Math.random() * answers.length)]

    return reply(`🐚 *KERANG AJAIB*\n\nPertanyaan: ${q}\nJawaban: *${result}*`)
  }
}