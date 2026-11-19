const { startChessGame } = require("../../lib/chess/chessGame.js")
module.exports = {
  name: 'chess',
  execute({ from, sender, args, reply }) {
    if (global.chessGames[from])
      return reply('♟️ Game catur sudah berjalan.')
    if (args[0] === 'resign') {
      delete global.chessGames[from]
      return reply('🏳️ Kamu menyerah. Game selesai.')
    }
    if (args[0] && !isNaN(args[0])) {
      const elo = Math.max(200, Math.min(2000, Number(args[0])))
      startChessGame(from, sender, null, { vsBot: true, botElo: elo })
      return reply(`♟️ Game catur dimulai!\n🤖 Lawan BOT (ELO ${elo})\nPutih jalan dulu.`)
    }
    return reply('Tag lawan atau isi ELO bot.\nContoh: .chess 1000')
  }
}