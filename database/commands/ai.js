const RyzuAI = require("../../scrape/RyzuAI")
const { cleanAiText } = require("../../lib/ai")

module.exports = {
    name: "ai",
    alias: ["tanya", "ask", "chatgpt", "gpt"],
    execute: async ({ reply, q, prefix, command }) => {
        if (!q) return reply(`Contoh: ${prefix + command} apa itu coding?`)

        await reply("⏳ Sedang berpikir...")

        const res = await RyzuAI(q)
        if (!res) return reply("❌ Layanan AI sedang gangguan, coba lagi nanti.")

        return reply(cleanAiText(res))
    }
}