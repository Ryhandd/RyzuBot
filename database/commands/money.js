module.exports = {
    name: "money",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        reply(`💰 *MONEY*\n\nSaldo: ${u.money.toLocaleString()}`);
    }
};
