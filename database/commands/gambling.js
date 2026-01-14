<<<<<<< HEAD
const { safeNum, addMoney } = require('../../lib/rpgUtils');

module.exports = {
    name: "gambling",
    alias: ["judi", "slot"],
    execute: async ({ reply, args, sender, funcs, command }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.money = safeNum(user.money);

        if (user.money < 1)
            return reply("❌ Kamu tidak punya uang.");

        // ================= CONFIG =================
        const customRates = {
            2: 0.45,
            3: 0.30,
            5: 0.18,
            10: 0.09
        };
        // ==========================================

        const maxBet = Math.floor(user.money * 0.25);

        // ================= BET ====================
        let bet = args[0] === "all"
            ? maxBet
            : safeNum(args[0]);

        if (!bet || bet < 1)
            return reply("❌ Contoh: .judi 1000 x2");

        if (bet > user.money)
            return reply("❌ Uang kamu tidak cukup.");

        if (bet > maxBet)
            return reply(`❌ Max bet 25% dari uangmu (${maxBet.toLocaleString('id-ID')})`);
        // ==========================================

        // ================= JUDI ===================
        if (command === "judi") {

            let mult = args[1]
                ? parseInt(args[1].replace("x", ""))
                : 2;

            if (!Number.isFinite(mult) || mult < 2) mult = 2;
            if (mult > 10) mult = 10;

            const winRate = customRates[mult] || (1 / mult) * 0.9;

            // 💸 TARUH BET
            addMoney(user, -bet);

            const roll = Math.random();

            if (roll < winRate) {
                const win = bet * mult;
                addMoney(user, win);

                return reply(
                    `🎉 *MENANG JUDI!*\n\n` +
                    `🎲 Kelipatan: x${mult}\n` +
                    `📊 Chance: ${(winRate * 100).toFixed(1)}%\n\n` +
                    `💰 Menang: +${win.toLocaleString('id-ID')}\n` +
                    `💳 Saldo: ${user.money.toLocaleString('id-ID')}`
                );
            }

            return reply(
                `☠️ *KALAH JUDI*\n\n` +
                `🎲 Kelipatan: x${mult}\n` +
                `📊 Chance: ${(winRate * 100).toFixed(1)}%\n\n` +
                `💸 Hilang: -${bet.toLocaleString('id-ID')}\n` +
                `💳 Saldo: ${user.money.toLocaleString('id-ID')}`
            );
        }

        // ================= SLOT ===================
        else {

            addMoney(user, -bet);

            const roll = Math.random();
            let text = `🎰 *SLOT MACHINE*\n\n`;

            if (roll < 0.008) {
                const win = bet * 8;
                addMoney(user, win);
                text += `🤑 *JACKPOT!*\n💰 +${win.toLocaleString('id-ID')}`;
            }
            else if (roll < 0.088) {
                const win = bet * 2;
                addMoney(user, win);
                text += `⚡ *BIG WIN!*\n💰 +${win.toLocaleString('id-ID')}`;
            }
            else {
                text += `☠️ *LOSE*\n💸 -${bet.toLocaleString('id-ID')}`;
            }

            text += `\n\n💳 Saldo: ${user.money.toLocaleString('id-ID')}`;
            reply(text);
        }

        funcs.saveRPG();
    }
};
=======
const { safeNum, addMoney } = require('../../lib/rpgUtils');

module.exports = {
    name: "gambling",
    alias: ["judi", "slot"],
    execute: async ({ reply, args, sender, funcs, command }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.money = safeNum(user.money);

        if (user.money < 1)
            return reply("❌ Kamu tidak punya uang.");

        // ================= CONFIG =================
        const customRates = {
            2: 0.45,
            3: 0.30,
            5: 0.18,
            10: 0.09
        };
        // ==========================================

        const maxBet = Math.floor(user.money * 0.25);

        // ================= BET ====================
        let bet = args[0] === "all"
            ? maxBet
            : safeNum(args[0]);

        if (!bet || bet < 1)
            return reply("❌ Contoh: .judi 1000 x2");

        if (bet > user.money)
            return reply("❌ Uang kamu tidak cukup.");

        if (bet > maxBet)
            return reply(`❌ Max bet 25% dari uangmu (${maxBet.toLocaleString('id-ID')})`);
        // ==========================================

        // ================= JUDI ===================
        if (command === "judi") {

            let mult = args[1]
                ? parseInt(args[1].replace("x", ""))
                : 2;

            if (!Number.isFinite(mult) || mult < 2) mult = 2;
            if (mult > 10) mult = 10;

            const winRate = customRates[mult] || (1 / mult) * 0.9;

            // 💸 TARUH BET
            addMoney(user, -bet);

            const roll = Math.random();

            if (roll < winRate) {
                const win = bet * mult;
                addMoney(user, win);

                return reply(
                    `🎉 *MENANG JUDI!*\n\n` +
                    `🎲 Kelipatan: x${mult}\n` +
                    `📊 Chance: ${(winRate * 100).toFixed(1)}%\n\n` +
                    `💰 Menang: +${win.toLocaleString('id-ID')}\n` +
                    `💳 Saldo: ${user.money.toLocaleString('id-ID')}`
                );
            }

            return reply(
                `☠️ *KALAH JUDI*\n\n` +
                `🎲 Kelipatan: x${mult}\n` +
                `📊 Chance: ${(winRate * 100).toFixed(1)}%\n\n` +
                `💸 Hilang: -${bet.toLocaleString('id-ID')}\n` +
                `💳 Saldo: ${user.money.toLocaleString('id-ID')}`
            );
        }

        // ================= SLOT ===================
        else {

            addMoney(user, -bet);

            const roll = Math.random();
            let text = `🎰 *SLOT MACHINE*\n\n`;

            if (roll < 0.008) {
                const win = bet * 8;
                addMoney(user, win);
                text += `🤑 *JACKPOT!*\n💰 +${win.toLocaleString('id-ID')}`;
            }
            else if (roll < 0.088) {
                const win = bet * 2;
                addMoney(user, win);
                text += `⚡ *BIG WIN!*\n💰 +${win.toLocaleString('id-ID')}`;
            }
            else {
                text += `☠️ *LOSE*\n💸 -${bet.toLocaleString('id-ID')}`;
            }

            text += `\n\n💳 Saldo: ${user.money.toLocaleString('id-ID')}`;
            reply(text);
        }

        funcs.saveRPG();
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
