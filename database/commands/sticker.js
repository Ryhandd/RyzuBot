const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegPath = require("ffmpeg-static")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { createSticker } = require("../../lib/sticker")

// Menggunakan ffmpeg dari node_modules (otomatis)
ffmpeg.setFfmpegPath(ffmpegPath)

// ================= UTIL =================
function tmp(name) {
  return path.join(__dirname, "../../tmp", name)
}

async function ensureTmp() {
  const dir = path.join(__dirname, "../../tmp")
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function genBrat(text, outPath) {
  const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`
  const res = await axios.get(url, { responseType: "arraybuffer" })
  fs.writeFileSync(outPath, res.data)
}

// ================= HELPER =================
async function downloadMedia(message, type) {
  const stream = await downloadContentFromMessage(message, type)
  let buffer = Buffer.alloc(0)
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
  return buffer
}

function getQuoted(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null
}

function getImage(msg) {
  const q = getQuoted(msg)
  return (
    q?.imageMessage ||
    q?.viewOnceMessageV2?.message?.imageMessage ||
    msg.message?.imageMessage ||
    null
  )
}

// ================= COMMAND =================
module.exports = {
  name: "sticker",
  alias: ["s", "stiker", "smeme", "qc", "wm", "brat", "vbrat"],
  async execute({ ryzu, from, msg, command, q, reply, prefix, pushname, sender }) {

    // .S / .STIKER
    if (["s", "stiker"].includes(command)) {
      const quoted = getQuoted(msg)
      const media = quoted?.imageMessage || quoted?.videoMessage || msg.message?.imageMessage || msg.message?.videoMessage
      if (!media) return reply("Reply gambar / video (max 10 detik).")

      try {
        const isVideo = !!media.videoMessage
        if (isVideo && (media.seconds > 10)) return reply("❌ Video terlalu panjang (maks 10 detik).")
        const buffer = await downloadMedia(media, isVideo ? "video" : "image")
        const sticker = await createSticker(buffer, { isVideo })
        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch (e) {
        console.error(e)
        return reply("❌ Gagal membuat stiker.")
      }
    }

    // SMEME
    if (command === "smeme") {
      const image = getImage(msg)
      if (!image) return reply(`Reply gambar + teks\nContoh: ${prefix}smeme atas|bawah`)
      let [top, bottom] = q.split("|")
      top = top?.trim() || "_"
      bottom = bottom?.trim() || "_"
      reply("⏳ Membuat smeme...")
      try {
        const buffer = await downloadMedia(image, "image")
        const form = new FormData()
        form.append("reqtype", "fileupload")
        form.append("fileToUpload", buffer, "img.jpg")
        const up = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() })
        const bg = "https://images.weserv.nl/?url=" + encodeURIComponent(up.data.trim()) + "&output=png"
        const memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(top)}/${encodeURIComponent(bottom)}.png?background=${encodeURIComponent(bg)}&font=impact`
        const meme = await axios.get(memeUrl, { responseType: "arraybuffer" })
        const sticker = await createSticker(meme.data)
        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch (e) {
        return reply("❌ Gagal membuat smeme.")
      }
    }

    // VBRAT (ANIMASI)
    if (command === "vbrat") {
      if (!q) return reply("Teksnya mana?")
      const words = q.split(" ").slice(0, 6)
      if (words.length < 2) return reply("Minimal 2 kata biar jadi animasi.")
      reply("⏳ Membuat brat animasi...")
      await ensureTmp()
      const files = []
      try {
        for (let i = 0; i < words.length; i++) {
          const text = words.slice(0, i + 1).join(" ")
          const file = tmp(`brat_${i}.png`)
          await genBrat(text, file)
          files.push(file)
        }
        const listFile = tmp("list.txt")
        const videoFile = tmp("out.mp4")
        const listData = files.map(f => `file '${f.replace(/\\/g, "/")}'\nduration 0.45`).join("\n")
        fs.writeFileSync(listFile, listData)

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(listFile)
            .inputOptions(["-f concat", "-safe 0"])
            .outputOptions(["-pix_fmt yuv420p", "-movflags faststart", "-vf scale=512:512:force_original_aspect_ratio=increase,crop=512:512"])
            .save(videoFile)
            .on("end", resolve)
            .on("error", reject)
        })

        const videoBuffer = fs.readFileSync(videoFile)
        const sticker = await createSticker(videoBuffer, { isVideo: true })
        await ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch (e) {
        console.error(e)
        reply("❌ Gagal membuat vbrat.")
      } finally {
        [...files, tmp("list.txt"), tmp("out.mp4")].forEach(f => {
          if (fs.existsSync(f)) fs.unlinkSync(f)
        })
      }
    }

    // ================= QC =================
    if (command === "qc") {
      if (!q) return reply("Teksnya mana?")

      let pp
      try {
        pp = await ryzu.profilePictureUrl(sender, "image")
      } catch {
        pp = "https://i.ibb.co/3c29h46/default-profile.png"
      }

      try {
        const json = {
          type: "quote",
          format: "png",
          backgroundColor: "#ffffff",
          width: 512,
          height: 512,
          scale: 2,
          messages: [
            {
              avatar: true,
              from: {
                name: pushname,
                photo: { url: pp }
              },
              text: q
            }
          ]
        }

        const res = await axios.post(
          "https://bot.lyo.su/quote/generate",
          json
        )

        const buffer = Buffer.from(res.data.result.image, "base64")
        const sticker = await createSticker(buffer)

        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch (e) {
        console.error(e)
        return reply("❌ QC error.")
      }
    }

    // ================= BRAT (STATIC) =================
    if (command === "brat") {
      if (!q) return reply("Teksnya mana?")

      try {
        const res = await axios.get(
          `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(q)}`,
          { responseType: "arraybuffer" }
        )

        const sticker = await createSticker(res.data)

        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch {
        return reply("❌ Error server.")
      }
    }

    // ================= VBRAT (FINAL) =================
    if (command === "vbrat") {
      if (!q) return reply("Teksnya mana?")

      // 🔥 limit kata
      const words = q.split(" ").slice(0, 6)
      if (words.length < 2)
        return reply("Minimal 2 kata biar jadi animasi.")

      reply("⏳ Membuat brat animasi...")

      await ensureTmp()

      const frames = []
      const files = []

      try {
        // 1️⃣ generate frame brat bertahap
        for (let i = 0; i < words.length; i++) {
          const text = words.slice(0, i + 1).join(" ")
          const file = tmp(`brat_${i}.png`)
          await genBrat(text, file)
          files.push(file)
        }

        const listFile = tmp("list.txt")
        const videoFile = tmp("out.mp4")

        // 2️⃣ ffmpeg concat list
        const listData = files
          .map(f => `file '${f.replace(/\\/g, "/")}'\nduration 0.45`)
          .join("\n")

        fs.writeFileSync(listFile, listData)

        // 3️⃣ gabung jadi video
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(listFile)
            .inputOptions(["-f concat", "-safe 0"])
            .outputOptions([
              "-pix_fmt yuv420p",
              "-movflags faststart",
              "-vf scale=512:512:force_original_aspect_ratio=increase,crop=512:512"

            ])
            .save(videoFile)
            .on("end", resolve)
            .on("error", reject)
        })

        // 4️⃣ kirim sebagai video sticker
        const videoBuffer = fs.readFileSync(videoFile)
        const sticker = await createSticker(videoBuffer, { isVideo: true })

        await ryzu.sendMessage(from, { sticker }, { quoted: msg })

      } catch (e) {
        console.error(e)
        reply("❌ Gagal membuat vbrat.")
      } finally {
        // 🧹 auto cleanup
        [...files, tmp("list.txt"), tmp("out.mp4")].forEach(f => {
          if (fs.existsSync(f)) fs.unlinkSync(f)
        })
      }
    }

    // ================= WM =================
    if (command === "wm") {
      const quoted = getQuoted(msg)
      if (!quoted?.stickerMessage)
        return reply("Reply stikernya.")

      if (!q.includes("|"))
        return reply(`Format: ${prefix}wm Pack|Author`)

      let [pack, author] = q.split("|")

      try {
        const buffer = await downloadMedia(
          quoted.stickerMessage,
          "sticker"
        )

        const sticker = await createSticker(buffer, {
          pack: pack.trim(),
          author: author.trim()
        })

        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch (e) {
        console.error(e)
        return reply("❌ WM gagal.")
      }
    }
  }
}