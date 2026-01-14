<<<<<<< HEAD
const buff = require('../../lib/equipmentBuff');
const dura = require('../../lib/durability');
const { safeNum, addExp } = require('../../lib/rpgUtils');

module.exports = {
    name: "hunt",
    alias: ["berburu"],
    execute: async ({ sender, reply, funcs }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.health = safeNum(user.health, user.maxHealth || 100);
        user.maxHealth = safeNum(user.maxHealth, 100);
        user.exp = safeNum(user.exp);

        user.common = safeNum(user.common);
        user.mythic = safeNum(user.mythic);
        user.legendary = safeNum(user.legendary);

        user.lastHunt = safeNum(user.lastHunt);

        user.sword = 1;
        user.durability = user.durability || {};
        user.durability.sword = 100;

        // ===== REQUIREMENTS =====
        if (!user.sword)
            return reply("❌ Kamu butuh *Sword* untuk berburu.");

        if (user.health < 25)
            return reply(`⚠️ HP kamu terlalu rendah (${user.health}). Heal dulu.`);

        // ===== COOLDOWN =====
        const cooldown = 300000;
        const sisa = cooldown - (Date.now() - user.lastHunt);

        if (sisa > 0) {
            const detik = Math.ceil(sisa / 1000);
            return reply(`⏳ Tunggu *${detik} detik* lagi sebelum berburu.`);
        }

        user.lastHunt = Date.now();

        // ===== DURABILITY =====
        if (user.sword && user.durability?.sword > 0) {
            user.durability.sword -= dura.lose(user.sword, "sword");
            if (user.durability.sword < 0)
                user.durability.sword = 0;
        }

        // ===== DAMAGE =====
        let damage = Math.floor(Math.random() * 16) + 5;

        if (user.adventure_badge)
            damage = Math.floor(damage * 0.9);

        if (!Number.isFinite(damage) || damage < 3)
            damage = 3;

        user.health -= damage;
        if (user.health < 0) user.health = 0;

        // ===== DROP BONUS =====
        let dropBonus = 1;
        dropBonus *= safeNum(buff.swordDropBonus(user.sword), 1);
        if (user.pet_wolf) dropBonus += 0.10;
        if (user.hunter_charm) dropBonus += 0.15;

        // ===== DROPS =====
        let drops = [];

        user.common += 1;
        drops.push("Common Loot 📦");

        if (Math.random() < 0.08 * dropBonus) {
            user.mythic += 1;
            drops.push("Mythic Crate 📦");
        }

        if (Math.random() < 0.02 * dropBonus) {
            user.legendary += 1;
            drops.push("Legendary Box 🎁");
        }

        // ===== EXP =====
        let exp = Math.floor(Math.random() * 150) + 150;

        if (user.pet_dragon)
            exp = Math.floor(exp * 1.05);

        addExp(user, exp);

        funcs.saveRPG();
        funcs.cekLevel(sender);

        // ===== MESSAGE =====
        let text = `⚔️ *HUNT SELESAI*\n\n`;
        text += `🎁 Drop: ${drops.join(", ")}\n`;
        text += `❤️ Terluka: -${damage} HP\n`;
        text += `✨ EXP: +${exp.toLocaleString('id-ID')}\n`;
        text += `❤️ Sisa HP: ${user.health}/${user.maxHealth}`;

        if (user.pet_wolf || user.hunter_charm || user.pet_dragon) {
            text += `\n\n🔮 *BUFF AKTIF*`;
            if (user.pet_wolf)
                text += `\n🐺 Pet Wolf (+10% drop)`;
            if (user.hunter_charm)
                text += `\n🏹 Hunter Charm (+15% drop)`;
            if (user.pet_dragon)
                text += `\n🐉 Pet Dragon (+5% EXP)`;
        }

        return reply(text);
    }
};
=======
const buff = require('../../lib/equipmentBuff');
const dura = require('../../lib/durability');
const { safeNum, addExp } = require('../../lib/rpgUtils');

module.exports = {
    name: "hunt",
    alias: ["berburu"],
    execute: async ({ sender, reply, funcs }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.health = safeNum(user.health, user.maxHealth || 100);
        user.maxHealth = safeNum(user.maxHealth, 100);
        user.sword = safeNum(user.sword);
        user.exp = safeNum(user.exp);

        user.common = safeNum(user.common);
        user.mythic = safeNum(user.mythic);
        user.legendary = safeNum(user.legendary);

        user.lastHunt = safeNum(user.lastHunt);

        // ===== REQUIREMENTS =====
        if (user.sword < 1)
            return reply("❌ Kamu butuh *Sword* untuk berburu.");

        if (user.health < 25)
            return reply(`⚠️ HP kamu terlalu rendah (${user.health}). Heal dulu.`);

        // ===== COOLDOWN =====
        const cooldown = 300000;
        const sisa = cooldown - (Date.now() - user.lastHunt);

        if (sisa > 0) {
            const detik = Math.ceil(sisa / 1000);
            return reply(`⏳ Tunggu *${detik} detik* lagi sebelum berburu.`);
        }

        user.lastHunt = Date.now();

        // ===== DURABILITY =====
        if (user.sword && user.durability?.sword > 0) {
            user.durability.sword -= dura.lose(user.sword, "sword");
            if (user.durability.sword < 0)
                user.durability.sword = 0;
        }

        // ===== DAMAGE =====
        let damage = Math.floor(Math.random() * 16) + 5;

        if (user.adventure_badge)
            damage = Math.floor(damage * 0.9);

        if (!Number.isFinite(damage) || damage < 3)
            damage = 3;

        user.health -= damage;
        if (user.health < 0) user.health = 0;

        // ===== DROP BONUS =====
        let dropBonus = 1;
        dropBonus *= safeNum(buff.swordDropBonus(user.sword), 1);
        if (user.pet_wolf) dropBonus += 0.10;
        if (user.hunter_charm) dropBonus += 0.15;

        // ===== DROPS =====
        let drops = [];

        user.common += 1;
        drops.push("Common Loot 📦");

        if (Math.random() < 0.08 * dropBonus) {
            user.mythic += 1;
            drops.push("Mythic Crate 📦");
        }

        if (Math.random() < 0.02 * dropBonus) {
            user.legendary += 1;
            drops.push("Legendary Box 🎁");
        }

        // ===== EXP =====
        let exp = Math.floor(Math.random() * 150) + 150;

        if (user.pet_dragon)
            exp = Math.floor(exp * 1.05);

        addExp(user, exp);

        funcs.saveRPG();
        funcs.cekLevel(sender);

        // ===== MESSAGE =====
        let text = `⚔️ *HUNT SELESAI*\n\n`;
        text += `🎁 Drop: ${drops.join(", ")}\n`;
        text += `❤️ Terluka: -${damage} HP\n`;
        text += `✨ EXP: +${exp.toLocaleString('id-ID')}\n`;
        text += `❤️ Sisa HP: ${user.health}/${user.maxHealth}`;

        if (user.pet_wolf || user.hunter_charm || user.pet_dragon) {
            text += `\n\n🔮 *BUFF AKTIF*`;
            if (user.pet_wolf)
                text += `\n🐺 Pet Wolf (+10% drop)`;
            if (user.hunter_charm)
                text += `\n🏹 Hunter Charm (+15% drop)`;
            if (user.pet_dragon)
                text += `\n🐉 Pet Dragon (+5% EXP)`;
        }

        return reply(text);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
