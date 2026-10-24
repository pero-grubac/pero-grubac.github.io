---
order: 17
slug: snake
title: "Snake (Blavor)"
kind: desktop
year: 2023
summary: "Classic Snake for Windows with a second player and a demo bot."
metaDescription: "Snake (Blavor), classic Snake for the Windows desktop in C# and WPF, with a second player, wrap-around walls and a demo bot that avoids trapping itself."
description: "Classic Snake for the Windows desktop with a second player, wrap-around walls, rising speed and remappable keys. In demo mode a bot takes the shortest path to the mouse unless that would trap it."
highlights:
  - "Rules live in a UI-free core library; WPF only draws, keeps time and handles input"
  - "Two snakes move at once: every target cell is worked out before anyone moves"
  - "Sound effects synthesised to WAV in memory; maps from 15×15 to 25×25"
  - "136 tests, including 5 UI automation tests that drive the real game"
stack: ["C#", ".NET", "WPF", "xUnit", "UI Automation", "Game"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Snake"
image: "../../assets/snake/preview.webp"
imageAlt: "Snake: the snake on a 17×23 grid with score, best and speed"
featured: false
caseStudy: true
---

## What it does

The snake, the *blavor* of the title, moves around a grid and eats mice: each one is a point and one more cell of snake. A round ends when a snake hits a wall, its own body or the other snake, and a single player wins by filling the whole board.

- **Two players** share one keyboard, and the last snake standing wins. Two heads meeting on one cell is a draw.
- **Settings.** Maps from 15×15 to 25×25, each size with its own high score; solid or wrap-around walls; and four speeds, one of which gets faster with every mouse.
- **Remappable keys.** Binding a key that is already taken swaps the two actions, so one key never does two things.
- **Tight corners work.** A snake never turns straight back into itself, and two quick turns between ticks are both kept.
- **Demo mode.** A bot steers every snake: it takes the shortest path to the mouse unless that would trap it, keeps away from the other snake's head, and otherwise heads for open space. Pressing a direction takes over that snake.

## How it works

Snake.Core is a class library with no UI code that owns every rule and the whole flow of the game. GameSession runs the phases (menu, countdown, playing, game over), the keys, the bots and the records; GameState holds the board, the snakes, the food and the collisions. The WPF app draws whatever state the core holds, turns key presses into calls on GameSession and keeps time.

On every tick the session asks the bot for a direction for each snake it steers, then GameState moves all snakes at once: it takes each snake's next queued turn, finds each target cell, and counts a tail as free if its snake moves and does not eat. Snakes that hit a wall, a body or another head die; a snake that reaches a mouse grows and scores.

## Decisions and why

- **The window is a view.** The core owns the flow and the rules, so nearly everything is tested without starting WPF.
- **Simultaneous moves.** Working out every target cell before anyone moves makes head-on crashes and chasing the other snake's tail behave the same, whichever player comes first in the list.
- **Injected randomness.** Food placement is the only random thing in the game, and GameState takes the Random it uses, so every scenario can be replayed in a test.
- **Keys as names, not WPF types.** Bindings store names like "W" and "Up", so the rules about keys live in the core and are tested there.
- **No asset files for sound or player two.** Sound effects are synthesised into WAV data in memory, and player two's sprites are player one's with the red and blue channels swapped.
- **Files survive bad data.** Broken score lines are skipped instead of wiping the table, broken settings fall back to defaults, and both files are written through a temporary file, so a crash mid-write cannot corrupt them.

## Testing

Of the 136 tests, 118 cover the game logic in Snake.Core, from the two-turn buffer and head-on draws to broken score files and the bot playing whole seeded games. The app adds 13 unit tests and 5 UI Automation tests that start the real game and go through the menu, saving settings, a round ending in game over, a two-player draw and the controls panel.

GitHub Actions builds with warnings as errors and runs every test except the UI ones, with coverage. The UI tests need a desktop, so they run locally.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
