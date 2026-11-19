const { safeNum } = require('../../lib/rpgUtils')
module.exports = {
    name: "exp",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender] || {}
        reply(`✨ *EXP*\n\nEXP: ${safeNum(u.exp).toLocaleString('id-ID')}`)
    }
};