<<<<<<< HEAD
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
=======
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
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
