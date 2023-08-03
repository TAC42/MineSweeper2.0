'use strict'
var gTime = []

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}
function startTimer() {
    stopTimer()
    gTimeInterval = setInterval(timer, 1000)
}
function stopTimer() {
    clearInterval(gTimeInterval);
}
function resetTime() {
    gTime[0] = 0
    gTime[1] = 0
    gTime[2] = 0
    document.querySelector('.seconds').innerText = '00'
    document.querySelector('.minutes').innerText = '00'
}
function timer() {
    if ((gTime[2] += 1) == 60) {
        gTime[2] = 0
        gTime[1]++
    }
    if (gTime[1] == 100) {
        gTime[0] = 0
        gTime[0]++
    }



    const seconds = returnTime(gTime[2])
    const minutes = returnTime(gTime[1])
    document.querySelector('.seconds').innerText = seconds
    document.querySelector('.minutes').innerText = minutes

}
function returnTime(input) {
    return input > 9 ? input : `0${input}`
}

function getEmptyCell() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                emptyCells.push({ i, j })
            }
        }
    }
    if (emptyCells.length === 0) return null
    return emptyCells[getRandomInt(0, emptyCells.length - 1)]
}

function playSoundWinning() {
    const sound = new Audio(`sound/winning.mp3`)
    sound.play()

}
function playSoundMine() {
    const sound = new Audio(`sound/mine.wav`)
    sound.play()
}
function playSoundFail() {
    const sound = new Audio(`sound/fail.mp3`)
    sound.play()
}

// function returnTime(input) {
    //     return input > 10 ? input : `0${input}`
// }
// function getRandomColor() {
    //     var letters = '0123456789ABCDEF';
    //     var color = '#';
    //     for (var i = 0; i < 6; i++) {
        //         color += letters[Math.floor(Math.random() * 16)];
        //     }
//     return color;
// }

// function makeId(length = 6) {
//     var txt = ''
//     var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

//     for (var i = 0; i < length; i++) {
//         txt += possible.charAt(Math.floor(Math.random() * possible.length))
//     }

//     return txt
// }



