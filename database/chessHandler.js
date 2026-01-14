const { makeMove } = require('./commands/chessGame.js')

module.exports = async function chessHandler({ from, sender, text, reply }) {
  const game = global.chessGames[from]
  if (!game) return false

  if (!/^(o-o|o-o-o|[nbrqk]?[a-h][1-8])$/i.test(text)) return false

  const res = makeMove(from, sender, text)
  reply(res)
  return true
}