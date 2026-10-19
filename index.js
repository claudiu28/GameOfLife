let grid = createGrid();
let generation = 0;
let running = false;
let timer = null;

const canvas = document.getElementById("board");
const context = canvas.getContext("2d");
console.log(context);

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;
console.log(canvas.width, canvas.height);

function createGrid() {
  const new_grid = [];
  for (let i = 0; i < ROWS; i++) {
    const line = [];
    for (let j = 0; j < COLS; j++) {
      line.push(DEAD);
    }
    new_grid.push(line);
  }
  return new_grid;
}

function numberOfAliveNeighbors(grid, line, column) {
  let num = 0;
  for (const [di, dj] of NEIGHBORS) {
    const r = (line + di + ROWS) % ROWS;
    const c = (column + dj + COLS) % COLS;
    if (grid[r][c] === ALIVE) {
      num++;
    }
  }
  return num;
}

function computeGeneration(grid) {
  const next = createGrid();

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const current = grid[i][j];
      const num = numberOfAliveNeighbors(grid, i, j);

      if (current === ALIVE) {
        if (num >= 4) {
          next[i][j] = DEAD;
        } else if (num <= 1) {
          next[i][j] = DEAD;
        } else {
          next[i][j] = ALIVE;
        }
      } else {
        if (num === 3) {
          next[i][j] = ALIVE;
        } else {
          next[i][j] = DEAD;
        }
      }
    }
  }
  return next;
}

function population(grid) {
  let total = 0;
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      total += grid[i][j];
    }
  }
  return total;
}

function draw() {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#333";
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (grid[i][j] === ALIVE) {
        context.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  context.strokeStyle = "gray";
  context.lineWidth = 1;
  context.beginPath();
  for (let j = 0; j <= COLS; j++) {
    context.moveTo(j * CELL_SIZE, 0);
    context.lineTo(j * CELL_SIZE, canvas.height);
  }
  for (let i = 0; i <= ROWS; i++) {
    context.moveTo(0, i * CELL_SIZE);
    context.lineTo(canvas.width, i * CELL_SIZE);
  }
  context.stroke();

  document.getElementById("generation").textContent = generation;
  document.getElementById("population").textContent = String(population(grid));
}

function step() {
  generation = generation + 1;
  grid = computeGeneration(grid);
  draw();
}

function start() {
  if (running) return;
  running = true;
  timer = setInterval(step, SPEED);
  document.getElementById("start").textContent = "Pause";
}

function stop() {
  clearInterval(timer);
  running = false;
  document.getElementById("start").textContent = "Start";
}

function clearGrid() {
  stop();
  grid = createGrid();
  generation = 0;
  draw();
}

function randomize() {
  stop();
  grid = createGrid();
  generation = 0;
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (Math.random() > 0.5) {
        grid[i][j] = ALIVE;
      } else {
        grid[i][j] = DEAD;
      }
    }
  }
  draw();
}

function placePattern(name) {
  const cells = PATTERNS[name];
  if (!cells) return;

  stop();
  grid = createGrid();
  generation = 0;

  const startRow = ROWS / 2;
  const startCol = COLS / 2;

  for (const [r, c] of cells) {
    const i = startRow + r;
    const j = startCol + c;
    grid[i][j] = ALIVE;
  }

  draw();
}

document.getElementById("start").addEventListener("click", () => {
  if (running) {
    stop();
  } else {
    start();
  }
});

document.getElementById("step").addEventListener("click", () => {
  stop();
  step();
});

document.getElementById("clear").addEventListener("click", clearGrid);
document.getElementById("randomize").addEventListener("click", randomize);

document.getElementById("select").addEventListener("change", (e) => {
  placePattern(e.target.value);
});

canvas.addEventListener("click", (e) => {
  const c = Math.floor(e.offsetX / CELL_SIZE);
  const r = Math.floor(e.offsetY / CELL_SIZE);

  if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
    if (grid[r][c] === ALIVE) {
      grid[r][c] = DEAD;
    } else {
      grid[r][c] = ALIVE;
    }
    draw();
  }
});

draw();
