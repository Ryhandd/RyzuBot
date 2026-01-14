<<<<<<< HEAD
module.exports = {
    name: "maling",
    alias: ["nyolong", "steal"],
    desc: "Mencuri uang player lain (PvP)",
    async execute(ctx) {
        const { sender, reply, args, funcs, mentionedJid } = ctx

        // === VALIDASI TARGET ===
        let targetText = args[0]
        if (!targetText || !targetText.startsWith("@"))
            return reply("❌ Tag target!\nContoh: *.steal @628xxxxx 10000*")

        let target = targetText.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
        
        let nominal = parseInt(args[1])
        if (!nominal || nominal < 1000)
            return reply("❌ Nominal tidak valid\nMinimal Rp1.000")

        funcs.checkUser(sender)
        funcs.checkUser(target)

        let user = global.rpg[sender]
        let victim = global.rpg[target]

        if (sender === target)
            return reply("❌ Tidak bisa maling diri sendiri")

        // === CEK LIMIT ===
        if (!user.premium && user.limit < 1)
            return reply("❌ Limit kamu habis")

        const now = Date.now()
        const CD_NORMAL = 60 * 60 * 1000
        const CD_PENJARA = 3 * 60 * 60 * 1000

        if (user.lastMaling && now < user.lastMaling)
            return reply("⏳ Lu masih cooldown. Tobat dulu.")

        if (victim.money < nominal)
            return reply("❌ Duit target tidak cukup")

        // === POTONG LIMIT DI AWAL ===
        if (!user.premium) user.limit -= 1

        // === CHANCE SUKSES ===
        let successChance =
            nominal <= 10000 ? 100 :
            nominal <= 100000 ? 75 :
            nominal <= 1000000 ? 50 :
            nominal <= 10000000 ? 25 : 10

        // === CHANCE POLISI ===
        let policeChance =
            nominal <= 10000 ? 5 :
            nominal <= 100000 ? 50 :
            nominal <= 500000 ? 75 :
            nominal <= 1000000 ? 99 : 100

        let roll = Math.random() * 100
        let policeRoll = Math.random() * 100

        // === KETANGKAP POLISI ===
        if (policeRoll < policeChance) {
            let persen = Math.floor(Math.random() * 31) + 20 // 20–50%
            let sita = Math.floor(nominal * persen / 100)

            sita = Math.min(sita, victim.money)

            victim.money -= sita
            user.lastMaling = now + CD_PENJARA

            return reply(
`🚓 *TERTANGKAP POLISI!*
👤 Target: @${target.split("@")[0]}
💸 Polisi menyita: Rp${sita.toLocaleString()} (${persen}%)
⏳ Penjara: 3 Jam

📜 *NASIHAT*
_"Merampas hak orang lain tak pernah
membuatmu lebih kaya—hanya lebih dekat
pada kehinaan."_`
            )
        }

        // === GAGAL MALING ===
        if (roll > successChance) {
            user.lastMaling = now + CD_NORMAL
            return reply(
`❌ *MALING GAGAL*
👤 Target: @${target.split("@")[0]}
Lu gagal mencuri dan nyaris ketangkep.

📜 *NASIHAT*
_"Keserakahan sering membisikkan
keberanian palsu."_`
            )
        }

        // === SUKSES ===
        victim.money -= nominal
        user.money += nominal
        user.lastMaling = now + CD_NORMAL

        reply(
`🕵️‍♂️ *MALING BERHASIL*
👤 Target: @${target.split("@")[0]}
💰 Hasil: Rp${nominal.toLocaleString()}

📜 *NASIHAT*
_"Harta yang didapat dengan licik
takkan bertahan lama di tangan yang kotor."_`
        )
    }
}
=======
module.exports = {
    name: "maling",
    alias: ["nyolong", "steal"],
    desc: "Mencuri uang player lain (PvP)",
    async execute(ctx) {
        const { sender, reply, args, funcs, mentionedJid } = ctx

        // === VALIDASI TARGET ===
        let targetText = args[0]
        if (!targetText || !targetText.startsWith("@"))
            return reply("❌ Tag target!\nContoh: *.steal @628xxxxx 10000*")

        let target = targetText.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
        
        let nominal = parseInt(args[1])
        if (!nominal || nominal < 1000)
            return reply("❌ Nominal tidak valid\nMinimal Rp1.000")

        funcs.checkUser(sender)
        funcs.checkUser(target)

        let user = global.rpg[sender]
        let victim = global.rpg[target]

        if (sender === target)
            return reply("❌ Tidak bisa maling diri sendiri")

        // === CEK LIMIT ===
        if (!user.premium && user.limit < 1)
            return reply("❌ Limit kamu habis")

        const now = Date.now()
        const CD_NORMAL = 60 * 60 * 1000
        const CD_PENJARA = 3 * 60 * 60 * 1000

        if (user.lastMaling && now < user.lastMaling)
            return reply("⏳ Lu masih cooldown. Tobat dulu.")

        if (victim.money < nominal)
            return reply("❌ Duit target tidak cukup")

        // === POTONG LIMIT DI AWAL ===
        if (!user.premium) user.limit -= 1

        // === CHANCE SUKSES ===
        let successChance =
            nominal <= 10000 ? 100 :
            nominal <= 100000 ? 75 :
            nominal <= 1000000 ? 50 :
            nominal <= 10000000 ? 25 : 10

        // === CHANCE POLISI ===
        let policeChance =
            nominal <= 10000 ? 5 :
            nominal <= 100000 ? 50 :
            nominal <= 500000 ? 75 :
            nominal <= 1000000 ? 99 : 100

        let roll = Math.random() * 100
        let policeRoll = Math.random() * 100

        // === KETANGKAP POLISI ===
        if (policeRoll < policeChance) {
            let persen = Math.floor(Math.random() * 31) + 20 // 20–50%
            let sita = Math.floor(nominal * persen / 100)

            sita = Math.min(sita, victim.money)

            victim.money -= sita
            user.lastMaling = now + CD_PENJARA

            return reply(
`🚓 *TERTANGKAP POLISI!*
👤 Target: @${target.split("@")[0]}
💸 Polisi menyita: Rp${sita.toLocaleString()} (${persen}%)
⏳ Penjara: 3 Jam

📜 *NASIHAT*
_"Merampas hak orang lain tak pernah
membuatmu lebih kaya—hanya lebih dekat
pada kehinaan."_`
            )
        }

        // === GAGAL MALING ===
        if (roll > successChance) {
            user.lastMaling = now + CD_NORMAL
            return reply(
`❌ *MALING GAGAL*
👤 Target: @${target.split("@")[0]}
Lu gagal mencuri dan nyaris ketangkep.

📜 *NASIHAT*
_"Keserakahan sering membisikkan
keberanian palsu."_`
            )
        }

        // === SUKSES ===
        victim.money -= nominal
        user.money += nominal
        user.lastMaling = now + CD_NORMAL

        reply(
`🕵️‍♂️ *MALING BERHASIL*
👤 Target: @${target.split("@")[0]}
💰 Hasil: Rp${nominal.toLocaleString()}

📜 *NASIHAT*
_"Harta yang didapat dengan licik
takkan bertahan lama di tangan yang kotor."_`
        )
    }
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
