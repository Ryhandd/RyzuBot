<<<<<<< HEAD
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
=======
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
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
