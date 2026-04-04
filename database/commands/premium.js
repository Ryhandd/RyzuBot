module.exports = {
  name: "premium",
  alias: ["prem", "vip"],
  execute: async ({ reply, prefix, pushname }) => {

    const teks = `👑 *PREMIUM RYZUBOT*

    👋 Halo *${pushname}*!

━━━━━━━━━━━━━━━━━━━━━━

💎 *PAKET BULANAN*
┌ 1 Bulan  — Rp5.000
├ 2 Bulan  — Rp9.000 (hemat 10%)
└ 3 Bulan  — Rp12.000 (hemat 20%)

💎 *PAKET PERMANEN*
└ Permanen — Rp50.000

━━━━━━━━━━━━━━━━━━━━━━

✨ *KEUNTUNGAN PREMIUM*
┌ Limit lebih banyak
├ Akses fitur premium
├ No cooldown (beberapa fitur)
├ Prioritas response bot
└ Support perkembangan bot

━━━━━━━━━━━━━━━━━━━━━━
⚠️ Harga bisa naik sewaktu-waktu

📌 Minat? Chat ${prefix}owner ya`

    reply(teks)
  }
}