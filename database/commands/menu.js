const sendCard = require('../../lib/sendCard')

module.exports = {
  name: "menu",
  execute: async ({ ryzu, from, msg, reply, pushname, prefix, sender, funcs, args }) => {
    funcs.checkUser(sender)
    const user = global.rpg[sender]
    const sub = args.length ? args.shift().toLowerCase() : ""

    const categories = {
      rpg:    { name: "⚔️ RPG", id: "rpg" },
      games:  { name: "🎲 Games", id: "games" },
      media:  { name: "🎵 Media", id: "media" },
      tools:  { name: "🧰 Tools", id: "tools" },
      admin:  { name: "👥 Admin", id: "admin" },
      gacha:  { name: "🎰 Gacha", id: "gacha" },
      fun:    { name: "🎭 Fun", id: "fun" },
      sticker:{ name: "🖼️ Sticker", id: "sticker" },
      maker:  { name: "✏️ Maker", id: "maker" },
      download:{ name: "⬇️ Download", id: "download" },
      search: { name: "🔍 Search", id: "search" },
      ai:     { name: "🤖 AI", id: "ai" },
      owner:  { name: "👑 Owner", id: "owner" }
    }

    // SUB-MENU DETAIL (teks biasa untuk ketika user pilih kategori)
    const menuDetails = {
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
└ ${prefix}tebakgender <nama>`,

      sticker: `🖼️ *STICKER*\n┌ ${prefix}sticker / s\n├ ${prefix}stickergif / sgif\n├ ${prefix}stickerwm / swm <pack>|<author>\n├ ${prefix}take <pack>|<author>\n└ ${prefix}emojimix <😎>+<😎>`,

      maker: `✏️ *MAKER*\n┌ ${prefix}attp <teks>\n├ ${prefix}ttp <teks>\n├ ${prefix}brat <teks>\n└ ${prefix}quotemaker`,

      download: `⬇️ *DOWNLOAD*\n┌ ${prefix}play <judul>\n├ ${prefix}ytmp3 <link>\n├ ${prefix}ytmp4 <link>\n├ ${prefix}tt <link>\n├ ${prefix}ig <link>\n├ ${prefix}fb <link>\n└ ${prefix}mediafire <link>`,

      search: `🔍 *SEARCH*\n┌ ${prefix}pinterest <query>\n├ ${prefix}ytsearch <query>\n├ ${prefix}google <query>\n├ ${prefix}gimage <query>\n└ ${prefix}wikimedia <query>`,

      ai: `🤖 *AI*\n┌ ${prefix}ai <pertanyaan>\n├ ${prefix}aiimg <prompt>\n├ ${prefix}remini / hd\n├ ${prefix}chatgpt <pertanyaan>\n└ ${prefix}blackbox <pertanyaan>`,

      owner: `👑 *OWNER*\n┌ ${prefix}addpremium @tag <hari>\n├ ${prefix}delpremium @tag\n├ ${prefix}addmoney @tag <jumlah>\n├ ${prefix}addexp @tag <jumlah>\n├ ${prefix}setafk @tag <jam>\n├ ${prefix}delafk @tag\n└ ${prefix}listpremium`
    }

    // JIKA USER MEMILIH SUB-MENU
    if (sub && menuDetails[sub]) {
      return reply(
        `📋 *${categories[sub]?.name || sub.toUpperCase()}*\n` +
        menuDetails[sub] +
        `\n\n_Ketik ${prefix}menu untuk kembali ke menu utama_`
      )
    }

    // === MENU UTAMA DENGAN LIST MESSAGE (WHATSAPP BUSINESS STYLE) ===
    const sections = [
      {
        title: "📂 MENU UTAMA",
        rows: [
          { title: "📋 Semua Fitur", description: "Lihat semua command tersedia", id: `${prefix}allmenu` },
          { title: "🛒 Store Menu", description: "Topup & Jualan", id: `${prefix}store` },
          { title: "📊 Menu Owner", description: "Khusus Owner Bot", id: `${prefix}menu owner` },
          { title: "👨‍💻 Owner / Dev", description: "Info Pembuat Bot", id: `${prefix}owner` }
        ]
      },
      {
        title: "📁 KATEGORI MENU LAIN",
        rows: [
          { title: "🖼️ Menu Stickers", description: "Bikin stiker dari gambar/video", id: `${prefix}menu sticker` },
          { title: "✏️ Menu Maker", description: "Text to image, brat, attp", id: `${prefix}menu maker` },
          { title: "⬇️ Menu Download", description: "YT, TT, IG, FB Downloader", id: `${prefix}menu download` },
          { title: "🔍 Menu Search", description: "Pinterest, Google, YT Search", id: `${prefix}menu search` },
          { title: "🎮 Menu Game", description: "Tebak gambar, math, slot", id: `${prefix}menu games` },
          { title: "🤖 Menu AI", description: "ChatGPT, AI Image, Remini", id: `${prefix}menu ai` },
          { title: "⚔️ Menu RPG", description: "Adventure, mining, ekonomi", id: `${prefix}menu rpg` },
          { title: "🎭 Menu Fun", description: "Apakah, kerang ajaib, rate", id: `${prefix}menu fun` },
          { title: "🎰 Menu Gacha", description: "Gacha karakter & item", id: `${prefix}menu gacha` },
          { title: "🧰 Menu Tools", description: "Ping, translate, QR, calc", id: `${prefix}menu tools` }
        ]
      }
    ]

    const buttonText = `╔══════════════════════╗
║   🤖  *RYZU BOT*   ║
╚══════════════════════╝

👋 Halo *${pushname}*!

📌 *INFO BOT*
┌ 🤖 Bot Name: RyzuBot
├ 📦 Version: 2.0.0
└ 📅 ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

📊 *INFO USER*
┌ 👤 Status: ${user?.premium ? '⭐ Premium' : '🆓 Free User'}
├ 📛 Name: ${pushname}
├ 🎫 Limit: ${user?.limit || 0}/25 • Sisa: ${25 - (user?.limit || 0)}
└ 🎭 Role: ${user?.premium ? 'Premium' : 'Free'}

━━━━━━━━━━━━━━━━━━━━━━
💡 *Tips:* Pilih kategori di bawah untuk melihat detail command.
_Ketik ${prefix}help untuk panduan lengkap._`

    // Kirim List Message
    await ryzu.sendMessage(from, {
      text: buttonText,
      buttonText: "📂 BUKA MENU",
      sections: sections,
      footer: "Ryzu Bot • a calm & smart whatsapp assistant"
    }, { quoted: msg })

  }
}