module.exports = {
    name: "gachainfo",
    alias: ["gacha-info", "ginfo"],
    execute: async ({ sender, reply }) => {
        const user = global.rpg[sender];

        const pity = user.gacha_pity || 0;
        const ticket = user.gacha_ticket || 0;
        const history = user.gacha_history || [];

        let text = `🎰 *GACHA INFO*\n\n`;
        text += `🎟️ Ticket: ${ticket}\n`;
        text += `📉 Pity: ${pity}/50\n\n`;

        text += `🎖️ *RATE*\n`;
        text += `• Common: 55%\n`;
        text += `• Rare: 25%\n`;
        text += `• Epic: 14%\n`;
        text += `• Legendary: 5%\n`;
        text += `• Limited: 1%\n\n`;

        text += `📜 *HISTORY (TERAKHIR)*\n`;

        if (history.length === 0) {
            text += `Belum ada pull.`;
        } else {
            history.slice(0, 10).forEach((h, i) => {
                text += `${i + 1}. [${h.rarity.toUpperCase()}] ${h.reward}\n`;
            });
        }

        return reply(text);
    }
};
