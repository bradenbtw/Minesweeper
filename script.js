import { TILE_STATUSES, createBoard, markTile, revealTile, checkWin, checkLose } from "./minesweeper.js";

let BOARD_SIZE;
let NUMBER_OF_MINES;
let board;

export function difficulty(level) {
    if (level === "easy") {
        BOARD_SIZE = 5;
        NUMBER_OF_MINES = 3;
    }
    else if (level === "medium") {
        BOARD_SIZE = 8;
        NUMBER_OF_MINES = 10;
    }
    else if (level === "hard") {
        BOARD_SIZE = 12;
        NUMBER_OF_MINES = 20;
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
    }
}

function stopProp(e) {
    e.stopImmediatePropagation()
}

setDifficulty();
resetButton();