const { safeNum } = require('../../lib/rpgUtils')
module.exports = {
    name: "level",
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender] || {}
        const level = Math.max(1, safeNum(u.level, 1))
        reply(
            `📊 *LEVEL*\n\n` +
            `Level: ${level}\n` +
            `EXP: ${safeNum(u.exp)}/${level * 500}`
        )
    }
};