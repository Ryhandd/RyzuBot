const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

async function createSticker(buffer, options = {}) {
  const DEFAULT_PACK = "RyzuBot"
  const DEFAULT_AUTHOR = "RyzuBot"

  const { isVideo = false, pack = DEFAULT_PACK, author = DEFAULT_AUTHOR } = options

  const magic = buffer.slice(0, 12).toString("hex")
  const isWebP = magic.startsWith("52494646") && buffer.slice(8, 12).toString("ascii") === "WEBP"

  if (isWebP && !isVideo) {
    return await addExifMetadata(buffer, pack, author)
  }

  const tmpDir = path.join(process.cwd(), "tmp")
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  const id = crypto.randomBytes(6).toString("hex")
  const inputPath = path.join(tmpDir, `input_${id}`)
  const outputPath = path.join(tmpDir, `output_${id}.webp`)

  let inputExt = "jpg"
  if (magic.startsWith("89504e47")) inputExt = "png"
  else if (magic.startsWith("47494638")) inputExt = "gif"
  else if (magic.startsWith("52494646") && buffer.slice(8, 12).toString("ascii") === "WEBP") inputExt = "webp"
  else if (magic.startsWith("000000") || magic.includes("66747970")) inputExt = "mp4"

  const inputFull = `${inputPath}.${inputExt}`
  fs.writeFileSync(inputFull, buffer)

  try {
    if (isVideo || inputExt === "mp4" || inputExt === "gif") {
      execSync(
        `ffmpeg -y -i "${inputFull}" \
        -vcodec libwebp \
        -vf "scale='if(gt(iw,ih),512,trunc(oh*a/2)*2)':'if(gt(iw,ih),trunc(ow/a/2)*2,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=0x00000000" \
        -loop 0 -t 5 -preset default -an -vsync 0 -quality 80 \
        "${outputPath}"`,
        { stdio: "pipe" }
      )
    } else {
      execSync(
        `ffmpeg -y -i "${inputFull}" \
        -vcodec libwebp \
        -vf "scale='if(gt(iw,ih),512,trunc(oh*a/2)*2)':'if(gt(iw,ih),trunc(ow/a/2)*2,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=0x00000000" \
        -quality 80 \
        "${outputPath}"`,
        { stdio: "pipe" }
      )
    }

    const webpBuffer = fs.readFileSync(outputPath)
    return await addExifMetadata(webpBuffer, pack, author)

  } finally {
    if (fs.existsSync(inputFull)) fs.unlinkSync(inputFull)
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
  }
}

const { buildExifBuffer } = require("./exif")

async function addExifMetadata(webpBuffer, packName, author) {
  const exifData = buildExifBuffer(packName, author)

  try {
    const { Image } = require("node-webpmux")
    const img = new Image()
    await img.load(webpBuffer)
    img.exif = exifData
    return await img.save(null)
  } catch {
    return injectExifChunkManual(webpBuffer, exifData)
  }
}

function injectExifChunkManual(webpBuffer, exifData) {
  if (
    webpBuffer.toString("ascii", 0, 4) !== "RIFF" ||
    webpBuffer.toString("ascii", 8, 12) !== "WEBP"
  ) return webpBuffer

  const chunkName = Buffer.from("EXIF", "ascii")
  const chunkSize = Buffer.alloc(4)
  chunkSize.writeUInt32LE(exifData.length, 0)
  const padding = exifData.length % 2 !== 0 ? Buffer.alloc(1) : Buffer.alloc(0)
  const exifChunk = Buffer.concat([chunkName, chunkSize, exifData, padding])

  const newBuffer = Buffer.concat([webpBuffer, exifChunk])
  newBuffer.writeUInt32LE(webpBuffer.length - 8 + exifChunk.length, 4)
  return newBuffer
}

module.exports = { createSticker, buildExifBuffer, injectExifChunkManual }