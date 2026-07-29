module.exports = {
  name: "help",
  alias: ["start", "panduan"],
  execute: async ({ reply, prefix, pushname }) => {

    const name = pushname || "User"

    const teks = `📖 *PANDUAN RYZUBOT*

👋 Halo *${name}*!
Selamat datang di RyzuBot (Bisa di Private Chat & Grup Chat)

━━━━━━━━━━━━━━━━━━━━━━

🚀 *CARA MULAI*
┌ 1. Semua fitur umum (AI, Downloader, Game, Media) bisa dipakai langsung tanpa daftar!
│
├ 2. Daftar akun jika ingin main RPG & Ekonomi:
│   ${prefix}register nama_kamu
│
└ 3. Cek profile RPG kamu & klaim daily:
    ${prefix}me / ${prefix}daily

━━━━━━━━━━━━━━━━━━━━━━

⚔️ *MAIN RPG* *(Butuh .daftar)*
┌ ${prefix}adventure  → cari resource
├ ${prefix}mining     → tambang
├ ${prefix}fishing    → mancing
└ ${prefix}heal       → isi darah

━━━━━━━━━━━━━━━━━━━━━━

🎮 *MAIN GAME & FITUR UMUM* *(Bisa Tanpa Daftar)*
┌ ${prefix}play / ${prefix}ai / ${prefix}sticker
├ ${prefix}tebakgambar / ${prefix}family100
└ ${prefix}tictactoe / ${prefix}genshin

━━━━━━━━━━━━━━━━━━━━━━

👑 *PREMIUM (FREE MODE)*
┌ Semua user saat ini bebas limit!
├ Semua fitur premium terbuka gratis
└ Cek status: ${prefix}limit

━━━━━━━━━━━━━━━━━━━━━━

📂 *LIHAT SEMUA MENU*
└ ${prefix}menu

━━━━━━━━━━━━━━━━━━━━━━
💡 Tips: Jangan spam command, bot bukan babu
`

    reply(teks)
  }
}