'use strict'


const MINE = '💣'
/* This is an object in which you can keep and update the
 current game state: isOn: Boolean, when true we let the user
  play shownCount: How many cells are shown markedCount:
 How many cells are marked (with a flag)
secsPassed: How many seconds passed */
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

//MODEL: A Matrix containing cell objects: Each cell: 
var gBoard = []
// minesAroundCount: 4,
// isShown: false,
// isMine: false,
// isMarked: true


//DOM: This is an object by which the board size is set (in this case: 4x4 board and how many mines to place)
var gLevel = {
    SIZE: 4,
    MINES: 2
}


//TODO: This is called when page loads
function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)

}

/*TODO: Builds the board Set the mines Call
 setMinesNegsCount() Return the created board*/
function buildBoard() {

    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }

    }
    const board = setMines(gBoard)

    return board
}

function setMines(board) {
    var count = 0
    while (count !== gGame.MINES){
        var i = getRandomIntInclusive(0,gGame.SIZE-1)
        var j = getRandomIntInclusive(0,gGame.SIZE-1)
        if (!board[i][j].isMine){
            board[i][j].isMine = true
            count++
        }
    }

    // board[0][3].isMine = true
    // board[2][2].isMine = true
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
                board[i][j].minesAroundCount = setMinesNegsCount(i, j)
        }
    }
    return board
}

/*TODO: Count mines around each cell 
and set the cell's minesAroundCount. */
function setMinesNegsCount(rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            if (currCell.isMine) count++
        }
    }
    console.log('count:', count);
    return count
}

//TODO: Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>\n` //class="game-row"
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = board[i][j]
            var className = ''
            var inCell = ''
            // For classes: cell of type closed/open ==> if open: conditions to neg  
            if (!cell.isShown) {
                className = 'closed'
            } else {
                //cell.isShown = true

                //if it's a mine 
                if (cell.isMine) {
                    className = 'mine'
                    inCell = MINE
                    console.log('IN CELL MINE')
                } else {
                    className = 'open'
                    //now we addon the count of neighboring mines
                    switch (cell.minesAroundCount) {
                        case 0:
                            className += '0'
                            break;
                        case 1:
                            className += '1'
                            inCell = 1
                            break;
                        case 2:
                            className += '2'
                            inCell = 2
                            break;
                        case 3:
                            className += '3'
                            inCell = 3
                            break;
                        case 4:
                            className += '4'
                            inCell = 4
                            break;
                       
                    }

                }
            }
            console.log('inCell:', inCell);
            // rendering in DOM for all cells with all cases
            strHTML += `\t<td class="cell ${className}" onclick="onCellClicked(this, ${i}, ${j})">${inCell}</td>\n`
            // maybe will need this later: data-i="${i}" data-j="${j}" 

        }
        strHTML += `</tr>\n`
    }
    //console.log(strHTML)

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}



//TODO: Called when a cell is clicked onCellMarked(elCell)
function onCellClicked(elCell, i, j) {
    if (gBoard[i][j].isMine) {
        gGame.isOn = false
        elCell.classList.add('over')
        checkGameOver(gGame.isOn)
    }
    if (gBoard[i][j].isMarked) return

    if (!gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true
        expandShown(gBoard, elCell, i, j)
    }


}

//TODO: Called when a cell is right- clicked
//see how you can hide the context menu on right click
function onCellMarked(elCell) {

}

/*TODO: Game ends when all mines are marked, and all the other cells are shown */
function checkGameOver() {

}


/*TODO: When user clicks a cell with no mines around, we need to open not only that cell, 
but also its neighbors. NOTE: start with a basic implementation that only opens
 the non-mine 1st degree neighbors BONUS: if you have the time later, try to work 
 more like the real algorithm (see description at the Bonuses section below) */
function expandShown(board, elCell, rowIdx, colIdx) {
   
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
                if(!gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
   renderBoard(gBoard)

}