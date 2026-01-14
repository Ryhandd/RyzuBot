<<<<<<< HEAD
function createInitialBoard() {
  const board = {}
  const files = ['a','b','c','d','e','f','g','h']

  for (let i = 0; i < 8; i++) {
    board[files[i] + 2] = 'wp'
    board[files[i] + 7] = 'bp'
  }

  const backRank = ['r','n','b','q','k','b','n','r']
  for (let i = 0; i < 8; i++) {
    board[files[i] + 1] = 'w' + backRank[i]
    board[files[i] + 8] = 'b' + backRank[i]
  }

  return board
}

module.exports = { createInitialBoard }
=======
function createInitialBoard() {
  const board = {}
  const files = ['a','b','c','d','e','f','g','h']

  for (let i = 0; i < 8; i++) {
    board[files[i] + 2] = 'wp'
    board[files[i] + 7] = 'bp'
  }

  const backRank = ['r','n','b','q','k','b','n','r']
  for (let i = 0; i < 8; i++) {
    board[files[i] + 1] = 'w' + backRank[i]
    board[files[i] + 8] = 'b' + backRank[i]
  }

  return board
}

module.exports = { createInitialBoard }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
