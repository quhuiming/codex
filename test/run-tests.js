import assert from "node:assert/strict";

import {
  createFood,
  createInitialState,
  setDirection,
  startGame,
  tick
} from "../src/game.js";

const tests = [
  {
    name: "snake moves one cell forward on tick",
    run() {
      let state = createInitialState(() => 0);
      state = startGame(state);

      const nextState = tick(state, () => 0);

      assert.deepEqual(nextState.snake[0], { x: 8, y: 8 });
      assert.equal(nextState.score, 0);
      assert.equal(nextState.status, "running");
    }
  },
  {
    name: "snake grows and increments score after eating food",
    run() {
      const state = {
        ...createInitialState(() => 0),
        status: "running",
        food: { x: 8, y: 8 }
      };

      const nextState = tick(state, () => 0);

      assert.equal(nextState.snake.length, state.snake.length + 1);
      assert.equal(nextState.score, 1);
      assert.notDeepEqual(nextState.food, { x: 8, y: 8 });
    }
  },
  {
    name: "snake cannot reverse direction directly",
    run() {
      const state = createInitialState(() => 0);
      const nextState = setDirection(state, "left");

      assert.equal(nextState.queuedDirection, "right");
    }
  },
  {
    name: "wall collisions end the game",
    run() {
      const state = {
        ...createInitialState(() => 0, 4),
        snake: [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
        direction: "right",
        queuedDirection: "right",
        status: "running",
        food: { x: 0, y: 0 }
      };

      const nextState = tick(state, () => 0);

      assert.equal(nextState.status, "game-over");
    }
  },
  {
    name: "food spawns only on free cells",
    run() {
      const snake = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ];

      const food = createFood(snake, 2, () => 0);

      assert.deepEqual(food, { x: 1, y: 1 });
    }
  }
];

let failures = 0;

for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error.stack);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`Passed ${tests.length} of ${tests.length} tests.`);
}