module.exports = {
    name: "exp",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        reply(`✨ *EXP*\n\nEXP: ${u.exp.toLocaleString()}`);
    }
};
