require("dotenv").config()

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const crypto = require("crypto")
const { exec } = require("child_process")
const similarity = require("similarity")
const OpenAI = require("openai")
const chalk = require("chalk")

const chessHandler = require("./database/chessHandler.js")
const { db, initDB } = require("./lib/db.js")

const { downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys")

const getMediaType = (message) => {
  if (!message) return null
  if (message.imageMessage) return "image"
  if (message.videoMessage) return "video"
  if (message.stickerMessage) return "sticker"
  return null
}

async function init() {
  await initDB()
  await readCommands()
}

init()

// --- GLOBALS ---
global.chessGames = global.chessGames || {}
global.shimiCooldown = {}
global.shimiQueue = {}
global.simiCooldown = {}
global.simiQueue = {}
global.msgHistory = {}
global.suit = global.suit || {}

const ownerContacts = (process.env.OWNER_NUMBERS || "").split(",").filter(Boolean)
const dbPath = "./database/userRPG.json"

if (!fs.existsSync("./database")) fs.mkdirSync("./database")
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}))
global.rpg = JSON.parse(fs.readFileSync(dbPath))

global.SHIMI_PROMPT = `
Kamu adalah SHIMI.
Kepribadian: Feminim, Slayy, Gaul, Bestie vibes, Ramah dan playful.
Gaya bicara: Bahasa Indonesia gaul, santai, jawaban singkat.
Panggilan favorit ke user: "bestiee".
Usahakan setiap balasan diakhiri dengan kata "bestiee".
Emoji: 🥰 😘 🤭 😍 😋 😜 ❤ 💋 💅 🤣 💖 😭 😱
Kata gaul: bestiee, slayy, anjirr, mantul, gemes, sayang
`

global.SIMI_PROMPT = `
Kamu adalah SIMI. Kepribadian: Ceria, polos, menggemaskan, ramah.
Gaya bicara: Kalimat pendek, bahasa sederhana, nada ceria, pakai emoji 😊✨🐻.
Jangan pakai kata kasar. Fokus jawab sesuai pertanyaan.
`

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// --- HELPER FUNCTIONS ---
const decodeJid = (jid) => {
  if (!jid) return jid
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || {}
    return (decode.user && decode.server && decode.user + "@" + decode.server) || jid
  }
  return jid
}

const funcs = {
  saveRPG: () => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(global.rpg, null, 2))
    } catch (e) {
      console.error("Error saving RPG data:", e)
    }
  },

  runtime: (s) => {
    s = Number(s)
    const d = Math.floor(s / 86400),
      h = Math.floor((s % 86400) / 3600),
      m = Math.floor((s % 3600) / 60),
      sc = Math.floor(s % 60)
    return (d > 0 ? d + "h " : "") + (h > 0 ? h + "j " : "") + (m > 0 ? m + "m " : "") + sc + "d"
  },

  checkUser: (s) => {
    if (!global.rpg[s]) {
      global.rpg[s] = {
        registered: false, regTime: 0, name: "", premium: false, premiumTime: 0,
        money: 10000, exp: 0, level: 1, health: 100, maxHealth: 100, limit: 10,
        potion: 0, umpan: 0,
        kayu: 0, batu: 0, besi: 0, emas: 0, diamond: 0,
        ikan: 0, ikan_mas: 0, ikan_lele: 0, ikan_paus: 0, kepiting: 0,
        common: 0, uncommon: 0, mythic: 0, legendary: 0, sampah: 0,
        sword: null, armor: null, rod: null,
        durability: { sword: 0, armor: 0, rod: 0 },
        pet_wolf: 0, pet_dragon: 0, pet_cat: 0,
        mining_charm: 0, fishing_charm: 0, hunter_charm: 0,
        adventure_badge: 0, golden_emblem: 0,
        gacha_ticket: 0, gacha_pity: 0, gacha_history: [],
        lastAdventure: 0, lastFishing: 0, lastHunt: 0, lastMining: 0,
        lotre: 0, investasi: [], afk: 0, afkReason: "",
        lastDaily: 0, lastWeekly: 0, lastMonthly: 0, lastYearly: 0,
        lastMaling: 0, lastRampok: 0
      }
      funcs.saveRPG()
    }

    const u = global.rpg[s]

    // Ensure durability exists
    if (!u.durability) u.durability = { sword: 0, armor: 0, rod: 0 }
    for (const k of ["sword", "armor", "rod"]) {
      if (typeof u.durability[k] !== "number") u.durability[k] = 0
    }

    // Migrate old numeric equipment
    const tierMap = ["stone", "iron", "gold", "diamond", "netherite"]
    for (const eq of ["sword", "armor", "rod"]) {
      if (typeof u[eq] === "number") u[eq] = tierMap[u[eq] - 1] || null
    }

    const validTier = ["stone", "iron", "gold", "diamond", "netherite"]
    for (const eq of ["sword", "armor", "rod"]) {
      if (!validTier.includes(u[eq])) u[eq] = null
    }

    const maxDura = { stone: 80, iron: 120, gold: 160, diamond: 220, netherite: 300 }
    for (const eq of ["sword", "armor", "rod"]) {
      if (u[eq] && u.durability[eq] === 0) u.durability[eq] = maxDura[u[eq]]
    }

    // Ensure arrays
    if (!Array.isArray(u.gacha_history)) u.gacha_history = []
    if (!Array.isArray(u.investasi)) u.investasi = []

    // Ensure optional fields
    const defaults = {
      premiumTime: 0, lotre: 0, lastDaily: 0, lastWeekly: 0,
      lastMonthly: 0, lastYearly: 0, afk: 0, afkReason: ""
    }
    for (const [key, val] of Object.entries(defaults)) {
      if (u[key] === undefined) u[key] = val
    }
  },

  downloadMedia: async (media, type) => {
    const stream = await downloadContentFromMessage(media, type)
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    return buffer
  },

  cekLevel: (s) => {
    const u = global.rpg[s]
    if (!u) return false
    let naik = false
    while (u.exp >= u.level * 500) {
      u.exp -= u.level * 500
      u.level++
      u.maxHealth += 20
      u.health = u.maxHealth
      u.money += 1000
      naik = true
    }
    if (naik) funcs.saveRPG()
    return naik
  }
}

// --- LOAD COMMANDS ---
const commands = new Map()
const cmdFolder = path.join(__dirname, "database", "commands")

const readCommands = async () => {
  commands.clear()
  if (!fs.existsSync(cmdFolder)) fs.mkdirSync(cmdFolder, { recursive: true })
  const files = fs.readdirSync(cmdFolder).filter((f) => f.endsWith(".js"))
  for (const file of files) {
    try {
      // FIX: delete require cache biar bisa reload
      delete require.cache[require.resolve(path.join(cmdFolder, file))]
      const cmd = require(path.join(cmdFolder, file))
      if (cmd?.name) commands.set(cmd.name, cmd)
    } catch (e) {
      console.log(`❌ Gagal load command ${file}:`, e.message)
    }
  }
  console.log(`✅ Loaded ${commands.size} commands`)
}

const cooldowns = new Set()

// --- SHIMI FAST REPLY ---
const shimiFastReply = {
  oy: "apa bestiee??🥰", oyy: "apa bestiee??🥰",
  oi: "kenapa bestiee??🤭", oii: "kenapa bestiee??🤭",
  hi: "hi juga bestiee🥰", hai: "hai juga bestiee🥰",
  halo: "halo juga bestiee🥰",
  shimi: "iya bestiee🤭", shimii: "iya bestiee🤭",
  "lu siapa": "temenmu yang slayy dan mengbotyy💅💋",
  "siapa lu": "temenmu yang slayy dan mengbotyy💅💋",
}

const simiFastReply = {
  hai: "haiii 😊", halo: "halo 😊", hi: "hii ✨",
  simi: "iyaaa 😊", simii: "iyaaa 😊",
  "kamu siapa": "aku simi 😊", "siapa kamu": "aku simi, temennyaa kamu ✨",
}

// --- MAIN HANDLER ---
module.exports = async function ryzuHandler(ryzu, m) {
  try {
    const msg = m.messages[0]
    if (!msg || !msg.message) return

    // === IDENTITAS DASAR ===
    const from = msg.key.remoteJid
    const msgId = msg.key.id
    const isGroup = from.endsWith("@g.us")
    const sender = isGroup ? msg.key.participant || msg.participant : from
    const senderId = decodeJid(sender)
    const senderNumber = senderId.split("@")[0]
    const pushname = msg.pushName || "User"

    // === TEKS ===
    const rawText =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ""

    console.log(chalk.green(`[${isGroup ? "Grup" : "PC"}]`), chalk.yellow(pushname + ":"), rawText)

    // === DEFINISI REPLY (FIX: pindah ke atas sebelum dipakai) ===
    const reply = (teks) => {
      if (!teks) return
      return ryzu.sendMessage(from, { text: String(teks), contextInfo: { linkPreview: false } }, { quoted: msg })
    }

    // === MEDIA HANDLER ===
    const mediaType = getMediaType(msg.message)
    let mediaPath = null

    if (mediaType) {
      try {
        const extMap = { image: "jpg", video: "mp4", sticker: "webp" }
        const buffer = await funcs.downloadMedia(msg.message[`${mediaType}Message`], mediaType)
        const dir = path.join(__dirname, "media", mediaType)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        mediaPath = path.join(dir, `${msgId}.${extMap[mediaType]}`)
        fs.writeFileSync(mediaPath, buffer)
      } catch (e) {
        // Media download gagal, lanjut aja
      }
    }

    // === SIMPAN KE SQLITE (FIX: await db.prepare) ===
    try {
      await db.prepare(`INSERT OR IGNORE INTO messages (id, chat_id, sender, text, media_type, media_path, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(msgId, from, senderId, rawText, mediaType, mediaPath, Date.now())
    } catch (e) {
      // DB error gak perlu crash bot
    }

    // === MESSAGE HISTORY ===
    global.msgHistory[from] = global.msgHistory[from] || []
    global.msgHistory[from].push({ id: msgId, sender: senderId, text: rawText, timestamp: Date.now() })
    if (global.msgHistory[from].length > 50) global.msgHistory[from].shift()

    // === BOT IDENTITY ===
    const botId = decodeJid(ryzu.user?.id || ryzu.authState.creds.me?.id)
    const botNumber = botId?.split("@")[0] || ""

    // === PARSING COMMAND ===
    const body = rawText
    const text = body.trim()
    const bodyLow = text.toLowerCase()

    const prefixMatch = text.match(/^[\\/!#.]/)
    const prefix = prefixMatch ? prefixMatch[0] : "."
    const isCmd = !!prefixMatch
    const args = text.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()
    const q = args.join(" ")

    // === METADATA GRUP ===
    let groupMetadata = null
    let participants = []
    let isAdmin = false
    let isBotAdmin = false

    if (isGroup) {
      try {
        groupMetadata = await ryzu.groupMetadata(from)
        participants = groupMetadata.participants || []
        isAdmin = participants.some((p) => decodeJid(p.id) === senderId && p.admin)
        isBotAdmin = participants.some((p) => decodeJid(p.id) === botId && p.admin)
      } catch (e) {
        // Gagal ambil metadata, lanjut
      }
    }

    const isCreator = ownerContacts.includes(senderNumber) || botNumber === senderNumber

    // === ANTI-SPAM "BOT" ===
    if (!isCmd && bodyLow === "bot") {
      if (!cooldowns.has(from)) {
        cooldowns.add(from)
        setTimeout(() => cooldowns.delete(from), 30000)
        return reply("RyzuBot aktif! 🤖\nKetik *.menu* untuk melihat daftar perintah.")
      }
      return
    }

    // === CHESS HANDLER ===
    const chessHandled = await chessHandler({ from, sender: senderId, text, reply })
    if (chessHandled) return

    // === ADDITIONAL VARS ===
    const mentionUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const quotedMsg = quoted
      ? quoted.viewOnceMessageV2?.message || quoted.viewOnceMessage?.message || quoted
      : null

    // === SHIMI / SIMI BLOCK ===
    if (!isCmd && shimiFastReply[bodyLow] && global.shimi?.[senderId]) {
      return ryzu.sendMessage(from, { text: shimiFastReply[bodyLow] })
    }

    if (!isCmd && global.shimi?.[senderId] && text && !msg.key.fromMe && from !== "status@broadcast") {
      const now = Date.now()
      if (now - (global.shimiCooldown[senderId] || 0) < 1000) return
      global.shimiCooldown[senderId] = now
      if (Math.random() < 0.3) return
      if (!openai) return reply("OpenAI belum dikonfigurasi di .env bestiee 🤭")
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: global.SHIMI_PROMPT }, { role: "user", content: text }],
          max_tokens: 150, temperature: 1.2
        })
        return ryzu.sendMessage(from, { text: completion.choices[0].message.content || "apaan dah" }, { quoted: msg })
      } catch (e) { /* OpenAI error, skip */ }
    }

    if (!isCmd && simiFastReply[bodyLow] && global.simi?.[senderId]) {
      return ryzu.sendMessage(from, { text: simiFastReply[bodyLow] })
    }

    if (!isCmd && global.simi?.[senderId] && text && !msg.key.fromMe && from !== "status@broadcast") {
      const now = Date.now()
      if (now - (global.simiCooldown[senderId] || 0) < 1000) return
      global.simiCooldown[senderId] = now
      if (Math.random() < 0.3) return
      if (!openai) return
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: global.SIMI_PROMPT }, { role: "user", content: text }],
          max_tokens: 120, temperature: 0.6
        })
        return ryzu.sendMessage(from, { text: completion.choices[0].message.content || "hmm?? 🤔" }, { quoted: msg })
      } catch (e) { /* OpenAI error, skip */ }
    }

    // === INIT GAME OBJECTS ===
    if (!ryzu.game) ryzu.game = {}
    if (!ryzu.ttt) ryzu.ttt = {}
    if (!ryzu.suit) ryzu.suit = {}
    funcs.checkUser(senderId)

    // FIX: Ignore bot's own messages SETELAH checkUser
    if (msg.key.fromMe) return

    // === TIC TAC TOE HANDLER ===
    if (ryzu.ttt?.[from]) {
      const room = ryzu.ttt[from]
      if ((senderId === room.p1 || senderId === room.p2) && /^[1-9]$/.test(bodyLow)) {
        if (senderId !== room.turn) return

        const nomor = parseInt(bodyLow) - 1
        if (room.board[nomor] === "X" || room.board[nomor] === "O") {
          return reply("❌ Kotak sudah terisi!")
        }

        room.board[nomor] = senderId === room.p1 ? "X" : "O"
        room.turn = senderId === room.p1 ? room.p2 : room.p1

        const checkWin = (b) => {
          const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
          for (const c of wins) if (b[c[0]] === b[c[1]] && b[c[1]] === b[c[2]] && (b[c[0]] === "X" || b[c[0]] === "O")) return b[c[0]]
          return null
        }

        const renderBoard = (b) => {
          let res = ""
          for (let i = 0; i < 9; i++) {
            res += b[i] === "X" ? "❌" : b[i] === "O" ? "⭕" : "⬜"
            if ((i + 1) % 3 === 0) res += "\n"
          }
          return res
        }

        const winner = checkWin(room.board)
        const tie = room.board.every((x) => x === "X" || x === "O")
        const boardTeks = renderBoard(room.board)

        if (winner) {
          await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\n🎉 @${senderId.split("@")[0]} MENANG!`, mentions: [senderId] }, { quoted: msg })
          delete ryzu.ttt[from]
        } else if (tie) {
          await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\n🤝 SERI!`, mentions: [room.p1, room.p2] }, { quoted: msg })
          delete ryzu.ttt[from]
        } else {
          await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\nGiliran: @${room.turn.split("@")[0]}`, mentions: [room.turn] }, { quoted: msg })
        }
        return
      }
    }

    // === AFK LOGIC ===
    if (!body.startsWith(prefix + "delafk")) {
      // Tag mention ke user yang AFK
      if (mentionUser.length > 0) {
        for (const jid of mentionUser) {
          const target = global.rpg[jid]
          if (target?.afk > 0) {
            const waktu = funcs.runtime((Date.now() - target.afk) / 1000)
            ryzu.sendMessage(from, {
              text: `🔇 @${jid.split("@")[0]} sedang AFK!\nAlasan: ${target.afkReason || "-"}\nSejak: ${waktu} lalu.`,
              mentions: [jid]
            }, { quoted: msg })
          }
        }
      }

      // FIX: cek apakah senderId ada di rpg sebelum akses .afk
      if (global.rpg[senderId] && global.rpg[senderId].afk > 0) {
        const waktu = funcs.runtime((Date.now() - global.rpg[senderId].afk) / 1000)
        ryzu.sendMessage(from, {
          text: `✨ @${senderId.split("@")[0]} kembali online!\nBerhenti AFK setelah: ${waktu}`,
          mentions: [senderId]
        })
        global.rpg[senderId].afk = 0
        global.rpg[senderId].afkReason = ""
        funcs.saveRPG()
      }
    }

    // === GAME HANDLER ===
    if (ryzu.game[from] && body) {
      const room = ryzu.game[from]

      // --- HINT ---
      if (bodyLow === prefix + "hint") {
        if (room.tipe === "family100") return reply("❌ Family 100 tidak memiliki hint!")
        const user = global.rpg[senderId]
        if (!user.premium && user.limit <= 0) return reply("❌ Limit kamu habis! Tidak bisa pakai hint.")
        if (!user.premium) { user.limit -= 1; funcs.saveRPG() }

        if (room.deskripsi) return reply(`💡 *PETUNJUK*\n\n${room.deskripsi}`)

        const jawaban = Array.isArray(room.jawaban) ? room.jawaban[0] : room.jawaban
        const clue = jawaban.replace(/[a-zA-Z]/g, (c, i) => i === 0 || jawaban[i - 1] === " " ? c : "_")
        return reply(`💡 *HINT*\n\n${clue.toUpperCase()}`)
      }

      // --- NYERAH ---
      if (bodyLow === "nyerah") {
        if (room.tipe === "family100") {
          let teks = `🏳️ *MENYERAH*\n\nSoal: *${room.soal}*\n\n🗝️ *KUNCI JAWABAN:*\n`
          room.jawaban_asli.forEach((j, i) => {
            const p = room.penjawab?.[j.toLowerCase().trim()] ? ` ✅ @${room.penjawab[j.toLowerCase().trim()].split("@")[0]}` : " ❌"
            teks += `${i + 1}. ${j}${p}\n`
          })
          if (room.timeout) clearTimeout(room.timeout)
          delete ryzu.game[from]
          return ryzu.sendMessage(from, { text: teks, mentions: Object.values(room.penjawab || {}) }, { quoted: msg })
        } else {
          const jawaban = Array.isArray(room.jawaban) ? room.jawaban[0] : room.jawaban
          if (room.timeout) clearTimeout(room.timeout)
          delete ryzu.game[from]
          return reply(`🏳️ *MENYERAH*\nJawaban: *${jawaban.toUpperCase()}*`)
        }
      }

      // --- CEK JAWABAN ---
      if (!body.startsWith(prefix)) {
        if (room.tipe === "family100") {
          const index = room.jawaban.indexOf(bodyLow)
          if (index >= 0 && !room.terjawab.includes(bodyLow)) {
            room.terjawab.push(bodyLow)
            room.penjawab[bodyLow] = senderId
            global.rpg[senderId].money += 5000
            global.rpg[senderId].exp += 500
            const up = funcs.cekLevel(senderId)
            funcs.saveRPG()

            let teks = `✅ *BENAR!*\n📝 Soal: *${room.soal}*\n\n`
            const mentions = []
            room.jawaban_asli.forEach((j, i) => {
              const lj = j.toLowerCase().trim()
              if (room.terjawab.includes(lj)) {
                mentions.push(room.penjawab[lj])
                teks += `${i + 1}. ${j} (@${room.penjawab[lj].split("@")[0]})\n`
              } else teks += `${i + 1}. ??\n`
            })
            teks += `\n🎁 +5000 Money | +500 EXP`
            if (up) teks += `\n🎊 LEVEL UP!`

            if (room.terjawab.length === room.jawaban.length) {
              teks += `\n\n🎉 SEMUA TERJAWAB!`
              if (room.timeout) clearTimeout(room.timeout)
              delete ryzu.game[from]
            }
            return ryzu.sendMessage(from, { text: teks, mentions }, { quoted: msg })
          }
        } else {
          const targetJawaban = room.jawaban
          let benar = false
          if (Array.isArray(targetJawaban)) {
            benar = targetJawaban.some((j) => bodyLow === j || similarity(bodyLow, j) >= 0.75)
          } else {
            benar = bodyLow === targetJawaban || similarity(bodyLow, targetJawaban) >= 0.75
          }

          if (benar) {
            let money = 5000, exp = 500
            if (room.tipe === "math" && room.hadiah) { money = room.hadiah.money; exp = room.hadiah.exp }
            global.rpg[senderId].money += money
            global.rpg[senderId].exp += exp
            const up = funcs.cekLevel(senderId)
            if (room.timeout) clearTimeout(room.timeout)
            delete ryzu.game[from]
            return reply(`✅ *BENAR!*\n💰 +${money} Money\n✨ +${exp} EXP${up ? "\n🎊 LEVEL UP!" : ""}`)
          }
        }
      }
    }

    // === COMMAND HANDLER ===
    if (isCmd) {
      const cmd = commands.get(commandName) || [...commands.values()].find((x) => x.alias?.includes(commandName))

      if (cmd) {
        const user = global.rpg[senderId]
        const isPremium = user.premium || isCreator
        const whiteList = ["register", "reg", "daftar", "help", "menu", "rules", "owner", "s", "ping", "start"]

        if (!isPremium && !whiteList.includes(commandName)) {
          if (user.limit <= 0) {
            return reply(`❌ *LIMIT HABIS*\n\nBeli limit di *.shop* atau upgrade ke *Premium* biar No Limit.`)
          }
        }

        // Cek expired premium
        if (user.premium && user.premiumTime !== -1 && Date.now() > user.premiumTime) {
          user.premium = false
          user.premiumTime = 0
          funcs.saveRPG()
          ryzu.sendMessage(senderId, { text: "⏰ Premium kamu sudah berakhir. Perpanjang ya! 🥲" })
        }

        const rawQuotedUser = msg.message.extendedTextMessage?.contextInfo?.participant ||
          msg.message.extendedTextMessage?.contextInfo?.remoteJid || null
        const quotedUser = rawQuotedUser ? decodeJid(rawQuotedUser) : null

        const ctx = {
          ryzu, m, msg, from, sender: senderId, pushname, body, args, q, prefix,
          command: commandName, isGroup, isCreator, isAdmin, isBotAdmin, participants,
          groupMetadata, mentionUser, quoted: quotedMsg, quotedUser, reply, funcs,
          axios, exec, user, isPremium
        }

        try {
          await cmd.execute(ctx)
          if (!whiteList.includes(commandName)) {
            user.exp += 10
            if (!isPremium) user.limit -= 1
            funcs.cekLevel(senderId)
            funcs.saveRPG()
          }
        } catch (err) {
          console.error(`Error di command ${commandName}:`, err)
          reply(`❌ Error: ${err.message}`)
        }
      }
    }
  } catch (e) {
    console.error("Error in main handler:", e)
    // FIX: gak perlu kirim error ke owner kalau ownerContacts kosong
    if (ownerContacts[0]) {
      try {
        await ryzu.sendMessage(ownerContacts[0] + "@s.whatsapp.net", {
          text: `⚠️ *BOT ERROR*\n\n${e.message}`
        })
      } catch (_) {}
    }
  }
}