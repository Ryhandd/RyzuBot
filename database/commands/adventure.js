<<<<<<< HEAD
const buff = require('../../lib/equipmentBuff');
const dura = require('../../lib/durability');
const { safeNum, addMoney, addExp } = require('../../lib/rpgUtils');

module.exports = {
    name: "adventure",
    alias: ["adv"],
    execute: async ({ reply, sender, funcs, ryzu, from }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE USER =====
        user.health = safeNum(user.health, user.maxHealth || 100);
        user.maxHealth = safeNum(user.maxHealth, 100);
        user.kayu = safeNum(user.kayu);
        user.armor = safeNum(user.armor);

        // ===== CEK HP =====
        if (user.health < 30) {
            return reply(
                `⚠️ HP kamu terlalu rendah (${user.health} HP).\n` +
                `Heal dulu sebelum berpetualang.`
            );
        }

        // ===== COOLDOWN =====
        const cooldown = 900000;
        const sisa = cooldown - (Date.now() - (user.lastAdventure || 0));

        if (sisa > 0) {
            const menit = Math.floor(sisa / 60000);
            const detik = Math.floor((sisa % 60000) / 1000);
            return reply(
                `⏳ Kamu masih kelelahan.\n` +
                `Tunggu *${menit} menit ${detik} detik* lagi.`
            );
        }

        user.lastAdventure = Date.now();

        // ===== DURABILITY =====
        if (user.armor && user.durability?.armor > 0) {
            user.durability.armor -= dura.lose(user.armor, "armor");
        }

        // ===== DAMAGE =====
        const baseDamage = Math.floor(Math.random() * 18) + 8;
        const reduce = Math.floor(user.armor * 1.5);

        let damage = Math.max(3, baseDamage - reduce);

        const armorReduce = safeNum(buff.armorReduce(user.armor));
        damage = Math.floor(damage * (1 - armorReduce));

        if (user.adventure_badge)
            damage = Math.floor(damage * 0.9);

        if (!Number.isFinite(damage) || damage < 3)
            damage = 3;

        user.health -= damage;
        if (user.health < 0) user.health = 0;

        // ===== REWARD =====
        let exp = Math.floor(Math.random() * 700) + 500;
        const kayu = Math.floor(Math.random() * 31) + 10;

        if (user.pet_dragon)
            exp = Math.floor(exp * 1.05);

        let money =
            exp * 5 +
            kayu * 100 -
            damage * 50;

        if (user.golden_emblem)
            money = Math.floor(money * 1.1);

        if (!Number.isFinite(money) || money < 0)
            money = 0;

        // ===== UPDATE USER (UTILS) =====
        addExp(user, exp);
        addMoney(user, money);
        user.kayu += kayu;

        funcs.saveRPG();
        funcs.cekLevel(sender, ryzu, from);

        // ===== MESSAGE =====
        let text = `🌲 *PETUALANGAN SELESAI* 🌲\n\n`;
        text += `❤️ Terluka: -${damage} HP\n`;
        text += `🪵 Kayu: +${kayu}\n`;
        text += `💰 Money: +${money.toLocaleString('id-ID')}\n`;
        text += `✨ EXP: +${exp.toLocaleString('id-ID')}\n`;
        text += `\n❤️ Sisa HP: ${user.health}/${user.maxHealth}`;

        if (user.adventure_badge || user.pet_dragon || user.golden_emblem) {
            text += `\n\n🔮 *BUFF AKTIF*`;
            if (user.adventure_badge)
                text += `\n🛡️ Adventure Badge (-10% Damage)`;
            if (user.pet_dragon)
                text += `\n🐉 Pet Dragon (+5% EXP)`;
            if (user.golden_emblem)
                text += `\n🌟 Golden Emblem (+10% Money)`;
        }

        reply(text);
    }
};
=======
const buff = require('../../lib/equipmentBuff');
const dura = require('../../lib/durability');
const { safeNum, addMoney, addExp } = require('../../lib/rpgUtils');

module.exports = {
    name: "adventure",
    alias: ["adv"],
    execute: async ({ reply, sender, funcs, ryzu, from }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE USER =====
        user.health = safeNum(user.health, user.maxHealth || 100);
        user.maxHealth = safeNum(user.maxHealth, 100);
        user.kayu = safeNum(user.kayu);
        user.armor = safeNum(user.armor);

        // ===== CEK HP =====
        if (user.health < 30) {
            return reply(
                `⚠️ HP kamu terlalu rendah (${user.health} HP).\n` +
                `Heal dulu sebelum berpetualang.`
            );
        }

        // ===== COOLDOWN =====
        const cooldown = 900000;
        const sisa = cooldown - (Date.now() - (user.lastAdventure || 0));

        if (sisa > 0) {
            const menit = Math.floor(sisa / 60000);
            const detik = Math.floor((sisa % 60000) / 1000);
            return reply(
                `⏳ Kamu masih kelelahan.\n` +
                `Tunggu *${menit} menit ${detik} detik* lagi.`
            );
        }

        user.lastAdventure = Date.now();

        // ===== DURABILITY =====
        if (user.armor && user.durability?.armor > 0) {
            user.durability.armor -= dura.lose(user.armor, "armor");
        }

        // ===== DAMAGE =====
        const baseDamage = Math.floor(Math.random() * 18) + 8;
        const reduce = Math.floor(user.armor * 1.5);

        let damage = Math.max(3, baseDamage - reduce);

        const armorReduce = safeNum(buff.armorReduce(user.armor));
        damage = Math.floor(damage * (1 - armorReduce));

        if (user.adventure_badge)
            damage = Math.floor(damage * 0.9);

        if (!Number.isFinite(damage) || damage < 3)
            damage = 3;

        user.health -= damage;
        if (user.health < 0) user.health = 0;

        // ===== REWARD =====
        let exp = Math.floor(Math.random() * 700) + 500;
        const kayu = Math.floor(Math.random() * 31) + 10;

        if (user.pet_dragon)
            exp = Math.floor(exp * 1.05);

        let money =
            exp * 5 +
            kayu * 100 -
            damage * 50;

        if (user.golden_emblem)
            money = Math.floor(money * 1.1);

        if (!Number.isFinite(money) || money < 0)
            money = 0;

        // ===== UPDATE USER (UTILS) =====
        addExp(user, exp);
        addMoney(user, money);
        user.kayu += kayu;

        funcs.saveRPG();
        funcs.cekLevel(sender, ryzu, from);

        // ===== MESSAGE =====
        let text = `🌲 *PETUALANGAN SELESAI* 🌲\n\n`;
        text += `❤️ Terluka: -${damage} HP\n`;
        text += `🪵 Kayu: +${kayu}\n`;
        text += `💰 Money: +${money.toLocaleString('id-ID')}\n`;
        text += `✨ EXP: +${exp.toLocaleString('id-ID')}\n`;
        text += `\n❤️ Sisa HP: ${user.health}/${user.maxHealth}`;

        if (user.adventure_badge || user.pet_dragon || user.golden_emblem) {
            text += `\n\n🔮 *BUFF AKTIF*`;
            if (user.adventure_badge)
                text += `\n🛡️ Adventure Badge (-10% Damage)`;
            if (user.pet_dragon)
                text += `\n🐉 Pet Dragon (+5% EXP)`;
            if (user.golden_emblem)
                text += `\n🌟 Golden Emblem (+10% Money)`;
        }

        reply(text);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
