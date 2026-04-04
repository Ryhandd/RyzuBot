require("dotenv").config()

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const { exec } = require("child_process")
const similarity = require("similarity")
const OpenAI = require("openai")
const chalk = require("chalk")

const chessHandler = require("./database/chessHandler.js")
const { db, initDB } = require("./lib/db.js")
const { connect, User } = require("./lib/mongo")

const { downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys")

const getMediaType = (message) => {
  if (!message) return null
  if (message.imageMessage) return "image"
  if (message.videoMessage) return "video"
  if (message.stickerMessage) return "sticker"
  return null
}

global.chessGames = global.chessGames || {}
global.shimiCooldown = {}
global.simiCooldown = {}
global.msgHistory = {}
global.suit = global.suit || {}
global.shimi = global.shimi || {}
global.simi = global.simi || {}
global.rpg = {}

const ownerContacts = (process.env.OWNER_NUMBERS || "").split(",").filter(Boolean)
const dbPath = "./database/userRPG.json"

if (!fs.existsSync("./database")) fs.mkdirSync("./database")

global.SHIMI_PROMPT = `Kamu adalah SHIMI. Kepribadian: Feminim, Slayy, Gaul, Bestie vibes, Ramah dan playful. Gaya bicara: Bahasa Indonesia gaul, santai, jawaban singkat. Panggilan favorit ke user: "bestiee". Usahakan setiap balasan diakhiri dengan kata "bestiee". Emoji: 🥰 😘 🤭 😍 😋 😜 ❤ 💋 💅 🤣 💖 😭 😱`
global.SIMI_PROMPT = `Kamu adalah SIMI. Kepribadian: Ceria, polos, menggemaskan, ramah. Gaya bicara: Kalimat pendek, bahasa sederhana, nada ceria, pakai emoji 😊✨🐻. Jangan pakai kata kasar. Fokus jawab sesuai pertanyaan.`

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        jid = (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    }
    return jid.replace(/:.*@/g, '@').split('@') + '@' + jid.split('@');
};

const funcs = {
  saveRPG: async (userId) => {
    try {
      if (userId && global.rpg[userId]) {
        await User.findByIdAndUpdate(userId, { _id: userId, data: global.rpg[userId] }, { upsert: true, returnDocument: 'after' })
      } else {
        for (const [id, data] of Object.entries(global.rpg)) {
          await User.findByIdAndUpdate(id, { _id: id, data }, { upsert: true })
        }
      }
      fs.writeFileSync(dbPath, JSON.stringify(global.rpg, null, 2))
    } catch (e) {
      console.error("saveRPG error:", e.message)
      try { fs.writeFileSync(dbPath, JSON.stringify(global.rpg, null, 2)) } catch (_) {}
    }
  },

  runtime: (s) => {
    s = Number(s)
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
      m = Math.floor((s % 3600) / 60), sc = Math.floor(s % 60)
    return (d > 0 ? d + "h " : "") + (h > 0 ? h + "j " : "") + (m > 0 ? m + "m " : "") + sc + "d"
  },

  checkUser: (s) => {
    if (!global.rpg[s]) {
      global.rpg[s] = {
        registered: false, regTime: 0, name: "", premium: false, premiumTime: 0,
        money: 10000, exp: 0, level: 1, health: 100, maxHealth: 100, limit: 10,
        potion: 0, umpan: 0, kayu: 0, batu: 0, besi: 0, emas: 0, diamond: 0,
        ikan: 0, ikan_mas: 0, ikan_lele: 0, ikan_paus: 0, kepiting: 0,
        common: 0, uncommon: 0, mythic: 0, legendary: 0, sampah: 0,
        sword: null, armor: null, rod: null, durability: { sword: 0, armor: 0, rod: 0 },
        pet_wolf: 0, pet_dragon: 0, pet_cat: 0,
        mining_charm: 0, fishing_charm: 0, hunter_charm: 0,
        adventure_badge: 0, golden_emblem: 0,
        gacha_ticket: 0, gacha_pity: 0, gacha_history: [],
        lastAdventure: 0, lastFishing: 0, lastHunt: 0, lastMining: 0,
        lotre: 0, investasi: [], afk: 0, afkReason: "",
        lastDaily: 0, lastWeekly: 0, lastMonthly: 0, lastYearly: 0,
        lastMaling: 0, lastRampok: 0
      }
      funcs.saveRPG(s).catch(() => {})
    }
    const u = global.rpg[s]
    if (!u.durability) u.durability = { sword: 0, armor: 0, rod: 0 }
    for (const k of ["sword", "armor", "rod"]) {
      if (typeof u.durability[k] !== "number") u.durability[k] = 0
    }
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
    if (!Array.isArray(u.gacha_history)) u.gacha_history = []
    if (!Array.isArray(u.investasi)) u.investasi = []
    const defaults = { premiumTime: 0, lotre: 0, lastDaily: 0, lastWeekly: 0, lastMonthly: 0, lastYearly: 0, afk: 0, afkReason: "" }
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
    if (naik) funcs.saveRPG(s).catch(() => {})
    return naik
  }
}

const commands = new Map()
const cmdFolder = path.join(__dirname, "database", "commands")

const readCommands = async () => {
  commands.clear()
  if (!fs.existsSync(cmdFolder)) fs.mkdirSync(cmdFolder, { recursive: true })
  const files = fs.readdirSync(cmdFolder).filter((f) => f.endsWith(".js"))
  console.log("📂 Files:", files)
  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(cmdFolder, file))]
      const cmd = require(path.join(cmdFolder, file))
      if (cmd?.name) {
        commands.set(cmd.name, cmd)
        console.log(`✅ Loaded: ${cmd.name}`)
      } else {
        console.log(`⚠️ ${file} tidak punya property 'name'`)
      }
    } catch (e) {
      console.log(`❌ Gagal load ${file}:`, e.message)
    }
  }
  console.log(`🔥 Total commands: ${commands.size}`)
}

async function init() {
  try {
    await connect()
    await initDB()
    const users = await User.find({})
    for (const u of users) {
      if (u._id !== "__sesi__") global.rpg[u._id] = u.data
    }
    console.log(`✅ Loaded ${users.length} users dari MongoDB`)
    if (fs.existsSync(dbPath)) {
      try {
        const localData = JSON.parse(fs.readFileSync(dbPath))
        for (const [id, data] of Object.entries(localData)) {
          if (!global.rpg[id]) global.rpg[id] = data
        }
      } catch (_) {}
    }
  } catch (e) {
    console.error("MongoDB gagal, fallback ke JSON:", e.message)
    if (fs.existsSync(dbPath)) {
      global.rpg = JSON.parse(fs.readFileSync(dbPath))
    }
  }
  await readCommands()
}

init()

const shimiFastReply = {
  oy: "apa bestiee??🥰", oyy: "apa bestiee??🥰",
  oi: "kenapa bestiee??🤭", oii: "kenapa bestiee??🤭",
  hi: "hi juga bestiee🥰", hai: "hai juga bestiee🥰",
  halo: "halo juga bestiee🥰", shimi: "iya bestiee🤭", shimii: "iya bestiee🤭",
  "lu siapa": "temenmu yang slayy dan mengbotyy💅💋",
  "siapa lu": "temenmu yang slayy dan mengbotyy💅💋",
}

const simiFastReply = {
  hai: "haiii 😊", halo: "halo 😊", hi: "hii ✨",
  simi: "iyaaa 😊", simii: "iyaaa 😊",
  "kamu siapa": "aku simi 😊", "siapa kamu": "aku simi, temennyaa kamu ✨",
}

const cooldowns = new Set()

// Cache LID -> nomor HP & owner JID
const lidToNumber = new Map()
const ownerJidCache = new Set()
const ownerNumbers = ownerContacts.map(v => v.trim().replace(/[^0-9]/g, ""))

module.exports = async function ryzuHandler(ryzu, m) {
  try {
    const msg = m.messages[0]
    if (!msg || !msg.message) return
    if (msg.key.fromMe) return

    const msgId = msg.key.id
    const from = msg.key.remoteJid
    if (!from || from === "status@broadcast") return

    const isGroup = from.endsWith("@g.us")

    // === SENDER ===
    let sender
    if (isGroup) {
      sender = msg.key.participant || msg.participant || msg.key.remoteJid
    } else {
      sender = msg.key.remoteJid
    }

    const senderId = decodeJid(sender)
    const pushname = msg.pushName || "User"

    // === BOT IDENTITY ===
    const botId = decodeJid(ryzu.user?.id || ryzu.authState?.creds?.me?.id)

    // === GRUP METADATA ===
    // Dilakukan AWAL agar LID bisa di-resolve sebelum cek isCreator
    let groupMetadata = null
    let participants = []
    let isAdmin = false
    let isBotAdmin = false

    if (isGroup) {
      try {
        groupMetadata = await ryzu.groupMetadata(from)
        participants = groupMetadata.participants || []

        for (const p of participants) {
          const pJid = decodeJid(p.id)
          const pNum = pJid.split("@")[0].replace(/[^0-9]/g, "")

          // Simpan mapping LID -> nomor HP
          if (p.lid) {
            const pLid = p.lid.split("@")[0].replace(/[^0-9]/g, "")
            if (pLid && pNum) lidToNumber.set(pLid, pNum)
          }

          // Kalau participant ini adalah owner, cache JID-nya (termasuk LID)
          if (ownerNumbers.includes(pNum)) {
            ownerJidCache.add(pJid)
            if (p.lid) ownerJidCache.add(decodeJid(p.lid))
          }
        }

        isAdmin = participants.some((p) => decodeJid(p.id) === senderId && p.admin)
        isBotAdmin = participants.some((p) => decodeJid(p.id) === botId && p.admin)
      } catch (_) {}
    }

    // === RESOLVE NOMOR DARI LID ===
    let resolvedNum = senderId.split("@")[0].replace(/[^0-9]/g, "")
    if (resolvedNum.length > 13 && lidToNumber.has(resolvedNum)) {
      resolvedNum = lidToNumber.get(resolvedNum)
    }

    // === IS CREATOR ===
    const isCreator =
      ownerJidCache.has(senderId) ||                          // JID sudah dikenal owner
      ownerNumbers.includes(resolvedNum) ||                   // Nomor resolved cocok
      ownerNumbers.some(o => resolvedNum.endsWith(o)) ||      // Suffix match (62xxx vs 0xxx)
      ownerNumbers.some(o => o.endsWith(resolvedNum))         // Reverse suffix

    const rawText = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.buttonsResponseMessage?.selectedDisplayText ||
      msg.message?.listResponseMessage?.title ||
      msg.message?.ephemeralMessage?.message?.conversation ||
      msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      ""
    ).trim()

    console.log(chalk.green(`[${isGroup ? "Grup" : "PC"}]`), chalk.yellow(pushname + ":"), rawText)

    const reply = (teks) => {
      if (!teks) return
      return ryzu.sendMessage(from, { text: String(teks), contextInfo: { linkPreview: false } }, { quoted: msg })
    }

    // === MEDIA ===
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
      } catch (_) {}
    }

    // === SQLITE ===
    try {
      await db.prepare(`INSERT OR IGNORE INTO messages (id, chat_id, sender, text, media_type, media_path, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(msgId, from, senderId, rawText, mediaType, mediaPath, Date.now())
    } catch (_) {}

    // === HISTORY ===
    global.msgHistory[from] = global.msgHistory[from] || []
    global.msgHistory[from].push({ id: msgId, sender: senderId, text: rawText, timestamp: Date.now() })
    if (global.msgHistory[from].length > 50) global.msgHistory[from].shift()

    // === PARSING ===
    const body = rawText
    const text = body.trim()
    const bodyLow = text.toLowerCase()
    const prefixMatch = text.match(/^[\\/!#.]/)
    const prefix = prefixMatch ? prefixMatch[0] : "."
    const isCmd = prefixMatch !== null
    const args = text.slice(isCmd ? prefix.length : 0).trim().split(/ +/)
    const commandName = isCmd ? args.shift().toLowerCase() : ""
    const q = args.join(" ")

    // === INIT USER ===
    funcs.checkUser(senderId)

    // === ANTI-SPAM "BOT" ===
    if (!isCmd && bodyLow.includes("bot")) {
      return reply("RyzuBot disini!\nKetik *.menu* untuk daftar perintah.");
    }

    // === CHESS ===
    const chessHandled = await chessHandler({ from, sender: senderId, text, reply })
    if (chessHandled) return

    const mentionUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const quotedMsg = quoted
      ? quoted.viewOnceMessageV2?.message || quoted.viewOnceMessage?.message || quoted
      : null

    // === SHIMI ===
    if (!isCmd && shimiFastReply[bodyLow] && global.shimi?.[senderId]) {
      return ryzu.sendMessage(from, { text: shimiFastReply[bodyLow] })
    }
    if (!isCmd && global.shimi?.[senderId] && text && openai) {
      const now = Date.now()
      if (now - (global.shimiCooldown[senderId] || 0) < 1000) return
      global.shimiCooldown[senderId] = now
      if (Math.random() < 0.3) return
      try {
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: global.SHIMI_PROMPT }, { role: "user", content: text }],
          max_tokens: 150, temperature: 1.2
        })
        return ryzu.sendMessage(from, { text: res.choices[0].message.content || "apaan dah" }, { quoted: msg })
      } catch (_) {}
    }

    // === SIMI ===
    if (!isCmd && simiFastReply[bodyLow] && global.simi?.[senderId]) {
      return ryzu.sendMessage(from, { text: simiFastReply[bodyLow] })
    }
    if (!isCmd && global.simi?.[senderId] && text && openai) {
      const now = Date.now()
      if (now - (global.simiCooldown[senderId] || 0) < 1000) return
      global.simiCooldown[senderId] = now
      if (Math.random() < 0.3) return
      try {
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: global.SIMI_PROMPT }, { role: "user", content: text }],
          max_tokens: 120, temperature: 0.6
        })
        return ryzu.sendMessage(from, { text: res.choices[0].message.content || "hmm?? 🤔" }, { quoted: msg })
      } catch (_) {}
    }

    // === GAME OBJECTS ===
    if (!ryzu.game) ryzu.game = {}
    if (!ryzu.ttt) ryzu.ttt = {}
    if (!ryzu.suit) ryzu.suit = {}

    // === TIC TAC TOE ===
    if (ryzu.ttt?.[from] && Object.keys(ryzu.ttt[from]).length > 0) {
      let isReplyId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      if (isReplyId && ryzu.ttt[from][isReplyId]) {
        const room = ryzu.ttt[from][isReplyId];
        
        if ((senderId === room.p1 || senderId === room.p2) && /^[1-9]$/.test(bodyLow)) {
          if (senderId !== room.turn) return;
          const nomor = parseInt(bodyLow) - 1;
          if (room.board[nomor] === "X" || room.board[nomor] === "O") return reply("❌ Kotak sudah terisi!");
          
          room.board[nomor] = senderId === room.p1 ? "X" : "O";
          room.turn = senderId === room.p1 ? room.p2 : room.p1;
          
          const checkWin = (b) => {
            const wins = [,,,,,,,];
            for (const c of wins) if (b[c] === b[c] && b[c] === b[c] && (b[c] === "X" || b[c] === "O")) return b[c];
            return null;
          }
          const renderBoard = (b) => {
            let res = "";
            for (let i = 0; i < 9; i++) {
              res += b[i] === "X" ? "❌" : b[i] === "O" ? "⭕" : "⬜";
              if ((i + 1) % 3 === 0) res += "\n";
            }
            return res;
          }
          
          const winner = checkWin(room.board);
          const tie = room.board.every((x) => x === "X" || x === "O");
          const boardTeks = renderBoard(room.board);
          
          if (winner) {
            await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\n🎉 @${senderId.split("@")} MENANG!`, mentions: [senderId] }, { quoted: msg });
            delete ryzu.ttt[from][isReplyId];
          } else if (tie) {
            await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\n🤝 SERI!`, mentions: [room.p1, room.p2] }, { quoted: msg });
            delete ryzu.ttt[from][isReplyId];
          } else {
            let nextMsg = await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\nGiliran: @${room.turn.split("@")}\nBalas pesan ini untuk membalas!`, mentions: [room.turn] }, { quoted: msg });
            
            ryzu.ttt[from][nextMsg.key.id] = room;
            delete ryzu.ttt[from][isReplyId];
          }
          return;
        }
      }
    }

    // === AFK ===
    if (!isCmd || commandName !== "delafk") {
      for (const jid of mentionUser) {
        const t = global.rpg[jid]
        if (t?.afk > 0) {
          const waktu = funcs.runtime((Date.now() - t.afk) / 1000)
          ryzu.sendMessage(from, { text: `🔇 @${jid.split("@")[0]} sedang AFK!\nAlasan: ${t.afkReason || "-"}\nSejak: ${waktu} lalu.`, mentions: [jid] }, { quoted: msg })
        }
      }
      if (global.rpg[senderId]?.afk > 0) {
        const waktu = funcs.runtime((Date.now() - global.rpg[senderId].afk) / 1000)
        ryzu.sendMessage(from, { text: `✨ @${senderId.split("@")[0]} kembali online!\nBerhenti AFK setelah: ${waktu}`, mentions: [senderId] })
        global.rpg[senderId].afk = 0
        global.rpg[senderId].afkReason = ""
        funcs.saveRPG(senderId).catch(() => {})
      }
    }

    // === GAME HANDLER ===
    if (ryzu.game[from] && Object.keys(ryzu.game[from]).length > 0 && body) {

      let isReplyId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId; 
      let activeGames = Object.values(ryzu.game[from]);
      let room = null;

      if (isReplyId) {
        room = activeGames.find(g => g.id === isReplyId);
      }

      if (!room && ryzu.game[from]["family100"]) {
        const isJawabanFamily = ryzu.game[from]["family100"].jawaban.includes(bodyLow);
        if (isJawabanFamily || bodyLow === "nyerah") {
          room = ryzu.game[from]["family100"];
        }
      }

      if (!room) {
        if (bodyLow === "nyerah" || bodyLow === prefix + "hint") {
          if (activeGames.length > 0 && activeGames.some(g => g.tipe !== "family100")) {
             return reply("❌ Wajib reply pesan soal gamenya untuk nyerah/hint ya!");
          }
        }
        
      } else { 

        // === HINT ===
        if (bodyLow === prefix + "hint") {
          if (room.tipe === "family100") return reply("❌ Family 100 tidak memiliki hint!");
          const user = global.rpg[senderId];
          if (!user.premium && user.limit <= 0) return reply("❌ Limit habis!");
          if (!user.premium) { user.limit -= 1; funcs.saveRPG(senderId).catch(() => {}); }
          if (room.deskripsi) return reply(`💡 *PETUNJUK*\n\n${room.deskripsi}`);
          const jaw = Array.isArray(room.jawaban) ? room.jawaban : room.jawaban;
          const clue = jaw.replace(/[a-zA-Z]/g, (c, i) => i === 0 || jaw[i - 1] === " " ? c : "_");
          return reply(`💡 *HINT*\n\n${clue.toUpperCase()}`);
        }

        // === NYERAH ===
        if (bodyLow === "nyerah") {
          if (room.tipe === "family100") {
            let teks = `🏳️ *MENYERAH*\n\nSoal: *${room.soal}*\n\n🗝️ Jawaban:\n`;
            room.jawaban_asli.forEach((j, i) => {
              const p = room.penjawab?.[j.toLowerCase().trim()];
              teks += `${i + 1}. ${j}${p ? ` ✅ @${p.split("@")}` : " ❌"}\n`;
            });
            if (room.timeout) clearTimeout(room.timeout);
            delete ryzu.game[from][room.tipe];
            return ryzu.sendMessage(from, { text: teks, mentions: Object.values(room.penjawab || {}) }, { quoted: msg });
          } else {
            const listJawaban = Array.isArray(room.jawaban_asli) ? room.jawaban_asli.join(', ') : (room.jawaban_asli || room.jawaban);
            const captionNyerah = `🏳️ *MENYERAH*\n\n🗝️ Jawaban: *${listJawaban.toUpperCase()}*`;
            if (room.timeout) clearTimeout(room.timeout);
            const backupImg = room.img; 
            const tipeGame = room.tipe;
            delete ryzu.game[from][room.tipe];
            if (tipeGame === 'tebakheromlbb' && backupImg) {
              return ryzu.sendMessage(from, { image: { url: backupImg }, caption: captionNyerah }, { quoted: msg });
            }
            return reply(captionNyerah);
          }
        }

        // === JAWABAN BENAR ===
        if (!isCmd) {
          if (room.tipe === "family100") {
            const index = room.jawaban.indexOf(bodyLow);
            if (index >= 0 && !room.terjawab.includes(bodyLow)) {
              room.terjawab.push(bodyLow);
              room.penjawab[bodyLow] = senderId;
              global.rpg[senderId].money += 5000;
              global.rpg[senderId].exp += 500;
              const up = funcs.cekLevel(senderId);
              funcs.saveRPG(senderId).catch(() => {});
              let teks = `✅ *BENAR!*\n📝 Soal: *${room.soal}*\n\n`;
              const mentions = [];
              room.jawaban_asli.forEach((j, i) => {
                const lj = j.toLowerCase().trim();
                if (room.terjawab.includes(lj)) {
                  mentions.push(room.penjawab[lj]);
                  teks += `${i + 1}. ${j} (@${room.penjawab[lj].split("@")})\n`;
                } else teks += `${i + 1}. ??\n`;
              });
              teks += `\n🎁 +5000 Money | +500 EXP${up ? "\n🎊 LEVEL UP!" : ""}`;
              if (room.terjawab.length === room.jawaban.length) {
                teks += `\n\n🎉 SEMUA TERJAWAB!`;
                if (room.timeout) clearTimeout(room.timeout);
                delete ryzu.game[from][room.tipe];
              }
              return ryzu.sendMessage(from, { text: teks, mentions }, { quoted: msg });
            }
          } else {
            const targetJawaban = room.jawaban;
            let benar = Array.isArray(targetJawaban)
              ? targetJawaban.some((j) => bodyLow === j || similarity(bodyLow, j) >= 0.75)
              : bodyLow === targetJawaban || similarity(bodyLow, targetJawaban) >= 0.75;
            if (benar) {
              let money = 5000, exp = 500;
              if (room.hadiah) { money = room.hadiah.money; exp = room.hadiah.exp; }
              global.rpg[senderId].money += money;
              global.rpg[senderId].exp += exp;
              const up = funcs.cekLevel(senderId);
              if (room.timeout) clearTimeout(room.timeout);
              delete ryzu.game[from][room.tipe];
              funcs.saveRPG(senderId).catch(() => {});
              return reply(`✅ *BENAR!*\n💰 +${money} Money\n✨ +${exp} EXP${up ? "\n🎊 LEVEL UP!" : ""}`);
            }
          }
        }
      }
    }

    // === COMMAND HANDLER ===
    if (isCmd) {
      const cmd = commands.get(commandName) || [...commands.values()].find((x) => x.alias?.includes(commandName))
      if (!cmd) return

      const user = global.rpg[senderId]
      const whiteList = ["register", "reg", "daftar", "help", "menu", "rules", "owner", "s", "ping", "runtime", "speed", "start", "shop", "buy", "sell", "money", "profile", "me", "inv", "afk", "unreg", "unregister", "tictactoe", "limit", "ceklimit", "sisalimit"]
      const isPremium = user.premium || isCreator
      
      if (!user.registered && !whiteList.includes(commandName)) {
        return reply("Anda belum terdaftar.\nSilahkan daftar dengan .daftar nama")
      }

      if (!isPremium && !whiteList.includes(commandName) && user.limit <= 0) {
        return reply(`❌ *LIMIT HABIS*\n\nBeli limit di *.shop* atau upgrade ke *Premium*.`)
      }

      if (user.premium && user.premiumTime !== -1 && Date.now() > user.premiumTime) {
        user.premium = false
        user.premiumTime = 0
        funcs.saveRPG(senderId).catch(() => {})
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
          
          if (!isPremium) {
            user.limit -= 1
            await ryzu.sendMessage(from, { 
              text: "*Limit -1*"
            }).catch(() => {}) 
          }
          
          funcs.cekLevel(senderId)
          funcs.saveRPG(senderId).catch(() => {})
        }
      } catch (err) {
        console.error(`Error di command ${commandName}:`, err)
        reply(`❌ Error: ${err.message}`)
      }
    }

  } catch (e) {
    console.error("Error in main handler:", e)
    if (ownerContacts[0]) {
      try {
        await ryzu.sendMessage(ownerContacts[0], { text: `⚠️ *BOT ERROR*\n\n${e.message}` })
      } catch (_) {}
    }
  }
}