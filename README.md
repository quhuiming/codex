# Classic Snake

A minimal classic Snake game built with plain HTML, CSS, and JavaScript.

## Features

- Grid-based movement
- Snake growth after eating food
- Score and best-score tracking
- Pause, resume, and restart
- Game-over state for wall and self collisions
- Keyboard controls and on-screen controls

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000/`.

## Test

```bash
npm test
```

## Controls

- Arrow keys or `WASD`: move
- `Space`: pause / resume
- `Restart`: reset the game

## Manual checklist

- Start the game and confirm the snake moves on the grid
- Eat food and confirm the score increases and the snake grows
- Pause and resume with `Space`
- Restart and confirm the score resets
- Hit a wall or the snake body and confirm game-over appears