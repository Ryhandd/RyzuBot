const responses = [
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
    let persen = Math.floor(Math.random() * 101)

    if (persen > 90) persen = 90 + Math.floor(Math.random() * 10)

    const note = responses[Math.floor(Math.random() * responses.length)]

    return reply(
      `💅 *SEBERAPA CANTIK*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}