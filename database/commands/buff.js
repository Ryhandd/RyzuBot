<<<<<<< HEAD
const buff = require('../../lib/equipmentBuff');

module.exports = {
    name: "buff",
    alias: ["buffs", "effect"],
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        let txt = `✨ *ACTIVE BUFFS*\n\n`;
        let active = false;

        // ===== EQUIPMENT =====
        if (u.sword > 0) {
            const v = ((buff.swordDropBonus(u.sword) - 1) * 100).toFixed(0);
            txt += `⚔️ Sword Tier ${u.sword}: +${v}% Hunt Drop\n`;
            active = true;
        }

        if (u.armor > 0) {
            const v = (buff.armorReduce(u.armor) * 100).toFixed(0);
            txt += `🛡️ Armor Tier ${u.armor}: -${v}% Damage\n`;
            active = true;
        }

        if (u.rod > 0) {
            const v = ((buff.rodFishingBonus(u.rod) - 1) * 100).toFixed(0);
            txt += `🎣 Rod Tier ${u.rod}: +${v}% Fishing\n`;
            active = true;
        }

        // ===== CHARMS =====
        if (u.mining_charm) {
            txt += `⛏️ Mining Charm: +10% Mining Result\n`;
            active = true;
        }

        if (u.fishing_charm) {
            txt += `🎣 Fishing Charm: +10% Fishing Result\n`;
            active = true;
        }

        if (u.hunter_charm) {
            txt += `🏹 Hunter Charm: +15% Hunt Drop\n`;
            active = true;
        }

        // ===== BADGE =====
        if (u.adventure_badge) {
            txt += `🛡️ Adventure Badge: -10% Adventure Damage\n`;
            active = true;
        }

        // ===== PET =====
        if (u.pet_wolf) {
            txt += `🐺 Pet Wolf: +10% Hunt Drop\n`;
            active = true;
        }

        if (u.pet_dragon) {
            txt += `🐉 Pet Dragon: +5% Global EXP\n`;
            active = true;
        }

        // ===== LIMITED =====
        if (u.golden_emblem) {
            txt += `🌟 Golden Emblem: Prestige Item (Special Event)\n`;
            active = true;
        }

        if (!active)
            txt += `❌ Tidak ada buff aktif saat ini.`;

        reply(txt);
    }
};
=======
const buff = require('../../lib/equipmentBuff');

module.exports = {
    name: "buff",
    alias: ["buffs", "effect"],
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        let txt = `✨ *ACTIVE BUFFS*\n\n`;
        let active = false;

        // ===== EQUIPMENT =====
        if (u.sword > 0) {
            const v = ((buff.swordDropBonus(u.sword) - 1) * 100).toFixed(0);
            txt += `⚔️ Sword Tier ${u.sword}: +${v}% Hunt Drop\n`;
            active = true;
        }

        if (u.armor > 0) {
            const v = (buff.armorReduce(u.armor) * 100).toFixed(0);
            txt += `🛡️ Armor Tier ${u.armor}: -${v}% Damage\n`;
            active = true;
        }

        if (u.rod > 0) {
            const v = ((buff.rodFishingBonus(u.rod) - 1) * 100).toFixed(0);
            txt += `🎣 Rod Tier ${u.rod}: +${v}% Fishing\n`;
            active = true;
        }

        // ===== CHARMS =====
        if (u.mining_charm) {
            txt += `⛏️ Mining Charm: +10% Mining Result\n`;
            active = true;
        }

        if (u.fishing_charm) {
            txt += `🎣 Fishing Charm: +10% Fishing Result\n`;
            active = true;
        }

        if (u.hunter_charm) {
            txt += `🏹 Hunter Charm: +15% Hunt Drop\n`;
            active = true;
        }

        // ===== BADGE =====
        if (u.adventure_badge) {
            txt += `🛡️ Adventure Badge: -10% Adventure Damage\n`;
            active = true;
        }

        // ===== PET =====
        if (u.pet_wolf) {
            txt += `🐺 Pet Wolf: +10% Hunt Drop\n`;
            active = true;
        }

        if (u.pet_dragon) {
            txt += `🐉 Pet Dragon: +5% Global EXP\n`;
            active = true;
        }

        // ===== LIMITED =====
        if (u.golden_emblem) {
            txt += `🌟 Golden Emblem: Prestige Item (Special Event)\n`;
            active = true;
        }

        if (!active)
            txt += `❌ Tidak ada buff aktif saat ini.`;

        reply(txt);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
