module.exports = {
  name: "premium",
  alias: ["prem", "vip"],
  execute: async ({ reply, prefix, pushname }) => {

    const teks = `👑 *PREMIUM RYZUBOT*

👋 Halo *${pushname}*!

🎁 *INFORMASI PENTING*:
Saat ini **seluruh fitur premium & limit tak terbatas aktif secara GRATIS** untuk seluruh pengguna tanpa perlu berlangganan!

━━━━━━━━━━━━━━━━━━━━━━

💎 *PAKET BULANAN (OPSIONAL SUPPORT)*
┌ 1 Bulan  — Rp5.000
├ 2 Bulan  — Rp9.000 (hemat 10%)
└ 3 Bulan  — Rp12.000 (hemat 20%)

💎 *PAKET PERMANEN*
└ Permanen — Rp50.000

━━━━━━━━━━━━━━━━━━━━━━

✨ *KEUNTUNGAN PREMIUM*
┌ Akses fitur premium
├ Unlimited Limit
├ Support perkembangan server bot
└ Prioritas respon bot

━━━━━━━━━━━━━━━━━━━━━━

📌 Ingin berkontribusi/dukung bot? Chat ${prefix}owner ya`

    reply(teks)
  }
}