<<<<<<< HEAD
function minimax(board, depth, isMax, color) {
  if (depth === 0) return evaluate(board, color)
  let best = isMax ? -9999 : 9999

  for (let move of generateAllMoves(board, color)) {
    const score = minimax(
      move.board,
      depth - 1,
      !isMax,
      color === 'w' ? 'b' : 'w'
    )
    best = isMax ? Math.max(best, score) : Math.min(best, score)
  }
  return best
}
=======
function minimax(board, depth, isMax, color) {
  if (depth === 0) return evaluate(board, color)
  let best = isMax ? -9999 : 9999

  for (let move of generateAllMoves(board, color)) {
    const score = minimax(
      move.board,
      depth - 1,
      !isMax,
      color === 'w' ? 'b' : 'w'
    )
    best = isMax ? Math.max(best, score) : Math.min(best, score)
  }
  return best
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
