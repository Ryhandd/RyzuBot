const responses = [
  "dihitung berdasarkan logika yang sempat hilang",
  "otak terdeteksi sedang buffering",
  "hasil ini dipengaruhi WiFi mental",
  "algoritma sempat crash membaca pola pikir",
  "ini berdasarkan jawaban ujian yang tidak dikumpulkan"
]

module.exports = {
  name: "seberapapintar",
  alias: ["pintar"],

  execute: async ({ q, reply }) => {
    let persen = Math.floor(Math.random() * 101)

    if (persen > 90) persen = 90 + Math.floor(Math.random() * 10)

    const note = responses[Math.floor(Math.random() * responses.length)]

    return reply(
      `🧠 *SEBERAPA PINTAR*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}