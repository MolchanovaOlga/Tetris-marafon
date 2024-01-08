const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;

const TETROMINO_NAMES = ['O', 'L', 'I', 'S', 'T', 'Z', 'J'];

const TETROMINOES = {
    'O': [
        [1, 1],
        [1, 1]
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'I': [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
    'S': [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
    ],
    'T': [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ],
    'Z': [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
    ],
    'J': [ 
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
    ],
};

let playfield;
let tetromino;
let timeOutId;
let requestId;
let score = 0;
let isPaused = false;
let isGameOver = false;
const gameOverBlock = document.querySelector('.game-restart');
const btnRestart = document.querySelector('.restart');

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function  generatePlayfield() {
    document.querySelector('.tetris').innerHTML = '';
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i += 1) {
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }

    playfield = new Array(PLAYFIELD_ROWS).fill(0)
                                        .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function getRandomFigure(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function generateTetromino() {
    const nameTetro = getRandomFigure(TETROMINO_NAMES);                                           //рандом фігури
    const matrixTetro = TETROMINOES[nameTetro];
    const columnTetro = Math.floor(PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2);     //відцентрування фігури
    const rowTetro = -2;

    tetromino = {
        name: nameTetro,
        matrix: matrixTetro,
        column: columnTetro,
        row: rowTetro
    }
}

//generatePlayfield();
//generateTetromino();

let cells;
init();

function drawPlayField () {
    for (let row = 0; row < PLAYFIELD_ROWS; row += 1) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column += 1) {
           // if (playfield[row][column] == 0) { continue }
            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row += 1) {
        for (let column = 0; column < tetrominoMatrixSize; column += 1) {
            if (isOutsideTopBoard(row)) { continue }
            if(tetromino.matrix[row][column] == 0){ continue }
            if(tetromino.row + row < 0) { continue }
            const cellIndex = convertPositionToIndex(tetromino.
                row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

drawTetromino();

//коли фігура торкається верхньої межі, гру завершено 

function isOutsideTopBoard(row) {
    return tetromino.row + row < 0;
}

function draw() {
    cells.forEach((cell) => cell.removeAttribute('class'));
    drawPlayField();
    drawTetromino();
}

document.addEventListener('keydown', onKeyDown);
btnRestart.addEventListener('click', function() {
    init();
})

function togglePauseGame() {
    isPaused = !isPaused;

    if(isPaused) {
        stopLoop();
    } else {
        startLoop();
    }
}

function onKeyDown(event) {
    if(event.key == 'p') {
        togglePauseGame();
    }

    if(isPaused) {
        return;
    }
    switch(event.key) {
        case ' ':
            dropTetrominoDown();
            break;
        case 'ArrowUp':
            rotateTetromino();
            break;
        case 'ArrowDown':
            moveTetrominoDown();
            break;
        case 'ArrowLeft':
            moveTetrominoLeft();
            break;
        case 'ArrowRight':
            moveTetrominoRight();
            break;
    }

    draw();
}

function dropTetrominoDown() {
    while(!isValid()) {
        tetromino.row++;
    }
    tetromino.row--;
}

// перевірка стикування фігури в межах поля і фігур між собою

function moveTetrominoDown() {
    tetromino.row += 1;
    if (isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
}

function moveTetrominoLeft() {
    tetromino.column -= 1;
    if (isValid()) {
        tetromino.column += 1;
    }
}

function moveTetrominoRight() {
    tetromino.column += 1;
    if (isValid()) {
        tetromino.column -= 1;
    }
}

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row += 1) {
        for (let column = 0; column < matrixSize; column += 1) {
            if (!tetromino.matrix[row][column]) { continue; }           
            if (isOutsideOfGameBoard(row, column)) { return true; }
            if (hasCollisions(row, column)) { return true;}
        }
    }
    return false;
}


function isOutsideOfGameBoard(row, column) {
    return tetromino.column + column < 0 ||
            tetromino.column + column >= PLAYFIELD_COLUMNS ||
            tetromino.row + row >= playfield.length;
}

function hasCollisions (row, column) {                                   
    return  playfield[tetromino.row + row]?.[tetromino.column + column]   // щоб матриці з 0-ми перекривалися
}

function placeTetromino () {
    const  matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row += 1) {
        for (let column = 0; column < matrixSize; column += 1) {
            if (!tetromino.matrix[row][column]) continue;

            if (isOutsideTopBoard(row)) {
              isGameOver = true;
              return;
           }

            playfield[tetromino.row + row][tetromino.column + 
                column] = tetromino.name;
        }
    }

    // вираховуємо бали
    const filledRows = findFilledRows();
    removeFillRows(filledRows);
    generateTetromino();
}

function countScore(destroyRows) {
    switch(destroyRows) {
        case 1:
            score += 10;
            break;
        case 2:
            score += 30;
            break;
        case 3:
            score += 50;
            break;
        case 4:
            score += 100;
            break;
        default:
            score += 0;
    }
    document.querySelector('.score').innerHTML = score;
}

// видаляємо заповнені ряди

function removeFillRows(filledRows) {
    //filledRows.forEach(row => {
      //  dropRowsAbove(row);
    //})
    for (let i = 0; i < filledRows.length; i += 1) {
        const row = filledRows[i]
        dropRowsAbove(row);
    }
    countScore(filledRows.length);
}

function dropRowsAbove(rowDelete) {
    for (let row = rowDelete; row > 0; row -= 1) {
        playfield[row] = playfield[row - 1];
    }

    playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
    const filledRows = [];
    for (let row = 0; row < PLAYFIELD_ROWS; row += 1) {
        let filledColumns = 0;
        for (let column = 0; column < PLAYFIELD_COLUMNS; column += 1) {
            if (playfield[row][column] !== 0) {
                filledColumns += 1;
            }
        }
        if (PLAYFIELD_COLUMNS == filledColumns) {
            filledRows.push(row);
        }
    }
    return filledRows;
}

// вільне падіння фігури

function moveDown() {
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();
    if (isGameOver) {
        gameOver();
    }
}

//функція зупинення гри

function gameOver() {
    stopLoop();
    gameOverBlock.style.display = 'flex';
}

function startLoop() {
    timeOutId = setTimeout(
        () => (requestId = requestAnimationFrame(moveDown)),
        700
    );
}

//startLoop();


function init() {
    gameOverBlock.style.display = 'none';
    isGameOver = false;
    generatePlayfield();
    generateTetromino();
    startLoop();
    cells = document.querySelectorAll('.tetris div');
    score = 0;
    countScore();
}

function stopLoop() {
    cancelAnimationFrame(requestId);
    timeOutId = clearTimeout(timeOutId);
}

// перевертання фігури

function  rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    tetromino.matrix = rotatedMatrix;
    if (isValid()){
        tetromino.matrix = oldMatrix;
    }
    draw();
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];
    for (let i = 0; i < N; i += 1) {
        rotateMatrix[i] = [];
        for (let j = 0; j < N; j += 1) {
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rotateMatrix;
}

