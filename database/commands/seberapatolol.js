const brainResponses = [
  "dihitung berdasarkan logika yang sempat hilang",
  "otak terdeteksi sedang buffering",
  "hasil ini dipengaruhi WiFi mental",
  "algoritma sempat crash membaca pola pikir",
  "ini berdasarkan jawaban ujian yang tidak dikumpulkan"
]

module.exports = {
  name: "seberapatolol",
  alias: ["tolol"],

  execute: async ({ q, reply }) => {
    const { persen, note } = randomRate(brainResponses)

    return reply(
      `🧠 *SEBERAPA TOLOL*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}