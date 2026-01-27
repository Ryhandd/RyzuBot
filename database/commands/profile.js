const getRole = require('../../lib/role');
const { safeNum, MAX_SAFE } = require('../../lib/rpgUtils');
const sendCard = require('../../lib/sendCard');

module.exports = {
    name: "profile",
    alias: ["me", "inv", "inventory", "profile"],
    execute: async ({ ryzu, from, sender, mentionUser, quotedUser, msg, funcs, pushname }) => {

        let target = quotedUser || mentionUser?.[0] || sender;
        funcs.checkUser(target);

        const u = global.rpg[target];

        // ===== SANITIZE USER DATA (GLOBAL UTILS) =====
        u.money = safeNum(u.money, 0);
        u.exp = safeNum(u.exp, 0);
        u.health = safeNum(u.health, u.maxHealth || 100);
        u.maxHealth = safeNum(u.maxHealth, 100);

        u.kayu = safeNum(u.kayu);
        u.batu = safeNum(u.batu);
        u.besi = safeNum(u.besi);
        u.emas = safeNum(u.emas);
        u.diamond = safeNum(u.diamond);

        // ===== FORMATTER =====
        const formatMoney = n =>
            n >= MAX_SAFE
                ? '9.007.199.254.740.991 (MAX)'
                : n.toLocaleString('id-ID');

        const f = n => safeNum(n).toLocaleString('id-ID');

        const role = getRole(u.level);
        const name = target === sender
            ? pushname
            : `@${target.split('@')[0]}`;

        // ===== GACHA SUMMARY =====
        const gachaCount = (u.gacha_history || []).length;
        const lastPull = u.gacha_history?.[0];

        // ===== PROFILE TEXT =====
        let txt = `👤 *PROFILE CARD*\n`;
        txt += `🏷️ Name: ${name}\n`;
        txt += `🏅 Role: ${role} (Lv.${u.level})\n`;
        txt += `💰 Money: Rp ${formatMoney(u.money)}\n`;
        txt += `✨ EXP: ${f(u.exp)}\n`;
        txt += `❤️ HP: ${u.health} / ${u.maxHealth}\n\n`;

        txt += `⚔️ *EQUIPMENT*\n`;
        txt += `   ├ Sword Tier: ${u.sword || 0}\n`;
        txt += `   ├ Armor Tier: ${u.armor || 0}\n`;
        txt += `   └ Rod Tier: ${u.rod || 0}\n\n`;

        txt += `🎣 *KOLAM IKAN*\n`;
        txt += `   ├ 🐟 Ikan: ${f(u.ikan)}\n`;
        txt += `   ├ 🐠 Mas: ${f(u.ikan_mas)}\n`;
        txt += `   ├ 🐟 Lele: ${f(u.ikan_lele)}\n`;
        txt += `   ├ 🦀 Kepiting: ${f(u.kepiting)}\n`;
        txt += `   └ 🐳 Paus: ${f(u.ikan_paus)}\n\n`;

        txt += `⛏️ *MATERIAL*\n`;
        txt += `   ├ 🪵 Kayu: ${f(u.kayu)}\n`;
        txt += `   ├ 🪨 Batu: ${f(u.batu)}\n`;
        txt += `   ├ ⛓️ Besi: ${f(u.besi)}\n`;
        txt += `   ├ 🥇 Emas: ${f(u.emas)}\n`;
        txt += `   └ 💎 Diamond: ${f(u.diamond)}\n\n`;

        txt += `📦 *LOOT BOX*\n`;
        txt += `   └ C:${f(u.common)} | U:${f(u.uncommon)} | M:${f(u.mythic)} | L:${f(u.legendary)}\n\n`;

        txt += `🎰 *GACHA STATUS*\n`;
        txt += `   ├ 🎟️ Ticket: ${u.gacha_ticket || 0}\n`;
        txt += `   ├ 📉 Pity: ${u.gacha_pity || 0}/50\n`;
        txt += `   ├ 🎖️ Total Pull: ${gachaCount}\n`;
        txt += `   └ 🌟 Limited: ${u.golden_emblem ? "YES" : "NO"}\n`;

        if (lastPull) {
            txt += `\n🕒 *Last Pull*\n`;
            txt += `   └ [${lastPull.rarity.toUpperCase()}] ${lastPull.reward}\n`;
        }

        let pp;
        try {
            pp = await ryzu.profilePictureUrl(target, 'image');
        } catch {
            pp = "https://files.catbox.moe/cz6tt0.jpg"; // fallback
        }

        await sendCard({
            ryzu,
            from,
            msg,
            text: txt,
            title: "RPG PLAYER PROFILE",
            body: `${name} • Lv ${u.level}`,
            image: pp,
            target
        });
    }
};
