const cuteResponses = [
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
    const { persen, note } = randomRate(cuteResponses)

    return reply(
      `🐥 *SEBERAPA IMUT*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}