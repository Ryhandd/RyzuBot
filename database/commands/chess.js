<<<<<<< HEAD
const { startChessGame } = require('./chessGame.js')

module.exports = {
  name: 'chess',
  execute({ from, sender, args, reply }) {
    if (global.chessGames[from])
      return reply('♟️ Game catur sudah berjalan.')

    // .chess 600
    if (args[0] && !isNaN(args[0])) {
      const elo = Math.max(200, Math.min(2000, Number(args[0])))

      startChessGame(from, sender, null, {
        vsBot: true,
        botElo: elo
      })

      return reply(`♟️ Game catur dimulai!\n🤖 Lawan BOT (ELO ${elo})\nPutih jalan dulu.`)
    }

    if (args[0] === 'resign') {
      delete global.chessGames[from]
      return reply('🏳️ Kamu menyerah. Game selesai.')
    }

    return reply('Tag lawan atau isi ELO bot.\nContoh: .chess 1000')
  }
}
=======
const { startChessGame } = require('./chessGame.js')

module.exports = {
  name: 'chess',
  execute({ from, sender, args, reply }) {
    if (global.chessGames[from])
      return reply('♟️ Game catur sudah berjalan.')

    // .chess 600
    if (args[0] && !isNaN(args[0])) {
      const elo = Math.max(200, Math.min(2000, Number(args[0])))

      startChessGame(from, sender, null, {
        vsBot: true,
        botElo: elo
      })

      return reply(`♟️ Game catur dimulai!\n🤖 Lawan BOT (ELO ${elo})\nPutih jalan dulu.`)
    }

    if (args[0] === 'resign') {
      delete global.chessGames[from]
      return reply('🏳️ Kamu menyerah. Game selesai.')
    }

    return reply('Tag lawan atau isi ELO bot.\nContoh: .chess 1000')
  }
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
