<<<<<<< HEAD
const axios = require("axios")

module.exports = {
  name: "draw",
  execute: async ({ ryzu, from, q, reply, msg }) => {
    if (!q) return reply("Mau digambarin apa?")

    await reply("⏳ Ryzu AI sedang menggambar...")

    try {
      const res = await axios.post(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        { inputs: q },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "image/png"
          },
          responseType: "arraybuffer",
          timeout: 120000
        }
      )

      await ryzu.sendMessage(
        from,
        {
          image: Buffer.from(res.data),
          caption: `🖼️ Ryzu AI\n\nPrompt: ${q}`
        },
        { quoted: msg }
      )
    } catch (e) {
      console.error("HF ERROR:", e.response?.data || e.message)
      reply("❌ Model sedang loading / limit. Coba lagi sebentar.")
    }
  }
}
=======
const axios = require("axios")

module.exports = {
  name: "draw",
  execute: async ({ ryzu, from, q, reply, msg }) => {
    if (!q) return reply("Mau digambarin apa?")

    await reply("⏳ Ryzu AI sedang menggambar...")

    try {
      const res = await axios.post(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        { inputs: q },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "image/png"
          },
          responseType: "arraybuffer",
          timeout: 120000
        }
      )

      await ryzu.sendMessage(
        from,
        {
          image: Buffer.from(res.data),
          caption: `🖼️ Ryzu AI\n\nPrompt: ${q}`
        },
        { quoted: msg }
      )
    } catch (e) {
      console.error("HF ERROR:", e.response?.data || e.message)
      reply("❌ Model sedang loading / limit. Coba lagi sebentar.")
    }
  }
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
