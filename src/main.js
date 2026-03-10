import {
  GRID_SIZE,
  createInitialState,
  pauseGame,
  resetGame,
  setDirection,
  startGame,
  tick
} from "./game.js";

const TICK_MS = 140;
const FLASH_MS = 220;
const STORAGE_KEY = "snake-best-score";
const BOARD_COLOR = "#f3f0e8";
const GRID_COLOR = "#d8d1c2";
const SNAKE_COLOR = "#2f5d50";
const HEAD_COLOR = "#1e4037";
const FOOD_COLOR = "#b44332";
const FLASH_COLOR = "#f0ddd7";

const board = document.querySelector("#game-board");
const scoreValue = document.querySelector("#score");
const bestScoreValue = document.querySelector("#best-score");
const gameStateValue = document.querySelector("#game-state");
const toggleButton = document.querySelector("#toggle-button");
const restartButton = document.querySelector("#restart-button");
const directionButtons = document.querySelectorAll("[data-direction]");
const overlay = document.querySelector("#game-overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayText = document.querySelector("#overlay-text");
const overlayAction = document.querySelector("#overlay-action");

const context = board.getContext("2d");
const cellSize = board.width / GRID_SIZE;

let state = createInitialState();
let bestScore = readBestScore();
let tickHandle = null;
let flashUntil = 0;

function readBestScore() {
  const saved = Number.parseInt(window.localStorage.getItem(STORAGE_KEY), 10);
  return Number.isNaN(saved) ? 0 : saved;
}

function writeBestScore(value) {
  window.localStorage.setItem(STORAGE_KEY, String(value));
}

function ensureLoop() {
  if (tickHandle !== null) {
    return;
  }

  tickHandle = window.setInterval(() => {
    const previousStatus = state.status;
    state = tick(state);
    if (previousStatus === "running" && state.status === "game-over") {
      flashBoard();
    }
    syncBestScore();
    render();
    if (state.status === "game-over") {
      stopLoop();
    }
  }, TICK_MS);
}

function stopLoop() {
  if (tickHandle === null) {
    return;
  }

  window.clearInterval(tickHandle);
  tickHandle = null;
}

function flashBoard() {
  flashUntil = performance.now() + FLASH_MS;
}

function syncBestScore() {
  if (state.score <= bestScore) {
    return;
  }

  bestScore = state.score;
  writeBestScore(bestScore);
}

function stateLabel() {
  if (state.status === "game-over") {
    return "Game over";
  }

  if (state.status === "paused") {
    return "Paused";
  }

  if (state.status === "running") {
    return "Running";
  }

  return "Ready";
}

function toggleLabel() {
  if (state.status === "running") {
    return "Pause";
  }

  if (state.status === "game-over") {
    return "Play again";
  }

  return state.score > 0 || state.status === "paused" ? "Resume" : "Start";
}

function overlayContent() {
  if (state.status === "game-over") {
    return {
      visible: true,
      title: "游戏结束",
      text: `本局得分 ${state.score}，按空格或点击按钮再来一局。`,
      action: "Play again"
    };
  }

  if (state.status === "paused") {
    return {
      visible: true,
      title: "已暂停",
      text: "按空格继续，或点击按钮恢复游戏。",
      action: "Resume"
    };
  }

  if (state.status === "ready") {
    return {
      visible: true,
      title: "准备开始",
      text: "先按方向键或点击方向按钮开始移动。",
      action: "Start"
    };
  }

  return {
    visible: false,
    title: "",
    text: "",
    action: ""
  };
}

function renderCell(position, color) {
  context.fillStyle = color;
  context.fillRect(
    position.x * cellSize + 1,
    position.y * cellSize + 1,
    cellSize - 2,
    cellSize - 2
  );
}

function renderBoard() {
  const isFlashing = performance.now() < flashUntil;
  context.fillStyle = isFlashing ? FLASH_COLOR : BOARD_COLOR;
  context.fillRect(0, 0, board.width, board.height);

  context.strokeStyle = GRID_COLOR;
  context.lineWidth = 1;

  for (let index = 0; index <= GRID_SIZE; index += 1) {
    const offset = index * cellSize;
    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset, board.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, offset);
    context.lineTo(board.width, offset);
    context.stroke();
  }

  if (state.food) {
    renderCell(state.food, FOOD_COLOR);
  }

  state.snake.forEach((segment, index) => {
    renderCell(segment, index === 0 ? HEAD_COLOR : SNAKE_COLOR);
  });
}

function render() {
  const overlayState = overlayContent();

  renderBoard();
  scoreValue.textContent = String(state.score);
  bestScoreValue.textContent = String(bestScore);
  gameStateValue.textContent = stateLabel();
  toggleButton.textContent = toggleLabel();
  overlayTitle.textContent = overlayState.title;
  overlayText.textContent = overlayState.text;
  overlayAction.textContent = overlayState.action;
  overlay.dataset.visible = overlayState.visible ? "true" : "false";
}

function resumeOrStart() {
  if (state.status === "game-over") {
    state = resetGame();
  }

  state = startGame(state);
  ensureLoop();
  render();
}

function pause() {
  state = pauseGame(state);
  stopLoop();
  flashBoard();
  render();
}

function restart() {
  state = resetGame();
  stopLoop();
  render();
}

function applyDirection(direction) {
  const previousDirection = state.queuedDirection;
  state = setDirection(state, direction);
  if (state.queuedDirection !== previousDirection) {
    board.dataset.turn = direction;
    window.clearTimeout(applyDirection.turnHandle);
    applyDirection.turnHandle = window.setTimeout(() => {
      delete board.dataset.turn;
    }, 120);
  }
  if (state.status === "ready") {
    state = startGame(state);
    ensureLoop();
  }
  render();
}

function handleKeydown(event) {
  const directionMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right"
  };

  if (event.code === "Space") {
    event.preventDefault();
    if (state.status === "running") {
      pause();
    } else {
      resumeOrStart();
    }
    return;
  }

  const direction = directionMap[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  applyDirection(direction);
}

toggleButton.addEventListener("click", () => {
  if (state.status === "running") {
    pause();
    return;
  }

  resumeOrStart();
});

restartButton.addEventListener("click", restart);
overlayAction.addEventListener("click", () => {
  if (state.status === "running") {
    pause();
    return;
  }

  resumeOrStart();
});
document.addEventListener("keydown", handleKeydown);

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyDirection(button.dataset.direction);
  });
});

render();