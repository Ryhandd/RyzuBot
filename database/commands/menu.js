const sendCard = require('../../lib/sendCard')

module.exports = {
  name: "menu",
  execute: async ({ ryzu, from, msg, reply, pushname, prefix, sender, funcs, args }) => {
    funcs.checkUser(sender)
    const user = global.rpg[sender]
    const sub = args.length ? args.shift().toLowerCase() : ""

    const categories = {
      rpg:    "⚔️ RPG",
      games:  "🎲 Games",
      media:  "🎵 Media",
      tools:  "🧰 Tools",
      admin:  "👥 Admin",
      gacha:  "🎰 Gacha",
      fun:    "🎭 Fun",
    }

    if (sub && categories[sub]) {
      const menus = {
        rpg: `
👤 *PROFILE*
┌ ${prefix}register / daftar <nama>
├ ${prefix}me / profile / inv
├ ${prefix}limit
└ ${prefix}kolam

⚔️ *RPG CORE*
┌ ${prefix}adventure / adv
├ ${prefix}mining / tambang
├ ${prefix}fishing / mancing
├ ${prefix}hunt / berburu
└ ${prefix}heal

📊 *PROGRESSION*
┌ ${prefix}craft <sword|armor|rod>
├ ${prefix}upgrade <sword|armor|rod>
├ ${prefix}repair <sword|armor|rod>
├ ${prefix}equipment / equip
└ ${prefix}buff

💰 *EKONOMI*
┌ ${prefix}money
├ ${prefix}shop / buy / sell
├ ${prefix}tf <item> <jumlah> @tag
├ ${prefix}invest / tarik
├ ${prefix}maling @tag
├ ${prefix}rampok <nominal>
└ ${prefix}top <kategori>

📦 *BOX & CLAIM*
┌ ${prefix}open <common|uncommon|mythic|legendary>
├ ${prefix}daily / weekly / monthly / yearly
└ ${prefix}lotre`,

        games: `
🎲 *MINI GAMES*
┌ ${prefix}tictactoe @lawan
├ ${prefix}suit @lawan
├ ${prefix}family100
├ ${prefix}tebakgambar / tg
├ ${prefix}tebakgenshin
├ ${prefix}tebakcharanime / tca
├ ${prefix}tebakheromlbb
├ ${prefix}tekateki
├ ${prefix}asahotak
├ ${prefix}math <noob|easy|normal|hard|insane>
├ ${prefix}judi <bet> <x2-x10>
└ ${prefix}slot <bet>

🐺 *WEREWOLF GAME*
┌ ${prefix}ww join <nama> (Join Room)
├ ${prefix}ww start (Mulai Game)
├ ${prefix}ww cektim (Status Game)
├ ${prefix}ww info (Daftar Role)
├ ${prefix}ww kill @tag 🌙 (Werewolf)
├ ${prefix}ww protect @tag 🛡️ (Guardian)
├ ${prefix}ww ramal @tag 🔮 (Seer)
├ ${prefix}ww vote @tag ☀️ (Siang)
├ ${prefix}ww next (Lanjut Phase)
├ ${prefix}ww out / reset
├ ${prefix}cekrole (Private Chat)
└ ${prefix}ww leaderboard / lb

♟️ *CATUR*
└ ${prefix}chess <elo>`,

        media: `
🎵 *DOWNLOADER*
┌ ${prefix}play <judul/link>
├ ${prefix}ytmp3 <link>
├ ${prefix}ytmp4 <link>
├ ${prefix}tt <link>
├ ${prefix}ig <link>
├ ${prefix}fb <link>
└ ${prefix}mediafire <link>

🖼️ *IMAGE*
┌ ${prefix}pinterest / pin <query>
├ ${prefix}meme
└ ${prefix}darkjokes`,

        tools: `
🧰 *TOOLS*
┌ ${prefix}ping
├ ${prefix}viewonce
├ ${prefix}cuaca <kota>
├ ${prefix}kurs <100 USD ke IDR>
├ ${prefix}quote / motivasi
├ ${prefix}kamus <kata>
├ ${prefix}translate <en:id teks>
├ ${prefix}qr <teks/url>
├ ${prefix}calc <ekspresi>
├ ${prefix}shorturl <url>
├ ${prefix}base64 / encode / decode
├ ${prefix}biner
├ ${prefix}chatgpt
├ ${prefix}ai / tanya <pertanyaan>
├ ${prefix}aiimg <prompt>
├ ${prefix}remini / hd
├ ${prefix}say <teks>
├ ${prefix}id ff <id>
├ ${prefix}id mlbb <id>
├ ${prefix}id codm <id>
├ ${prefix}id aov <id>
└ ${prefix}id genshin <id>

🤖 *AI CHAT*
┌ ${prefix}shimi on/off
└ ${prefix}simi on/off`,

        admin: `
👥 *GROUP ADMIN*
┌ ${prefix}kick @tag
├ ${prefix}adduser <nomor>
├ ${prefix}promote @tag
├ ${prefix}demote @tag
├ ${prefix}hidetag <pesan>
├ ${prefix}tagall <pesan>
├ ${prefix}tagadmin
└ ${prefix}del (reply pesan)

👑 *OWNER ONLY*
┌ ${prefix}addpremium @tag <hari>
├ ${prefix}addmoney @tag <jumlah>
├ ${prefix}addexp @tag <jumlah>
├ ${prefix}addlevel @tag <jumlah>
├ ${prefix}setpremium @tag <hari|permanen>
├ ${prefix}setmoney @tag <jumlah>
├ ${prefix}setexp @tag <jumlah>
├ ${prefix}setlevel @tag <jumlah>
├ ${prefix}setafk @tag <jam>
├ ${prefix}delpremium @tag
├ ${prefix}delafk @tag <jam>
└ ${prefix}listpremium`,

        gacha: `
🎰 *GACHA SYSTEM*
┌ ${prefix}gacha / pull
├ ${prefix}gacha 10
├ ${prefix}gachainfo / ginfo
└ ${prefix}gachadex / igacha

🎟️ *TIKET*
┌ Beli di ${prefix}shop
└ ${prefix}buy gacha_ticket <1|5|10>

📊 *RATE*
┌ Common   : 55%
├ Rare     : 25%
├ Epic     : 14%
├ Legendary: 5%
└ Limited  : 1% (pity 50)`,

        fun: `
🎭 *FUN RANDOM*
┌ ${prefix}apakah <pertanyaan>
├ ${prefix}iq <nama>
├ ${prefix}kerangajaib <pertanyaan>
├ ${prefix}siapa
├ ${prefix}seberapagay <nama>
├ ${prefix}seberapalesbi <nama>
├ ${prefix}seberapaganteng <nama>
├ ${prefix}seberapacantik <nama>
├ ${prefix}seberapaimut <nama>
├ ${prefix}seberapapintar <nama>
├ ${prefix}seberapatolol <nama>
├ ${prefix}seberapagila <nama>
├ ${prefix}tebakumur <nama>
└ ${prefix}tebakgender <nama>`

      }

      return reply(
        `📋 *${categories[sub]}*\n` +
        menus[sub] +
        `\n\n_Ketik ${prefix}menu untuk kembali ke menu utama_`
      )
    }

    const textMenu =
`╔══════════════════════╗
║   🤖  *RYZU BOT* ║
╚══════════════════════╝

👋 Halo *${pushname}*!

━━━━━━━━━━━━━━━━━━━━━━

📂 *KATEGORI MENU*
┌ ${prefix}menu rpg    — ⚔️ RPG & Ekonomi
├ ${prefix}menu games  — 🎲 Mini Games & WW
├ ${prefix}menu media  — 🎵 Downloader
├ ${prefix}menu tools  — 🧰 Tools & AI
├ ${prefix}menu fun    — 🎭 Random & Absurd
├ ${prefix}menu admin  — 👥 Group Admin
└ ${prefix}menu gacha  — 🎰 Gacha System

━━━━━━━━━━━━━━━━━━━━━━

⚡ *SHORTCUT*
┌ ${prefix}help     — Cara menggunakan bot
├ ${prefix}owner    — Kontak pemilik bot
├ ${prefix}register — Daftar akun RPG
├ ${prefix}me       — Profile & Inventory
├ ${prefix}daily    — Klaim hadiah harian
├ ${prefix}shop     — Lihat toko
├ ${prefix}premium  — List harga premium
└ ${prefix}ping     — Cek kecepatan bot

━━━━━━━━━━━━━━━━━━━━━━
💡 Tips: ketik ${prefix}menu <kategori>
   contoh: *${prefix}menu games*
_RyzuBot — by Ryhandd_`

    await ryzu.sendMessage(from, {
        text: `Halo ${pushname}`,
        footer: "RyzuBot",
        buttons: [
                {
                        buttonId: `${prefix}owner`,
                        buttonText: { displayText: 'Owner' },
                        type: 1
                }],
                        headerType: 1
                }, { quoted: msg })

                await ryzu.sendMessage(from, {
                text: "Pilih menu:",
                footer: "RyzuBot",
                title: "Buka Menu",
                buttonText: "Klik Di Sini",
                sections: [
                {
                title: "Menu Utama",
                rows: [
                        { title: "Semua Fitur", rowId: `${prefix}menu all` },
                        { title: "Menu Game", rowId: `${prefix}menu games` },
                        { title: "Menu RPG", rowId: `${prefix}menu rpg` },
                        { title: "Menu Tools", rowId: `${prefix}menu tools` }
                ]}
        ]
    }, { quoted: msg })
  }
}