const { safeNum, addMoney } = require("../../lib/rpgUtils")

module.exports = {
  name: "maling",
  alias: ["curi", "steal"],
  execute: async ({ sender, mentionUser, quotedUser, reply, funcs, from, msg, ryzu }) => {
    const user = global.rpg[sender]

    const target = quotedUser || mentionUser[0]
    if (!target) return reply("❌ Tag atau reply orang yang mau dicuri!")
    if (target === sender) return reply("❌ Gak bisa nyuri dari diri sendiri!")

    funcs.checkUser(target)
    const victim = global.rpg[target]

    // Cek cooldown
    const CD = 3600000 // 1 jam
    const now = Date.now()
    user.lastMaling = safeNum(user.lastMaling)

    if (now - user.lastMaling < CD) {
      const sisa = CD - (now - user.lastMaling)
      const menit = Math.floor(sisa / 60000)
      const detik = Math.floor((sisa % 60000) / 1000)
      return reply(`⏳ Kamu masih dalam pengawasan polisi!\nTunggu *${menit}m ${detik}d* lagi.`)
    }

    // Cek target punya uang
    victim.money = safeNum(victim.money)
    if (victim.money < 1000) return reply(`❌ @${target.split("@")[0]} terlalu miskin untuk dicuri!`)

    user.lastMaling = now

    const roll = Math.random()

    // 45% sukses
    if (roll < 0.45) {
      const maxCuri = Math.min(Math.floor(victim.money * 0.1), 50000)
      const curian = Math.floor(Math.random() * maxCuri) + 1000

      addMoney(victim, -curian)
      addMoney(user, curian)
      funcs.saveRPG()

      await ryzu.sendMessage(from, {
        text:
          `🦹 *PENCURIAN BERHASIL!*\n\n` +
          `💰 Berhasil curi: ${curian.toLocaleString()} money\n` +
          `😈 Dari: @${target.split("@")[0]}\n\n` +
          `📜 _"Hati-hati, karma itu nyata..."_`,
        mentions: [target]
      }, { quoted: msg })
    } else if (roll < 0.75) {
      // 30% ketangkap, kena denda
      const denda = Math.floor(Math.random() * 5000) + 2000
      addMoney(user, -denda)
      funcs.saveRPG()

      await ryzu.sendMessage(from, {
        text:
          `🚔 *KETANGKAP POLISI!*\n\n` +
          `Kamu gagal mencuri dari @${target.split("@")[0]}!\n` +
          `💸 Denda: ${denda.toLocaleString()} money\n\n` +
          `📜 _"Kejahatan tidak pernah menguntungkan."_`,
        mentions: [target]
      }, { quoted: msg })
    } else {
      // 25% gagal tapi lolos
      funcs.saveRPG()
      return reply(
        `🏃 *GAGAL KABUR!*\n\n` +
        `Kamu gagal mencuri tapi berhasil kabur.\n` +
        `Tidak ada yang hilang.`
      )
    }
  }
}