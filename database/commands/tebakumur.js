module.exports = {
  name: "tebakumur",
  alias: ["umur"],

  execute: async ({ q, reply }) => {
    if (!q) return reply("Contoh: .tebakumur Ryzu")

    const rand = Math.random() * 100
    let umur

    if (rand < 35) {
      umur = Math.floor(Math.random() * (20 - 6 + 1)) + 6
    } else if (rand < 65) {
      umur = Math.floor(Math.random() * (50 - 21 + 1)) + 21
    } else if (rand < 85) {
      umur = Math.floor(Math.random() * (100 - 51 + 1)) + 51
    } else {
      umur = Math.floor(Math.random() * (150 - 101 + 1)) + 101
    }

    return reply(`🎂 *TEBAK UMUR*\n\nNama: *${q}*\nPerkiraan Umur: *${umur} tahun*`)
  }
}