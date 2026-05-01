const axios = require('axios')

module.exports = {
  name: "neko",
  execute: async ({ ryzu, from, msg, reply }) => {
    try {
      const res = await axios.get('https://api.nekosia.cat/api/v1/images/catgirl')
      const json = res.data
      const imageUrl = json.image.original.url

      await ryzu.sendMessage(from, {
        image: { url: imageUrl },
        caption: "Berhasil!"
      }, { quoted: msg })

    } catch (err) {
      console.error(err)
      reply("Gagal.")
    }
  }
}