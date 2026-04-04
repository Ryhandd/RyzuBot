const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegPath = require("ffmpeg-static")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { createSticker } = require("../../lib/sticker")
const { execSync } = require("child_process")

ffmpeg.setFfmpegPath(ffmpegPath)

const buildExifBuffer = (pack, author) => {
  const json = {
    "sticker-pack-id": `ryzubot-${Date.now()}`,
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author,
    "emojis": ["🚀"]
  }
  const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8")
  const exif = Buffer.concat([exifHeader, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  return exif
}

async function makeStickerWithWM(buffer, isVideo = false) {
  const raw = await createSticker(buffer, { isVideo })

  const { Image } = require("node-webpmux")
  const img = new Image()
  await img.load(raw)

  const exif = buildExifBuffer("RyzuBot", "+62 899-8821-419")
  img.exif = exif

  return await img.save(null)
}

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
  alias: ["s", "stiker", "smeme", "qc", "wm", "brat", "vbrat", "toimg", "tovideo", "tovid"],
  async execute({ ryzu, from, msg, command, q, reply, prefix, pushname, sender }) {

    // .S / .STIKER
    if (["s", "stiker"].includes(command)) {
      const quoted = getQuoted(msg)
      const media =
        quoted?.imageMessage ||
        quoted?.videoMessage ||
        quoted?.stickerMessage ||
        msg.message?.imageMessage ||
        msg.message?.videoMessage

      if (!media) return reply("Reply gambar / video / sticker")

      let type = "image"
      if (quoted?.videoMessage || msg.message?.videoMessage) type = "video"
      if (quoted?.stickerMessage) type = "sticker"

      const isVideo = type === "video"
      const buffer = await downloadMedia(media, type)
      const sticker = await makeStickerWithWM(buffer, isVideo)

      return ryzu.sendMessage(from, { sticker }, { quoted: msg })
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
        const sticker = await makeStickerWithWM(meme.data)
        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch (e) {
        return reply("❌ Gagal membuat smeme.")
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
          messages: [{
            avatar: true,
            from: { name: pushname, photo: { url: pp } },
            text: q
          }]
        }
        const res = await axios.post("https://bot.lyo.su/quote/generate", json)
        const buffer = Buffer.from(res.data.result.image, "base64")
        const sticker = await makeStickerWithWM(buffer)
        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch (e) {
        return reply("❌ QC error.")
      }
    }

    // ================= BRAT (STATIC) =================
    if (command === "brat") {
      if (!q) return reply("Teksnya mana?")
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(q)}`, { responseType: "arraybuffer" })
        const sticker = await makeStickerWithWM(res.data)
        return ryzu.sendMessage(from, { sticker }, { quoted: msg })
      } catch {
        return reply("❌ Error server.")
      }
    }

    // ================= VBRAT (ANIMASI) =================
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
        const sticker = await makeStickerWithWM(videoBuffer, true)
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

    // ================= WM =================
    if (command === "wm") {
      const quoted = getQuoted(msg)
      if (!quoted?.stickerMessage) return reply("Reply stikernya.")
      if (!q.includes("|")) return reply(`Format: ${prefix}wm Pack|Author`)

      let [pack, author] = q.split("|")
      pack = pack.trim() || ""
      author = author.trim() || ""

      try {
        const buffer = await downloadMedia(quoted.stickerMessage, "sticker")
        const { Image } = require("node-webpmux")
        const img = new Image()
        await img.load(buffer)

        const exifData = buildExifBuffer(pack, author)
        img.exif = exifData

        const stickerWithExif = await img.save(null)
        return ryzu.sendMessage(from, { sticker: stickerWithExif }, { quoted: msg })
      } catch (e) {
        console.error("WM Error:", e)
        return reply("❌ Gagal menyisipkan WM.")
      }
    }

    // ================= TOIMG =================
    if (command === "toimg") {
      const quoted = getQuoted(msg)
      if (!quoted?.stickerMessage) return reply("Reply stikernya.")

      await ensureTmp()

      try {
        const buffer = await downloadMedia(quoted.stickerMessage, "sticker")

        const input = tmp(`in_${Date.now()}.webp`)
        const output = tmp(`out_${Date.now()}.png`)

        fs.writeFileSync(input, buffer)

        execSync(`ffmpeg -y -ignore_loop 0 -i "${input}" -movflags faststart -pix_fmt yuv420p -vf "fps=15,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" "${output}"`)

        const result = fs.readFileSync(output)

        await ryzu.sendMessage(from, { image: result }, { quoted: msg })

        fs.unlinkSync(input)
        fs.unlinkSync(output)

      } catch (e) {
        console.error(e)
        reply("❌ Gagal convert ke gambar.")
      }
    }

    // ================= TOVIDEO =================
    if (["tovideo", "tovid"].includes(command)) {
      const quoted = getQuoted(msg)
      if (!quoted?.stickerMessage) return reply("Reply stikernya.")

      const isAnimated = quoted.stickerMessage.isAnimated
      if (!isAnimated) return reply("Stiker ini bukan animasi.")

      await ensureTmp()

      try {
        const buffer = await downloadMedia(quoted.stickerMessage, "sticker")

        const input = tmp(`in_${Date.now()}.webp`)
        const output = tmp(`out_${Date.now()}.mp4`)

        fs.writeFileSync(input, buffer)

        execSync(`ffmpeg -y -ignore_loop 0 -i "${input}" -movflags faststart -pix_fmt yuv420p -vf "fps=15,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" "${output}"`)

        const result = fs.readFileSync(output)

        await ryzu.sendMessage(from, { video: result }, { quoted: msg })

        fs.unlinkSync(input)
        fs.unlinkSync(output)

      } catch (e) {
        console.error(e)
        reply("❌ Gagal convert ke video.")
      }
    }

  }
}