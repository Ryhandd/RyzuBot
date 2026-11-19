const { safeNum } = require('../../lib/rpgUtils')
module.exports = {
    name: "money",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender] || {}
        reply(`💰 *MONEY*\n\nSaldo: ${safeNum(u.money).toLocaleString('id-ID')}`)
    }
};