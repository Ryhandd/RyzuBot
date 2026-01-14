<<<<<<< HEAD
const { createInitialBoard } = require('./chessBoard.js')
const { parseMove } = require('./chessMoves.js')
const { renderBoard } = require('./chessRender.js')
const { getLegalMoves } = require('./chessMoves.js')
const { isKingInCheck } = require('./chessMoves.js')
const { hasAnyLegalMove } = require('./chessMoves.js')

/* =========================
   BOT ENGINE SEDERHANA
========================= */

const PIECE_VALUE = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100
}

// evaluasi papan sederhana (material)
function evaluateBoard(board, color) {
  let score = 0
  for (let sq in board) {
    const piece = board[sq]
    const val = PIECE_VALUE[piece[1]]
    score += piece[0] === color ? val : -val
  }
  return score
}

// generate pseudo-move (SUPER SIMPLE)
function generateBotMoves(board, color) {
  const moves = []

  for (let from in board) {
    const piece = board[from]
    if (piece[0] !== color) continue

    const targets = getLegalMoves(from, board)

    for (let to of targets) {
      const newBoard = { ...board }
      newBoard[to] = piece
      delete newBoard[from]

      if (isKingInCheck(newBoard, color)) continue

      moves.push({
        from,
        to,
        board: newBoard,
        notation: piece[1] + to
      })
    }
  }

  return moves
}

// pilih move berdasarkan elo
function pickBotMove(moves, color, elo) {
  if (moves.length === 0) return null

  // elo rendah → random
  if (elo < 800) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  // elo menengah → greedy
  const scored = moves.map(m => ({
    ...m,
    score: evaluateBoard(m.board, color)
  }))

  scored.sort((a, b) => b.score - a.score)

  // elo tinggi → best
  if (elo >= 1400) return scored[0]

  // elo 800–1399 → kadang blunder
  return Math.random() < 0.7 ? scored[0] : scored[Math.floor(Math.random() * scored.length)]
}

/* =========================
   GAME LOGIC
========================= */

function startChessGame(roomId, white, black, options = {}) {
  global.chessGames[roomId] = {
    white,
    black,
    turn: 'w',
    board: createInitialBoard(),
    history: [],
    status: 'playing',
    enPassant: null,

    // BOT
    vsBot: options.vsBot || false,
    botElo: options.botElo || 0,
    botColor: options.vsBot ? 'b' : null,

    castling: {
      w: { king: true, rookA: true, rookH: true },
      b: { king: true, rookA: true, rookH: true }
    }
  }
}

function makeMove(roomId, sender, text) {
  const game = global.chessGames[roomId]
  if (!game) return '❌ Tidak ada game'

  if (game.status !== 'playing' && game.status !== 'check')
    return '❌ Game sudah selesai'

  const color = sender === game.white ? 'w' : 'b'
  if (game.turn !== color) return '⏳ Bukan giliranmu'

  const input = text.toLowerCase()

  // =====================
  // RESIGN
  // =====================
  if (input === 'resign' || input === 'nyerah') {
    game.status = 'resign'
    return `🏳️ ${color === 'w' ? 'Putih' : 'Hitam'} menyerah.\n\n${renderBoard(game.board)}`
  }

  // =====================
  // CASTLING
  // =====================
  if (input === 'o-o' || input === 'o-o-o') {
    const res = handleCastling(game, color, input)
    if (typeof res === 'string') return res

    let reply = `♟️ ${input.toUpperCase()}`

    // BOT MOVE SETELAH ROKADE
    if (game.vsBot && game.turn === game.botColor) {
      const moves = generateBotMoves(game.board, game.botColor)
      const botMove = pickBotMove(moves, game.botColor, game.botElo)

      if (botMove) {
        game.board = botMove.board
        game.history.push(botMove.notation)
        game.turn = color
        reply += `\n🤖 Bot (${game.botElo}) main: ${botMove.notation}`
      }
    }
    return reply + '\n\n' + renderBoard(game.board)
  }

  // =====================
  // PARSE MOVE
  // =====================
  let move = parseMove(input)
  if (!move) {
    move = parseSAN(input)
  }
  if (!move) return '❌ Format langkah tidak dikenali'
  if (move.mate && game.status !== 'checkmate') {
    return '❌ Bukan checkmate'
  }


  const pieceCode = color + move.piece
  let fromSquare = null

  // =====================
  // FIND LEGAL MOVE
  // =====================
  for (let sq in game.board) {
    if (game.board[sq] !== pieceCode) continue

    // pawn capture file check (dxe5)
    if (move.capture && sq[0] !== move.fromFile) continue

    const targets = getLegalMoves(sq, game.board, game.enPassant)
    if (!targets.includes(move.target)) continue

    const testBoard = { ...game.board }
    testBoard[move.target] = pieceCode
    delete testBoard[sq]

    // en passant capture simulation
    if (
      move.piece === 'p' &&
      game.enPassant &&
      move.target === game.enPassant.square
    ) {
      delete testBoard[game.enPassant.pawn]
    }

    if (isKingInCheck(testBoard, color)) continue

    fromSquare = sq
    break
  }

  if (!fromSquare) return '❌ Langkah tidak legal'

  // =====================
  // COMMIT MOVE
  // =====================
  game.board[move.target] = pieceCode
  delete game.board[fromSquare]

  // EN PASSANT CAPTURE
  if (
    move.piece === 'p' &&
    game.enPassant &&
    move.target === game.enPassant.square
  ) {
    delete game.board[game.enPassant.pawn]
  }

  // RESET EN PASSANT
  game.enPassant = null

  // SET EN PASSANT (DOUBLE MOVE)
  if (move.piece === 'p') {
    const startRank = color === 'w' ? '2' : '7'
    const passRank = color === 'w' ? '3' : '6'

    if (fromSquare[1] === startRank && Math.abs(move.target[1] - fromSquare[1]) === 2) {
      game.enPassant = {
        square: fromSquare[0] + passRank,
        pawn: move.target
      }
    }
  }

  // PROMOTION
  if (
    move.piece === 'p' &&
    ((color === 'w' && move.target[1] === '8') ||
     (color === 'b' && move.target[1] === '1'))
  ) {
    game.board[move.target] = color + (move.promotion || 'q')
  }

  // CASTLING RIGHTS
  if (move.piece === 'k') game.castling[color].king = false
  if (move.piece === 'r') {
    if (fromSquare[0] === 'a') game.castling[color].rookA = false
    if (fromSquare[0] === 'h') game.castling[color].rookH = false
  }

  game.history.push(input)
  game.turn = color === 'w' ? 'b' : 'w'

  // =====================
  // CHECK / MATE
  // =====================
  const enemy = game.turn
  const inCheck = isKingInCheck(game.board, enemy)
  const hasMove = hasAnyLegalMove(game.board, enemy)

  let reply = `♟️ ${text}`

  if (!hasMove) {
    game.status = inCheck ? 'checkmate' : 'stalemate'
    return reply + `\n\n${inCheck ? '♚ CHECKMATE!' : '🤝 STALEMATE'}\n${renderBoard(game.board)}`
  }

  if (inCheck) {
    game.status = 'check'
    reply += '\n⚠️ CHECK!'
  } else {
    game.status = 'playing'
  }

  // =====================
  // BOT MOVE
  // =====================
  if (game.vsBot && game.turn === game.botColor) {
    const moves = generateBotMoves(game.board, game.botColor)
    const botMove = pickBotMove(moves, game.botColor, game.botElo)

    if (botMove) {
      game.board = botMove.board
      game.history.push(botMove.notation)
      game.turn = color
      reply += `\n🤖 Bot (${game.botElo}) main: ${botMove.notation}`
    }
  }

  return reply + '\n\n' + renderBoard(game.board)
}

function handleCastling(game, color, notation) {
  // ❌ raja sedang check
  if (isKingInCheck(game.board, color)) {
    return '❌ Tidak bisa rokade saat raja sedang check'
  }

  const rank = color === 'w' ? '1' : '8'
  const kingFrom = 'e' + rank

  if (!game.castling[color].king)
    return '❌ King sudah pernah bergerak'

  if (notation === 'o-o') {
    // short castle
    if (!game.castling[color].rookH)
      return '❌ Rook sudah bergerak'

    if (game.board['f' + rank] || game.board['g' + rank])
      return '❌ Jalur rokade tidak kosong'

    const passSquares = ['f' + rank, 'g' + rank]

    for (let sq of passSquares) {
      const testBoard = { ...game.board }
      testBoard[sq] = color + 'k'
      delete testBoard[kingFrom]

      if (isKingInCheck(testBoard, color)) {
        return '❌ Rokade melewati petak terancam'
      }
    }

    game.board['g' + rank] = color + 'k'
    game.board['f' + rank] = color + 'r'
    delete game.board[kingFrom]
    delete game.board['h' + rank]
  }

  if (notation === 'o-o-o') {
    // long castle
    if (!game.castling[color].rookA)
      return '❌ Rook sudah bergerak'

    if (
      game.board['b' + rank] ||
      game.board['c' + rank] ||
      game.board['d' + rank]
    )
      return '❌ Jalur rokade tidak kosong'

    game.board['c' + rank] = color + 'k'
    game.board['d' + rank] = color + 'r'
    delete game.board[kingFrom]
    delete game.board['a' + rank]
  }

  // update state
  game.castling[color] = {
    king: false,
    rookA: false,
    rookH: false
  }

  game.turn = color === 'w' ? 'b' : 'w'

  return true
}

module.exports = {
  startChessGame,
  makeMove
}
=======
const { createInitialBoard } = require('./chessBoard.js')
const { parseMove } = require('./chessMoves.js')
const { renderBoard } = require('./chessRender.js')
const { getLegalMoves } = require('./chessMoves.js')
const { isKingInCheck } = require('./chessMoves.js')
const { hasAnyLegalMove } = require('./chessMoves.js')

/* =========================
   BOT ENGINE SEDERHANA
========================= */

const PIECE_VALUE = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100
}

// evaluasi papan sederhana (material)
function evaluateBoard(board, color) {
  let score = 0
  for (let sq in board) {
    const piece = board[sq]
    const val = PIECE_VALUE[piece[1]]
    score += piece[0] === color ? val : -val
  }
  return score
}

// generate pseudo-move (SUPER SIMPLE)
function generateBotMoves(board, color) {
  const moves = []

  for (let from in board) {
    const piece = board[from]
    if (piece[0] !== color) continue

    const targets = getLegalMoves(from, board)

    for (let to of targets) {
      const newBoard = { ...board }
      newBoard[to] = piece
      delete newBoard[from]

      if (isKingInCheck(newBoard, color)) continue

      moves.push({
        from,
        to,
        board: newBoard,
        notation: piece[1] + to
      })
    }
  }

  return moves
}

// pilih move berdasarkan elo
function pickBotMove(moves, color, elo) {
  if (moves.length === 0) return null

  // elo rendah → random
  if (elo < 800) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  // elo menengah → greedy
  const scored = moves.map(m => ({
    ...m,
    score: evaluateBoard(m.board, color)
  }))

  scored.sort((a, b) => b.score - a.score)

  // elo tinggi → best
  if (elo >= 1400) return scored[0]

  // elo 800–1399 → kadang blunder
  return Math.random() < 0.7 ? scored[0] : scored[Math.floor(Math.random() * scored.length)]
}

/* =========================
   GAME LOGIC
========================= */

function startChessGame(roomId, white, black, options = {}) {
  global.chessGames[roomId] = {
    white,
    black,
    turn: 'w',
    board: createInitialBoard(),
    history: [],
    status: 'playing',
    enPassant: null,

    // BOT
    vsBot: options.vsBot || false,
    botElo: options.botElo || 0,
    botColor: options.vsBot ? 'b' : null,

    castling: {
      w: { king: true, rookA: true, rookH: true },
      b: { king: true, rookA: true, rookH: true }
    }
  }
}

function makeMove(roomId, sender, text) {
  const game = global.chessGames[roomId]
  if (!game) return '❌ Tidak ada game'

  if (game.status !== 'playing' && game.status !== 'check')
    return '❌ Game sudah selesai'

  const color = sender === game.white ? 'w' : 'b'
  if (game.turn !== color) return '⏳ Bukan giliranmu'

  const input = text.toLowerCase()

  // =====================
  // RESIGN
  // =====================
  if (input === 'resign' || input === 'nyerah') {
    game.status = 'resign'
    return `🏳️ ${color === 'w' ? 'Putih' : 'Hitam'} menyerah.\n\n${renderBoard(game.board)}`
  }

  // =====================
  // CASTLING
  // =====================
  if (input === 'o-o' || input === 'o-o-o') {
    const res = handleCastling(game, color, input)
    if (typeof res === 'string') return res

    let reply = `♟️ ${input.toUpperCase()}`

    // BOT MOVE SETELAH ROKADE
    if (game.vsBot && game.turn === game.botColor) {
      const moves = generateBotMoves(game.board, game.botColor)
      const botMove = pickBotMove(moves, game.botColor, game.botElo)

      if (botMove) {
        game.board = botMove.board
        game.history.push(botMove.notation)
        game.turn = color
        reply += `\n🤖 Bot (${game.botElo}) main: ${botMove.notation}`
      }
    }
    return reply + '\n\n' + renderBoard(game.board)
  }

  // =====================
  // PARSE MOVE
  // =====================
  let move = parseMove(input)
  if (!move) {
    move = parseSAN(input)
  }
  if (!move) return '❌ Format langkah tidak dikenali'
  if (move.mate && game.status !== 'checkmate') {
    return '❌ Bukan checkmate'
  }


  const pieceCode = color + move.piece
  let fromSquare = null

  // =====================
  // FIND LEGAL MOVE
  // =====================
  for (let sq in game.board) {
    if (game.board[sq] !== pieceCode) continue

    // pawn capture file check (dxe5)
    if (move.capture && sq[0] !== move.fromFile) continue

    const targets = getLegalMoves(sq, game.board, game.enPassant)
    if (!targets.includes(move.target)) continue

    const testBoard = { ...game.board }
    testBoard[move.target] = pieceCode
    delete testBoard[sq]

    // en passant capture simulation
    if (
      move.piece === 'p' &&
      game.enPassant &&
      move.target === game.enPassant.square
    ) {
      delete testBoard[game.enPassant.pawn]
    }

    if (isKingInCheck(testBoard, color)) continue

    fromSquare = sq
    break
  }

  if (!fromSquare) return '❌ Langkah tidak legal'

  // =====================
  // COMMIT MOVE
  // =====================
  game.board[move.target] = pieceCode
  delete game.board[fromSquare]

  // EN PASSANT CAPTURE
  if (
    move.piece === 'p' &&
    game.enPassant &&
    move.target === game.enPassant.square
  ) {
    delete game.board[game.enPassant.pawn]
  }

  // RESET EN PASSANT
  game.enPassant = null

  // SET EN PASSANT (DOUBLE MOVE)
  if (move.piece === 'p') {
    const startRank = color === 'w' ? '2' : '7'
    const passRank = color === 'w' ? '3' : '6'

    if (fromSquare[1] === startRank && Math.abs(move.target[1] - fromSquare[1]) === 2) {
      game.enPassant = {
        square: fromSquare[0] + passRank,
        pawn: move.target
      }
    }
  }

  // PROMOTION
  if (
    move.piece === 'p' &&
    ((color === 'w' && move.target[1] === '8') ||
     (color === 'b' && move.target[1] === '1'))
  ) {
    game.board[move.target] = color + (move.promotion || 'q')
  }

  // CASTLING RIGHTS
  if (move.piece === 'k') game.castling[color].king = false
  if (move.piece === 'r') {
    if (fromSquare[0] === 'a') game.castling[color].rookA = false
    if (fromSquare[0] === 'h') game.castling[color].rookH = false
  }

  game.history.push(input)
  game.turn = color === 'w' ? 'b' : 'w'

  // =====================
  // CHECK / MATE
  // =====================
  const enemy = game.turn
  const inCheck = isKingInCheck(game.board, enemy)
  const hasMove = hasAnyLegalMove(game.board, enemy)

  let reply = `♟️ ${text}`

  if (!hasMove) {
    game.status = inCheck ? 'checkmate' : 'stalemate'
    return reply + `\n\n${inCheck ? '♚ CHECKMATE!' : '🤝 STALEMATE'}\n${renderBoard(game.board)}`
  }

  if (inCheck) {
    game.status = 'check'
    reply += '\n⚠️ CHECK!'
  } else {
    game.status = 'playing'
  }

  // =====================
  // BOT MOVE
  // =====================
  if (game.vsBot && game.turn === game.botColor) {
    const moves = generateBotMoves(game.board, game.botColor)
    const botMove = pickBotMove(moves, game.botColor, game.botElo)

    if (botMove) {
      game.board = botMove.board
      game.history.push(botMove.notation)
      game.turn = color
      reply += `\n🤖 Bot (${game.botElo}) main: ${botMove.notation}`
    }
  }

  return reply + '\n\n' + renderBoard(game.board)
}

function handleCastling(game, color, notation) {
  // ❌ raja sedang check
  if (isKingInCheck(game.board, color)) {
    return '❌ Tidak bisa rokade saat raja sedang check'
  }

  const rank = color === 'w' ? '1' : '8'
  const kingFrom = 'e' + rank

  if (!game.castling[color].king)
    return '❌ King sudah pernah bergerak'

  if (notation === 'o-o') {
    // short castle
    if (!game.castling[color].rookH)
      return '❌ Rook sudah bergerak'

    if (game.board['f' + rank] || game.board['g' + rank])
      return '❌ Jalur rokade tidak kosong'

    const passSquares = ['f' + rank, 'g' + rank]

    for (let sq of passSquares) {
      const testBoard = { ...game.board }
      testBoard[sq] = color + 'k'
      delete testBoard[kingFrom]

      if (isKingInCheck(testBoard, color)) {
        return '❌ Rokade melewati petak terancam'
      }
    }

    game.board['g' + rank] = color + 'k'
    game.board['f' + rank] = color + 'r'
    delete game.board[kingFrom]
    delete game.board['h' + rank]
  }

  if (notation === 'o-o-o') {
    // long castle
    if (!game.castling[color].rookA)
      return '❌ Rook sudah bergerak'

    if (
      game.board['b' + rank] ||
      game.board['c' + rank] ||
      game.board['d' + rank]
    )
      return '❌ Jalur rokade tidak kosong'

    game.board['c' + rank] = color + 'k'
    game.board['d' + rank] = color + 'r'
    delete game.board[kingFrom]
    delete game.board['a' + rank]
  }

  // update state
  game.castling[color] = {
    king: false,
    rookA: false,
    rookH: false
  }

  game.turn = color === 'w' ? 'b' : 'w'

  return true
}

module.exports = {
  startChessGame,
  makeMove
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
