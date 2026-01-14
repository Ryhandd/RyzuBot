const buff = require('../../lib/equipmentBuff');
const dura = require('../../lib/durability');

module.exports = {
    name: "equipment",
    alias: ["equip", "gear"],
    execute: async ({ sender, reply, funcs }) => {
        funcs.checkUser(sender);
        const u = global.rpg[sender];

        let txt = `🛡️ *EQUIPMENT DETAIL*\n\n`;

        // ===== SWORD =====
        txt += `⚔️ *SWORD*\n`;
        if (!u.sword) {
            txt += `• Tier: -\n• Effect: Tidak aktif\n\n`;
        } else {
            const bonus = ((buff.swordDropBonus(u.sword, u.durability.sword) - 1) * 100).toFixed(0);
            txt += `• Tier: ${u.sword.toUpperCase()}\n`;
            txt += `• Durability: ${u.durability.sword}/${dura.max(u.sword)}\n`;
            txt += u.durability.sword > 0
                ? `• Effect: +${bonus}% Hunt Drop\n\n`
                : `• Effect: Rusak (tidak aktif)\n\n`;
        }

        // ===== ARMOR =====
        txt += `🛡️ *ARMOR*\n`;
        if (!u.armor) {
            txt += `• Tier: -\n• Effect: Tidak aktif\n\n`;
        } else {
            const reduce = (buff.armorReduce(u.armor, u.durability.armor) * 100).toFixed(0);
            txt += `• Tier: ${u.armor.toUpperCase()}\n`;
            txt += `• Durability: ${u.durability.armor}/${dura.max(u.armor)}\n`;
            txt += u.durability.armor > 0
                ? `• Effect: -${reduce}% Damage\n\n`
                : `• Effect: Rusak (tidak aktif)\n\n`;
        }

        // ===== ROD =====
        txt += `🎣 *ROD*\n`;
        if (!u.rod) {
            txt += `• Tier: -\n• Effect: Tidak aktif\n\n`;
        } else {
            const bonus = ((buff.rodFishingBonus(u.rod, u.durability.rod) - 1) * 100).toFixed(0);
            txt += `• Tier: ${u.rod.toUpperCase()}\n`;
            txt += `• Durability: ${u.durability.rod}/${dura.max(u.rod)}\n`;
            txt += u.durability.rod > 0
                ? `• Effect: +${bonus}% Fishing Result\n\n`
                : `• Effect: Rusak (tidak aktif)\n\n`;
        }

        reply(txt);
    }
};
