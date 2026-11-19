// ============================================
// lib/ai.js — AI client (DeepSeek V4.1 Flash via BangunWeb router)
// ============================================
process.env.NODE_NO_WARNINGS = "1"

const https = require("https")
const http = require("http")
const { URL } = require("url")

// Shared HTTP agents: keep-alive reduces TLS handshakes & socket churn on
// RAM-limited hosts (InstaBox free plan). No pooling for the router = fewer
// parallel fetches from a single process.
const agent = new https.Agent({ keepAlive: true, maxSockets: 4, timeout: 60000 })

/**
 * Minimal fetch fallback for Node versions < 18. Uses https/http directly so
 * the bot stays dependency-free for its critical path.
 */
function fallbackFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const lib = u.protocol === "https:" ? https : http
    const req = lib.request(
      u,
      {
        method: options.method || "GET",
        headers: options.headers || {},
        timeout: options.timeout || 30000
      },
      (res) => {
        const chunks = []
        res.on("data", (c) => chunks.push(c))
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8")
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: async () => body,
            json: async () => JSON.parse(body)
          })
        })
      }
    )
    req.on("timeout", () => req.destroy(new Error(`timeout after ${options.timeout || 30000}ms`)))
    req.on("error", reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

const fetchImpl = typeof fetch === "function" ? fetch : fallbackFetch

/**
 * Chat completion against any OpenAI-compatible endpoint.
 * Defaults to DeepSeek V4.1 Flash via the BangunWeb router.
 *
 * @param {object} p
 * @param {string|Array} p.messages  string → single user turn, or chat array
 * @param {string} [p.model]         model id (default env AI_MODEL)
 * @param {string} [p.system]        system prompt (string messages only)
 * @param {number} [p.maxTokens]
 * @param {number} [p.temperature]
 * @param {object} [p.extra]         extra body fields (e.g. stream: false)
 * @returns {Promise<string|null>}
 */
async function aiChat({
  messages,
  model,
  system,
  maxTokens = 512,
  temperature = 0.7,
  extra = {}
} = {}) {
  const key = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY
  const base = (process.env.AI_BASE_URL || "https://router.bangunweb.com/v1").replace(/\/+$/, "")
  if (!key) return null

  const msgs = Array.isArray(messages)
    ? messages
    : [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: String(messages || "") }
      ]

  try {
    const res = await fetchImpl(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || process.env.AI_MODEL || "deepseek-v4.1-flash",
        messages: msgs,
        max_tokens: maxTokens,
        temperature,
        ...extra
      }),
      timeout: 45000
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[AI] HTTP ${res.status}: ${String(text).slice(0, 200)}`)
      return null
    }
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || null
  } catch (e) {
    console.error("[AI] request failed:", e.message)
    return null
  }
}

/** Strip WhatsApp-broken characters (*, #, long markdown) from AI answers. */
function cleanAiText(text) {
  return String(text || "")
    .replace(/[\*#]/g, "")
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```[a-z]*\n?/g, ""))
    .trim()
}

module.exports = { aiChat, cleanAiText, fetchImpl, agent }
