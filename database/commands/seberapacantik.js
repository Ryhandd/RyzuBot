const looksResponses = [
  "berdasarkan standar beauty TikTok yang tidak realistis",
  "kamera depan sempat menolak memproses wajah ini",
  "filter IG pun ikut bingung",
  "hasil ini dipengaruhi pencahayaan dan angle",
  "rating ini fluktuatif tergantung hari"
]

module.exports = {
  name: "seberapacantik",
  alias: ["cantik"],

  execute: async ({ q, reply }) => {
    const { persen, note } = randomRate(looksResponses)

    return reply(
      `💅 *SEBERAPA CANTIK*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}