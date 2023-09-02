const prompt = require('prompt-sync')({ sigint: true });

const HAT = '^'; // hat
const HOLE = 'O'; // hole
const SAFE = '░'; // field
const PLAYER_PATH = '*'; // player path

class Field {
  constructor(field) {
    this._field = field
    this._playerPos = this._getPos(PLAYER_PATH)
  }

  static generateField (rowCount, colCount, holePercentage = 10) {
    const field = []

    const totalGrid = rowCount * colCount
    let holeCount = Math.floor(totalGrid  * holePercentage / 100)
    let playerCount = 1
    let hatCount = 1

    for (let i = 0; i < rowCount; i++) {
      const row = []

      for (let j = 0; j < colCount; j++) {
        const gridLeft = totalGrid - (i * colCount + j)
        const randomNum = Math.random()

        // theoretically this kinda situation can happen:
        // ░░░░░░░░░░
        // ░░░░░░░░░░
        // ░░░░░░░░░░
        // ░░░░░░░░░░
        // ░░░░░░░░░░
        // ░░░░░░░░OO
        // OOOOOOOO^*
        if (randomNum <= playerCount / gridLeft) {
          row.push(PLAYER_PATH)
          playerCount--
        } else if (randomNum <= (hatCount + playerCount) / gridLeft) {
          row.push(HAT)
          hatCount--
        } else if (randomNum <= (hatCount + playerCount + holeCount) / gridLeft) {
          row.push(HOLE)
          holeCount--
        } else {
          row.push(SAFE)
        }
      }

      field.push(row)
    }

    return field
  }

  _getPos (token) {
    for (let i = 0; i < this._field.length; i++) {
      for (let j = 0; j < this._field[i].length; j++) {
        if (this._field[i][j] === token) {
          return [i, j]
        }
      }
    }

    throw new Error('token position not found!')
  }

  _getInput () {
    const validInputs = ['w', 'a', 's', 'd']
    const input = prompt('Which way?').toLowerCase()
    
    if (validInputs.includes(input)) {
      return input
    } else {
      console.log('only accept w, a, s, d')
      return this._getInput()
    }
  }

  _print () {
    this._field.forEach((row) => {
      const str = row.join('')
      console.log(str)
    })
  }

  _calculatePlayerPos (input) {
    let [row, col] = this._playerPos

    switch (input) {
      case 'w': row -= 1
        break;
      case 'a': col -= 1
        break;
      case 's': row += 1
        break;
      case 'd': col += 1
        break;
    }

    return [row, col]
  }

  _updateField () {
    const [row, col] = this._playerPos;
    this._field[row][col] = PLAYER_PATH
  }

  _isPosOutBound (pos) {
    const [row, col] = pos

    return (
      row < 0 || row >= this._field.length || col < 0 || col >= this._field[row].length
    )
  }

  _isPosLosing (pos) {
    const [row, col] = pos

    return this._field[row][col] === HOLE
  }

  _isPosWinning (pos) {
    const [row, col] = pos

    return this._field[row][col] === HAT
  }

  _loop () {
    this._print()
    const input = this._getInput()
    const nextPlayerPos = this._calculatePlayerPos(input)

    if (this._isPosOutBound(nextPlayerPos)) {
      console.log('Out of bounds instruction!')
    } else if (this._isPosLosing(nextPlayerPos)) {
      console.log('Sorry, you fell down a hole.')
    } else if (this._isPosWinning(nextPlayerPos)) {
      console.log('Congrats, you found your hat!')
    } else {
      this._playerPos = nextPlayerPos
      this._updateField()
      this._loop()
    }
  }

  start () {
    this._loop()
  }
}

const field = new Field(Field.generateField(8, 16))
field.start()
