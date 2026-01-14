function parseSAN(input) {
  input = input.trim()

  // CASTLING
  if (input === 'O-O' || input === 'o-o') {
    return { castle: 'short' }
  }
  if (input === 'O-O-O' || input === 'o-o-o') {
    return { castle: 'long' }
  }

  // CHECK / MATE
  let check = input.endsWith('+')
  let mate = input.endsWith('#')
  input = input.replace(/[+#]/g, '')

  // PIECE MOVE OR CAPTURE
  // Nf3, Rxa7, Qh5
  const sanRegex = /^([NBRQK])?([a-h])?(x)?([a-h][1-8])(=?[QRBN])?$/
  const m = input.match(sanRegex)
  if (!m) return null

  return {
    piece: m[1] ? m[1].toLowerCase() : 'p',
    fromFile: m[2] || null,
    capture: !!m[3],
    target: m[4],
    promotion: m[5] ? m[5][1].toLowerCase() : null,
    check,
    mate
  }
}

function parseMove(input) {
  input = input.toLowerCase().trim()

  // pawn capture: dxe5
  if (/^[a-h]x[a-h][1-8]$/.test(input)) {
    return {
      piece: 'p',
      fromFile: input[0],
      capture: true,
      target: input.slice(2)
    }
  }

  // normal pawn move: e4
  if (/^[a-h][1-8]$/.test(input)) {
    return {
      piece: 'p',
      target: input
    }
  }

  // piece move: nf3, bc4
  if (/^[nbrqk][a-h][1-8]$/.test(input)) {
    return {
      piece: input[0],
      target: input.slice(1)
    }
  }

  // pawn promotion: e8q, e1n
  if (/^[a-h][18][qrbn]$/.test(input)) {
    return {
      piece: 'p',
      target: input.slice(0, 2),
      promotion: input[2]
    }
  }

  // pawn capture: dxe5
  if (/^[a-h]x[a-h][1-8]$/.test(input)) {
    return {
      piece: 'p',
      fromFile: input[0],
      capture: true,
      target: input.slice(2)
    }
  }

  // normal pawn move
  if (/^[a-h][1-8]$/.test(input)) {
    return {
      piece: 'p',
      target: input
    }
  }

  // piece move
  if (/^[nbrqk][a-h][1-8]$/.test(input)) {
    return {
      piece: input[0],
      target: input.slice(1)
    }
  }

  return null
}


function knightMoves(from, board, color) {
  const deltas = [
    [1,2],[2,1],[-1,2],[-2,1],
    [1,-2],[2,-1],[-1,-2],[-2,-1]
  ]

  const f = from.charCodeAt(0) - 96
  const r = Number(from[1])
  const moves = []

  for (let [df, dr] of deltas) {
    const nf = f + df
    const nr = r + dr
    if (nf < 1 || nf > 8 || nr < 1 || nr > 8) continue

    const sq = String.fromCharCode(96 + nf) + nr
    if (!board[sq] || board[sq][0] !== color)
      moves.push(sq)
  }
  return moves
}

function slideMoves(from, board, color, dirs) {
  const f = from.charCodeAt(0) - 96
  const r = Number(from[1])
  const moves = []

  for (let [df, dr] of dirs) {
    let nf = f + df, nr = r + dr
    while (nf >= 1 && nf <= 8 && nr >= 1 && nr <= 8) {
      const sq = String.fromCharCode(96 + nf) + nr
      if (board[sq]) {
        if (board[sq][0] !== color) moves.push(sq)
        break
      }
      moves.push(sq)
      nf += df
      nr += dr
    }
  }
  return moves
}

function pawnMoves(from, board, color, enPassant) {
  const moves = []
  const file = from[0]
  const rank = Number(from[1])

  const dir = color === 'w' ? 1 : -1
  const startRank = color === 'w' ? 2 : 7

  const one = file + (rank + dir)
  if (!board[one]) {
    moves.push(one)

    const two = file + (rank + dir * 2)
    if (rank === startRank && !board[two]) {
      moves.push(two)
    }
  }

  for (let df of [-1, 1]) {
    const f = String.fromCharCode(file.charCodeAt(0) + df)
    if (f < 'a' || f > 'h') continue

    const target = f + (rank + dir)

    if (board[target] && board[target][0] !== color) {
      moves.push(target)
    }

    if (enPassant && enPassant.square === target) {
      moves.push(target)
    }
  }

  return moves
}

function kingMoves(from, board, color) {
  const moves = []
  const f = from.charCodeAt(0) - 96
  const r = Number(from[1])

  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue

      const nf = f + df
      const nr = r + dr
      if (nf < 1 || nf > 8 || nr < 1 || nr > 8) continue

      const sq = String.fromCharCode(96 + nf) + nr
      if (!board[sq] || board[sq][0] !== color) {
        moves.push(sq)
      }
    }
  }

  return moves
}

function getLegalMoves(from, board, enPassant=null) {
  const piece = board[from]
  if (!piece) return []

  const color = piece[0]
  const type = piece[1]

  if (type === 'p') {
    return pawnMoves(from, board, color, enPassant)
  }

  if (type === 'n') {
    return knightMoves(from, board, color)
  }

  if (type === 'r') {
    return slideMoves(from, board, color, [
      [1,0],[-1,0],[0,1],[0,-1]
    ])
  }

  if (type === 'b') {
    return slideMoves(from, board, color, [
      [1,1],[1,-1],[-1,1],[-1,-1]
    ])
  }

  if (type === 'q') {
    return slideMoves(from, board, color, [
      [1,0],[-1,0],[0,1],[0,-1],
      [1,1],[1,-1],[-1,1],[-1,-1]
    ])
  }

  if (type === 'k') {
    return kingMoves(from, board, color)
  }

  return []
}

function findKing(board, color) {
  for (let sq in board) {
    if (board[sq] === color + 'k') return sq
  }
  return null
}

function isSquareAttacked(square, board, attackerColor) {
  for (let from in board) {
    if (board[from][0] !== attackerColor) continue

    const moves = getLegalMoves(from, board)
    if (moves.includes(square)) return true
  }
  return false
}

function isKingInCheck(board, color) {
  const kingSq = findKing(board, color)
  if (!kingSq) return false

  const enemy = color === 'w' ? 'b' : 'w'
  return isSquareAttacked(kingSq, board, enemy)
}

function hasAnyLegalMove(board, color) {
  for (let from in board) {
    if (board[from][0] !== color) continue

    const targets = getLegalMoves(from, board)
    for (let to of targets) {
      const testBoard = { ...board }
      testBoard[to] = board[from]
      delete testBoard[from]

      if (!isKingInCheck(testBoard, color)) {
        return true
      }
    }
  }
  return false
}

module.exports = {
  parseSAN,
  parseMove,
  pawnMoves,
  knightMoves,
  slideMoves,
  kingMoves,
  getLegalMoves,
  isKingInCheck,
  hasAnyLegalMove
}