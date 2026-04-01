const responses = [
  "hasil ini membuat ilmuwan mempertanyakan karirnya",
  "algoritma kami hampir crash membaca ini",
  "ini di luar jangkauan pemahaman manusia",
  "angka ini datang tanpa penjelasan",
  "bot mempertimbangkan untuk tidak mengungkapkan ini",
  "logika mencoba kabur saat memproses ini"
]

function generateIQ() {
  const rand = Math.random() * 100

  if (rand < 1) return Infinity
  if (rand < 5) return -Math.floor(Math.random() * 2)

  return Math.floor(Math.random() * 200)
}

module.exports = {
  name: "iq",

  execute: async ({ q, reply }) => {
    if (!q) return reply("Contoh: .iq Ryzu")
    const iq = generateIQ()
    const iqDisplay = iq === Infinity ? "∞ (Infinity)" : iq

    const note = responses[Math.floor(Math.random() * responses.length)]

    return reply(
      `🧠 *IQ CHECK*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `IQ: *${iqDisplay}*\n` +
      `_(${note})_`
    )
  }
}