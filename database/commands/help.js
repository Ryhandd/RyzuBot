module.exports = {
  name: "help",
  alias: ["start", "panduan"],
  execute: async ({ reply, prefix, pushname }) => {

    const name = pushname || "User"

    const teks = `📖 *PANDUAN RYZUBOT*

👋 Halo *${name}*!
Selamat datang di RyzuBot

━━━━━━━━━━━━━━━━━━━━━━

🚀 *CARA MULAI*
┌ 1. Daftar akun dulu
│   ${prefix}register nama_kamu
│
├ 2. Cek profile kamu
│   ${prefix}me
│
└ 3. Ambil hadiah gratis
    ${prefix}daily

━━━━━━━━━━━━━━━━━━━━━━

⚔️ *MAIN RPG*
┌ ${prefix}adventure  → cari resource
├ ${prefix}mining     → tambang
├ ${prefix}fishing    → mancing
└ ${prefix}heal       → isi darah

━━━━━━━━━━━━━━━━━━━━━━

🎮 *MAIN GAME*
┌ ${prefix}suit @tag
├ ${prefix}tebakgambar
└ ${prefix}family100

━━━━━━━━━━━━━━━━━━━━━━

💰 *DAPET UANG*
┌ ${prefix}daily
├ ${prefix}adventure
├ ${prefix}jual item di ${prefix}shop
└ ${prefix}top

━━━━━━━━━━━━━━━━━━━━━━

👑 *PREMIUM (OPSIONAL)*
┌ Akses fitur lebih banyak
├ Limit lebih besar
└ Cek: ${prefix}premium

━━━━━━━━━━━━━━━━━━━━━━

📂 *LIHAT SEMUA MENU*
└ ${prefix}menu

━━━━━━━━━━━━━━━━━━━━━━
💡 Tips: Jangan spam command, bot bukan babu
`

    reply(teks)
  }
}