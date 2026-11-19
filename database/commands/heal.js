const { safeNum } = require('../../lib/rpgUtils')
module.exports = {
    name: "heal",
    execute: async ({ sender, reply, funcs }) => {
        const user = global.rpg[sender]
        if (!user) return reply("❌ Kamu belum punya data RPG. Ketik *.daftar nama* dulu.")

        // Sanitasi: field bisa berupa string/undefined dari data legacy
        user.health = safeNum(user.health)
        user.maxHealth = safeNum(user.maxHealth, 100)
        user.potion = safeNum(user.potion)

        if (user.maxHealth <= 0) user.maxHealth = 100
        if (user.health >= user.maxHealth) return reply("❤️ Darahmu sudah penuh!")
        if (user.potion < 1) return reply("❌ Kamu tidak punya Potion. Beli dulu di .shop")

        user.potion -= 1
        user.health = user.maxHealth

        await funcs.saveRPG(sender)
        return reply("❤️ Darah penuh kembali! Siap bertualang lagi.")
    }
};