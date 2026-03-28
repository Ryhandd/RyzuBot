const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

/**
 * createSticker
 * @param {Buffer} buffer - input media buffer (image/video/webp)
 * @param {object} options
 * @param {boolean} options.isVideo - apakah video sticker
 * @param {string} options.pack - nama pack
 * @param {string} options.author - nama author
 * @returns {Promise<Buffer>} webp buffer
 */
async function createSticker(buffer, options = {}) {
  const { isVideo = false, pack = "Ryzu Bot", author = "RyzuBot" } = options

  const tmpDir = path.join(process.cwd(), "tmp")
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  const id = Date.now() + Math.random().toString(36).slice(2)
  const inputPath = path.join(tmpDir, `input_${id}.${isVideo ? "mp4" : "jpg"}`)
  const outputPath = path.join(tmpDir, `output_${id}.webp`)

  fs.writeFileSync(inputPath, buffer)

  try {
    if (isVideo) {
      execSync(
        `ffmpeg -y -i "${inputPath}" \
          -vcodec libwebp \
          -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0" \
          -loop 0 -t 5 -preset default -an -vsync 0 -quality 75 \
          "${outputPath}"`,
        { stdio: "pipe" }
      )
    } else {
      execSync(
        `ffmpeg -y -i "${inputPath}" \
          -vcodec libwebp \
          -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0" \
          -quality 75 \
          "${outputPath}"`,
        { stdio: "pipe" }
      )
    }

    const webpBuffer = fs.readFileSync(outputPath)
    const result = await addExifMetadata(webpBuffer, pack, author)
    return result

  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
  }
}

function buildExifBuffer(packName, author) {
  const json = JSON.stringify({
    "sticker-pack-name": packName,
    "sticker-pack-publisher": author,
    emojis: ["🤖"]
  })

  const jsonBuf = Buffer.from(json, "utf8")

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

  const entryOffset = TIFF_HEADER_SIZE + 2
  buf.writeUInt16LE(0x010e, entryOffset)
  buf.writeUInt16LE(2, entryOffset + 2)
  buf.writeUInt32LE(jsonBuf.length, entryOffset + 4)
  buf.writeUInt32LE(dataOffset, entryOffset + 8)

  buf.writeUInt32LE(0, entryOffset + IFD_ENTRY_SIZE)

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
    // Fallback: inject manual EXIF chunk ke RIFF/WebP
    return injectExifChunkManual(webpBuffer, exifData)
  }
}

function injectExifChunkManual(webpBuffer, exifData) {
  // Validasi RIFF header
  if (webpBuffer.toString("ascii", 0, 4) !== "RIFF" ||
      webpBuffer.toString("ascii", 8, 12) !== "WEBP") {
    return webpBuffer
  }

  const chunkName = Buffer.from("EXIF", "ascii")
  const chunkSize = Buffer.alloc(4)
  chunkSize.writeUInt32LE(exifData.length, 0)

  const padding = exifData.length % 2 !== 0 ? Buffer.alloc(1) : Buffer.alloc(0)

  const exifChunk = Buffer.concat([chunkName, chunkSize, exifData, padding])

  const newFileSize = webpBuffer.length - 8 + exifChunk.length
  const newBuffer = Buffer.concat([webpBuffer, exifChunk])
  newBuffer.writeUInt32LE(newFileSize, 4)

  return newBuffer
}

module.exports = { createSticker }