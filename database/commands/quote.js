module.exports = {
    name: "quote",
    alias: ["motivasi"],
    
    execute: async ({ ryzu, from, q, msg, reply }) => {
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(q)}&color=000000&bgcolor=FFFFFF&format=png`
            await ryzu.sendMessage(from, { image: { url: qrUrl }, caption: `📱 *QR CODE*\n\nData: ${q}` }, { quoted: msg })
        } catch {
            return reply("❌ Gagal generate QR.")
        }
    }
}