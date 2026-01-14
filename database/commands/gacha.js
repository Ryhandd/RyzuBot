const { handleGachaItem } = require("../../lib/gachaConvert");
const { safeNum, addMoney } = require("../../lib/rpgUtils");

module.exports = {
    name: "gacha",
    alias: ["pull"],
    execute: async ({ sender, reply, args, funcs }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE INIT =====
        user.gacha_ticket = safeNum(user.gacha_ticket);
        user.gacha_pity = safeNum(user.gacha_pity);
        user.money = safeNum(user.money);
        user.gacha_history ||= [];

        const pullCount = args[0] === "10" ? 10 : 1;
        const bonusPull = pullCount === 10 ? 1 : 0;
        const totalPull = pullCount + bonusPull;

        if (user.gacha_ticket < pullCount)
            return reply("❌ Tiket gacha kamu tidak cukup.");

        user.gacha_ticket -= pullCount;

        let results = [];
        let messages = [];
        let gotRareItem = false;

        // ===== RARITY ROLL + PITY =====
        const rollRarity = () => {
            user.gacha_pity++;

            if (user.gacha_pity >= 50)
                return "legendary";

            const r = Math.random();
            if (r < 0.55) return "common";
            if (r < 0.80) return "rare";
            if (r < 0.94) return "epic";
            if (r < 0.99) return "legendary";
            return "limited";
        };

        // ===== GACHA LOOP =====
        for (let i = 0; i < totalPull; i++) {
            const rarity = rollRarity();
            let reward = "";

            switch (rarity) {
                case "common":
                    reward = Math.random() < 0.5
                        ? "potion"
                        : "gacha_ticket";
                    break;

                case "rare": {
                    const r = Math.random();
                    reward = r < 0.34
                        ? "mining_charm"
                        : r < 0.67
                            ? "fishing_charm"
                            : "hunter_charm";
                    break;
                }

                case "epic":
                    reward = Math.random() < 0.5
                        ? "pet_wolf"
                        : "adventure_badge";
                    break;

                case "legendary":
                    reward = "pet_dragon";
                    user.gacha_pity = 0;
                    gotRareItem = true;
                    break;

                case "limited":
                    reward = user.golden_emblem
                        ? "pet_dragon"
                        : "golden_emblem";
                    user.gacha_pity = 0;
                    gotRareItem = true;
                    break;
            }

            // ===== HANDLE ITEM =====
            const gachaRes = handleGachaItem(user, reward, rarity);

            // 🔒 JIKA ADA KONVERSI MONEY
            if (gachaRes?.money)
                addMoney(user, gachaRes.money);

            if (gachaRes?.message)
                messages.push(gachaRes.message);

            results.push({ rarity, reward });

            user.gacha_history.unshift({
                rarity,
                reward,
                time: Date.now()
            });

            if (user.gacha_history.length > 50)
                user.gacha_history.pop();
        }

        funcs.saveRPG();

        // ===== BUILD MESSAGE =====
        let text = `🎰 *GACHA RESULT*\n`;
        text += `🎟️ Pull: ${pullCount}x`;
        text += bonusPull ? ` (+1 Bonus)\n` : `\n`;

        text += `📉 Pity: ${user.gacha_pity}/50\n\n`;

        results.forEach((r, i) => {
            text += `${i + 1}. [${r.rarity.toUpperCase()}] ${r.reward}\n`;
        });

        if (gotRareItem)
            text += `\n🔥 *ITEM LANGKA DIDAPAT!*`;

        text += `\n🎟️ Sisa Ticket: ${user.gacha_ticket}`;

        if (messages.length) {
            text += `\n\n💱 *Konversi Duplikat*\n`;
            messages.forEach(m => text += `- ${m}\n`);
        }

        return reply(text);
    }
};
