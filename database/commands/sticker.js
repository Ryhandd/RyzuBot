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

// ================= STICKER MAKER =================
// isVideo: false = gambar biasa, true = video/gif animasi
// keepSize: true = pertahankan ukuran asli (max 512 di sisi terbesar, scale proporsional)
//           false = paksa square 512x512 (legacy, tidak dipakai di s/smeme)
async function makeSticker(buffer, isVideo = false, pack = "RyzuBot", author = "+62 899-8821-419") {
  const webp = require("node-webpmux")

  const input = tmp(`in_${Date.now()}`)
  const output = tmp(`out_${Date.now()}.webp`)

  fs.writeFileSync(input, buffer)

  // Scale proporsional: sisi terpanjang max 512, tidak ada crop/force square
  const scaleFilter = `scale='if(gt(iw,ih),512,-2)':'if(gt(iw,ih),-2,512)', pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000`

  if (isVideo) {
    execSync(
      `ffmpeg -y -i "${input}" -vcodec libwebp -vf "${scaleFilter},fps=15" -loop 0 -preset default -an -vsync 0 "${output}"`,
      { stdio: "ignore" }
    )
  } else {
    execSync(
      `ffmpeg -y -i "${input}" -vcodec libwebp -vf "${scaleFilter}" "${output}"`,
      { stdio: "ignore" }
    )
  }

  const img = new webp.Image()
  await img.load(output)

  const exif = buildExifBuffer(pack, author)
  img.exif = exif

  const result = await img.save(null)

  if (fs.existsSync(input)) fs.unlinkSync(input)
  if (fs.existsSync(output)) fs.unlinkSync(output)

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

async function uploadToTmpfiles(buffer) {
  const form = new FormData()
  form.append("file", buffer, { filename: "img.jpg", contentType: "image/jpeg" })
  const res = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
    headers: form.getHeaders(),
    timeout: 20000
  })
  const url = res.data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/")
  return url
}

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

// Ambil dimensi asli dari file menggunakan ffprobe
function getDimensions(filePath) {
  try {
    const out = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`,
      { encoding: "utf-8" }
    ).trim()
    const [w, h] = out.split("x").map(Number)
    if (w && h && w > 0 && h > 0) return { width: w, height: h }
  } catch (e) {
    console.warn("[getDimensions] ffprobe gagal:", e.message)
  }
  return null
}

// ================= COMMAND =================
module.exports = {
  name: "sticker",
  alias: ["s", "stiker", "smeme", "qc", "wm", "brat", "vbrat", "toimg", "tovideo", "tovid"],
  async execute({ ryzu, from, msg, command, q, reply, prefix, pushname, sender }) {

    // ================= S / STIKER =================
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
      // Ukuran proporsional, tidak di-crop
      const sticker = await makeSticker(buffer, isVideo)

      return ryzu.sendMessage(from, { sticker }, { quoted: msg })
    }

    // ================= SMEME =================
    if (command === "smeme") {
      const image = getImage(msg)
      if (!image) return reply(`Reply gambar + teks\nContoh: ${prefix}smeme atas|bawah`)

      if (!q || !q.includes("|")) return reply(`Format salah!\nContoh: ${prefix}smeme teks atas|teks bawah`)

      let [top, bottom] = q.split("|")
      top = (top?.trim() || "_").replace(/_/g, "__")
      bottom = (bottom?.trim() || "_").replace(/_/g, "__")

      reply("⏳ Membuat smeme...")
      await ensureTmp()

      let imgBuffer
      try {
        imgBuffer = await downloadMedia(image, "image")
      } catch (e) {
        return reply("❌ Gagal download gambar.")
      }

      // Dapatkan dimensi asli gambar
      const inputPath = tmp(`smeme_probe_${Date.now()}.jpg`)
      fs.writeFileSync(inputPath, imgBuffer)
      const dims = getDimensions(inputPath)
      fs.unlinkSync(inputPath)

      const origW = dims?.width || 512
      const origH = dims?.height || 512
      console.log(`[SMEME] Dimensi asli: ${origW}x${origH}`)

      try {
        const imageUrl = await uploadImage(imgBuffer)
        console.log("[SMEME] Image URL:", imageUrl)

        const bgEncoded = encodeURIComponent(imageUrl)
        const topEncoded = encodeURIComponent(top)
        const botEncoded = encodeURIComponent(bottom)

        // Gunakan dimensi asli, tanpa watermark (hapus font impact supaya default, tidak ada logo)
        // memegen tidak menambah watermark sendiri, pastikan tidak ada param watermark
        const memeUrl = `https://api.memegen.link/images/custom/${topEncoded}/${botEncoded}.png?background=${bgEncoded}&width=${origW}&height=${origH}`
        console.log("[SMEME] Meme URL:", memeUrl)

        const meme = await axios.get(memeUrl, {
          responseType: "arraybuffer",
          timeout: 30000,
          headers: { "User-Agent": "Mozilla/5.0" }
        })

        if (!meme.data || meme.data.byteLength < 1000) {
          throw new Error("Response meme terlalu kecil")
        }

        // Buat stiker dengan dimensi proporsional (tidak paksa 512x512)
        const sticker = await makeSticker(Buffer.from(meme.data), false)
        return ryzu.sendMessage(from, { sticker }, { quoted: msg })

      } catch (e) {
        console.error("[SMEME] Error:", e.message)

        // Fallback: overlay teks langsung pakai ffmpeg, dimensi asli
        try {
          console.log("[SMEME] Mencoba fallback ffmpeg overlay...")
          const inPath = tmp(`smeme_in_${Date.now()}.jpg`)
          const outPath = tmp(`smeme_out_${Date.now()}.png`)

          fs.writeFileSync(inPath, imgBuffer)

          const safeTop = top.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/:/g, "\\:")
          const safeBot = bottom.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/:/g, "\\:")

          // Tidak ada resize paksa, pakai dimensi asli
          execSync(
            `ffmpeg -y -i "${inPath}" \
            -vf "drawtext=text='${safeTop}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=20, \
            drawtext=text='${safeBot}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-text_h-20" \
            "${outPath}"`,
            { stdio: "ignore" }
          )

          const result = fs.readFileSync(outPath)
          const sticker = await makeSticker(result, false)

          if (fs.existsSync(inPath)) fs.unlinkSync(inPath)
          if (fs.existsSync(outPath)) fs.unlinkSync(outPath)

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
        const sticker = await makeSticker(buffer, false)
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
        const sticker = await makeSticker(res.data)
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
            .outputOptions(["-pix_fmt yuv420p", "-movflags faststart"])
            .save(videoFile)
            .on("end", resolve)
            .on("error", reject)
        })

        const videoBuffer = fs.readFileSync(videoFile)
        const sticker = await makeSticker(videoBuffer, true)
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

        // ── Deteksi FPS dari webp animasi ──
        let fps = 15
        try {
          const fpsRaw = execSync(
            `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "${inputPath}"`,
            { encoding: "utf-8" }
          ).trim()
          if (fpsRaw.includes("/")) {
            const [num, den] = fpsRaw.split("/").map(Number)
            if (den > 0) fps = Math.round(num / den)
          } else {
            fps = parseInt(fpsRaw) || 15
          }
          if (fps < 5) fps = 10
          if (fps > 60) fps = 30
        } catch {}
        console.log(`[TOVID] FPS: ${fps}`)

        // ── Ekstrak dimensi asli ──
        const dims = getDimensions(inputPath)
        let origW = dims?.width || 512
        let origH = dims?.height || 512
        // libx264 butuh dimensi genap
        const encW = origW % 2 === 0 ? origW : origW + 1
        const encH = origH % 2 === 0 ? origH : origH + 1
        console.log(`[TOVID] Dimensi: ${origW}x${origH} → encode ${encW}x${encH}`)

        let frameCount = 0
        try {
          execSync(
            `ffmpeg -y -analyzeduration 100M -probesize 100M -i "${inputPath}" -vf "scale=${encW}:${encH}:flags=lanczos,fps=${fps}" "${frameDir}/frame_%04d.png"`,
            { stdio: "pipe" }
          )
          frameCount = fs.readdirSync(frameDir).filter(f => f.endsWith(".png")).length
        } catch (ffErr) {
          console.warn("[TOVID] ffmpeg frame extract gagal, coba metode webpmux:", ffErr.message)
        }

        // ── Fallback: ekstrak frame via node-webpmux ──
        if (frameCount === 0) {
          console.log("[TOVID] Mencoba ekstrak frame via node-webpmux...")
          const webp = require("node-webpmux")
          const img = new webp.Image()
          await img.load(inputPath)

          // node-webpmux: frames ada di img.frames untuk webp animasi
          const frames = img.frames || []
          if (frames.length === 0) throw new Error("Tidak ada frame yang bisa diekstrak dari webp animasi ini")

          console.log(`[TOVID] Frame dari webpmux: ${frames.length}`)

          // Hitung ulang fps dari frame durations
          const durations = frames.map(f => f.delay || 100)
          const avgDelay = durations.reduce((a, b) => a + b, 0) / durations.length
          fps = Math.round(1000 / avgDelay)
          if (fps < 5) fps = 10
          if (fps > 60) fps = 30
          console.log(`[TOVID] FPS dari delay: ${fps}`)

          for (let i = 0; i < frames.length; i++) {
            const singleImg = new webp.Image()
            singleImg.width = img.width
            singleImg.height = img.height
            singleImg.data = frames[i].data

            const frameBuf = await singleImg.save(null)
            const frameWebp = path.join(frameDir, `raw_${String(i).padStart(4, "0")}.webp`)
            const framePng = path.join(frameDir, `frame_${String(i + 1).padStart(4, "0")}.png`)
            fs.writeFileSync(frameWebp, frameBuf)

            execSync(`ffmpeg -y -i "${frameWebp}" "${framePng}"`, { stdio: "ignore" })
            fs.unlinkSync(frameWebp)
          }

          frameCount = fs.readdirSync(frameDir).filter(f => f.endsWith(".png")).length
        }

        const frames = fs.readdirSync(frameDir).filter(f => f.endsWith(".png")).sort()
        if (frames.length === 0) throw new Error("Tidak ada frame yang berhasil diekstrak")
        console.log(`[TOVID] Total frame siap: ${frames.length}`)

        // ── Encode frame → mp4 ──
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
        if (frameDir && fs.existsSync(frameDir)) {
          try {
            fs.readdirSync(frameDir).forEach(f => {
              try { fs.unlinkSync(path.join(frameDir, f)) } catch {}
            })
            fs.rmdirSync(frameDir)
          } catch {}
        }
        ;[inputPath, outputPath].forEach(f => {
          if (f && fs.existsSync(f)) {
            try { fs.unlinkSync(f) } catch {}
          }
        })
      }
    }

  }
}