<<<<<<< HEAD
function renderBoard(board) {
  const files = ['a','b','c','d','e','f','g','h']
  let out = '```\n'

  for (let rank = 8; rank >= 1; rank--) {
    out += rank + ' '
    for (let f of files) {
      const sq = f + rank
      if (!board[sq]) {
        out += '. '
      } else {
        const piece = board[sq]
        const color = piece[0]
        const type = piece[1]

        const map = {
          p: 'p',
          r: 'r',
          n: 'n',
          b: 'b',
          q: 'q',
          k: 'k'
        }

        const char = color === 'w'
          ? map[type].toUpperCase()
          : map[type]

        out += char + ' '
      }
    }
    out += '\n'
  }

  out += '  a b c d e f g h\n```'
  return out
}

module.exports = { renderBoard }
=======
function renderBoard(board) {
  const files = ['a','b','c','d','e','f','g','h']
  let out = '```\n'

  for (let rank = 8; rank >= 1; rank--) {
    out += rank + ' '
    for (let f of files) {
      const sq = f + rank
      if (!board[sq]) {
        out += '. '
      } else {
        const piece = board[sq]
        const color = piece[0]
        const type = piece[1]

        const map = {
          p: 'p',
          r: 'r',
          n: 'n',
          b: 'b',
          q: 'q',
          k: 'k'
        }

        const char = color === 'w'
          ? map[type].toUpperCase()
          : map[type]

        out += char + ' '
      }
    }
    out += '\n'
  }

  out += '  a b c d e f g h\n```'
  return out
}

module.exports = { renderBoard }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
 