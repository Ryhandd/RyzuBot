const crazyResponses = [
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
    const { persen, note } = randomRate(crazyResponses)

    return reply(
      `🤪 *SEBERAPA GILA*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}