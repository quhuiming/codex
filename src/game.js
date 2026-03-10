export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

function createInitialSnake() {
  return [
    { x: 7, y: 8 },
    { x: 6, y: 8 },
    { x: 5, y: 8 }
  ];
}

function randomInt(max, random = Math.random) {
  return Math.floor(random() * max);
}

function pointKey(point) {
  return `${point.x},${point.y}`;
}

export function createFood(snake, gridSize = GRID_SIZE, random = Math.random) {
  const occupied = new Set(snake.map(pointKey));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = pointKey({ x, y });
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  return freeCells[randomInt(freeCells.length, random)];
}

export function createInitialState(random = Math.random, gridSize = GRID_SIZE) {
  const snake = createInitialSnake();

  return {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    queuedDirection: INITIAL_DIRECTION,
    food: createFood(snake, gridSize, random),
    score: 0,
    status: "ready"
  };
}

export function setDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection] || state.status === "game-over") {
    return state;
  }

  const activeDirection =
    state.status === "ready" ? state.direction : state.queuedDirection;

  if (OPPOSITES[activeDirection] === nextDirection) {
    return state;
  }

  if (activeDirection === nextDirection) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection
  };
}

export function startGame(state) {
  if (state.status === "game-over") {
    return state;
  }

  return {
    ...state,
    status: "running"
  };
}

export function pauseGame(state) {
  if (state.status !== "running") {
    return state;
  }

  return {
    ...state,
    status: "paused"
  };
}

export function resetGame(random = Math.random, gridSize = GRID_SIZE) {
  return createInitialState(random, gridSize);
}

export function tick(state, random = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const move = DIRECTIONS[state.queuedDirection];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + move.x,
    y: head.y + move.y
  };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  if (hitsWall) {
    return {
      ...state,
      direction: state.queuedDirection,
      status: "game-over"
    };
  }

  const grows =
    state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;

  const bodyToCheck = grows ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y
  );

  if (hitsSelf) {
    return {
      ...state,
      direction: state.queuedDirection,
      status: "game-over"
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!grows) {
    nextSnake.pop();
  }

  const nextFood = grows
    ? createFood(nextSnake, state.gridSize, random)
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction: state.queuedDirection,
    queuedDirection: state.queuedDirection,
    food: nextFood,
    score: grows ? state.score + 1 : state.score,
    status: nextFood ? "running" : "game-over"
  };
}