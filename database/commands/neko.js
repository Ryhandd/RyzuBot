const axios = require('axios')

module.exports = {
  name: "neko",
  execute: async (ctx) => {
    const { ryzu, from, msg, reply, user, isCreator, isPremium, sender, funcs } = ctx

    const sultan = isPremium || isCreator
    if (!sultan && user.limit <= 0) {
      return reply("❌ Limit lu abis! Beli di *.shop* atau upgrade ke *Premium*.")
    }

    try {
      const res = await axios.get(
        'https://api.nekosia.cat/api/v1/images/catgirl'
      )

      const imageUrl = res.data.image.original.url

      await ryzu.sendMessage(from, {
        image: { url: imageUrl },
        caption: "Berhasil!"
      }, { quoted: msg })

      if (!sultan) {
        user.limit -= 1
        await funcs.saveRPG(sender)
        await reply(`✅ Berhasil! Sisa limit: ${user.limit}`)
      } else {
        await reply(`✅ Berhasil!`)
      }

    } catch (err) {
      console.error(err)
      reply("Gagal.")
    }
  }
}