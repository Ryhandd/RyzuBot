const responses = [
  "tingkat kegilaan terdeteksi melebihi batas normal",
  "logika sudah meninggalkan sistem",
  "hasil ini membuat psikolog menyerah",
  "terlalu random bahkan untuk bot",
  "realita dan halu sudah bercampur"
]

module.exports = {
  name: "seberapagila",
  alias: ["gila"],

  execute: async ({ q, reply }) => {
    let persen = Math.floor(Math.random() * 101)

    if (persen > 90) persen = 90 + Math.floor(Math.random() * 10)

    const note = responses[Math.floor(Math.random() * responses.length)]

    return reply(
      `🤪 *SEBERAPA GILA*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}