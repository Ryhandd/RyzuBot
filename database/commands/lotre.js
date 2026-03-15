const { safeNum, addMoney } = require("../../lib/rpgUtils")

module.exports = {
  name: "lotre",
  alias: ["lotere", "lottrey"],
  execute: async ({ sender, args, reply, funcs }) => {
    const user = global.rpg[sender]

    user.lotre = safeNum(user.lotre)
    user.money = safeNum(user.money)

    const harga = 5000
    const subcommand = args[0]?.toLowerCase()

    // Show info
    if (!subcommand || subcommand === "info") {
      return reply(
        `🎟️ *LOTRE RYZU*\n\n` +
        `• Harga tiket: ${harga.toLocaleString()} money\n` +
        `• Punya tiket: ${user.lotre}\n\n` +
        `📌 Perintah:\n` +
        `*.lotre beli <jumlah>* - Beli tiket\n` +
        `*.lotre cabut* - Cabut lotre (butuh 1 tiket)\n` +
        `*.lotre info* - Lihat info\n\n` +
        `🎁 Hadiah:\n` +
        `• Jackpot (1%): 500.000 money\n` +
        `• Menang (10%): 50.000 money\n` +
        `• Kecil (30%): 10.000 money\n` +
        `• Kalah (59%): Tidak dapat apa-apa`
      )
    }

    // Beli tiket
    if (subcommand === "beli") {
      const jml = Math.max(1, safeNum(args[1], 1))
      const total = harga * jml
      if (user.money < total) return reply(`❌ Uang kurang! Butuh ${total.toLocaleString()} money.`)
      addMoney(user, -total)
      user.lotre += jml
      await funcs.saveRPG(sender)
      return reply(`✅ Berhasil beli *${jml} tiket lotre*!\n💰 Dibayar: ${total.toLocaleString()}\n🎟️ Total tiket: ${user.lotre}`)
    }

    // Cabut lotre
    if (subcommand === "cabut") {
      if (user.lotre < 1) return reply("❌ Kamu tidak punya tiket lotre. Beli dulu dengan *.lotre beli*")
      user.lotre -= 1

      const roll = Math.random() * 100
      let hasilText, hasilMoney = 0

      if (roll < 1) {
        hasilMoney = 500000
        hasilText = `🎊 *JACKPOT!!!*\nKamu menang *500.000 money*! Keberuntungan dewa!`
      } else if (roll < 11) {
        hasilMoney = 50000
        hasilText = `🥳 *MENANG BESAR!*\nKamu menang *50.000 money*!`
      } else if (roll < 41) {
        hasilMoney = 10000
        hasilText = `😊 *MENANG KECIL*\nKamu menang *10.000 money*!`
      } else {
        hasilText = `😢 *TIDAK MENANG*\nCoba lagi besok ya!`
      }

      if (hasilMoney > 0) addMoney(user, hasilMoney)
      await funcs.saveRPG(sender)
      return reply(`🎟️ *CABUT LOTRE*\n\n${hasilText}\n\n🎟️ Sisa tiket: ${user.lotre}`)
    }

    return reply("Perintah tidak dikenali. Ketik *.lotre info* untuk bantuan.")
  }
}