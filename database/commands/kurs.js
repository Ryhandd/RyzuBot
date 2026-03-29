const axios = require("axios");

module.exports = {
    name: "kurs",
    alias: ["rate"],

    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .kurs 100 USD ke IDR");

        try {
            // Format: .kurs 100 USD ke IDR
            const match = q.match(/^(\d+(?:\.\d+)?)\s+([A-Z]{3})\s+(?:ke|to)\s+([A-Z]{3})$/i)
            if (match) {
            const [, amount, from_curr, to_curr] = match
            const res = await axios.get(`https://open.er-api.com/v6/latest/${from_curr.toUpperCase()}`)
            const rate = res.data.rates[to_curr.toUpperCase()]
            if (!rate) return reply("❌ Kode mata uang tidak ditemukan.")
            const result = (parseFloat(amount) * rate).toLocaleString("id-ID", { maximumFractionDigits: 4 })
            return reply(`💱 *KONVERSI KURS*\n\n${amount} ${from_curr.toUpperCase()} = *${result} ${to_curr.toUpperCase()}*\n\nRate: 1 ${from_curr.toUpperCase()} = ${rate.toLocaleString("id-ID", { maximumFractionDigits: 4 })} ${to_curr.toUpperCase()}`)
            }
            // Format: .kurs IDR (list rates)
            const curr = q.trim().toUpperCase()
            const res = await axios.get(`https://open.er-api.com/v6/latest/USD`)
            const popular = ["IDR", "MYR", "SGD", "EUR", "GBP", "JPY", "KRW", "AUD", "CNY"]
            let text = `💱 *KURS USD HARI INI*\n\n`
            for (const c of popular) {
            text += `${c}: ${res.data.rates[c]?.toLocaleString("id-ID") || "-"}\n`
            }
            return reply(text)
        } catch (e) {
            return reply("❌ Gagal ambil data kurs.")
        }
    }
};