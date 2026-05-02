const sendCard = require('../../lib/sendCard')

module.exports = {
  name: "menu",
  execute: async ({ ryzu, from, msg, reply, pushname, prefix, sender, funcs, args }) => {
    funcs.checkUser(sender)
    const user = global.rpg[sender]
    const sub = args.length ? args.shift().toLowerCase() : ""

    const categories = {
      rpg:     "⚔️ RPG",
      games:   "🎲 Games",
      sticker: "🧷 Sticker",
      media:   "🎵 Media",
      tools:   "🧰 Tools",
      admin:   "👥 Admin",
      gacha:   "🎰 Gacha",
      fun:     "🎭 Fun",
      all:     "📋 All Menu",
    }

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
┌ ${prefix}ww join <nama>
├ ${prefix}ww start
├ ${prefix}ww cektim
├ ${prefix}ww info
├ ${prefix}ww kill @tag 🌙
├ ${prefix}ww protect @tag 🛡️
├ ${prefix}ww ramal @tag 🔮
├ ${prefix}ww vote @tag ☀️
├ ${prefix}ww next
├ ${prefix}ww out / reset
├ ${prefix}cekrole
└ ${prefix}ww leaderboard / lb

♟️ *CATUR*
└ ${prefix}chess <elo>`,

      sticker: `
🧷 *STICKER MENU*
┌ ${prefix}sticker / s
├ ${prefix}smeme
├ ${prefix}toimg
├ ${prefix}wm <pack|author>
└ ${prefix}qc`,

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
├ ${prefix}neko
├ ${prefix}waifu
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
└ ${prefix}tebakgender <nama>`,

      all: `
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
└ ${prefix}lotre

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
┌ ${prefix}ww join <nama>
├ ${prefix}ww start
├ ${prefix}ww kill @tag 🌙
├ ${prefix}ww protect @tag 🛡️
├ ${prefix}ww ramal @tag 🔮
├ ${prefix}ww vote @tag ☀️
├ ${prefix}ww next / out / reset
├ ${prefix}cekrole
└ ${prefix}ww leaderboard / lb

♟️ *CATUR*
└ ${prefix}chess <elo>

🧷 *STICKER*
┌ ${prefix}sticker / s
├ ${prefix}smeme
├ ${prefix}toimg
├ ${prefix}wm <pack|author>
└ ${prefix}qc

🎵 *MEDIA & DOWNLOADER*
┌ ${prefix}play / ytmp3 / ytmp4
├ ${prefix}tt / ig / fb / mediafire
├ ${prefix}pinterest / neko / waifu
└ ${prefix}meme / darkjokes

🧰 *TOOLS*
┌ ${prefix}ping / cuaca / kurs
├ ${prefix}translate / kamus / qr
├ ${prefix}calc / shorturl / base64
├ ${prefix}chatgpt / ai / aiimg
├ ${prefix}remini / say / viewonce
└ ${prefix}id ff|mlbb|codm|aov|genshin

🎰 *GACHA*
┌ ${prefix}gacha / gacha 10
├ ${prefix}gachainfo / gachadex
└ ${prefix}buy gacha_ticket <1|5|10>

🎭 *FUN*
┌ ${prefix}apakah / iq / siapa
├ ${prefix}kerangajaib / tekateki
└ ${prefix}seberapa<gay|ganteng|cantik|...>

👥 *ADMIN*
┌ ${prefix}kick / adduser / promote / demote
├ ${prefix}tagall / tagadmin / hidetag
└ ${prefix}del`
    }

    if (sub && categories[sub]) {
      return reply(
        `📋 *${categories[sub]}*\n` +
        menus[sub] +
        `\n\n_Ketik ${prefix}menu untuk kembali ke menu utama_`
      )
    }

    const headerText =
`╔══════════════════════╗
║   🤖  *RYZU BOT*  ║
╚══════════════════════╝

👋 Halo *${pushname}*!
Pilih kategori menu di bawah 👇`

    const buttons = [
      { buttonId: `${prefix}menu rpg`,     buttonText: { displayText: "⚔️ RPG & Ekonomi" },    type: 1 },
      { buttonId: `${prefix}menu games`,   buttonText: { displayText: "🎲 Games & Werewolf" },  type: 1 },
      { buttonId: `${prefix}menu gacha`,   buttonText: { displayText: "🎰 Gacha System" },       type: 1 },
      { buttonId: `${prefix}menu media`,   buttonText: { displayText: "🎵 Media & Download" },   type: 1 },
      { buttonId: `${prefix}menu tools`,   buttonText: { displayText: "🧰 Tools & AI" },         type: 1 },
      { buttonId: `${prefix}menu sticker`, buttonText: { displayText: "🧷 Sticker" },            type: 1 },
      { buttonId: `${prefix}menu fun`,     buttonText: { displayText: "🎭 Fun & Random" },       type: 1 },
      { buttonId: `${prefix}menu admin`,   buttonText: { displayText: "👥 Group Admin" },        type: 1 },
      { buttonId: `${prefix}menu all`,     buttonText: { displayText: "📋 Semua Menu" },         type: 1 },
    ]

    try {
      await ryzu.sendMessage(from, {
        image: { url: "https://files.catbox.moe/cz6tt0.jpg" },
        caption: headerText,
        footer: "RyzuBot — by Ryhandd",
        buttons: buttons,
        headerType: 4,
      }, { quoted: msg })
    } catch (e) {
      try {
        const sections = [
          {
            title: "📂 Pilih Kategori",
            rows: [
              { title: "⚔️ RPG & Ekonomi",    description: "Adventure, Mining, Shop, dll",  id: `${prefix}menu rpg`     },
              { title: "🎲 Games & Werewolf",  description: "Minigame, WW, Catur",           id: `${prefix}menu games`   },
              { title: "🎰 Gacha System",      description: "Pull, Rate, Tiket",             id: `${prefix}menu gacha`   },
              { title: "🎵 Media & Download",  description: "YT, TikTok, IG, Pinterest",    id: `${prefix}menu media`   },
              { title: "🧰 Tools & AI",        description: "Translate, QR, ChatGPT, dll",  id: `${prefix}menu tools`   },
              { title: "🧷 Sticker",           description: "Buat & edit sticker",          id: `${prefix}menu sticker` },
              { title: "🎭 Fun & Random",      description: "IQ, Seberapagay, dll",         id: `${prefix}menu fun`     },
              { title: "👥 Group Admin",       description: "Kick, Promote, Tagall, dll",   id: `${prefix}menu admin`   },
              { title: "📋 Semua Menu",        description: "Tampilkan semua perintah",     id: `${prefix}menu all`     },
            ]
          }
        ]

        await ryzu.sendMessage(from, {
          text: headerText,
          footer: "RyzuBot — by Ryhandd",
          title: "🤖 RYZU BOT",
          buttonText: "🗂️ Buka Menu",
          sections: sections,
        }, { quoted: msg })
      } catch (e2) {
        const textMenu =
`╔══════════════════════╗
║   🤖  *RYZU BOT*  ║
╚══════════════════════╝

👋 Halo *${pushname}*!

━━━━━━━━━━━━━━━━━━━━━━

📂 *KATEGORI MENU*
┌ ${prefix}menu rpg     — ⚔️ RPG & Ekonomi
├ ${prefix}menu games   — 🎲 Mini Games & WW
├ ${prefix}menu sticker — 🧷 Sticker Tools
├ ${prefix}menu media   — 🎵 Downloader
├ ${prefix}menu tools   — 🧰 Tools & AI
├ ${prefix}menu fun     — 🎭 Random & Absurd
├ ${prefix}menu admin   — 👥 Group Admin
├ ${prefix}menu gacha   — 🎰 Gacha System
└ ${prefix}menu all     — 📋 Semua Menu

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

        await sendCard({
          ryzu, from, msg,
          text: textMenu,
          title: "RYZUBOT MENU",
          body: `Halo ${pushname}`,
          image: "https://files.catbox.moe/cz6tt0.jpg"
        })
      }
    }
  }
}