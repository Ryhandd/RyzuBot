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
  const { isVideo = false, pack = "Ryzu Bot", author = "@RyzuBot" } = options

  const tmpDir = path.join(process.cwd(), "tmp")
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  const id = Date.now() + Math.random().toString(36).slice(2)
  const inputPath = path.join(tmpDir, `input_${id}.${isVideo ? "mp4" : "jpg"}`)
  const outputPath = path.join(tmpDir, `output_${id}.webp`)

  fs.writeFileSync(inputPath, buffer)

  try {
    if (isVideo) {
      // Video sticker: convert ke animated webp
      execSync(
        `ffmpeg -y -i "${inputPath}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -loop 0 -ss 00:00:00 -t 00:00:05 -preset default -an -vsync 0 "${outputPath}"`,
        { stdio: "pipe" }
      )
    } else {
      // Image sticker
      execSync(
        `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white@0.0" -vcodec libwebp "${outputPath}"`,
        { stdio: "pipe" }
      )
    }

    const result = fs.readFileSync(outputPath)

    // Add exif metadata (pack name & author) kalau ada node-webpmux
    try {
      const { Image } = require("node-webpmux")
      const img = new Image()
      await img.load(result)

      const exifData = JSON.stringify({
        "sticker-pack-name": pack,
        "sticker-pack-publisher": author,
        emojis: ["🤖"]
      })

      const exifBuffer = Buffer.concat([
        Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]),
        Buffer.from(exifData)
      ])

      img.exif = exifBuffer
      const finalBuffer = await img.save(null)
      return finalBuffer
    } catch {
      return result
    }

  } finally {
    // Cleanup temp files
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
  }
}

module.exports = { createSticker }