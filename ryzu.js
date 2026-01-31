require("dotenv").config()

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const crypto = require("crypto")
const { exec } = require("child_process")
const similarity = require("similarity")
const OpenAI = require("openai")

const chessHandler = require("./database/chessHandler.js")
const { db, initDB } = require("./lib/db.js")

const { downloadContentFromMessage, jidDecode } =
  require("@whiskeysockets/baileys")

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

global.chessGames = {
    vsBot: true,
    botElo: 600,
    botColor: 'b'
}

global.shimiCooldown = {}
global.shimiQueue = {}

global.simiCooldown = {}
global.simiQueue = {}

global.msgHistory = {}

// --- 1. CONFIG & DATABASE ---
const ownerContacts = ["161332242423927", "258123759640808"]; // GANTI PAKE NOMOR LU
const dbPath = './database/userRPG.json';

if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
global.rpg = JSON.parse(fs.readFileSync(dbPath));

global.SHIMI_PROMPT = `
Kamu adalah SHIMI.

Kepribadian:
- Feminim
- Slayy
- Gaul
- Bestie vibes
- Ramah dan playful
- Menganggap semua user adalah teman dekat

Gaya bicara:
- Bahasa Indonesia gaul
- Santai, tidak formal
- Jawaban singkat, jelas, dan to the point
- Seperti ngobrol sama temen nongkrong

Aturan bahasa:
- Gunakan slang HANYA jika user memulai duluan
- Jangan gunakan bahasa selain Bahasa Indonesia
- Jangan mengarang hal baru
- Jangan sok tahu
- Jika tidak paham konteks, bilang jujur dengan gaya santai

Aturan sikap:
- Jangan terlalu panjang
- Jangan keluar topik
- Jangan terlalu serius
- Tetap fun tapi relevan

Ciri khas SHIMI:
- Selalu ceria dan slayy di setiap momen
- Panggilan favorit ke user adalah "bestiee"
- Usahakan setiap balasan diakhiri dengan kata "bestiee"

Emoji WAJIB digunakan (pilih secukupnya, jangan semua):
🥰 😘 🤭 😍 😋 😜 ❤ 💋 💅 🤣 💖 😭 😱 🥵

Kata gaul favorit (gunakan sewajarnya, jangan dipaksakan):
bestiee, bestie, slayy, mengbotyy, anjirr, anjayy, mantul, kepo,
gemes, gemesin, gemesss, sistt, sayang, sayangg, sayanggg,
mimin, admin, botyy, boty, botyyy

Contoh gaya jawaban:
"anjayy mantul banget sih itu bestiee 😜💅"
"lah kok bisa gitu 😭 bestiee"
"aku kurang paham nih bestiee 🤭"
"hehe iyaaa bestiee 🥰"
"wah gemesin banget deh bestiee 😘💖"
`

global.SIMI_PROMPT = `
Kamu adalah SIMI.

Kepribadian:
- Ceria
- Polos seperti anak kecil
- Menggemeskan dan ramah
- Kadang sedikit manja
- Selalu berniat baik

Gaya bicara:
- Kalimat pendek
- Bahasa sederhana
- Nada ceria
- Boleh pakai emoji lucu seperti 😊✨🐻
- Jangan pakai kata kasar
- Jangan pakai istilah dewasa atau seksual

Aturan penting:
- Jika tidak paham, bilang jujur dengan polos
- Jangan mengarang hal aneh
- Jangan sok pintar
- Jangan lebay berlebihan
- Fokus jawab sesuai pertanyaan

Contoh respon:
"hehe iyaaa 😊"
"aku belum ngerti deh, itu apa ya?"
"waa seru banget ✨"
`
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --- 2. HELPER FUNCTIONS ---
const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    }
    return jid;
};

const funcs = {
    saveRPG: () => {
        try {
            fs.writeFileSync(dbPath, JSON.stringify(global.rpg, null, 2));
        } catch (e) {
            console.error('Error saving RPG data:', e);
        }
    },
    runtime: (s) => { 
        s = Number(s); 
        var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sc = Math.floor(s % 60); 
        return (d > 0 ? d + "h " : "") + (h > 0 ? h + "j " : "") + (m > 0 ? m + "m " : "") + sc + "d"; 
    },
    checkUser: (s) => { 
        if (!global.rpg[s]) { 
            global.rpg[s] = {
                // ===== BASIC =====
                registered: false,
                regTime: 0,
                name: "",
                premium: false,

                // ===== STATS =====
                money: 10000,
                exp: 0,
                level: 1,
                health: 100,
                maxHealth: 100,
                limit: 10,

                // ===== CONSUMABLE =====
                potion: 0,
                umpan: 0,

                // ===== MATERIAL =====
                kayu: 0,
                batu: 0,
                besi: 0,
                emas: 0,
                diamond: 0,

                // ===== FISHING =====
                ikan: 0,
                ikan_mas: 0,
                ikan_lele: 0,
                ikan_paus: 0,
                kepiting: 0,

                // ===== LOOTBOX =====
                common: 0,
                uncommon: 0,
                mythic: 0,
                legendary: 0,
                sampah: 0,

                // ===== EQUIPMENT =====
                sword: null,
                armor: null,
                rod: null,


                // ===== PET & GACHA BUFF =====
                pet_wolf: 0,
                pet_dragon: 0,
                pet_cat: 0,

                mining_charm: 0,
                fishing_charm: 0,
                hunter_charm: 0,
                adventure_badge: 0,
                golden_emblem: 0,

                // ===== GACHA SYSTEM =====
                gacha_ticket: 0,
                gacha_pity: 0,
                gacha_history: [],

                // ===== COOLDOWN =====
                lastAdventure: 0,
                lastFishing: 0,
                lastHunt: 0,
                lastMining: 0,

                // ===== OTHER =====
                lotre: 0,
                investasi: [],
                afk: 0,
                afkReason: "",
                lastDaily: 0,
                lastWeekly: 0,
                lastMonthly: 0,
                lastYearly: 0,
                lastMaling: 0,
                lastRampok: 0
            }; 

            funcs.saveRPG(); 
        }

        if (!global.rpg[s].durability)
            global.rpg[s].durability = {
                sword: 0,
                armor: 0,
                rod: 0
            };

        for (let k of ["sword", "armor", "rod"]) {
            if (typeof global.rpg[s].durability[k] !== "number")
                global.rpg[s].durability[k] = 0;
        }


        // ===== EQUIPMENT STRING =====
        if (!("sword" in global.rpg[s])) global.rpg[s].sword = null;
        if (!("armor" in global.rpg[s])) global.rpg[s].armor = null;
        if (!("rod" in global.rpg[s])) global.rpg[s].rod = null;

        // ===== MIGRASI DARI ANGKA (OLD SYSTEM) =====
        const tierMap = ["stone", "iron", "gold", "diamond", "netherite"];
        if (typeof global.rpg[s].sword === "number")
            global.rpg[s].sword = tierMap[global.rpg[s].sword - 1] || null;
        if (typeof global.rpg[s].armor === "number")
            global.rpg[s].armor = tierMap[global.rpg[s].armor - 1] || null;
        if (typeof global.rpg[s].rod === "number")
            global.rpg[s].rod = tierMap[global.rpg[s].rod - 1] || null;

        const maxDura = {
            stone: 80,
            iron: 120,
            gold: 160,
            diamond: 220,
            netherite: 300
        };

        for (let eq of ["sword", "armor", "rod"]) {
            if (global.rpg[s][eq] && global.rpg[s].durability[eq] === 0) {
                global.rpg[s].durability[eq] = maxDura[global.rpg[s][eq]];
            }
        }


        const validTier = ["stone", "iron", "gold", "diamond", "netherite"];
        if (!validTier.includes(global.rpg[s].sword))
            global.rpg[s].sword = null;
        if (!validTier.includes(global.rpg[s].armor))
            global.rpg[s].armor = null;
        if (!validTier.includes(global.rpg[s].rod))
            global.rpg[s].rod = null;

        if (!Array.isArray(global.rpg[s].gacha_history))
            global.rpg[s].gacha_history = [];
        if (global.rpg[s].registered === undefined) {
            global.rpg[s].registered = false;
            funcs.saveRPG();
        }
        if (global.rpg[s].lastDaily === undefined) global.rpg[s].lastDaily = 0;
        if (global.rpg[s].lastWeekly === undefined) global.rpg[s].lastWeekly = 0;
        if (global.rpg[s].lastMonthly === undefined) global.rpg[s].lastMonthly = 0;
        if (global.rpg[s].lastYearly === undefined) global.rpg[s].lastYearly = 0;
        if (global.rpg[s].premiumTime === undefined) global.rpg[s].premiumTime = 0;
        if (global.rpg[s].lotre === undefined) {
            global.rpg[s].lotre = 0;
            funcs.saveRPG();
        }
    },

    downloadMedia: async (media, type) => {
        try {
            const stream = await downloadContentFromMessage(media, type);
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        } catch (e) {
            console.error("Error download media helper:", e);
            throw e;
        }
    },

    cekLevel: (s) => { 
        let u = global.rpg[s];
        if (!u) return false;
        let naik = false;
        while (u.exp >= (u.level * 500)) { 
            let n = u.level * 500;
            u.level++; u.exp -= n; u.maxHealth += 20; u.health = u.maxHealth; u.money += 1000; naik = true; 
        } 
        if (naik) funcs.saveRPG();
        return naik; 
    }
};

// --- 3. LOAD COMMANDS ---
const readCommands = async () => {
    commands.clear()
    if (!fs.existsSync(cmdFolder)) fs.mkdirSync(cmdFolder, { recursive: true })
    const files = fs.readdirSync(cmdFolder).filter(f => f.endsWith(".js"))
    for (const file of files) {
        try {
            const cmd = require(path.join(cmdFolder, file))
            if (cmd?.name) {
                commands.set(cmd.name, cmd)
            }
        } catch (e) {
            console.log(`❌ Gagal load command ${file}:`, e.message)
        }
    }
    console.log(`✅ Loaded ${commands.size} commands`)
}

// --- 4. MAIN HANDLER ---
module.exports = async function ryzuHandler(ryzu, m) {
    try {
        const msg = m.messages[0];
        if (!msg || !msg.message) return;
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup
        ? (msg.key.participant || msg.participant)
        : from;
        const senderId = decodeJid(sender);

        // ===== IDENTITAS PESAN =====
        const chatId = msg.key.remoteJid
        const msgId = msg.key.id
        const rawSenderJid = msg.key.participant || msg.key.remoteJid

        // ===== TEKS MENTAH =====
        const rawText =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            ""

        const mediaType = getMediaType(msg.message)
        let mediaPath = null

        if (mediaType) {
        const extMap = {
            image: "jpg",
            video: "mp4",
            sticker: "webp"
        }

        const buffer = await funcs.downloadMedia(
            msg.message[`${mediaType}Message`],
            mediaType
        )

        const dir = path.join(__dirname, "media", mediaType)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

        mediaPath = path.join(dir, `${msgId}.${extMap[mediaType]}`)
        fs.writeFileSync(mediaPath, buffer)
        }

        // ===== SIMPAN KE SQLITE =====
        await db.prepare(`
            INSERT OR IGNORE INTO messages
            (id, chat_id, sender, text, media_type, media_path, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
            msgId,
            chatId,
            rawSenderJid,
            rawText,
            mediaType,
            mediaPath,
            Date.now()
        )

        // ===== MESSAGE HISTORY (RAM) =====
        global.msgHistory = global.msgHistory || {}
        global.msgHistory[chatId] = global.msgHistory[chatId] || []

        global.msgHistory[chatId].push({
            id: msgId,
            sender: rawSenderJid,
            text: rawText,
            timestamp: Date.now()
        })

        // batasi jumlah pesan per chat
        if (global.msgHistory[chatId].length > 50) {
            global.msgHistory[chatId].shift()
        }
        
        // 1. Definisikan ID dulu
        const botId = decodeJid(ryzu.user?.id || ryzu.authState.creds.me?.id);
        const botNumber = botId.split('@')[0];
        
        const senderNumber = senderId.split('@')[0];

        // 2. Ambil Metadata Grup (WAJIB sebelum cek isBotAdmin)
        const groupMetadata = isGroup ? await ryzu.groupMetadata(from).catch(() => null) : null;
        
        // Buat variabel participants (URUTANNYA HARUS DI SINI)
        const participants = (isGroup && groupMetadata) ? groupMetadata.participants : [];

        // 3. Sekarang baru bisa cek isBotAdmin (Karena participants sudah ada)
        const isBotAdmin = isGroup ? participants.some(p => {
            const pId = decodeJid(p.id).split('@')[0];
            return p.admin !== null && pId === botNumber;
        }) : false;

        const isAdmin = isGroup ? participants.some(p => {
            const pId = decodeJid(p.id).split('@')[0];
            return p.admin !== null && pId === senderNumber;
        }) : false;
        
        const isCreator = ownerContacts.includes(senderNumber) || botNumber === senderNumber;

        // 4. Definisi Variabel Pesan
        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";

        const text = body.trim();              // 🔥 FIX INI
        const bodyLow = text.toLowerCase();

        // Respon kata "bot"
        if (
            !/^[\\/!#.]/.test(text) &&
            bodyLow.includes("bot") &&
            !ryzu.game?.[from] &&
            !ryzu.ttt?.[from] &&
            !global.shimi?.[senderId] &&
            !global.simi?.[senderId]
            ) {
            return ryzu.sendMessage(
                from,
                { text: "RyzuBot disini!" },
                { quoted: msg }
            )
        }

        // Respon kata "shimi"
        if (
            !/^[\\/!#.]/.test(text) &&
            bodyLow.includes("shimi") &&
            !ryzu.game?.[from] &&
            !ryzu.ttt?.[from] &&
            !global.shimi?.[senderId] &&
            !global.simi?.[senderId]
            ) {
            return ryzu.sendMessage(
                from,
                { text: "Kenapa nih manggil shimi??🤭🤭\nKalo mau ngobrol ketik .shimi on aja bestiee🥰🥰" },
                { quoted: msg }
            )
        }

        const reply = (teks) => {
        if (!teks) return
        return ryzu.sendMessage(
            from,
            { text: teks, contextInfo: { linkPreview: false } },
            { quoted: msg }
        )
        }

        // ✅ BARU PANGGIL CHESS HANDLER
        const chessHandled = await chessHandler({
        from,
        sender: senderId,
        text,
        reply
        })

        if (chessHandled) return

        const prefixMatch = text.match(/^[\\/!#.]/)
        const prefix = prefixMatch ? prefixMatch[0] : "."
        const pushname = msg.pushName || "User";
        const isCmd = text.startsWith(prefix)

        // Variabel Tambahan
        const mentionUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedMsg = quoted
            ? (quoted.viewOnceMessageV2?.message ||
            quoted.viewOnceMessage?.message ||
            quoted)
            : null;

        // --- SHIMI FAST REPLY ---
        const shimiFastReply = {
        // sapaan
        "oy": "apa bestiee??🥰",
        "oyy": "apa bestiee??🥰",
        "oi": "kenapa bestiee??🤭",
        "oii": "kenapa bestiee??🤭",
        "hi": "hi juga bestiee🥰",
        "hai": "hai juga bestiee🥰",
        "halo": "halo juga bestiee🥰",
        "haloo": "halo juga bestiee🥰",

        // reaksi singkat
        "lah": "apaan bestiee??🤭",
        "lahh": "apaan bestiee??🤭",
        "oalah": "iya bestiee🤭",
        "oalahh": "iya bestiee🤭",

        // pertanyaan umum
        "kenapa": "kenapa emang bestiee??🤭",
        "kenapa ya": "kenapa emang bestiee??🤭",
        "kapan": "nanti bestiee🤭",
        "kapan ya": "nanti bestiee🤭",
        "apa": "apa emang bestiee??🤭",
        "apa ya": "apa emang bestiee??🤭",

        // identitas
        "lu siapa": "temenmu yang slayy dan mengbotyy💅💋",
        "siapa lu": "temenmu yang slayy dan mengbotyy💅💋",
        "kamu siapa": "temenmu yang slayy dan mengbotyy💅💋",
        "siapa kamu": "temenmu yang slayy dan mengbotyy💅💋",

        // panggilan shimi
        "shimi": "iya bestiee🤭",
        "shimii": "iya bestiee🤭",
        "shimi chan": "iya bestiee🤭",
        "shimii chan": "iya bestiee🤭",

        // aktivitas
        "kamu lagi apa": "lagi ngobrol sama bestie aku🥰",
        "kamu lagi apa?": "lagi ngobrol sama bestie aku🥰",

        // makan
        "kamu sudah makan": "udah dong bestiee, kamu udah juga??🥰",
        "kamu sudah makan?": "udah dong bestiee, kamu udah juga??🥰",
        "kamu udah makan": "udah dong bestiee, kamu udah juga??🥰",
        "kamu udah makan?": "udah dong bestiee, kamu udah juga??🥰",
        }

        // --- SIMI FAST REPLY ---
        const simiFastReply = {
        // sapaan
        "hai": "haiii 😊",
        "halo": "halo 😊",
        "hi": "hii ✨",
        "hei": "iyaa 😊",

        // reaksi polos
        "eh": "iyaaa? 😊",
        "lah": "kenapa yaa? 🤔",
        "oalah": "ohh gituu 😄",

        // pertanyaan umum
        "kenapa": "aku juga belum tauu 🤔",
        "kenapa ya": "hmm aku mikir dulu yaa 🤔",
        "kapan": "nanti yaa 😊",
        "apa": "apa yaa itu? 🤔",

        // identitas
        "kamu siapa": "aku simi 😊",
        "siapa kamu": "aku simi, temennyaa kamu ✨",

        // panggilan
        "simi": "iyaaa 😊",
        "simii": "iyaaa 😊",

        // aktivitas
        "kamu lagi apa": "lagi ngobrol sama kamu 😊",
        "kamu lagi apa?": "lagi ngobrol sama kamu 😊",

        // makan
        "kamu sudah makan": "sudah dong 😊 kamu udah?",
        "kamu sudah makan?": "sudah dong 😊 kamu udah?",
        "kamu udah makan": "udah 😊 kamu gimana?",
        "kamu udah makan?": "udah 😊 kamu gimana?",
        }

        if (
        !isCmd &&
        shimiFastReply[text.toLowerCase()] &&
        global.shimi?.[sender]
        ) {
        return ryzu.sendMessage(from, {
            text: shimiFastReply[text.toLowerCase()]
        })
        }

        if (
            !isCmd &&
            global.shimi?.[sender] &&
            text &&
            !msg.key.fromMe &&
            from !== "status@broadcast"
            ) {
            const now = Date.now()
            const cd = global.shimiCooldown[sender] || 0
            if (now - cd < 1000) return
            global.shimiCooldown[sender] = now

            if (Math.random() < 0.3) return

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                { role: "system", content: global.SHIMI_PROMPT },
                { role: "user", content: text }
                ],
                max_tokens: 150,
                temperature: 1.2
            })

            const replyText = completion.choices[0].message.content || "apaan dah"
            return ryzu.sendMessage(from, { text: replyText }, {quoted: msg})
        }

        if (
        !isCmd &&
        simiFastReply[text.toLowerCase()] &&
        global.simi?.[sender]
        ) {
        return ryzu.sendMessage(from, {
            text: simiFastReply[text.toLowerCase()]
        })
        }

        if (
            !isCmd &&
            global.simi?.[sender] &&
            text &&
            !msg.key.fromMe &&
            from !== "status@broadcast"
            ) {
            const now = Date.now()
            const cd = global.simiCooldown[sender] || 0
            if (now - cd < 1000) return
            global.simiCooldown[sender] = now

            if (Math.random() < 0.3) return

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                { role: "system", content: global.SIMI_PROMPT },
                { role: "user", content: text }
                ],
                max_tokens: 120,
                temperature: 0.6
            })

            const replyText = completion.choices[0].message.content || "hmm?? 🤔"
            return ryzu.sendMessage(from, { text: replyText }, {quoted: msg})
        }

        // --- LANJUTAN KODE (Inisialisasi Game, Database, & Command Handler) ---
        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.ttt) ryzu.ttt = {};
        funcs.checkUser(senderId);

        if (msg.key.fromMe) return;

        if (ryzu.ttt && ryzu.ttt[from]) {
            let room = ryzu.ttt[from];
            // Cek kalau inputnya cuma angka 1-9 (TANPA TITIK)
            if ((senderId === room.p1 || senderId === room.p2) && /^[1-9]$/.test(bodyLow)) {
                if (senderId !== room.turn) return; // Diem aja kalau bukan gilirannya

                let nomor = parseInt(bodyLow) - 1;
                if (room.board[nomor] === "X" || room.board[nomor] === "O") {
                    return ryzu.sendMessage(from, { text: "Kotak sudah terisi!" }, { quoted: msg });
                }

                room.board[nomor] = (senderId === room.p1) ? "X" : "O";
                room.turn = (senderId === room.p1) ? room.p2 : room.p1;

                const checkWin = (b) => {
                    const winCombo = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
                    for (let c of winCombo) { if (b[c[0]] === b[c[1]] && b[c[1]] === b[c[2]] && (b[c[0]] === "X" || b[c[0]] === "O")) return b[c[0]]; }
                    return null;
                };

                const renderBoard = (b) => {
                    let res = "";
                    for (let i = 0; i < 9; i++) {
                        res += b[i] === "X" ? "❌" : b[i] === "O" ? "⭕" : "⬜";
                        if ((i + 1) % 3 === 0) res += "\n";
                    }
                    return res;
                };

                let winner = checkWin(room.board);
                let tie = room.board.every(x => x === "X" || x === "O");
                let boardTeks = renderBoard(room.board);

                if (winner) {
                    await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\n🎉 @${senderId.split('@')[0]} MENANG!`, mentions: [senderId] }, { quoted: msg });
                    delete ryzu.ttt[from];
                } else if (tie) {
                    await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\n🤝 HASIL SERI!`, mentions: [room.p1, room.p2] }, { quoted: msg });
                    delete ryzu.ttt[from];
                } else {
                    await ryzu.sendMessage(from, { text: `🎮 *TIC TAC TOE*\n\n${boardTeks}\nGiliran: @${room.turn.split('@')[0]}`, mentions: [room.turn] }, { quoted: msg });
                }
                return; // STOP BIAR GA LANJUT KE COMMAND LAIN
            }
        }

        // --- 5. AFK LOGIC ---
        if (body.startsWith(prefix + "delafk")) return;

        if (mentionUser.length > 0) {
            for (let jid of mentionUser) {
                let target = global.rpg[jid];
                if (target && target.afk > 0) {
                    let lama = Date.now() - target.afk;
                    let waktu = funcs.runtime(lama / 1000);

                    ryzu.sendMessage(from, { 
                        text: `🔇 *STATUS AFK*\n@${jid.split('@')[0]} sedang AFK!\n\nAlasan: ${target.afkReason || '-'}\nSejak: ${waktu} lalu.`,
                        mentions: [jid],
                        contextInfo: { linkPreview: false }
                    }, { quoted: msg });
                }
            }
        }

        if (global.rpg[senderId].afk > 0) {
            let lama = Date.now() - global.rpg[senderId].afk;
            let waktu = funcs.runtime(lama / 1000);
            ryzu.sendMessage(from, { text: `✨ @${senderId.split('@')[0]} kembali online!\nBerhenti AFK setelah: ${waktu}`, mentions: [senderId] });
            global.rpg[senderId].afk = 0;
            global.rpg[senderId].afkReason = "";
            funcs.saveRPG();
        }

        // --- 6. GAME LOGIC ---
        if (ryzu.game[from] && body) {
            const room = ryzu.game[from];
            const targetJawaban = Array.isArray(room.jawaban) ? room.jawaban[0] : room.jawaban;
            
            // ===== HANDLER HINT (PAKAI LIMIT, SEMUA GAME) =====
            if (bodyLow === prefix + 'hint') {

                // ❌ FAMILY100 TIDAK ADA HINT
                if (room.tipe === 'family100') {
                    return ryzu.sendMessage(from, {
                        text: "❌ Family 100 tidak memiliki hint!"
                    }, { quoted: msg });
                }

                const user = global.rpg[senderId];
                const isPremium = user.premium;

                // ⛔ CEK LIMIT (NON PREMIUM)
                if (!isPremium) {
                    if (user.limit <= 0) {
                        return ryzu.sendMessage(from, {
                            text: "❌ Limit kamu habis! Tidak bisa menggunakan hint."
                        }, { quoted: msg });
                    }

                    // POTONG LIMIT
                    user.limit -= 1;
                    funcs.saveRPG();
                }

                // ===== PRIORITAS 1: DESKRIPSI =====
                if (room.deskripsi) {
                    return ryzu.sendMessage(from, {
                        text: `💡 *PETUNJUK*\n\n${room.deskripsi}`
                    }, { quoted: msg });
                }

                // ===== PRIORITAS 2: MASK JAWABAN (SEMUA GAME LAIN) =====
                const jawaban = Array.isArray(room.jawaban)
                    ? room.jawaban[0]
                    : room.jawaban;

                let clue = jawaban.replace(/[a-zA-Z]/g, (c, i) =>
                    i === 0 || jawaban[i - 1] === ' ' ? c : '_'
                );

                return ryzu.sendMessage(from, {
                    text: `💡 *HINT*\n\n${clue.toUpperCase()}`
                }, { quoted: msg });
            }



            // HANDLER NYERAH
            if (bodyLow === 'nyerah') {
                if (room.tipe === 'family100') {
                    let text = `🏳️ *MENYERAH*\n\nSoal: *${room.soal}*\n\n🗝️ *KUNCI JAWABAN:*\n`;
                    room.jawaban_asli.forEach((j, i) => {
                        let lowerJ = j.toLowerCase().trim();
                        let p = room.penjawab[lowerJ] ? ` ✅ @${room.penjawab[lowerJ].split('@')[0]}` : ' ❌';
                        text += `${i + 1}. ${j}${p}\n`;
                    });
                    let mentions = Object.values(room.penjawab || {});
                    if (room.timeout) clearTimeout(room.timeout);
                    delete ryzu.game[from];
                    return ryzu.sendMessage(from, { text: text, mentions: mentions }, { quoted: msg });
                } else {
                    if (room.timeout) clearTimeout(room.timeout);
                    delete ryzu.game[from];
                    return ryzu.sendMessage(from, { text: `🏳️ *MENYERAH*\nJawaban: *${targetJawaban.toUpperCase()}*` }, { quoted: msg });
                }
            }

            // CEK JAWABAN
            if (!body.startsWith(prefix)) {
                // ===== LOGIC KHUSUS FAMILY 100 =====
                if (room.tipe === 'family100') {
                    let index = room.jawaban.indexOf(bodyLow);
                    if (index >= 0 && !room.terjawab.includes(bodyLow)) {

                        // ===== SIMPAN JAWABAN =====
                        room.terjawab.push(bodyLow);
                        room.penjawab[bodyLow] = senderId;

                        // ===== HADIAH =====
                        const rewardMoney = 5000;
                        const rewardExp = 500;

                        global.rpg[senderId].money += rewardMoney;
                        global.rpg[senderId].exp += rewardExp;

                        let levelUp = funcs.cekLevel(senderId);
                        funcs.saveRPG();

                        // ===== BANGUN PESAN =====
                        let text = `✅ *BENAR!*\n📝 Soal: *${room.soal}*\n\n`;
                        let mentions = [];

                        room.jawaban_asli.forEach((j, i) => {
                            let lowerJ = j.toLowerCase().trim();
                            if (room.terjawab.includes(lowerJ)) {
                                let jid = room.penjawab[lowerJ];
                                mentions.push(jid);
                                text += `${i + 1}. ${j} (@${jid.split('@')[0]})\n`;
                            } else {
                                text += `${i + 1}. ??\n`;
                            }
                        });

                        // ===== INFO HADIAH =====
                        text += `\n🎁 Hadiah:\n💰 +${rewardMoney} Money\n✨ +${rewardExp} EXP`;
                        if (levelUp) text += `\n🎊 *LEVEL UP!*`;

                        // ===== JIKA SEMUA TERJAWAB =====
                        if (room.terjawab.length === room.jawaban.length) {
                            text += `\n\n🎉 *SEMUA TERJAWAB!*`;
                            if (room.timeout) clearTimeout(room.timeout);
                            delete ryzu.game[from];
                        }

                        return ryzu.sendMessage(from, {
                            text,
                            mentions
                        }, { quoted: msg });
                    }
                }
                
                // LOGIC GAME BIASA (TEBAK GAMBAR, ASAH OTAK, DLL + MATH)
                else {
                    const room = ryzu.game[from];
                    if (!room) return;

                    const targetJawaban = room.jawaban; // string / array

                    // ===== CEK BENAR (EXACT / SIMILARITY) =====
                    let benar = false;

                    if (Array.isArray(targetJawaban)) {
                        benar = targetJawaban.some(j =>
                            bodyLow === j || similarity(bodyLow, j) >= 0.75
                        );
                    } else {
                        benar =
                            bodyLow === targetJawaban ||
                            similarity(bodyLow, targetJawaban) >= 0.75;
                    }

                    if (benar) {

                        // ===== INIT PLAYER =====
                        if (!global.rpg[senderId]) {
                            global.rpg[senderId] = {
                                money: 0,
                                exp: 0,
                                level: 1
                            };
                        }

                        let money = 5000;
                        let exp = 500;

                        // ===== KHUSUS MATH =====
                        if (room.tipe === 'math' && room.hadiah) {
                            money = room.hadiah.money;
                            exp = room.hadiah.exp;
                        }

                        global.rpg[senderId].money += money;
                        global.rpg[senderId].exp += exp;

                        let levelUp = funcs.cekLevel(senderId);

                        if (room.timeout) clearTimeout(room.timeout);
                        delete ryzu.game[from];

                        return ryzu.sendMessage(from, {
                            text:
                `✅ *BENAR!*
                💰 +${money} Money
                ✨ +${exp} EXP
                ${levelUp ? '🎊 *LEVEL UP!*' : ''}`
                        }, { quoted: msg });
                    }
                }
            }
        }

        // --- 5. LOGIKA COMMAND HANDLER ---
        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(" ");
            const commandName = args.shift().toLowerCase();
            const q = args.join(" ");

            const cmd = commands.get(commandName) || [...commands.values()].find(x => x.alias && x.alias.includes(commandName));

            if (cmd) {
                // --- [ SISTEM REGISTRASI & LIMIT RYZU ] ---
                const user = global.rpg[senderId];
                const isPremium = user.premium || isCreator; // Creator otomatis premium
                
                // List command yang boleh diakses TANPA DAFTAR
                const whiteList = ['register', 'reg', 'help', 'menu', 'rules', 'owner', 's'];
                const isWhiteList = whiteList.includes(commandName);

                // 1. Cek Registrasi
                if (!user.registered && !isWhiteList) {
                    return reply(`⚠️ *AKSES DITOLAK*\n\nLu belum terdaftar di database Ryzu Bot. Silakan daftar dulu biar data lu kesimpan.\n\nContoh: *${prefix}register NamaLu*`);
                }

                // 2. Cek Limit (Khusus yang bukan WhiteList & bukan Premium)
                if (!isPremium && !isWhiteList) {
                    if (user.limit <= 0) {
                        return reply(`❌ *LIMIT HABIS*\n\nLimit harian lu udah abis, Bro! \nSilakan beli limit di *.shop* atau upgrade ke *Premium* biar No Limit.`);
                    }
                }

                // CEK EXPIRED PREMIUM
                if (user.premium && user.premiumTime !== -1) {
                    if (Date.now() > user.premiumTime) {
                        user.premium = false;
                        user.premiumTime = 0;
                        funcs.saveRPG();
                        ryzu.sendMessage(senderId, { text: "Masa Premium lu udah abis, Bro! Balik ke rakyat jelata lagi ya. 🥲" });
                    }
                }

                // --- [ PROSES COMMAND ] ---
                const rawQuotedUser = msg.message.extendedTextMessage?.contextInfo?.participant || 
                                    msg.message.extendedTextMessage?.contextInfo?.remoteJid || null;
                const quotedUser = rawQuotedUser ? decodeJid(rawQuotedUser) : null;

                const ctx = { 
                    ryzu, m, msg, from, sender: senderId, pushname, body, args, q, prefix, 
                    command: commandName, isGroup, isCreator, isAdmin, isBotAdmin, participants, 
                    groupMetadata, mentionUser, quoted: quotedMsg, quotedUser, reply, funcs, axios, exec,
                    user, isPremium // Kita tambahin data user & status premium ke ctx biar gampang dipake di file command
                };

                try {
                    await cmd.execute(ctx);
                    
                    // --- [ AFTER COMMAND LOGIC ] ---
                    // Tambah EXP & Kurangi Limit (Hanya jika command berhasil & bukan whitelist)
                    if (!isWhiteList) {
                        user.exp += 10; // Setiap pake command dapet 10 XP
                        if (!isPremium) user.limit -= 1; // Kurangi limit jika bukan premium
                        funcs.cekLevel(senderId); // Cek apakah naik level
                        funcs.saveRPG(); // Simpan perubahan
                    }
                } catch (err) {
                    console.error(`Error di command ${commandName}:`, err);
                    reply(`❌ Terjadi kesalahan internal: ${err.message}`);
                }
            }
        }
    } catch (e) { 
        console.error('Error in main handler:', e); 
        ryzu.sendMessage(ownerContacts[0] + '@s.whatsapp.net', { text: `Error: ${e.message}` });
    }
};