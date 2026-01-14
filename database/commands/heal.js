<<<<<<< HEAD
module.exports = {
    name: "heal",
    execute: async ({ sender, reply, funcs }) => {
        const user = global.rpg[sender];
        if (user.health >= user.maxHealth) return reply("❤️ Darahmu sudah penuh!");
        if (user.potion < 1) return reply("❌ Kamu tidak punya Potion. Beli dulu di .shop");

        user.potion -= 1;
        user.health = user.maxHealth;
        
        funcs.saveRPG();
        return reply("❤️ Darah penuh kembali! Siap bertualang lagi.");
    }
=======
module.exports = {
    name: "heal",
    execute: async ({ sender, reply, funcs }) => {
        const user = global.rpg[sender];
        if (user.health >= user.maxHealth) return reply("❤️ Darahmu sudah penuh!");
        if (user.potion < 1) return reply("❌ Kamu tidak punya Potion. Beli dulu di .shop");

        user.potion -= 1;
        user.health = user.maxHealth;
        
        funcs.saveRPG();
        return reply("❤️ Darah penuh kembali! Siap bertualang lagi.");
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};