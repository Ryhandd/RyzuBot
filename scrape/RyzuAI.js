const axios = require("axios")
const { aiChat, cleanAiText } = require("../lib/ai")

/**
 * Primary engine: DeepSeek V4.1 Flash via BangunWeb router (lib/ai.js).
 * Fallbacks are only attempted when their API key exists, so a missing key
 * no longer wastes a request + timeout.
 */
async function RyzuAI(prompt, opts = {}) {
  const primary = await aiChat({
    messages: prompt,
    system: opts.system,
    maxTokens: opts.maxTokens || 800,
    temperature: opts.temperature ?? 0.7
  })
  if (primary) return primary

  // GROQ
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: String(prompt) }]
        },
        {
          headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
          timeout: 30000
        }
      )
      const out = res.data?.choices?.[0]?.message?.content
      if (out) return out
    } catch (err) {
      console.error("GROQ ERROR:", err.response?.status || err.message)
    }
  }

  // OPENROUTER
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-chat",
          messages: [{ role: "user", content: String(prompt) }]
        },
        {
          headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
          timeout: 30000
        }
      )
      const out = res.data?.choices?.[0]?.message?.content
      if (out) return out
    } catch (err) {
      console.error("OPENROUTER ERROR:", err.response?.status || err.message)
    }
  }

  return null
}

module.exports = RyzuAI
module.exports.cleanAiText = cleanAiText