const getRole = require('../../lib/role');
const sendCard = require('../../lib/sendCard');

module.exports = {
    name: "menu",
    alias: ["help", "list", "start"],
    execute: async ({ ryzu, from, msg, reply, pushname, prefix, sender, funcs }) => {
        funcs.checkUser(sender);
        const user = global.rpg[sender];   
        
        const role = getRole(user.level);

        const money = user.money.toLocaleString("id-ID");

        const textMenu = `
👋 Halo *${pushname}*!
📊 Status: *${role}* | Level: *${user.level}*
💰 Money: *Rp ${money}*

━━━━━━━━━━━━━━━━━━
🤖 *RYZU BOT – MAIN MENU*
━━━━━━━━━━━━━━━━━━

⚔️ *RPG CORE*
• ${prefix}adventure / adv
• ${prefix}mining
• ${prefix}fishing / mancing
• ${prefix}hunt / berburu
• ${prefix}heal

🎒 *PROFILE & STATUS*
• ${prefix}me / profile
• ${prefix}inventory / inv
• ${prefix}equipment
• ${prefix}buff
• ${prefix}money
• ${prefix}exp
• ${prefix}level
• ${prefix}kolam

🔨 *CRAFT & PROGRESSION*
• ${prefix}craft
• ${prefix}upgrade
• ${prefix}repair

🛒 *SHOP & EKONOMI*
• ${prefix}shop
• ${prefix}buy
• ${prefix}sell
• ${prefix}tf
• ${prefix}top

🎰 *GACHA SYSTEM*
• ${prefix}gacha
• ${prefix}ginfo
• ${prefix}gachadex / igacha

📦 *BOX & CLAIM*
• ${prefix}open
• ${prefix}daily / claim
• ${prefix}weekly
• ${prefix}monthly
• ${prefix}yearly
• ${prefix}lotre

🎲 *GAMES*
• ${prefix}tictactoe
• ${prefix}suit
• ${prefix}family100
• ${prefix}tebakgambar
• ${prefix}tebakgenshin
• ${prefix}tebakcharanime
• ${prefix}tekateki
• ${prefix}asahotak
• ${prefix}judi
• ${prefix}slot
• ${prefix}nyerah

🐺 *WEREWOLF*
• ${prefix}ww join
• ${prefix}ww start
• ${prefix}ww out
• ${prefix}cekrole

🎵 *MEDIA*
• ${prefix}play <judul>
• ${prefix}ytmp3 <link>
• ${prefix}ytmp4 <link>
• ${prefix}tt <link>
• ${prefix}ig <link>
• ${prefix}fb <link>

🧰 *TOOLS & FUN*
• ${prefix}ai
• ${prefix}aiimg / draw
• ${prefix}remini
• ${prefix}meme
• ${prefix}darkjokes
• ${prefix}afk
• ${prefix}ping
• ${prefix}simi
• ${prefix}shimi

🛠 *STICKER*
• ${prefix}s
• ${prefix}smeme
• ${prefix}wm
• ${prefix}qc
• ${prefix}brat
• ${prefix}vbrat
• ${prefix}pin

👥 *ADMIN GROUP*
• ${prefix}kick
• ${prefix}adduser
• ${prefix}promote
• ${prefix}demote
• ${prefix}hidetag
• ${prefix}tagall
• ${prefix}tagadmin
• ${prefix}del

━━━━━━━━━━━━━━━━━━
✨ *Tips RPG*
• Equipment punya tier: *Stone → Iron → Gold → Diamond → Netherite*
• Upgrade hanya lewat *.upgrade*
• Buff aktif bisa dicek di *.buff*
• Gacha punya *PITY SYSTEM* (50 = Legendary)

_Bot by Ryzu_
`;
        try {
            await sendCard({
                ryzu,
                from,
                msg,
                text: textMenu,
                title: 'RYZU RPG MENU',
                body: `Halo ${pushname}`,
                image: 'https://files.catbox.moe/cz6tt0.jpg'
            });
        } catch (e) {
            await reply(textMenu);
        }
    }
};
