<<<<<<< HEAD
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
=======
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
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
