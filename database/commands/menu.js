const sendCard = require('../../lib/sendCard')

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
      { buttonId: `${prefix}menu rpg`,   buttonText: { displayText: '⚔️ RPG'   }, type: 1 },
      { buttonId: `${prefix}menu games`, buttonText: { displayText: '🎲 Games' }, type: 1 },
      { buttonId: `${prefix}menu gacha`, buttonText: { displayText: '🎰 Gacha' }, type: 1 },
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
│   └ Tebak karakter Genshin Impact
├ 06. ${prefix}tebakcharanime / tca
│   └ Tebak karakter anime
├ 07. ${prefix}tebakheromlbb
│   └ Tebak hero Mobile Legends
├ 08. ${prefix}tekateki
│   └ Teka-teki seru & lucu
├ 09. ${prefix}asahotak
│   └ Puzzle & brain training
├ 10. ${prefix}math <noob|easy|normal|hard|insane>
│   └ Challenge matematika
├ 11. ${prefix}judi <bet> <x2-x10>
│   └ Game taruhan
├ 12. ${prefix}slot <bet>
│   └ Spin slot machine
└ 13. ${prefix}chess <elo>
    └ Main catur dengan rating ELO

[2] WEREWOLF GAME 🐺
├ 14. ${prefix}ww join <nama>
│   └ Join room Werewolf
├ 15. ${prefix}ww start
│   └ Mulai game Werewolf
├ 16. ${prefix}ww info / cektim
│   └ Cek info role & status game
├ 17. ${prefix}ww kill @tag 🌙
│   └ Werewolf membunuh target (malam)
├ 18. ${prefix}ww protect @tag 🛡️
│   └ Guardian melindungi target
├ 19. ${prefix}ww ramal @tag 🔮
│   └ Seer mengecek role target
├ 20. ${prefix}ww vote @tag ☀️
│   └ Voting eliminasi siang hari
├ 21. ${prefix}ww next
│   └ Lanjut ke fase berikutnya
├ 22. ${prefix}ww out / reset
│   └ Keluar / reset game
├ 23. ${prefix}cekrole
│   └ Cek role Werewolf (via private)
└ 24. ${prefix}ww leaderboard / lb
    └ Lihat ranking Werewolf

💡 Ketik ${prefix}menu untuk kembali`,

      gacha: `
📋 *🎰 GACHA SYSTEM*

[1] GACHA PULL
├ 01. ${prefix}gacha / pull
│   └ Pull gacha 1x (butuh tiket)
├ 02. ${prefix}gacha 10
│   └ Pull gacha 10x sekaligus
├ 03. ${prefix}gachainfo / ginfo
│   └ Info rate & detail gacha
└ 04. ${prefix}gachadex / igacha
    └ Lihat koleksi karakter gacha

[2] TIKET GACHA
├ 05. ${prefix}shop
│   └ Beli tiket di toko
└ 06. ${prefix}buy gacha_ticket <1|5|10>
    └ Beli langsung 1, 5, atau 10 tiket

[3] RATE GACHA
├ Common    : 55% — Item biasa
├ Rare      : 25% — Item langka
├ Epic      : 14% — Item sangat langka
├ Legendary :  5% — Item terlangka
└ Limited   :  1% — Pity system (50 pull)

💡 Ketik ${prefix}menu untuk kembali`,

      media: `
📋 *🎵 MEDIA & DOWNLOADER*

[1] DOWNLOADER MUSIK & VIDEO
├ 01. ${prefix}play <judul/link>
│   └ Download & kirim audio YouTube
├ 02. ${prefix}ytmp3 <link>
│   └ Download YouTube jadi MP3
├ 03. ${prefix}ytmp4 <link>
│   └ Download YouTube jadi MP4
├ 04. ${prefix}tt <link>
│   └ Download video TikTok (no watermark)
├ 05. ${prefix}ig <link>
│   └ Download foto/video Instagram
├ 06. ${prefix}fb <link>
│   └ Download video Facebook
└ 07. ${prefix}mediafire <link>
    └ Download file dari MediaFire

[2] IMAGE & RANDOM MEDIA
├ 08. ${prefix}pinterest / pin <query>
│   └ Cari & kirim gambar Pinterest
├ 09. ${prefix}neko
│   └ Kirim gambar neko random
├ 10. ${prefix}waifu
│   └ Kirim gambar waifu random
├ 11. ${prefix}meme
│   └ Kirim meme random
└ 12. ${prefix}darkjokes
    └ Kirim dark jokes random

💡 Ketik ${prefix}menu untuk kembali`,

      tools: `
📋 *🧰 TOOLS & AI*

[1] UTILITIES
├ 01. ${prefix}ping
│   └ Cek kecepatan respon bot
├ 02. ${prefix}viewonce
│   └ Buka pesan view once
├ 03. ${prefix}cuaca <kota>
│   └ Info cuaca kota tertentu
├ 04. ${prefix}kurs <100 USD ke IDR>
│   └ Konversi mata uang
├ 05. ${prefix}quote / motivasi
│   └ Kirim quote motivasi random
├ 06. ${prefix}kamus <kata>
│   └ Cari arti kata di kamus
├ 07. ${prefix}translate <en:id teks>
│   └ Terjemahkan teks antar bahasa
├ 08. ${prefix}qr <teks/url>
│   └ Buat QR code dari teks/link
├ 09. ${prefix}calc <ekspresi>
│   └ Kalkulator ekspresi matematika
├ 10. ${prefix}shorturl <url>
│   └ Perpendek URL panjang
├ 11. ${prefix}base64 / encode / decode
│   └ Encode atau decode teks Base64
└ 12. ${prefix}biner
    └ Konversi teks ke biner & sebaliknya

[2] GAME ID CHECKER
├ 13. ${prefix}id ff <id>
│   └ Cek info akun Free Fire
├ 14. ${prefix}id mlbb <id>
│   └ Cek info akun Mobile Legends
├ 15. ${prefix}id codm <id>
│   └ Cek info akun COD Mobile
├ 16. ${prefix}id aov <id>
│   └ Cek info akun Arena of Valor
└ 17. ${prefix}id genshin <id>
    └ Cek info akun Genshin Impact

[3] AI & CHAT
├ 18. ${prefix}chatgpt
│   └ Chat dengan ChatGPT
├ 19. ${prefix}ai / tanya <pertanyaan>
│   └ Tanya AI apapun
├ 20. ${prefix}aiimg <prompt>
│   └ Generate gambar dengan AI
├ 21. ${prefix}remini / hd
│   └ Perjelas & enhance foto
├ 22. ${prefix}say <teks>
│   └ Bot bacakan teks (TTS)
├ 23. ${prefix}shimi on/off
│   └ Aktifkan/nonaktifkan Shimi AI
└ 24. ${prefix}simi on/off
    └ Aktifkan/nonaktifkan Simi AI

💡 Ketik ${prefix}menu untuk kembali`,

      sticker: `
📋 *🧷 STICKER TOOLS*

[1] BUAT STICKER
├ 01. ${prefix}sticker / s
│   └ Buat sticker dari gambar/video
├ 02. ${prefix}smeme
│   └ Buat sticker meme (reply gambar)
├ 03. ${prefix}toimg
│   └ Konversi sticker jadi gambar
├ 04. ${prefix}wm <pack|author>
│   └ Tambahkan watermark ke sticker
└ 05. ${prefix}qc
    └ Buat quote card dari teks/reply

💡 Cara pakai:
• Reply gambar lalu ketik ${prefix}sticker
• Reply sticker lalu ketik ${prefix}toimg
• Ketik ${prefix}qc lalu ikuti instruksi

💡 Ketik ${prefix}menu untuk kembali`,

      fun: `
📋 *🎭 FUN & RANDOM*

[1] TEBAK & RAMAL
├ 01. ${prefix}apakah <pertanyaan>
│   └ Jawaban ya/tidak dari bot
├ 02. ${prefix}kerangajaib <pertanyaan>
│   └ Tanya kerang ajaib
├ 03. ${prefix}tekateki
│   └ Teka-teki seru
├ 04. ${prefix}tebakumur <nama>
│   └ Tebak umur seseorang
└ 05. ${prefix}tebakgender <nama>
    └ Tebak jenis kelamin dari nama

[2] RANDOM & LUCU
├ 06. ${prefix}iq <nama>
│   └ Cek IQ seseorang (random)
├ 07. ${prefix}siapa
│   └ Siapa yang paling... (random)
├ 08. ${prefix}seberapagay <nama>
│   └ Seberapa gay seseorang?
├ 09. ${prefix}seberapalesbi <nama>
│   └ Seberapa lesbi seseorang?
├ 10. ${prefix}seberapaganteng <nama>
│   └ Seberapa ganteng seseorang?
├ 11. ${prefix}seberapacantik <nama>
│   └ Seberapa cantik seseorang?
├ 12. ${prefix}seberapaimut <nama>
│   └ Seberapa imut seseorang?
├ 13. ${prefix}seberapapintar <nama>
│   └ Seberapa pintar seseorang?
├ 14. ${prefix}seberapatolol <nama>
│   └ Seberapa tolol seseorang?
└ 15. ${prefix}seberapagila <nama>
    └ Seberapa gila seseorang?

💡 Ketik ${prefix}menu untuk kembali`,

      admin: `
📋 *👥 GROUP ADMIN*

[1] MANAJEMEN ANGGOTA
├ 01. ${prefix}kick @tag
│   └ Keluarkan member dari grup
├ 02. ${prefix}adduser <nomor>
│   └ Tambahkan member ke grup
├ 03. ${prefix}promote @tag
│   └ Jadikan member sebagai admin
├ 04. ${prefix}demote @tag
│   └ Turunkan admin jadi member
└ 05. ${prefix}del
    └ Hapus pesan (reply pesan target)

[2] BROADCAST & TAG
├ 06. ${prefix}tagall <pesan>
│   └ Tag semua member grup
├ 07. ${prefix}tagadmin
│   └ Tag semua admin grup
└ 08. ${prefix}hidetag <pesan>
    └ Tag semua tanpa mention terlihat

[3] OWNER ONLY 👑
├ 09. ${prefix}addpremium @tag <hari>
│   └ Tambah hari premium user
├ 10. ${prefix}addmoney @tag <jumlah>
│   └ Tambah uang ke akun user
├ 11. ${prefix}addexp @tag <jumlah>
│   └ Tambah EXP ke akun user
├ 12. ${prefix}addlevel @tag <jumlah>
│   └ Tambah level ke akun user
├ 13. ${prefix}setpremium @tag <hari|permanen>
│   └ Set durasi premium user
├ 14. ${prefix}setmoney @tag <jumlah>
│   └ Set uang akun user
├ 15. ${prefix}setexp @tag <jumlah>
│   └ Set EXP akun user
├ 16. ${prefix}setlevel @tag <jumlah>
│   └ Set level akun user
├ 17. ${prefix}setafk @tag <jam>
│   └ Set status AFK user
├ 18. ${prefix}delpremium @tag
│   └ Hapus status premium user
├ 19. ${prefix}delafk @tag <jam>
│   └ Hapus status AFK user
└ 20. ${prefix}listpremium
    └ Lihat daftar semua user premium

💡 Ketik ${prefix}menu untuk kembali`,

      all: `
📋 *SEMUA MENU*

━━━ ⚔️ RPG & EKONOMI ━━━
├ ${prefix}register / me / limit / kolam
├ ${prefix}adventure / mining / fishing / hunt / heal
├ ${prefix}craft / upgrade / repair / equipment / buff
├ ${prefix}money / shop / buy / sell / tf / invest / tarik
├ ${prefix}maling / rampok / top
├ ${prefix}open / daily / weekly / monthly / yearly / lotre

━━━ 🎲 GAMES ━━━
├ ${prefix}tictactoe / suit / family100
├ ${prefix}tebakgambar / tebakgenshin / tebakcharanime
├ ${prefix}tebakheromlbb / tekateki / asahotak
├ ${prefix}math / judi / slot / chess

━━━ 🐺 WEREWOLF ━━━
├ ${prefix}ww join / start / info / cektim
├ ${prefix}ww kill / protect / ramal / vote
├ ${prefix}ww next / out / reset / leaderboard
└ ${prefix}cekrole

━━━ 🎰 GACHA ━━━
├ ${prefix}gacha / gacha 10
├ ${prefix}gachainfo / gachadex
└ ${prefix}buy gacha_ticket <1|5|10>

━━━ 🎵 MEDIA ━━━
├ ${prefix}play / ytmp3 / ytmp4
├ ${prefix}tt / ig / fb / mediafire
├ ${prefix}pinterest / neko / waifu / meme / darkjokes

━━━ 🧰 TOOLS ━━━
├ ${prefix}ping / viewonce / cuaca / kurs
├ ${prefix}quote / kamus / translate / qr
├ ${prefix}calc / shorturl / base64 / biner
├ ${prefix}id ff / mlbb / codm / aov / genshin
├ ${prefix}chatgpt / ai / aiimg / remini / say
└ ${prefix}shimi on/off / simi on/off

━━━ 🧷 STICKER ━━━
├ ${prefix}sticker / smeme / toimg / wm / qc

━━━ 🎭 FUN ━━━
├ ${prefix}apakah / kerangajaib / tekateki
├ ${prefix}iq / siapa / tebakumur / tebakgender
└ ${prefix}seberapa<gay|lesbi|ganteng|cantik|imut|pintar|tolol|gila>

━━━ 👥 ADMIN ━━━
├ ${prefix}kick / adduser / promote / demote / del
├ ${prefix}tagall / tagadmin / hidetag
└ ${prefix}addpremium / setpremium / delpremium / listpremium

💡 Ketik ${prefix}menu <kategori> untuk detail
   Contoh: *${prefix}menu rpg*`
    }

    // ─── TAMPILKAN MENU BERDASARKAN SUB ─────────────────────────────────────
    if (sub && menus[sub]) {
      return reply(menus[sub])
    }

    // ─── MAIN MENU: OPTION LIST ─────────────────────────────────────────────
    const mainMenu =
`╔══════════════════════╗
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