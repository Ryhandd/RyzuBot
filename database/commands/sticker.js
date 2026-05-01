const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegPath = require("ffmpeg-static")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { execSync } = require("child_process")
const { Image } = require("node-webpmux")

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
  const FileType = require("file-type")
  const webp = require("node-webpmux")

  const type = await FileType.fromBuffer(buffer)
  if (!type) throw "File tidak valid"

  const input = tmp(`in_${Date.now()}`)
  const output = tmp(`out_${Date.now()}.webp`)

  fs.writeFileSync(input, buffer)

  if (isVideo) {
    execSync(
      `ffmpeg -y -i "${input}" -vcodec libwebp -vf "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,fps=30" -loop 0 -preset default -an -vsync 0 "${output}"`,
      { stdio: "ignore" }
    )
  } else {
    execSync(
      `ffmpeg -y -i "${input}" -vcodec libwebp -vf "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease" "${output}"`,
      { stdio: "ignore" }
    )
  }

  const img = new webp.Image()
  await img.load(output)

  const exif = buildExifBuffer("RyzuBot", "+62 899-8821-419")
  img.exif = exif

  const result = await img.save(null)

  fs.unlinkSync(input)
  fs.unlinkSync(output)

  return result
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

// Upload gambar ke imgbb (gratis, tanpa login, reliable)
async function uploadToImgbb(buffer) {
  const form = new FormData()
  form.append("image", buffer.toString("base64"))
  // Pakai API key publik imgbb atau upload ke tmpfiles.org
  const res = await axios.post(
    "https://api.imgbb.com/1/upload?key=2e49e9d44a8c5be3f4c0f8a7b1d23456",
    form,
    { headers: form.getHeaders(), timeout: 15000 }
  )
  return res.data.data.url
}

// Upload gambar ke tmpfiles.org (no API key needed)
async function uploadToTmpfiles(buffer) {
  const form = new FormData()
  form.append("file", buffer, { filename: "img.jpg", contentType: "image/jpeg" })
  const res = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
    headers: form.getHeaders(),
    timeout: 20000
  })
  // tmpfiles return URL seperti https://tmpfiles.org/1234567/img.jpg
  // ubah ke direct link: https://tmpfiles.org/dl/1234567/img.jpg
  const url = res.data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/")
  return url
}

// Upload gambar ke catbox dengan timeout lebih panjang
async function uploadToCatbox(buffer) {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", buffer, { filename: "img.jpg", contentType: "image/jpeg" })
  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
    timeout: 30000
  })
  return res.data.trim()
}

// Upload dengan fallback: catbox → tmpfiles
async function uploadImage(buffer) {
  try {
    const url = await uploadToCatbox(buffer)
    if (url && url.startsWith("https://")) return url
    throw new Error("Catbox gagal")
  } catch (e1) {
    console.warn("[SMEME] Catbox gagal, fallback ke tmpfiles:", e1.message)
    try {
      return await uploadToTmpfiles(buffer)
    } catch (e2) {
      console.error("[SMEME] Semua upload gagal:", e2.message)
      throw new Error("Upload gambar gagal")
    }
  }
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

// Ambil dimensi asli dari file webp menggunakan ffprobe
function getWebpDimensions(filePath) {
  try {
    const out = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`,
      { encoding: "utf-8" }
    ).trim()
    const [w, h] = out.split("x").map(Number)
    if (w && h && w > 0 && h > 0) return { width: w, height: h }
  } catch (e) {
    console.warn("[TOVID] ffprobe gagal:", e.message)
  }
  return null
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

    // ================= SMEME =================
    if (command === "smeme") {
      const image = getImage(msg)
      if (!image) return reply(`Reply gambar + teks\nContoh: ${prefix}smeme atas|bawah`)

      if (!q || !q.includes("|")) return reply(`Format salah!\nContoh: ${prefix}smeme teks atas|teks bawah`)

      let [top, bottom] = q.split("|")
      top = (top?.trim() || "_").replace(/_/g, "__")    // memegen pakai __ untuk underscore
      bottom = (bottom?.trim() || "_").replace(/_/g, "__")

      reply("⏳ Membuat smeme...")
      await ensureTmp()

      let imgBuffer
      try {
        imgBuffer = await downloadMedia(image, "image")
      } catch (e) {
        return reply("❌ Gagal download gambar.")
      }

      try {
        // Upload gambar dan dapatkan URL publik
        const imageUrl = await uploadImage(imgBuffer)
        console.log("[SMEME] Image URL:", imageUrl)

        // Buat URL meme via memegen dengan background dari URL gambar
        const bgEncoded = encodeURIComponent(imageUrl)
        const topEncoded = encodeURIComponent(top)
        const botEncoded = encodeURIComponent(bottom)

        const memeUrl = `https://api.memegen.link/images/custom/${topEncoded}/${botEncoded}.png?background=${bgEncoded}&font=impact&width=512&height=512`
        console.log("[SMEME] Meme URL:", memeUrl)

        const meme = await axios.get(memeUrl, {
          responseType: "arraybuffer",
          timeout: 30000,
          headers: { "User-Agent": "Mozilla/5.0" }
        })

        if (!meme.data || meme.data.byteLength < 1000) {
          throw new Error("Response meme terlalu kecil, kemungkinan error")
        }

        const sticker = await makeStickerWithWM(Buffer.from(meme.data))
        return ryzu.sendMessage(from, { sticker }, { quoted: msg })

      } catch (e) {
        console.error("[SMEME] Error:", e.message)

        // Fallback: overlay teks langsung pakai ffmpeg tanpa upload
        try {
          console.log("[SMEME] Mencoba fallback ffmpeg overlay...")
          const inputPath = tmp(`smeme_in_${Date.now()}.jpg`)
          const outputPath = tmp(`smeme_out_${Date.now()}.png`)

          fs.writeFileSync(inputPath, imgBuffer)

          const safeTop = top.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/:/g, "\\:")
          const safeBot = bottom.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/:/g, "\\:")

          execSync(
            `ffmpeg -y -i "${inputPath}" \
            -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512, \
            drawtext=text='${safeTop}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=20, \
            drawtext=text='${safeBot}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-text_h-20" \
            "${outputPath}"`,
            { stdio: "ignore" }
          )

          const result = fs.readFileSync(outputPath)
          const sticker = await makeStickerWithWM(result)

          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)

          return ryzu.sendMessage(from, { sticker }, { quoted: msg })
        } catch (fallbackErr) {
          console.error("[SMEME] Fallback juga gagal:", fallbackErr.message)
          return reply("❌ Gagal membuat smeme. Coba lagi nanti.")
        }
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
        const sticker = await makeStickerWithWM(buffer, false)
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
        ;[...files, tmp("list.txt"), tmp("out.mp4")].forEach(f => {
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

        execSync(`ffmpeg -y -loglevel error -i "${input}" "${output}"`, {
          stdio: "ignore"
        })

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
      if (!isAnimated) return reply("Stiker yang dibalas bukan stiker animasi.")

      await ensureTmp()

      let inputPath, outputPath, frameDir

      try {
        const buffer = await downloadMedia(quoted.stickerMessage, "sticker")

        const ts = Date.now()
        inputPath = tmp(`raw_${ts}.webp`)
        outputPath = tmp(`out_${ts}.mp4`)
        frameDir = tmp(`frames_${ts}`)

        fs.writeFileSync(inputPath, buffer)
        fs.mkdirSync(frameDir, { recursive: true })

        // Ambil dimensi asli dari webp
        const dims = getWebpDimensions(inputPath)
        let origW = dims?.width || 512
        let origH = dims?.height || 512
        console.log(`[TOVID] Dimensi original: ${origW}x${origH}`)

        // Pastikan dimensi genap (syarat libx264)
        const encW = origW % 2 === 0 ? origW : origW + 1
        const encH = origH % 2 === 0 ? origH : origH + 1

        // Ekstrak FPS asli dari webp
        let fps = 15
        try {
          const fpsOut = execSync(
            `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "${inputPath}"`,
            { encoding: "utf-8" }
          ).trim()
          // r_frame_rate bisa berupa "30000/1001" atau "30/1"
          if (fpsOut.includes("/")) {
            const [num, den] = fpsOut.split("/").map(Number)
            fps = Math.round(num / den)
          } else {
            fps = parseInt(fpsOut) || 15
          }
          // Clamp ke range wajar
          if (fps < 5) fps = 10
          if (fps > 60) fps = 30
        } catch {
          fps = 15
        }
        console.log(`[TOVID] FPS: ${fps}`)

        // Ekstrak frame dengan FPS asli, skala sesuai dimensi original
        execSync(
          `ffmpeg -y -i "${inputPath}" -vf "scale=${encW}:${encH}:flags=lanczos,fps=${fps}" "${frameDir}/frame_%04d.png"`,
          { stdio: "ignore" }
        )

        const frames = fs.readdirSync(frameDir)
          .filter(f => f.endsWith(".png"))
          .sort()

        if (frames.length === 0) throw new Error("Tidak ada frame yang berhasil diekstrak")
        console.log(`[TOVID] Frame diekstrak: ${frames.length}`)

        // Encode frame jadi mp4 dengan dimensi & fps asli
        execSync(
          `ffmpeg -y -framerate ${fps} -i "${frameDir}/frame_%04d.png" \
          -c:v libx264 -pix_fmt yuv420p -crf 18 -preset fast \
          -vf "scale=${encW}:${encH}" \
          -movflags +faststart "${outputPath}"`,
          { stdio: "ignore" }
        )

        const result = fs.readFileSync(outputPath)
        await ryzu.sendMessage(from, { video: result, mimetype: "video/mp4" }, { quoted: msg })

      } catch (e) {
        console.error("[TOVID ERROR]:", e.message)
        reply("❌ Gagal convert ke video. Pastikan stiker animasi valid.")
      } finally {
        // Bersihkan frame dir
        if (frameDir && fs.existsSync(frameDir)) {
          try {
            fs.readdirSync(frameDir).forEach(f => {
              try { fs.unlinkSync(path.join(frameDir, f)) } catch {}
            })
            fs.rmdirSync(frameDir)
          } catch {}
        }
        // Bersihkan file temp
        ;[inputPath, outputPath].forEach(f => {
          if (f && fs.existsSync(f)) {
            try { fs.unlinkSync(f) } catch {}
          }
        })
      }
    }

  }
}