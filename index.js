const ROWS = 40;
const COLS = 60;
const CELL_SIZE = 14;

const DEAD = 0;
const ALIVE = 1;

let grid = createEmptyGrid();
let generation = 0;
let running = false;
let timer = null;
let speed = 150;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;


const PATTERNS = {
    block: [[0, 0], [0, 1], [1, 0], [1, 1]],
    beehive: [[0, 1], [0, 2], [1, 0], [1, 3], [2, 1], [2, 2]],
    loaf: [[0, 1], [0, 2], [1, 0], [1, 3], [2, 1], [2, 3], [3, 2]],
    boat: [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1]],
    blinker: [[0, 0], [1, 0], [2, 0]],
    toad: [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]],
    beacon: [[0, 0], [0, 1], [1, 0], [2, 3], [3, 2], [3, 3]],
    glider: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    lwss: [[0, 1], [0, 4], [1, 0], [2, 0], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3]]
};


function createEmptyGrid() {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
        const line = [];
        for (let col = 0; col < COLS; col++) {
            line.push(DEAD);
        }
        newGrid.push(line);
    }
    return newGrid;
}


function countAliveNeighbors(g, row, col) {
    let count = 0;
    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            if (dRow === 0 && dCol === 0) {
                continue;
            }
            const r = (row + dRow + ROWS) % ROWS;
            const c = (col + dCol + COLS) % COLS;
            if (g[r][c] === ALIVE) {
                count++;
            }
        }
    }
    return count;
}

function computeNextGeneration(g) {
    const next = createEmptyGrid();

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const state = g[row][col];
            const neighbors = countAliveNeighbors(g, row, col);

            if (state === ALIVE) {
                if (neighbors >= 4) {
                    next[row][col] = DEAD;
                } else if (neighbors <= 1) {
                    next[row][col] = DEAD;
                } else {
                    next[row][col] = ALIVE;
                }
            } else {
                if (neighbors === 3) {
                    next[row][col] = ALIVE;
                } else {
                    next[row][col] = DEAD;
                }
            }
        }
    }
    return next;
}

function countPopulation(g) {
    let total = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            total += g[row][col];
        }
    }
    return total;
}

function draw() {

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#333";
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col] === ALIVE) {
                ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        ctx.moveTo(col * CELL_SIZE + 0.5, 0);
        ctx.lineTo(col * CELL_SIZE + 0.5, canvas.height);
        ctx.stroke();
    }
    for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * CELL_SIZE + 0.5);
        ctx.lineTo(canvas.width, row * CELL_SIZE + 0.5);
        ctx.stroke();
    }

    document.getElementById("genLabel").textContent = generation;
    document.getElementById("popLabel").textContent = String(countPopulation(grid));
}

function step() {
    grid = computeNextGeneration(grid);
    generation++;
    draw();
}

function start() {
    running = true;
    timer = setInterval(step, speed);
    document.getElementById("btnStart").textContent = "Pause";
}

function stop() {
    running = false;
    clearInterval(timer);
    document.getElementById("btnStart").textContent = "Start";
}

function clearGrid() {
    stop();
    grid = createEmptyGrid();
    generation = 0;
    draw();
}

function placePattern(name) {
    const cells = PATTERNS[name];
    if (!cells) {
        return;
    }
    stop();
    grid = createEmptyGrid();
    generation = 0;

    const startRow = Math.floor(ROWS / 2) - 2;
    const startCol = Math.floor(COLS / 2) - 2;
    for (const [r, c] of cells) {
        grid[startRow + r][startCol + c] = ALIVE;
    }
    draw();
}


document.getElementById("btnStart").addEventListener("click", function () {
    if (running) {
        stop();
    } else {
        start();
    }
});

document.getElementById("btnStep").addEventListener("click", function () {
    stop();
    step();
});

document.getElementById("btnClear").addEventListener("click", clearGrid);

document.getElementById("patternSelect").addEventListener("change", function () {
    placePattern(this.value);
});

document.getElementById("speedSlider").addEventListener("input", function () {
    speed = Number(this.value);
    document.getElementById("speedLabel").textContent = speed;
    if (running) {
        clearInterval(timer);
        timer = setInterval(step, speed);
    }
});

canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        if (grid[row][col] === ALIVE) {
            grid[row][col] = DEAD;
        } else {
            grid[row][col] = ALIVE;
        }
        draw();
    }
});

draw();
