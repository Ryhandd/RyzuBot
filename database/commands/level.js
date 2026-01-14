module.exports = {
    name: "level",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        reply(
            `📊 *LEVEL*\n\n` +
            `Level: ${u.level}\n` +
            `EXP: ${u.exp}/${u.level * 500}`
        );
    }
};
