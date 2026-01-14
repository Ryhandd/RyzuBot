function squareToCoord(square) {
  return {
    file: square.charCodeAt(0) - 96,
    rank: parseInt(square[1])
  }
}

function coordToSquare(file, rank) {
  return String.fromCharCode(96 + file) + rank
}

module.exports = {
  squareToCoord,
  coordToSquare
}
