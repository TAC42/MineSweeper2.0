'use strict'


const MINE = '💣'
const FLAG = '🚩'

var gGame // Object that contains all counters and state of the game

//MODEL: A Matrix containing cell objects: Each cell: 
var gBoard
var gFirstCellClicked
var gTimeInterval

//DOM: This is an object by which the board size is set (in this case: 4x4 board and how many mines to place)
var gLevel = {
    SIZE: 4,
    MINES: 2
}


//This is called when page loads
function onInit() {
    resetGameValues()
    gBoard = buildBoard()
    renderBoard(gBoard)
    gFirstCellClicked = true

}

//MODEL: Builds the board 
function buildBoard() {
    gBoard = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isExpand: false
            }
        }

    }
    const board = setMines(gBoard)

    return board
}

//Set mines randomly and then traverse the board adding neighbor numerical values to each cell
function setMines(board) {
    var count = 0
    while (count !== gLevel.MINES) {
        var i = getRandomInt(0, gLevel.SIZE)
        var j = getRandomInt(0, gLevel.SIZE)

        if (!board[i][j].isMine) {
            board[i][j].isMine = true
            count++
        }
    }

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(i, j)
        }
    }
    return board
}

/* Count mines around each cell 
and set the neighbor numerical values for each cell */
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
    return count
}

//DOM: Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = board[i][j]
            var className = ''
            var inCell = ''
            /*This part Condition to find the right classes: 
             cell of type closed/open ==> if open: adding neighboring mines*/
            if (!cell.isShown) {
                className = 'closed'
                if (gBoard[i][j].isMarked) {
                    className += ' flag'
                    inCell = FLAG
                }
            } else {
                //if it's a mine 
                if (cell.isMine) {
                    className = 'mine'
                    inCell = MINE
                } else {
                    className = 'open'
                    //now we add-on the count of neighboring mines
                    className += cell.minesAroundCount
                    if (cell.minesAroundCount) inCell = cell.minesAroundCount
                }
            }
            // rendering in DOM for all cells with all cases
            strHTML += `\t<td class="cell ${className}" data-i="${i}" data-j="${j}" oncontextmenu="onCellMarked(this, ${i}, ${j});return false;" 
            onclick="onCellClicked( ${i}, ${j})">${inCell}</td>\n`
            // maybe will need this later: data-i="${i}" data-j="${j}" 

        }
        strHTML += `</tr>\n`
    }
    //console.log(strHTML)

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}



//Called when a cell is left clicked 
function onCellClicked(i, j) {
    if (!gGame.isOn) return //if the game didn't start. automatically true at the beginning
    if (gGame.hintOn) { // uses a hint!
        getHint({ i, j })
        return
    }
    if (gBoard[i][j].isMarked) return //if cell is marked do nothing
    if (gBoard[i][j].isShown) return //if cell is shown do nothing
    stateOfSmiley(1)
    while (gFirstCellClicked && gBoard[i][j].isMine) {
        onInit()
    }
    if (gFirstCellClicked) { // if the first cell was clicked
        startTimer()
        gFirstCellClicked = false
    }

    if (gBoard[i][j].isMine) { //if you hit a mine!!!
        if (gGame.life > 1) playSoundMine()
        stateOfSmiley(3)
        resetOrRemoveLife(false)
        gGame.markedCount++
    } else {
        gGame.shownCount++
        if (gBoard[i][j].minesAroundCount === 0) {
            expandShown(i, j) //elCell and board param removed - no usage
            gGame.shownCount--
        }
    }
    gBoard[i][j].isShown = true // Update MODEL
    renderBoard(gBoard) // Update DOM
    checkGameOver()
}

//On right click toggles Mark on a closed cell
function onCellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return //if cell is shown do nothing
    //Update Model
    (gBoard[i][j].isMarked) ? gGame.markedCount-- : gGame.markedCount++
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    //Update DOM
    elCell.innerText = (gBoard[i][j].isMarked) ? FLAG : ''
    checkGameOver()
    return false
}

/*TODO: Game ends when all mines are marked, and all the other cells are shown */
function checkGameOver() {
    //Losing!
    if (gGame.life === 0) {
        playSoundFail()
        stateOfSmiley(4)
        gGame.isOn = false
        clearInterval(gTimeInterval)
        showAllMines()

        return true
    }
    //winning!
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES) {
        stateOfSmiley(5)
        clearInterval(gTimeInterval)
        gGame.isOn = false
        playSoundWinning()
        checkBestTime()
        return true
    }
    return false
}

//Traverse through the board to reveal all the mines when the game is lost
function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard)
}


/*Expand the board using neighboring cells and recursion  */
function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isMine && !gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                gGame.shownCount++

                if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isExpand) {
                    gBoard[i][j].isExpand = true
                    expandShown(i, j)
                }
            }
        }
    }
    renderBoard(gBoard)

}

// change the level of the game
function onChangeLevel(level) {
    switch (level) {
        case '0':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            onInit()
            break;
        case '1':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            onInit()
            break;
        case '2':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            onInit()
            break;
    }
}
// when clicking smiley you reset the game!
function onChangeSmiley() {
    stateOfSmiley(1)
    onInit()
}
function onUseSafeClick(elBtn) {
    if (gGame.safe === 0) return // when there are no more safe clicks: do nothing.
    const emptyPOS = getEmptyCell()
    // if there are no empty cells left:
    if (emptyPOS === null) {
        alert('No empty cells left!')
        return
    }
    gGame.safe--
    var safeClick = ''
    for (var i = 0; i < gGame.safe; i++) safeClick += '🛟'
    elBtn.innerText = safeClick

    const elEmptyCell = document.querySelector(`[data-i="${emptyPOS.i}"][data-j="${emptyPOS.j}"]`)
    elEmptyCell.innerText = '🛟'
    setTimeout(() => {
        elEmptyCell.innerText = ''
    }, 1250);

}
// make smiley transition look cooler!
function stateOfSmiley(index) {
    const smileys = ['😀', '😮', '😫', '🤯', '☠️', '👑']
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = (index === 4) ? smileys[index - 1] : smileys[index]
    setTimeout(() => {
        elBtn.innerText = (index === 4) ? smileys[4] : smileys[0]
        if (index === 5) elBtn.innerText = smileys[index]
    }, 250);
}

//reset the game when: 1. game Starts 2. You click the reset button (Smiley)
function resetGameValues() {
    gGame = {
        isOn: true,
        hintOn: false,
        life: 3,
        safe: 3,
        hint: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gFirstCellClicked = false
    stopTimer()
    resetTime()
    resetOrRemoveLife(true)
    const elBtn = document.querySelector('.safe')
    elBtn.innerText = '🛟🛟🛟'
    for (var i = 0; i < 3; i++) {
        const elBtn = document.querySelector(`.light${i + 1}`)
        elBtn.classList.remove('hide')
    }
}

//removes a life or reset life in case of reset! true = reset // false = lose 1 life
function resetOrRemoveLife(lifeSwitch) {
    const elBtn = document.querySelector('.life')
    var hearts = ''
    if (!lifeSwitch) {
        if (gGame.life === 1) {
            elBtn.innerText = '🪦'
            gGame.life--
            checkGameOver()
            return
        }
        //Modal:
        gGame.life--
    }
    //DOM:
    for (var i = 0; i < gGame.life; i++) {
        hearts += '💖'
    }
    elBtn.innerHTML = hearts

}

function onUseHint(elBtn) {
    elBtn.classList.add('highlight')
    gGame.hintOn = true
}
function getHint(cellPos) {
    gGame.hintOn = false
    const elBtn = document.querySelector(`.light${gGame.hint}`)
    elBtn.classList.remove('highlight')
    elBtn.classList.add('hide')
    gGame.hint--
    const rowIdx = cellPos.i
    const colIdx = cellPos.j

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                if (gBoard[i][j].isMine) {
                    elCell.classList.remove('closed')
                    elCell.classList.add('mine')
                    elCell.innerText = MINE
                } else {
                    elCell.classList.remove('closed')
                    elCell.classList.add(`open${gBoard[i][j].minesAroundCount}`)
                    elCell.innerText = gBoard[i][j].minesAroundCount
                }
                elCell.classList.add('highlight')
            }
        }
    }

    setTimeout(() => {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j >= gBoard[0].length) continue
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                if (elCell.classList.contains('highlight')) {
                    gBoard[i][j].isShown = false
                    elCell.classList.remove('highlight')
                }
            }
        }
        renderBoard(gBoard)
    }, 2000);

}

// Display or set new score record and write it to a file for each difficulty 
function checkBestTime() {
    const topScoreFiles = ['data/easy.csv', 'data/average.csv', 'data/expert.csv']
    var level
    var difficulty = ''
    switch (gLevel.SIZE) { // check the level of the game
        case 4:
            level = 0
            difficulty = 'NOVICE'
            break;
        case 8:
            level = 1
            difficulty = 'INTERMEDIATE'
            break;
        case 12:
            level = 2
            difficulty = 'EXPERT'
            break;
    }
    const fs = require('fs')
    fs.readFile(topScoreFiles[level], 'utf8', (err, data) => {
        if (err) {
            console.log('err:', err);
            return
        }
        const lines = data.trim().split('\n');
        const fileInfo = []
        for (var i = 0; i < lines.length; i++) {
            fileInfo[i] = []
            const tempCells = lines[i].split(',')
            for (var j = 0; j < 3; j++) {
                fileInfo[i][j] = tempCells[j]
            }
        }
        const elSec = document.querySelector('seconds')
        const elMin = document.querySelector('minutes')
        var newScoreTime = elMin.innerText + ':' + elSec.innerText
        var compTempScoreTime = (+elMin.innerText * 60) + (+elSec.innerText)


        if (fileInfo.length < 5) {
            addNewTopScore(fileInfo, newScoreTime, -1, difficulty)
        } else {
            for (var i = 0; i < fileInfo.length; i++) {
                const min = +fileInfo[i][1].slice(0, 2);
                const sec = +fileInfo[i][1].slice(3, 5);

                const time = sec + min * 60
                if (time < compTempScoreTime) {
                    addNewTopScore(fileInfo, newScoreTime, i,difficulty)
                    return
                }
            }
            addNewTopScore(fileInfo, newScoreTime, NaN, difficulty)
        }
    })
}

function addNewTopScore(fileInfo, currScoreTime, rowIdx, difficulty) {
    const newFileInfo = []
    if(rowIdx === NaN){
        renderNewTopScore(newFileInfo, difficulty)
        displayTopScores()
        return
    }
    if (rowIdx !== -1) {
        for (var i = 0; i < fileInfo.length; i++) {
            newFileInfo[i] = []
            if (rowIdx < i) {
                newFileInfo[i] = fileInfo[i]
            } else if (rowIdx == i) {
                newFileInfo[i] = [prompt(`Congratulations! You have reached a new best time Score!
                Please enter your name:`), currScoreTime, getDate()]
            } else {
                newFileInfo[i + 1] = fileInfo[i]
            }
        }
    } else {
        newFileInfo = fileInfo
        newFileInfo.push([prompt(`Congratulations! You have reached a new best time Score!
        Please enter your name:`), currScoreTime, getDate()])
    }

    renderNewTopScore(newFileInfo, difficulty)
    displayTopScores(difficulty)
    writeNewTopScore(newFileInfo, level, topScoreFiles)
}

function renderNewTopScore(fileInfo, difficulty) { 
//DOM: Render the Top score as a <table> to the page
    var strHTML = `👑 TOP BEST SCORE FOR ${difficulty}! 👑`
    for (var i = 0; i < fileInfo.length; i++) {
        strHTML += `<tr><td class="cell dis">${i+1}.</td>\n`
        for (var j = 0; j < fileInfo[0].length; j++) {
            const cell = fileInfo[i][j]
            // rendering in DOM for all cells 
            strHTML += `\t<td class="cell dis">${cell}</td>\n` 

        }
        strHTML += `</tr>\n`
    }
    strHTML += `<button onclick="displayTopScores()">OK</button>`

    const elBoard = document.querySelector('.score')
    elBoard.innerHTML = strHTML

}
function writeNewTopScore(fileInfo, level, files) {
    var fileStr = ''

    for (var i = 0; i < fileInfo.length; i++) {
        for (var j = 0; j < fileInfo[0].length; j++) {
            fileStr += fileInfo[i][j] + ','
        }
        fileStr += ',\n'
    }

    const fs = require('fs')
    fs.writeFile(files[level], fileStr, err => {
        if (err) {
            console.log('err:', err);
            return
        }
    })
}

function displayTopScores(){
    const elScoreDiv = document.querySelector('.score')
    elScoreDiv.classList.toggle('.hide')
}



