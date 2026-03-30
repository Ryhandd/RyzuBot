const { createItem } = require("../../lib/inventory");
const { safeNum, addMoney } = require("../../lib/rpgUtils");

module.exports = {
    name: "gacha",
    alias: ["pull"],
    execute: async ({ sender, reply, args, funcs }) => {

        const user = global.rpg[sender];

        user.gacha_ticket = safeNum(user.gacha_ticket);
        user.gacha_pity = safeNum(user.gacha_pity);
        user.money = safeNum(user.money);

        user.inventory ||= [];
        user.gacha_history ||= [];

        const pullCount = args[0] === "10" ? 10 : 1;
        const bonusPull = pullCount === 10 ? 1 : 0;
        const totalPull = pullCount + bonusPull;

        if (user.gacha_ticket < pullCount)
            return reply("❌ Tiket tidak cukup.");

        user.gacha_ticket -= pullCount;

        let results = [];
        let gotRareItem = false;

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

        for (let i = 0; i < totalPull; i++) {
            const rarity = rollRarity();
            let reward = "";

            switch (rarity) {
                case "common":
                    reward = Math.random() < 0.5 ? "potion" : "gacha_ticket";
                    break;

                case "rare":
                    reward = ["mining_charm", "fishing_charm", "hunter_charm"]
                        [Math.floor(Math.random() * 3)];
                    break;

                case "epic":
                    reward = Math.random() < 0.5 ? "pet_wolf" : "adventure_badge";
                    break;

                case "legendary":
                    reward = "pet_dragon";
                    user.gacha_pity = 0;
                    gotRareItem = true;
                    break;

                case "limited":
                    reward = Math.random() < 0.5 ? "golden_emblem" : "ancient_relic";
                    user.gacha_pity = 0;
                    gotRareItem = true;
                    break;
            }

            const itemObj = createItem(reward, rarity);
            user.inventory.push(itemObj);

            results.push(itemObj);

            user.gacha_history.unshift({
                rarity,
                reward,
                time: Date.now()
            });

            if (user.gacha_history.length > 50)
                user.gacha_history.pop();
        }

        await funcs.saveRPG(sender);

        let text = `🎰 *GACHA RESULT*\n`;
        text += `🎟️ Pull: ${pullCount}${bonusPull ? " (+1)" : ""}\n`;
        text += `📉 Pity: ${user.gacha_pity}/50\n\n`;

        results.forEach((item, i) => {
            text += `${i + 1}. [${item.rarity.toUpperCase()}] ${item.name} (${item.durability})\n`;
        });

        if (gotRareItem)
            text += `\n🔥 ITEM LANGKA DIDAPAT!`;

        text += `\n🎟️ Sisa Ticket: ${user.gacha_ticket}`;

        reply(text);
    }
};