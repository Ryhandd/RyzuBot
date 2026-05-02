const sendCard = require('../../lib/sendCard')

// ─── Layer 1: interactiveMessage tanpa header media ───────────────────────────
async function sendInteractiveMenu(ryzu, from, msg, pushname, prefix) {
  const imageUrl = 'https://files.catbox.moe/cz6tt0.jpg'

  await ryzu.sendMessage(from, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            imageMessage: {
              url: imageUrl,
              mimetype: 'image/jpeg',
              fileSha256: Buffer.alloc(32),
              fileEncSha256: Buffer.alloc(32),
              fileLength: 0,
              mediaKey: Buffer.alloc(32),
              directPath: '',
              mediaKeyTimestamp: 0,
            }
          },
          body: { text: `👋 Halo *${pushname}*!\nPilih kategori menu di bawah 👇` },
          footer: { text: 'RyzuBot — by Ryhandd' },
          nativeFlowMessage: {
            buttons: [
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚔️ RPG & Ekonomi',   id: `${prefix}menu rpg`     }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎲 Games & Werewolf', id: `${prefix}menu games`   }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎰 Gacha System',     id: `${prefix}menu gacha`   }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 Media & Download', id: `${prefix}menu media`   }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧰 Tools & AI',       id: `${prefix}menu tools`   }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧷 Sticker',          id: `${prefix}menu sticker` }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎭 Fun & Random',     id: `${prefix}menu fun`     }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 Group Admin',      id: `${prefix}menu admin`   }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Semua Menu',       id: `${prefix}menu all`     }) },
            ],
            messageParamsJson: ''
          }
        }
      }
    }
  }, { quoted: msg })
}

// ─── Layer 2: list message ────────────────────────────────────────────────────
async function sendListMenu(ryzu, from, msg, pushname, prefix) {
  await ryzu.sendMessage(from, {
    text: `╔══════════════════════╗\n║   🤖  *RYZU BOT*  ║\n╚══════════════════════╝\n\n👋 Halo *${pushname}*!\nPilih kategori menu di bawah 👇`,
    footer: 'RyzuBot — by Ryhandd',
    title: '🤖 RYZU BOT',
    buttonText: '🗂️ Buka Menu',
    sections: [{
      title: '📂 Pilih Kategori',
      rows: [
        { title: '⚔️ RPG & Ekonomi',    description: 'Adventure, Mining, Shop, dll', id: `${prefix}menu rpg`     },
        { title: '🎲 Games & Werewolf',  description: 'Minigame, WW, Catur',          id: `${prefix}menu games`   },
        { title: '🎰 Gacha System',      description: 'Pull, Rate, Tiket',            id: `${prefix}menu gacha`   },
        { title: '🎵 Media & Download',  description: 'YT, TikTok, IG, Pinterest',   id: `${prefix}menu media`   },
        { title: '🧰 Tools & AI',        description: 'Translate, QR, ChatGPT, dll', id: `${prefix}menu tools`   },
        { title: '🧷 Sticker',           description: 'Buat & edit sticker',         id: `${prefix}menu sticker` },
        { title: '🎭 Fun & Random',      description: 'IQ, Seberapagay, dll',        id: `${prefix}menu fun`     },
        { title: '👥 Group Admin',       description: 'Kick, Promote, Tagall, dll',  id: `${prefix}menu admin`   },
        { title: '📋 Semua Menu',        description: 'Tampilkan semua perintah',    id: `${prefix}menu all`     },
      ]
    }]
  }, { quoted: msg })
}

module.exports = {
  name: 'menu',
  execute: async ({ ryzu, from, msg, reply, pushname, prefix, sender, funcs, args }) => {
    funcs.checkUser(sender)
    const sub = args.length ? args.shift().toLowerCase() : ''

    const categories = {
      rpg:     '⚔️ RPG',
      games:   '🎲 Games',
      sticker: '🧷 Sticker',
      media:   '🎵 Media',
      tools:   '🧰 Tools',
      admin:   '👥 Admin',
      gacha:   '🎰 Gacha',
      fun:     '🎭 Fun',
      all:     '📋 All Menu',
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
├ ${prefix}ww cektim / info
├ ${prefix}ww kill @tag 🌙
├ ${prefix}ww protect @tag 🛡️
├ ${prefix}ww ramal @tag 🔮
├ ${prefix}ww vote @tag ☀️
├ ${prefix}ww next / out / reset
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
┌ ${prefix}money / shop / buy / sell
├ ${prefix}tf / invest / tarik
├ ${prefix}maling / rampok / top

📦 *BOX & CLAIM*
┌ ${prefix}open / daily / weekly
└ ${prefix}monthly / yearly / lotre

🎲 *MINI GAMES*
┌ ${prefix}tictactoe / suit / family100
├ ${prefix}tebakgambar / tebakgenshin
├ ${prefix}tebakcharanime / tebakheromlbb
├ ${prefix}tekateki / asahotak / math
├ ${prefix}judi / slot / chess <elo>

🐺 *WEREWOLF*
┌ ${prefix}ww join/start/kill/protect
├ ${prefix}ww ramal/vote/next/out/reset
└ ${prefix}cekrole / ww leaderboard

🧷 *STICKER*
┌ ${prefix}sticker / smeme / toimg
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

🤖 *AI CHAT*
┌ ${prefix}shimi on/off
└ ${prefix}simi on/off

🎰 *GACHA*
┌ ${prefix}gacha / gacha 10
├ ${prefix}gachainfo / gachadex
└ ${prefix}buy gacha_ticket <1|5|10>

🎭 *FUN*
┌ ${prefix}apakah / iq / siapa
├ ${prefix}kerangajaib / tekateki
└ ${prefix}seberapa<gay|ganteng|cantik|...>

👥 *ADMIN*
┌ ${prefix}kick / adduser / promote
├ ${prefix}demote / tagall / tagadmin
├ ${prefix}hidetag / del
└ ${prefix}addpremium / setpremium / listpremium`
    }

    // ─── Kalau ada sub, langsung tampilkan menu kategorinya ──────────────────
    if (sub && categories[sub]) {
      return reply(
        `📋 *${categories[sub]}*\n` +
        menus[sub] +
        `\n\n_Ketik ${prefix}menu untuk kembali ke menu utama_`
      )
    }

    // ─── Layer 1: interactiveMessage (tanpa header media) ────────────────────
    try {
      await sendInteractiveMenu(ryzu, from, msg, pushname, prefix)
      return
    } catch (e1) {
      console.log('[menu] interactiveMessage gagal:', e1.message)
    }

    // ─── Layer 2: listMessage ─────────────────────────────────────────────────
    try {
      await sendListMenu(ryzu, from, msg, pushname, prefix)
      return
    } catch (e2) {
      console.log('[menu] listMessage gagal:', e2.message)
    }

    // ─── Layer 3: sendCard teks biasa (pasti jalan) ───────────────────────────
    const textMenu =
`╔══════════════════════╗
║   🤖  *RYZU BOT*     ║
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
      title: 'RYZUBOT MENU',
      body: `Halo ${pushname}`,
      image: 'https://files.catbox.moe/cz6tt0.jpg'
    })
  }
}