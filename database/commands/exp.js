<<<<<<< HEAD
module.exports = {
    name: "exp",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        reply(`✨ *EXP*\n\nEXP: ${u.exp.toLocaleString()}`);
    }
};
=======
module.exports = {
    name: "exp",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        reply(`✨ *EXP*\n\nEXP: ${u.exp.toLocaleString()}`);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
