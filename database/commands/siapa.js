module.exports = {
  name: "siapa",
  alias: ["who"],

  execute: async ({ ryzu, from, msg, reply }) => {
    const isGroup = msg.key.remoteJid.endsWith("@g.us")

    if (!isGroup) return reply("Fitur khusus grup.")

    const metadata = await ryzu.groupMetadata(from)
    const participants = metadata.participants

    const random = participants[Math.floor(Math.random() * participants.length)]
    const tag = random.id

    return ryzu.sendMessage(from, {
      text: `👤 Jawabannya adalah: @${tag.split("@")[0]}`,
      mentions: [tag]
    }, { quoted: msg })
  }
}