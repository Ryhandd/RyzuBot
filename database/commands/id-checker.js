const axios = require('axios')

module.exports = {
    name: "id-checker",
    alias: ["id"],

    async execute(ctx) {
        const { ryzu, from, msg, args, q, reply, user, funcs, isCreator, isPremium, sender, prefix } = ctx

        if (!args || !args) {
            return reply(`⚠️ *Format Salah!*\n\nContoh penggunaan:\n*${prefix}id ff 404810410*\n*${prefix}id ml 14142141*\n*${prefix}id codm 142141214*\n\n*List Game:* ff, ml, codm, aov, gi`)
        }

        const sutan = isPremium || isCreator
        if (!sutan && user.limit <= 0) {
            return reply("❌ Limit lu abis! Beli di *.shop* atau upgrade ke *Premium* biar Unlimited.")
        }

        const subCommand = args.toLowerCase()
        const targetId = args
        let gameName = ""

        switch (subCommand) {
            case 'ff': 
                gameName = "Free Fire" 
                break
            case 'ml': 
            case 'mlbb':
                gameName = "Mobile Legends" 
                break
            case 'cod':
            case 'codm': 
                gameName = "CODM" 
                break
            case 'aov': 
                gameName = "AOV" 
                break
            case 'gi':
            case 'genshin': 
                gameName = "GENSHIN IMPACT" 
                break
            default: 
                return reply(`❌ Game *${subCommand}* tidak tersedia.\nList: ff, ml, codm, aov, gi`)
        }

        await reply(`⏳ Sedang mengecek ID *${targetId}* untuk game *${gameName}*...`)

        try {
            const res = await axios.get('https://api.velixs.com/random-games', {
                params: {
                    game: gameName,
                    id: targetId
                },
                headers: {
                    'X-VelixsAPI-Key': process.env.VELIXS_KEY
                }
            })

            const data = res.data

            if (data && data.status) {
                let teks = `✅ *ID CHECKER FOUND*\n\n`
                teks += `🎮 *Game:* ${gameName}\n`
                teks += `🆔 *ID:* ${targetId}\n`
                teks += `👤 *Nickname:* ${data.nickname || data.name || data.result || 'Terdeteksi'}\n`
                
                if (data.region) teks += `🌍 *Region:* ${data.region}\n`

                await reply(teks)

                if (!sutan) {
                    user.limit -= 1
                    await funcs.saveRPG(sender)
                    await reply(`Sisa limit: ${user.limit}`)
                }
            } else {
                reply(`❌ Data tidak ditemukan. Pastikan ID *${targetId}* benar untuk game *${gameName}*.`)
            }

        } catch (e) {
            console.error("Checker Error:", e.response ? e.response.data : e.message)
            reply("❌ Terjadi kesalahan pada server API atau Key tidak valid.")
        }
    }
}