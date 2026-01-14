<<<<<<< HEAD
module.exports = {
    name: "money",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        reply(`💰 *MONEY*\n\nSaldo: ${u.money.toLocaleString()}`);
    }
};
=======
module.exports = {
    name: "money",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        reply(`💰 *MONEY*\n\nSaldo: ${u.money.toLocaleString()}`);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
