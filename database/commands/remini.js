<<<<<<< HEAD
const axios = require("axios")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")

function extractImage(m) {
  const stack = [m]
  while (stack.length) {
    const obj = stack.pop()
    if (!obj || typeof obj !== "object") continue
    if (obj.imageMessage) return obj.imageMessage
    for (const k in obj) {
      if (typeof obj[k] === "object") stack.push(obj[k])
    }
  }
  return null
}

module.exports = {
  name: "remini",
  alias: ["hd", "upscale"],
  async execute({ ryzu, m, from, reply }) {
    try {
      const img = extractImage(m)
      if (!img) return reply("❌ Kirim / Reply gambar dengan caption *.remini*")

      await reply("⏳ Memproses gambar...")

      // download image
      const stream = await downloadContentFromMessage(img, "image")
      let buffer = Buffer.alloc(0)
      for await (const c of stream) {
        buffer = Buffer.concat([buffer, c])
      }

      const base64 = buffer.toString("base64")

      // request ke API Betabotz Remini-v2
      const apiUrl = `https://api.betabotz.eu.org/api/tools/remini-v2?apikey=Btz-pUjTd`

      const res = await axios.post(apiUrl, {
        image: base64
      }, {
        headers: { "Content-Type": "application/json" }
      })

      const result = res.data

      if (!result || !result.result) {
        return reply("❌ Gagal memperbaiki gambar.")
      }

      // Kirim hasil
      await ryzu.sendMessage(from, {
        image: { url: result.result },
        caption: "✨ Upscale selesai!"
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      reply("❌ Upscale gagal.")
    }
  }
}
=======
const axios = require("axios")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")

function extractImage(m) {
  const stack = [m]
  while (stack.length) {
    const obj = stack.pop()
    if (!obj || typeof obj !== "object") continue
    if (obj.imageMessage) return obj.imageMessage
    for (const k in obj) {
      if (typeof obj[k] === "object") stack.push(obj[k])
    }
  }
  return null
}

module.exports = {
  name: "remini",
  alias: ["hd", "upscale"],
  async execute({ ryzu, m, from, reply }) {
    try {
      const img = extractImage(m)
      if (!img) return reply("❌ Kirim / Reply gambar dengan caption *.remini*")

      await reply("⏳ Memproses gambar...")

      // download image
      const stream = await downloadContentFromMessage(img, "image")
      let buffer = Buffer.alloc(0)
      for await (const c of stream) {
        buffer = Buffer.concat([buffer, c])
      }

      const base64 = buffer.toString("base64")

      // request ke API Betabotz Remini-v2
      const apiUrl = `https://api.betabotz.eu.org/api/tools/remini-v2?apikey=Btz-pUjTd`

      const res = await axios.post(apiUrl, {
        image: base64
      }, {
        headers: { "Content-Type": "application/json" }
      })

      const result = res.data

      if (!result || !result.result) {
        return reply("❌ Gagal memperbaiki gambar.")
      }

      // Kirim hasil
      await ryzu.sendMessage(from, {
        image: { url: result.result },
        caption: "✨ Upscale selesai!"
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      reply("❌ Upscale gagal.")
    }
  }
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
