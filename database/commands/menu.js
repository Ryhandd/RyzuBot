const moment = require('moment-timezone')

// ─── SUB-MENU TEXT ──────────────────────────────────────────────────────────
function getSubMenuText(sub, prefix) {
  const menus = {
    rpg: `
📋 *⚔️ RPG & EKONOMI*

┌  ◦ *PROFILE & STATUS*
│  ◦ ${prefix}register / daftar <nama> — Daftar akun RPG baru
│  ◦ ${prefix}unregister / unreg — Batalkan pendaftaran akun RPG
│  ◦ ${prefix}me / profile / inv — Lihat profile & inventory
│  ◦ ${prefix}limit — Cek limit harian
└  ◦ ${prefix}kolam — Kelola kolam ikan & umpan

┌  ◦ *CORE ACTIVITIES*
│  ◦ ${prefix}adventure / adv — Petualangan cari XP & item
│  ◦ ${prefix}mining / tambang — Menambang ore & gem
│  ◦ ${prefix}fishing / mancing — Aktivitas memancing
│  ◦ ${prefix}hunt / berburu — Berburu hewan untuk reward
└  ◦ ${prefix}heal — Sembuhkan HP dengan potion

┌  ◦ *PROGRESSION SYSTEM*
│  ◦ ${prefix}craft <sword|armor|rod> — Crafting equipment
│  ◦ ${prefix}upgrade <sword|armor|rod> — Upgrade level equipment
│  ◦ ${prefix}repair <sword|armor|rod> — Perbaiki equipment rusak
│  ◦ ${prefix}equipment / equip — Lihat & ganti equipment
└  ◦ ${prefix}buff — Cek buff/status efek aktif

┌  ◦ *EKONOMI & TRADING*
│  ◦ ${prefix}money — Cek saldo uang
│  ◦ ${prefix}shop / buy / sell — Buka toko & transaksi item
│  ◦ ${prefix}tf <item> <jumlah> @tag — Kirim item ke user lain
│  ◦ ${prefix}invest / tarik — Kelola investasi uang
│  ◦ ${prefix}maling @tag — Curi item/uang user lain
│  ◦ ${prefix}rampok <nominal> — Rampok uang user lain
└  ◦ ${prefix}top <kategori> — Peringkat/leaderboard RPG

┌  ◦ *BOX & REWARDS*
│  ◦ ${prefix}open <box> — Buka lootbox
│  ◦ ${prefix}daily / weekly / monthly / yearly — Klaim hadiah periodik
└  ◦ ${prefix}lotre — Ikut undian lotre harian

💡 Ketik ${prefix}menu untuk kembali`,

    games: `
📋 *🎲 GAMES & WEREWOLF*

┌  ◦ *MINI GAMES*
│  ◦ ${prefix}tictactoe @lawan — Main Tic-Tac-Toe vs player
│  ◦ ${prefix}suit @lawan — Main Gunting-Batu-Kertas
│  ◦ ${prefix}family100 — Game tebak jawaban terpopuler
│  ◦ ${prefix}tebakgambar / tg — Kuis tebak gambar
│  ◦ ${prefix}tebakgenshin — Kuis tebak karakter Genshin Impact
│  ◦ ${prefix}tebakcharanime / tca — Kuis tebak karakter anime
│  ◦ ${prefix}tebakheromlbb — Kuis tebak hero MLBB
│  ◦ ${prefix}tekateki — Jawab teka-teki seru & lucu
│  ◦ ${prefix}asahotak — Kuis puzzle & asah otak
│  ◦ ${prefix}math <level> — Tantangan matematika
│  ◦ ${prefix}judi <bet> <mult> — Taruhan uang
│  ◦ ${prefix}slot <bet> — Main slot machine
└  ◦ ${prefix}chess <elo> — Main catur vs AI

┌  ◦ *WEREWOLF GAME 🐺*
│  ◦ ${prefix}ww join <nama> — Gabung room Werewolf
│  ◦ ${prefix}ww start — Mulai permainan Werewolf
│  ◦ ${prefix}ww info / cektim — Info status & role aktif
│  ◦ ${prefix}ww kill @tag — [Role Werewolf] Bunuh target
│  ◦ ${prefix}ww protect @tag — [Role Guardian] Lindungi target
│  ◦ ${prefix}ww ramal @tag — [Role Seer] Intip role target
│  ◦ ${prefix}ww vote @tag — Voting eliminasi siang hari
│  ◦ ${prefix}ww next — Lompati fase permainan
│  ◦ ${prefix}ww out / reset — Keluar / reset room game
│  ◦ ${prefix}cekrole — Cek role Werewolf pribadi via private chat
└  ◦ ${prefix}ww leaderboard / lb — Papan peringkat Werewolf

💡 Ketik ${prefix}menu untuk kembali`,

    gacha: `
📋 *🎰 GACHA SYSTEM*

┌  ◦ *GACHA PULL*
│  ◦ ${prefix}gacha / pull — Tarik gacha 1x (butuh tiket)
│  ◦ ${prefix}gacha 10 — Tarik gacha 10x sekaligus
│  ◦ ${prefix}gachainfo / ginfo — Informasi rate & detail gacha
└  ◦ ${prefix}gachaindex / igacha — Lihat galeri koleksi gacha

┌  ◦ *TIKET GACHA*
│  ◦ ${prefix}shop — Beli tiket gacha di toko
└  ◦ ${prefix}buy gacha_ticket <jumlah> — Beli langsung tiket gacha

┌  ◦ *PROBABILITAS RATE GACHA*
│  ◦ Common    : 55% (Item biasa)
│  ◦ Rare      : 25% (Item langka)
│  ◦ Epic      : 14% (Item sangat langka)
│  ◦ Legendary :  5% (Item terlangka)
└  ◦ Limited   :  1% (Pity system ke-50)

💡 Ketik ${prefix}menu untuk kembali`,

    media: `
📋 *🎵 MEDIA & DOWNLOADER*

┌  ◦ *DOWNLOADER*
│  ◦ ${prefix}play <judul/link> — Download audio YouTube
│  ◦ ${prefix}ytmp3 <link> — Unduh YouTube jadi MP3
│  ◦ ${prefix}ytmp4 <link> — Unduh YouTube jadi MP4
│  ◦ ${prefix}spotify <link> — Unduh musik/lagu dari Spotify
│  ◦ ${prefix}scribd <link> — Unduh dokumen/PDF dari Scribd
│  ◦ ${prefix}tt <link> — Unduh video TikTok tanpa WM
│  ◦ ${prefix}ig <link> — Unduh foto/video Instagram
│  ◦ ${prefix}fb <link> — Unduh video Facebook
└  ◦ ${prefix}mediafire <link> — Unduh file dari MediaFire

┌  ◦ *IMAGE & MEDIA RANDOM*
│  ◦ ${prefix}pinterest / pin <query> — Cari gambar di Pinterest
│  ◦ ${prefix}neko — Kirim gambar anime Neko random (Nekosia)
│  ◦ ${prefix}waifu — Kirim gambar anime Waifu random (Waifu.im)
│  ◦ ${prefix}foxgirl / wolfgirl / maid / vtuber — Kirim gambar anime kategori terkait
│  ◦ ${prefix}nekosia / ns — Cari gambar kustom via Nekosia Engine
│  ◦ ${prefix}meme / darkjokes — Kirim gambar humor/dark jokes random

💡 Ketik ${prefix}menu untuk kembali`,

    tools: `
📋 *🧰 TOOLS & AI*

┌  ◦ *UTILITIES*
│  ◦ ${prefix}ping — Cek kecepatan respon bot
│  ◦ ${prefix}viewonce — Buka pesan sekali lihat (view once)
│  ◦ ${prefix}who / w — Lacak pengirim asli dari reply berantai
│  ◦ ${prefix}cuaca <kota> — Informasi cuaca kota tertentu
│  ◦ ${prefix}kurs <USD ke IDR> — Konversi mata uang global
│  ◦ ${prefix}quote / motivasi — Kirim kutipan motivasi random
│  ◦ ${prefix}kamus <kata> — Cari arti kata resmi di KBBI
│  ◦ ${prefix}translate <kode teks> — Terjemahkan teks
│  ◦ ${prefix}qr <teks/link> — Buat kode QR dari teks/URL
│  ◦ ${prefix}calc <rumus> — Kalkulator matematika instan
│  ◦ ${prefix}shorturl <url> — Persingkat tautan link panjang
│  ◦ ${prefix}base64 / encode / decode — Enkripsi/dekripsi Base64
└  ◦ ${prefix}biner — Konversi teks ke biner dan sebaliknya

┌  ◦ *GAME ID CHECKER*
│  ◦ ${prefix}id ff <id> — Cari info akun Free Fire
│  ◦ ${prefix}id mlbb <id> — Cari info akun Mobile Legends
│  ◦ ${prefix}id codm <id> — Cari info akun COD Mobile
│  ◦ ${prefix}id aov <id> — Cari info akun Arena of Valor
└  ◦ ${prefix}id genshin <id> — Cari info akun Genshin Impact

┌  ◦ *ARTIFICIAL INTELLIGENCE (AI)*
│  ◦ ${prefix}chatgpt — Ngobrol interaktif dengan ChatGPT
│  ◦ ${prefix}ai / tanya <pertanyaan> — Tanya AI apa saja
│  ◦ ${prefix}aiimg <prompt> — Buat gambar dengan AI
│  ◦ ${prefix}remini / hd — Perjelas resolusi foto buram
│  ◦ ${prefix}say <teks> — Ubah teks jadi suara (TTS)
│  ◦ ${prefix}shimi <on/off> — Chatbot Shimi
└  ◦ ${prefix}simi <on/off> — Chatbot Simi

💡 Ketik ${prefix}menu untuk kembali`,

    sticker: `
📋 *🧷 STICKER TOOLS*

┌  ◦ *BUAT STICKER*
│  ◦ ${prefix}sticker / s — Buat sticker dari gambar/video
│  ◦ ${prefix}smeme — Buat sticker meme teks (reply gambar)
│  ◦ ${prefix}toimg — Ubah stiker menjadi file gambar
│  ◦ ${prefix}wm <pack|author> — Ganti watermark sticker
└  ◦ ${prefix}qc — Buat stiker quote card dari teks/reply

💡 *Cara Pakai:*
┌  ◦ Kirim/reply gambar dengan ketik ${prefix}sticker
│  ◦ Kirim/reply stiker dengan ketik ${prefix}toimg
└  ◦ Ketik ${prefix}qc diikuti teks Anda

💡 Ketik ${prefix}menu untuk kembali`,

    fun: `
📋 *🎭 FUN & RANDOM*

┌  ◦ *TEBAK & RAMAL*
│  ◦ ${prefix}apakah <pertanyaan> — Jawab ya/tidak random dari bot
│  ◦ ${prefix}kerangajaib <tanya> — Jawab dari kerang ajaib
│  ◦ ${prefix}tekateki — Kirim teka-teki seru & menantang
│  ◦ ${prefix}tebakumur <nama> — Prediksi umur berdasarkan nama
└  ◦ ${prefix}tebakgender <nama> — Prediksi gender berdasarkan nama

┌  ◦ *KUIS RANDOM & SERU*
│  ◦ ${prefix}iq <nama> — Cek tingkat IQ seseorang (fun)
│  ◦ ${prefix}siapa — Tunjuk member grup secara acak
│  ◦ ${prefix}seberapagay <nama> — Cek seberapa gay seseorang
│  ◦ ${prefix}seberapalesbi <nama> — Cek seberapa lesbi seseorang
│  ◦ ${prefix}seberapaganteng <nama> — Cek persentase ganteng
│  ◦ ${prefix}seberapacantik <nama> — Cek persentase cantik
│  ◦ ${prefix}seberapaimut <nama> — Cek persentase imut
│  ◦ ${prefix}seberapapintar <nama> — Cek persentase pintar
│  ◦ ${prefix}seberapatolol <nama> — Cek persentase tolol
└  ◦ ${prefix}seberapagila <nama> — Cek persentase gila

💡 Ketik ${prefix}menu untuk kembali`,

    admin: `
📋 *👥 GROUP ADMIN*

┌  ◦ *MANAJEMEN ANGGOTA*
│  ◦ ${prefix}kick @tag — Keluarkan member dari grup
│  ◦ ${prefix}adduser <nomor> — Tambahkan nomor ke dalam grup
│  ◦ ${prefix}promote @tag — Angkat member menjadi admin grup
│  ◦ ${prefix}demote @tag — Turunkan jabatan admin jadi member
│  ◦ ${prefix}list / members — Cek status registrasi member grup
└  ◦ ${prefix}del — Hapus pesan bot/orang lain (reply pesan target)

┌  ◦ *BROADCAST & TAG*
│  ◦ ${prefix}tagall <pesan> — Tag semua member grup sekaligus
│  ◦ ${prefix}tagadmin — Tag semua jajaran admin grup
└  ◦ ${prefix}hidetag <pesan> — Tag semua member tanpa mention terlihat

┌  ◦ *FITUR KHUSUS OWNER 👑*
│  ◦ ${prefix}addpremium @tag <hari> — Tambah status premium user
│  ◦ ${prefix}addmoney @tag <jumlah> — Tambah uang user RPG
│  ◦ ${prefix}addexp @tag <jumlah> — Tambah EXP user RPG
│  ◦ ${prefix}addlevel @tag <jumlah> — Tambah level user RPG
│  ◦ ${prefix}setpremium @tag <durasi> — Set status premium user
│  ◦ ${prefix}setmoney @tag <jumlah> — Set uang user RPG
│  ◦ ${prefix}setexp @tag <jumlah> — Set EXP user RPG
│  ◦ ${prefix}setlevel @tag <jumlah> — Set level user RPG
│  ◦ ${prefix}setafk @tag <jam> — Pasang status AFK user
│  ◦ ${prefix}delpremium @tag — Cabut status premium user
│  ◦ ${prefix}delafk @tag — Bersihkan status AFK user
└  ◦ ${prefix}listpremium — Tampilkan daftar seluruh user premium

💡 Ketik ${prefix}menu untuk kembali`,

    all: `
📋 *SEMUA MENU*

━━━ ⚔️ RPG & EKONOMI ━━━
├ ${prefix}register
├ ${prefix}unregister
├ ${prefix}me
├ ${prefix}limit
├ ${prefix}kolam
├ ${prefix}adventure
├ ${prefix}mining
├ ${prefix}fishing
├ ${prefix}hunt
├ ${prefix}heal
├ ${prefix}craft
├ ${prefix}upgrade
├ ${prefix}repair
├ ${prefix}equipment
├ ${prefix}buff
├ ${prefix}money
├ ${prefix}shop
├ ${prefix}buy
├ ${prefix}sell
├ ${prefix}tf
├ ${prefix}invest
├ ${prefix}tarik
├ ${prefix}maling
├ ${prefix}rampok
├ ${prefix}top
├ ${prefix}open
├ ${prefix}daily
├ ${prefix}weekly
├ ${prefix}monthly
├ ${prefix}yearly
└ ${prefix}lotre

━━━ 🎲 GAMES ━━━
├ ${prefix}tictactoe
├ ${prefix}suit
├ ${prefix}family100
├ ${prefix}tebakgambar
├ ${prefix}tebakgenshin
├ ${prefix}tebakcharanime
├ ${prefix}tebakheromlbb
├ ${prefix}tekateki
├ ${prefix}asahotak
├ ${prefix}math
├ ${prefix}judi
├ ${prefix}slot
└ ${prefix}chess

━━━ 🐺 WEREWOLF ━━━
├ ${prefix}ww join
├ ${prefix}ww start
├ ${prefix}ww info
├ ${prefix}ww cektim
├ ${prefix}ww kill
├ ${prefix}ww protect
├ ${prefix}ww ramal
├ ${prefix}ww vote
├ ${prefix}ww next
├ ${prefix}ww out
├ ${prefix}ww reset
├ ${prefix}ww leaderboard
└ ${prefix}cekrole

━━━ 🎰 GACHA ━━━
├ ${prefix}gacha
├ ${prefix}gacha 10
├ ${prefix}gachainfo
├ ${prefix}gachadex
└ ${prefix}buy gacha_ticket

━━━ 🎵 MEDIA ━━━
├ ${prefix}play
├ ${prefix}ytmp3
├ ${prefix}ytmp4
├ ${prefix}spotify
├ ${prefix}scribd
├ ${prefix}tt
├ ${prefix}ig
├ ${prefix}fb
├ ${prefix}mediafire
├ ${prefix}pinterest
├ ${prefix}neko
├ ${prefix}waifu
├ ${prefix}foxgirl / wolfgirl
├ ${prefix}maid / vtuber
├ ${prefix}nekosia / ns
├ ${prefix}meme
└ ${prefix}darkjokes

━━━ 🧰 TOOLS ━━━
├ ${prefix}ping
├ ${prefix}viewonce
├ ${prefix}who
├ ${prefix}cuaca
├ ${prefix}kurs
├ ${prefix}quote
├ ${prefix}kamus
├ ${prefix}translate
├ ${prefix}qr
├ ${prefix}calc
├ ${prefix}shorturl
├ ${prefix}base64
├ ${prefix}biner
├ ${prefix}id ff
├ ${prefix}id mlbb
├ ${prefix}id codm
├ ${prefix}id aov
├ ${prefix}id genshin
├ ${prefix}chatgpt
├ ${prefix}ai
├ ${prefix}aiimg
├ ${prefix}remini
├ ${prefix}say
├ ${prefix}shimi
└ ${prefix}simi

━━━ 🧷 STICKER ━━━
├ ${prefix}sticker
├ ${prefix}smeme
├ ${prefix}toimg
├ ${prefix}wm
└ ${prefix}qc

━━━ 🎭 FUN ━━━
├ ${prefix}apakah
├ ${prefix}kerangajaib
├ ${prefix}tekateki
├ ${prefix}tebakumur
├ ${prefix}tebakgender
├ ${prefix}iq
├ ${prefix}siapa
├ ${prefix}seberapagay
├ ${prefix}seberapalesbi
├ ${prefix}seberapaganteng
├ ${prefix}seberapacantik
├ ${prefix}seberapaimut
├ ${prefix}seberapapintar
├ ${prefix}seberapatolol
└ ${prefix}seberapagila

━━━ 👥 ADMIN ━━━
├ ${prefix}kick
├ ${prefix}adduser
├ ${prefix}promote
├ ${prefix}demote
├ ${prefix}list
├ ${prefix}del
├ ${prefix}tagall
├ ${prefix}tagadmin
├ ${prefix}hidetag
├ ${prefix}addpremium
├ ${prefix}setpremium
├ ${prefix}delpremium
└ ${prefix}listpremium

💡 Ketik ${prefix}menu <kategori> untuk detail
   Contoh: *${prefix}menu rpg*`
  }
  return menus[sub] || null
}

const menuModule = {
  name: 'menu',
  alias: ['help'],
  getSubMenuText,
  execute: async ({ ryzu, from, msg, reply, pushname, prefix, sender, funcs, args, isGroup }) => {
    funcs.checkUser(sender)
    const sub = args.length ? args.shift().toLowerCase() : ''

    // ─── TAMPILKAN SUB MENU BERDASARKAN KATEGORI ────────────────────────────
    if (sub) {
      const text = getSubMenuText(sub, prefix)
      if (text) return reply(text)
    }

    // ─── DATA USER & BOT ────────────────────────────────────────────────────
    const moment = require('moment-timezone')
    const user = global.rpg[sender] || {}
    const tanggal = moment().tz('Asia/Jakarta').format('DD MMMM YYYY')
    const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss')
    const status = user.premium ? '⭐ Premium' : '👤 Free User'
    const nama = user.name || pushname
    const limit = user.limit ?? 10
    const maxLimit = 10
    const uptimeStr = funcs.runtime(process.uptime())

    // ─── BODY TEKS MENU (Ciri Khas Bot Tanpa Emoji Robot) ───────────────────
    const menuText =
`Hi @${sender.split('@')[0]}

┌  ◦ Uptime : ${uptimeStr}
│  ◦ Tanggal : ${tanggal}
│  ◦ Waktu : ${waktu}
└  ◦ Prefix Used : [ ${prefix} ]

╔══ Info Bot ══╗
│ Bot Name : RyzuBot
│ Total Fitur : 100+
│ Owner Bot : wa.me/628971614687
╚══════════════

╔══ Info User ══╗
│ Name : ${nama}
│ Status : ${status}
│ Limit : ${maxLimit - limit}/${maxLimit} • Sisa : ${limit}
╚══════════════

┌  ◦ *DAFTAR MENU*
│  ◦ ${prefix}menu all
│  ◦ ${prefix}menu rpg
│  ◦ ${prefix}menu games
│  ◦ ${prefix}menu gacha
│  ◦ ${prefix}menu media
│  ◦ ${prefix}menu tools
│  ◦ ${prefix}menu sticker
│  ◦ ${prefix}menu fun
└  ◦ ${prefix}menu admin 

*Note:* Ketik ${prefix}menu <category> untuk melihat menu spesifik
Contoh: ${prefix}menu tools`

    // BACA SETTING: Set ke true untuk mengirim gambar + caption teks menu.
    // Set ke false untuk mengirim menu teks murni (tanpa gambar sama sekali, sangat hemat penyimpanan).
    const sendAsImage = true 

    try {
      if (sendAsImage) {
        // Mengirim gambar biasa dengan teks menu sebagai caption (Bypass filter spam centang 1)
        await ryzu.sendMessage(from, {
          image: { url: 'https://files.catbox.moe/cz6tt0.jpg' },
          caption: menuText,
          contextInfo: {
            mentionedJid: [sender]
          }
        }, { quoted: msg })
      } else {
        // Mengirim teks murni (Sangat hemat penyimpanan dan super ringan)
        await ryzu.sendMessage(from, {
          text: menuText,
          contextInfo: {
            mentionedJid: [sender]
          }
        }, { quoted: msg })
      }
    } catch (e) {
      console.error('[MENU ERROR]', e.message)
      return reply(`❌ Error: ${e.message}`)
    }
  }
}

module.exports = menuModule
