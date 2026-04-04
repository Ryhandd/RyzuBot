function buildExifBuffer(pack, author) {
  const json = {
    "sticker-pack-id": `ryzubot-${Date.now()}`,
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author,
    "emojis": ["🚀"]
  }

  const exifHeader = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x41, 0x57,
    0x07, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x16, 0x00, 0x00, 0x00
  ])

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8")
  const exif = Buffer.concat([exifHeader, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)

  return exif
}

module.exports = { buildExifBuffer }