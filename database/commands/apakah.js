module.exports = {
  name: "apakah",
  alias: ["apa"],

  execute: async ({ q, reply }) => {
    if (!q) return reply("Contoh: .apakah aku bakal sukses?")

    const answers = ["Iya", "Tentu", "Tidak", "Mungkin", "Bisa jadi"]
    const result = answers[Math.floor(Math.random() * answers.length)]

    return reply(`❓ *PERTANYAAN*\n${q}\n\n💬 Jawaban: *${result}*`)
  }
}