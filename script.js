import { TILE_STATUSES, createBoard, markTile, revealTile, checkWin, checkLose } from "./minesweeper.js";

let BOARD_SIZE;
let NUMBER_OF_MINES;
let board;

// Music
var audio = new Audio('minesweeper_ambient_soundtrack.mp3');
audio.volume = 0.15;
audio.play();

function toggleMusicButton() {
    document.querySelectorAll('.music-button').forEach(button => {
        button.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
            }
            else {
                audio.pause();
            }
        })
    })
}

// Timer
let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

const timerDisplay = document.querySelector(".timer");

export function timer_start() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timer = setInterval(update, 10);
        isRunning = true;
    }
}

export function timer_stop() {
    if (isRunning) {
        clearInterval(timer);
        elapsedTime = Date.now() - startTime;
        isRunning = false;
    }
}

function update() {
    const currentTime =  Date.now();
    elapsedTime = currentTime - startTime;
    let seconds = Math.floor(elapsedTime / 1000);
    timerDisplay.textContent = "Time: " + `${seconds}`;
}
// SCORE CALCULATION
const scoreDisplay = document.querySelector(".score")

function scoreCalc() {
    const MINE_MULT = NUMBER_OF_MINES;
    const TIME_MULT = elapsedTime / 100;
    const SCORE = Math.round(MINE_MULT * TIME_MULT);
    scoreDisplay.textContent = "Score: " + SCORE;
}

// Minesweeper
export function difficulty(level) {
    if (level === "easy") {
        BOARD_SIZE = 10;
        NUMBER_OF_MINES = 10;
    }
    else if (level === "medium") {
        BOARD_SIZE = 12;
        NUMBER_OF_MINES = 20;
    }
    else if (level === "impossible") {
        BOARD_SIZE = 16;
        NUMBER_OF_MINES = 35;
    }
    resetBoard();
}

function setDifficulty() {
    document.querySelectorAll('.difficulty-button').forEach(button => {
        button.addEventListener('click', function() {
            const level = this.innerText.toLowerCase();
            difficulty(level);
        })
    })
}

function resetButton() {
    document.querySelectorAll('.reset-button').forEach(button => {
        button.addEventListener('click', function() {
            resetBoard();
        })
    })
}

function resetBoard() {
    timer_stop();
    elapsedTime = 0;
    scoreDisplay.textContent = "";
    const boardElement = document.querySelector(".board");
    
    const minesLeftText = document.querySelector(".subtext");
    minesLeftText.textContent = "Mines Left: " + NUMBER_OF_MINES;
    
    const newBoardElement = boardElement.cloneNode(false);
    boardElement.replaceWith(newBoardElement);

    newBoardElement.setAttribute("data-size", BOARD_SIZE);

    board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);

    board.forEach(row => {
        row.forEach(tile => {
            newBoardElement.append(tile.element);
            tile.element.addEventListener("click", () => {
                revealTile(board, tile);
                checkGameEnd();
            });
            tile.element.addEventListener("contextmenu", e => {
                e.preventDefault();
                markTile(tile);
                listMinesLeft();
            });
        });
    });
    newBoardElement.style.setProperty("--size", BOARD_SIZE);
    timer_start()
}

function listMinesLeft() {
    const minesLeftText = document.querySelector(".subtext");
    const markedTilesCount = board.reduce((count, row) => {
        return count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length;
    }, 0);
    const newMineNum = NUMBER_OF_MINES - markedTilesCount;
    minesLeftText.textContent = "Mines Left: " + newMineNum;
}


function checkGameEnd() {
    const win = checkWin(board);
    const lose = checkLose(board);
    const boardElement = document.querySelector(".board");
    const messageText = document.querySelector(".subtext");

    if (win || lose) {
        boardElement.addEventListener('click', stopProp, { capture: true });
        boardElement.addEventListener('contextmenu', stopProp, { capture: true });
    }

    if (win) {
        messageText.textContent = 'You Win!';
        timer_stop();
        scoreCalc();
    }

    if (lose) {
        messageText.textContent = 'You Lose!';
        board.forEach(row => {
            row.forEach(tile => {
                if (tile.status === TILE_STATUSES.MARKED) {
                    markTile(tile);
                }
                if (tile.mine) {
                    revealTile(board, tile);
                }
            });
        });
        timer_stop();
    }
}

function stopProp(e) {
    e.stopImmediatePropagation()
}

setDifficulty();
resetButton();
toggleMusicButton();