const sendCard = require('../../lib/sendCard')

// ─── Helper: Format Option List ──────────────────────────────────────────────
function formatOptionList(commands, prefix) {
  return commands.map((cmd, i) => {
    const num = String(i + 1).padStart(2, '0')
    return `┌ ${num}. ${prefix}${cmd.name}${cmd.alias ? ` / ${cmd.alias}` : ''}\n│   └ ${cmd.desc}`
  }).join('\n')
}

// ─── Layer 1: List Message (Baileys) ─────────────────────────────────────────
async function sendListMenu(ryzu, from, msg, pushname, prefix) {
  const listMsg = {
    text: `╔══════════════════════╗\n║   🤖  *RYZU BOT*     ║\n╚══════════════════════╝\n\n👋 Halo *${pushname}*!\nPilih kategori menu di bawah 👇`,
    footer: 'RyzuBot — by Ryhandd',
    title: '🤖 RYZU BOT',
    buttonText: '🗂️ Buka Menu',
    sections: [
      {
        title: '📂 Pilih Kategori',
        rows: [
          { title: '⚔️ RPG & Ekonomi',   description: 'Adventure, Mining, Shop, dll', id: `${prefix}menu rpg`     },
          { title: '🎲 Games & Werewolf', description: 'Minigame, WW, Catur',          id: `${prefix}menu games`   },
          { title: '🎰 Gacha System',     description: 'Pull, Rate, Tiket',            id: `${prefix}menu gacha`   },
          { title: '🎵 Media & Download', description: 'YT, TikTok, IG, Pinterest',   id: `${prefix}menu media`   },
          { title: '🧰 Tools & AI',       description: 'Translate, QR, ChatGPT, dll', id: `${prefix}menu tools`   },
          { title: '🧷 Sticker',          description: 'Buat & edit sticker',         id: `${prefix}menu sticker` },
          { title: '🎭 Fun & Random',     description: 'IQ, Seberapagay, dll',        id: `${prefix}menu fun`     },
          { title: '👥 Group Admin',      description: 'Kick, Promote, Tagall, dll',  id: `${prefix}menu admin`   },
          { title: '📋 Semua Menu',       description: 'Tampilkan semua perintah',    id: `${prefix}menu all`     },
        ]
      }
    ]
  }
  await ryzu.sendMessage(from, listMsg, { quoted: msg })
}

// ─── Layer 2: Button Message ──────────────────────────────────────────────────
async function sendButtonMenu(ryzu, from, msg, pushname, prefix) {
  await ryzu.sendMessage(from, {
    text: `👋 Halo *${pushname}*!\nPilih kategori menu di bawah 👇`,
    footer: 'RyzuBot — by Ryhandd',
    buttons: [
      { buttonId: `${prefix}menu rpg`,     buttonText: { displayText: '⚔️ RPG'   }, type: 1 },
      { buttonId: `${prefix}menu games`,   buttonText: { displayText: '🎲 Games' }, type: 1 },
      { buttonId: `${prefix}menu gacha`,   buttonText: { displayText: '🎰 Gacha' }, type: 1 },
    ],
    headerType: 1
  }, { quoted: msg })
}

module.exports = {
  name: 'menu',
  execute: async ({ ryzu, from, msg, reply, pushname, prefix, sender, funcs, args }) => {
    funcs.checkUser(sender)
    const sub = args.length ? args.shift().toLowerCase() : ''

    // ─── DEFINISI MENU DALAM FORMAT OPTION LIST ─────────────────────────────
    const menus = {
      rpg: `
📋 *⚔️ RPG & EKONOMI*

[1] PROFILE & STATUS
├ 01. ${prefix}register / daftar <nama>
│   └ Daftar akun RPG baru
├ 02. ${prefix}me / profile / inv
│   └ Lihat profile & inventory
├ 03. ${prefix}limit
│   └ Cek limit harian
└ 04. ${prefix}kolam
    └ Kelola kolam ikan & umpan

[2] RPG CORE ACTIVITIES
├ 05. ${prefix}adventure / adv
│   └ Petualangan cari XP & item
├ 06. ${prefix}mining / tambang
│   └ Menambang ore & gem
├ 07. ${prefix}fishing / mancing
│   └ Aktivitas memancing
├ 08. ${prefix}hunt / berburu
│   └ Berburu hewan untuk reward
└ 09. ${prefix}heal
    └ Restore health dengan potion

[3] PROGRESSION SYSTEM
├ 10. ${prefix}craft <sword|armor|rod>
│   └ Crafting equipment
├ 11. ${prefix}upgrade <sword|armor|rod>
│   └ Upgrade equipment
├ 12. ${prefix}repair <sword|armor|rod>
│   └ Perbaiki equipment rusak
├ 13. ${prefix}equipment / equip
│   └ Lihat/ganti equipment
└ 14. ${prefix}buff
    └ Cek buff & effect aktif

[4] EKONOMI & TRADING
├ 15. ${prefix}money
│   └ Cek saldo uang
├ 16. ${prefix}shop / buy / sell
│   └ Buka toko & transaksi
├ 17. ${prefix}tf <item> <jumlah> @tag
│   └ Transfer item ke player
├ 18. ${prefix}invest / tarik
│   └ Kelola investasi
├ 19. ${prefix}maling @tag
│   └ Mencuri dari player lain
├ 20. ${prefix}rampok <nominal>
│   └ Merampok player untuk uang
└ 21. ${prefix}top <kategori>
    └ Lihat leaderboard

[5] BOX & REWARDS
├ 22. ${prefix}open <common|uncommon|mythic|legendary>
│   └ Buka lootbox
├ 23. ${prefix}daily / weekly / monthly / yearly
│   └ Klaim hadiah periodik
└ 24. ${prefix}lotre
    └ Ikut undian lottery

💡 Ketik ${prefix}menu untuk kembali`,

      games: `
📋 *🎲 GAMES & WEREWOLF*

[1] MINI GAMES
├ 01. ${prefix}tictactoe @lawan
│   └ Main Tic-Tac-Toe vs player
├ 02. ${prefix}suit @lawan
│   └ Main Gunting-Batu-Kertas
├ 03. ${prefix}family100
│   └ Tebak jawaban terpopuler
├ 04. ${prefix}tebakgambar / tg
│   └ Tebak gambar
├ 05. ${prefix}tebakgenshin
│   └ Tebak karakter Genshin
├ 06. ${prefix}tebakcharanime / tca
│   └ Tebak karakter anime
├ 07. ${prefix}tebakheromlbb
│   └ Tebak hero Mobile Legends
├ 08. ${prefix}asahotak
│   └ Puzzle & brain training
├ 09. ${prefix}math <noob|easy|normal|hard|insane>
│   └ Challenge matematika
├ 10. ${prefix}judi <bet> <x2-x10>
│   └ Game taruhan
├ 11. ${prefix}slot
│   └ Spin slot machine
└ 12. ${prefix}chess <elo>
    └ Main catur dengan rating ELO

[2] WEREWOLF GAME 🐺
├ 13. ${prefix}ww join <nama>
│   └ Join room Werewolf
├ 14. ${prefix}ww start
│   └ Mulai game Werewolf
├ 15. ${prefix}ww info / cektim
│   └ Cek info role & timer
├ 16. ${prefix}ww kill @tag 🌙
│   └ Werewolf membunuh target
├ 17. ${prefix}ww protect @tag 🛡️
│   └ Guardian melindungi target
├ 18. ${prefix}ww ramal @tag 🔮
│   └ Seer mengecek role target
├ 19. ${prefix}ww vote @tag ☀️
│   └ Voting eliminasi siang hari
├ 20. ${prefix}ww next / out / reset
│   └ Lanjut fase / keluar / reset
├ 21. ${prefix}cekrole
│   └ Cek role Werewolf (private)
└ 22. ${prefix}ww leaderboard / lb
    └ Lihat ranking Werewolf

💡 Ketik ${prefix}menu untuk kembali`,

      // ... (format serupa untuk kategori lain: sticker, media, tools, admin, gacha, fun, all)
    }

    // ─── TAMPILKAN MENU BERDASARKAN SUB ─────────────────────────────────────
    if (sub && menus[sub]) {
      return reply(menus[sub])
    }

    // ─── MAIN MENU: OPTION LIST ─────────────────────────────────────────────
    const mainMenu = `
╔══════════════════════╗
║   🤖  *RYZU BOT*     ║
╚══════════════════════╝

👋 Halo *${pushname}*!

📂 *PILIH KATEGORI MENU*
┌ 01. ${prefix}menu rpg
│   └ ⚔️ RPG, Ekonomi, Adventure, Mining
├ 02. ${prefix}menu games
│   └ 🎲 Mini Games, Werewolf, Catur
├ 03. ${prefix}menu gacha
│   └ 🎰 Gacha System, Pull, Tiket, Rate
├ 04. ${prefix}menu media
│   └ 🎵 Downloader: YT, TikTok, IG, Pinterest
├ 05. ${prefix}menu tools
│   └ 🧰 Tools: Translate, QR, AI, Utilities
├ 06. ${prefix}menu sticker
│   └ 🧷 Sticker Maker & Editor
├ 07. ${prefix}menu fun
│   └ 🎭 Fun Random: IQ, Seberapagay, dll
├ 08. ${prefix}menu admin
│   └ 👥 Group Admin: Kick, Promote, Tagall
└ 09. ${prefix}menu all
    └ 📋 Tampilkan SEMUA perintah

⚡ *SHORTCUT POPULAR*
┌ 10. ${prefix}register — Daftar akun RPG
├ 11. ${prefix}me — Cek profile & inventory
├ 12. ${prefix}daily — Klaim hadiah harian
├ 13. ${prefix}shop — Buka toko
├ 14. ${prefix}gacha — Pull gacha
├ 15. ${prefix}play — Download musik YouTube
├ 16. ${prefix}sticker — Buat sticker
├ 17. ${prefix}ai — Chat dengan AI
└ 18. ${prefix}ping — Cek respon bot

━━━━━━━━━━━━━━━━━━━━━━
💡 *TIPS PENGGUNAAN*
• Ketik ${prefix}menu <kategori> untuk langsung akses
  Contoh: *${prefix}menu games*
• Gunakan alias perintah untuk lebih cepat
  Contoh: ${prefix}tg sama dengan ${prefix}tebakgambar
• Reply pesan untuk perintah yang membutuhkan media

_RyzuBot — by Ryhandd_`

    // ─── FALLBACK: Coba List → Button → Text Card ───────────────────────────
    try {
      await sendListMenu(ryzu, from, msg, pushname, prefix)
      return
    } catch (e1) {
      console.log('[menu] listMessage gagal:', e1.message)
    }
    try {
      await sendButtonMenu(ryzu, from, msg, pushname, prefix)
      return
    } catch (e2) {
      console.log('[menu] buttonMessage gagal:', e2.message)
    }
    await sendCard({
      ryzu, from, msg,
      text: mainMenu,
      title: 'RYZUBOT MENU',
      body: `Halo ${pushname}`,
      image: 'https://files.catbox.moe/cz6tt0.jpg'
    })
  }
}

module.exports = async function sendCard({
    ryzu, from, msg = null, text = '', title = 'Ryzu Bot',
    body = 'Ryzu Bot Multi-Device',
    image = 'https://files.catbox.moe/cz6tt0.jpg', target = null
}) {
    const contextInfo = {
        externalAdReply: {
            title, body, mediaType: 1, thumbnailUrl: image,
            renderLargerThumbnail: true,
            sourceUrl: target ? `https://wa.me/${target.split('@')[0]}` : 'https://github.com'
        }
    }
    return ryzu.sendMessage(from, { text, contextInfo }, msg ? { quoted: msg } : {})
}