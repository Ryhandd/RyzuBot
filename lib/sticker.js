const { Sticker } = require("wa-sticker-formatter")

async function createSticker(
  buffer,
  { pack = "", author = "RyzuBot", isVideo = false } = {}
) {
  const sticker = new Sticker(buffer, {
    pack,
    author,
    type: isVideo ? "full" : "default",
    quality: isVideo ? 60 : 80,
    fps: isVideo ? 15 : undefined
  })

  return await sticker.toBuffer()
}

module.exports = { createSticker }
