<<<<<<< HEAD
const { safeNum, addMoney, addExp } = require('../../lib/rpgUtils');

module.exports = {
    name: "claim",
    alias: ["daily", "weekly", "monthly", "yearly"],
    execute: async ({ sender, command, reply, funcs }) => {

        const user = global.rpg[sender];
        const now = Date.now();

        // ===== SANITIZE =====
        user.money = safeNum(user.money);
        user.exp = safeNum(user.exp);

        const rewards = {
            daily: {
                name: "Daily",
                cd: 86400000,
                money: 5000,
                exp: 1000,
                items: { kayu: 5, batu: 5, common: 1 }
            },
            weekly: {
                name: "Weekly",
                cd: 604800000,
                money: 50000,
                exp: 10000,
                items: { emas: 5, mythic: 2, umpan: 10 }
            },
            monthly: {
                name: "Monthly",
                cd: 2592000000,
                money: 250000,
                exp: 50000,
                items: { diamond: 5, legendary: 1, potion: 5 }
            },
            yearly: {
                name: "Yearly",
                cd: 31536000000,
                money: 1000000,
                exp: 200000,
                items: { diamond: 50, legendary: 10, armor: 1 }
            }
        };

        const type = command === "claim" ? "daily" : command;
        const reward = rewards[type];

        if (!reward)
            return reply("❌ Reward tidak ditemukan.");

        const lastKey = `last${reward.name}`;
        user[lastKey] = safeNum(user[lastKey]);

        if (now - user[lastKey] < reward.cd) {
            const sisa = reward.cd - (now - user[lastKey]);
            const jam = Math.floor(sisa / 3600000);
            const menit = Math.floor((sisa % 3600000) / 60000);
            return reply(
                `⏳ Sudah ambil hadiah ${reward.name}. ` +
                `Tunggu ${jam}j ${menit}m lagi.`
            );
        }

        // ===== APPLY REWARD =====
        addMoney(user, reward.money);
        addExp(user, reward.exp);

        let itemTxt = "";
        for (const item in reward.items) {
            user[item] = safeNum(user[item]);
            user[item] += reward.items[item];
            itemTxt += `\n- ${item}: ${reward.items[item]}`;
        }

        user[lastKey] = now;

        funcs.saveRPG();
        funcs.cekLevel(sender);

        return reply(
            `🎁 *${reward.name.toUpperCase()} REWARD*\n\n` +
            `💰 Money: +${reward.money.toLocaleString('id-ID')}\n` +
            `✨ EXP: +${reward.exp.toLocaleString('id-ID')}` +
            itemTxt
        );
    }
};
=======
const { safeNum, addMoney, addExp } = require('../../lib/rpgUtils');

module.exports = {
    name: "claim",
    alias: ["daily", "weekly", "monthly", "yearly"],
    execute: async ({ sender, command, reply, funcs }) => {

        const user = global.rpg[sender];
        const now = Date.now();

        // ===== SANITIZE =====
        user.money = safeNum(user.money);
        user.exp = safeNum(user.exp);

        const rewards = {
            daily: {
                name: "Daily",
                cd: 86400000,
                money: 5000,
                exp: 1000,
                items: { kayu: 5, batu: 5, common: 1 }
            },
            weekly: {
                name: "Weekly",
                cd: 604800000,
                money: 50000,
                exp: 10000,
                items: { emas: 5, mythic: 2, umpan: 10 }
            },
            monthly: {
                name: "Monthly",
                cd: 2592000000,
                money: 250000,
                exp: 50000,
                items: { diamond: 5, legendary: 1, potion: 5 }
            },
            yearly: {
                name: "Yearly",
                cd: 31536000000,
                money: 1000000,
                exp: 200000,
                items: { diamond: 50, legendary: 10, armor: 1 }
            }
        };

        const type = command === "claim" ? "daily" : command;
        const reward = rewards[type];

        if (!reward)
            return reply("❌ Reward tidak ditemukan.");

        const lastKey = `last${reward.name}`;
        user[lastKey] = safeNum(user[lastKey]);

        if (now - user[lastKey] < reward.cd) {
            const sisa = reward.cd - (now - user[lastKey]);
            const jam = Math.floor(sisa / 3600000);
            const menit = Math.floor((sisa % 3600000) / 60000);
            return reply(
                `⏳ Sudah ambil hadiah ${reward.name}. ` +
                `Tunggu ${jam}j ${menit}m lagi.`
            );
        }

        // ===== APPLY REWARD =====
        addMoney(user, reward.money);
        addExp(user, reward.exp);

        let itemTxt = "";
        for (const item in reward.items) {
            user[item] = safeNum(user[item]);
            user[item] += reward.items[item];
            itemTxt += `\n- ${item}: ${reward.items[item]}`;
        }

        user[lastKey] = now;

        funcs.saveRPG();
        funcs.cekLevel(sender);

        return reply(
            `🎁 *${reward.name.toUpperCase()} REWARD*\n\n` +
            `💰 Money: +${reward.money.toLocaleString('id-ID')}\n` +
            `✨ EXP: +${reward.exp.toLocaleString('id-ID')}` +
            itemTxt
        );
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
