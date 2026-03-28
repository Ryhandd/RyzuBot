const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

async function createSticker(buffer, options = {}) {
  const { isVideo = false, pack = "t", author = "RyzuBot" } = options

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

function buildExifBuffer(packName, author) {
  const json = JSON.stringify({
    "sticker-pack-id": crypto.randomBytes(8).toString("hex"),
    "sticker-pack-name": packName,
    "sticker-pack-publisher": author,
    emojis: ["🤖"]
  })

  const jsonBuf = Buffer.concat([Buffer.from(json, "utf8"), Buffer.alloc(1)])

  const TIFF_HEADER_SIZE = 8
  const IFD_ENTRY_SIZE = 12
  const NUM_ENTRIES = 1
  const IFD_SIZE = 2 + NUM_ENTRIES * IFD_ENTRY_SIZE + 4
  const dataOffset = TIFF_HEADER_SIZE + IFD_SIZE
  const totalSize = dataOffset + jsonBuf.length
  const buf = Buffer.alloc(totalSize)

  buf.write("II", 0, "ascii")
  buf.writeUInt16LE(42, 2)
  buf.writeUInt32LE(TIFF_HEADER_SIZE, 4)
  buf.writeUInt16LE(NUM_ENTRIES, TIFF_HEADER_SIZE)

  const e = TIFF_HEADER_SIZE + 2
  buf.writeUInt16LE(0x010e, e)
  buf.writeUInt16LE(2, e + 2)
  buf.writeUInt32LE(jsonBuf.length, e + 4)
  buf.writeUInt32LE(dataOffset, e + 8)
  buf.writeUInt32LE(0, e + IFD_ENTRY_SIZE)

  jsonBuf.copy(buf, dataOffset)
  return buf
}

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

module.exports = { createSticker }