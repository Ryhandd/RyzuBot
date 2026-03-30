const responses = [
  "dikonfirmasi oleh standar keimutan global",
  "kucing terdekat menyetujui hasil ini",
  "tingkat keimutan menyebabkan orang ingin cubit",
  "hasil ini membuat dunia sedikit lebih lembut",
  "imut tapi berbahaya"
]

module.exports = {
  name: "seberapaimut",
  alias: ["imut"],

  execute: async ({ q, reply }) => {
    let persen = Math.floor(Math.random() * 101)

    if (persen > 90) persen = 90 + Math.floor(Math.random() * 10)

    const note = responses[Math.floor(Math.random() * responses.length)]

    return reply(
      `🐥 *SEBERAPA IMUT*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}