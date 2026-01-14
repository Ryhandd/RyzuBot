const PIECE_VALUE = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 100
}

function evaluateBoard(board, color) {
  let score = 0
  for (let sq in board) {
    const p = board[sq]
    const val = PIECE_VALUE[p[1]]
    score += p[0] === color ? val : -val
  }
  return score
}

function pickMove(moves, elo) {
  // elo rendah = random
  if (elo < 800) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  // elo menengah = semi greedy
  if (elo < 1400) {
    return moves.sort((a, b) => b.score - a.score)[0]
  }

  // elo tinggi = best move
  return moves.sort((a, b) => b.score - a.score)[0]
}

module.exports = {
  evaluateBoard,
  pickMove
}
