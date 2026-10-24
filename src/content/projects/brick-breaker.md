---
order: 16
slug: brick-breaker
title: "Brick Breaker"
kind: live
applicationCategory: GameApplication
year: 2026
summary: "Retro arcade game with 100 levels, 30 power-ups and a level editor."
metaDescription: "Brick Breaker, a retro arcade game in Godot: 100 levels, 30 power-ups and a level editor, with hand-rolled ball physics. Builds for web, Windows and Android."
description: "Retro arcade game in the style of DX-Ball 2 and Arkanoid, with 100 levels, 30 power-ups and a built-in level editor. A bot has played every built-in level to the end to prove it can be cleared."
highlights:
  - "Hand-rolled ball physics with substeps, so the ball never tunnels through bricks"
  - "11 kinds of bricks; levels are plain JSON and level sets can be shared"
  - "Everything drawn in code; most music and sound effects generated · English / Serbian"
  - "190 GUT tests in 18 scripts · builds for the web, Windows and Android"
stack: ["Godot", "GDScript", "GUT", "WebAssembly", "Android", "Game"]
links:
  live: "/brick-breaker/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/brick-breaker"
image: "../../assets/live/brick-breaker.webp"
imageAlt: "Brick Breaker: a level in progress with rows of coloured bricks, several balls in flight, the paddle at the bottom and the score at the top"
featured: false
caseStudy: true
---

## What it does

I built Brick Breaker as a learning project for Godot 4: an arcade game in the style of DX-Ball 2 and Arkanoid, with pixel fonts, a CRT filter, chiptune music and plenty of screen shake. You steer the paddle, launch the ball and break bricks; where the ball meets the paddle sets the bounce angle, up to about 65°. Keyboard, mouse, gamepad and touch all work.

- **100 built-in levels.** Shapes such as a heart, a space invader, Pac-Man and the number 100, and patterns that mix every brick type. Every level you clear becomes a place to start from.
- **11 kinds of bricks.** Normal bricks in six colours, 2- and 3-hit bricks that crack, indestructible steel, TNT whose explosions chain, bonus bricks that always drop a good power-up, ghost bricks that stay invisible until the first hit, and moving, regenerating, portal and spawner bricks.
- **30 power-ups, 20 good and 10 bad.** Multiball, laser, missiles, a shield, a magnet and a twin paddle help; darkness, reverse controls, a drunk ball and an ice paddle get in the way. Bad ones always have a lower total drop weight than good ones.
- **Combo scoring.** The multiplier grows every 3 bricks broken before the ball returns to the paddle, up to ×5, and every 50,000 points earns an extra life.
- **A level editor** with pencil, eraser, rectangle, row copy and mirror tools, undo and redo, and a one-click Test mode. Levels are grouped into sets that can be exported and imported as a .zip or as single JSON levels.

Everything on screen is drawn in code: bricks, capsules, icons, the starfield and the arena frame are canvas primitives, and a script generates the UI theme. Music and most sound effects are generated too, next to Kenney CC0 sounds. The interface is in English and Serbian.

## How it works

The ball physics are hand-rolled on Godot's CharacterBody2D and move_and_collide(). A minimum vertical angle is enforced, and at high speed the ball moves in substeps, so it never tunnels through bricks.

Content is data. Brick types are BrickType resources, each power-up is a PowerUpDef resource plus one PowerUpEffect script, and levels are JSON, with each grid row as a string and a legend that maps characters to brick types, so a level is easy to write by hand as well as in the editor. Broken JSON or an unknown brick ID never crashes the game: the level is skipped, with a message that says why. Every power-up has a stack rule: refresh the timer, stack another copy, replace others in its group (long and short paddle cancel each other), or apply at once.

Six autoloads hold the global parts, among them an EventBus of signals such as brick_destroyed and ball_lost. Only LevelLoader reads and writes level files, for the game and the editor alike, and only SaveManager writes progress.

## Decisions and why

- **Data-driven content.** A new brick type, power-up or level is a data file plus at most one small script, so adding content never touches existing systems.
- **Systems talk through signals.** A brick only announces that it was destroyed, and scoring, drops, audio and effects each react on their own. That way the juice (particles, screen shake, hit stop, flashes) can be removed without touching gameplay.
- **Power-ups go through a GameContext.** Effects never reach into the game scene directly, so tests can hand them a fake context.
- **The Compatibility renderer.** It is what makes the web and low-end phone builds possible.
- **A single-threaded web build.** It runs on any static host, itch.io included, without special headers.

## Testing and deployment

190 GUT tests in 18 scripts cover the pure logic: bounce angles, level parsing and validation, set import and export, every built-in level loading, combos and extra lives, power-up stack rules and drop selection, effects against a fake game, TNT chain reactions and the other special bricks, and broken save files.

Gameplay is also checked with headless simulations at a fixed 60 frames per second, so minutes of game time pass in seconds. One of them plays every built-in level with endless lives until the last brick breaks, and a level that is not cleared within 8 minutes of game time fails the check.

GitHub Actions publishes the browser version to GitHub Pages on every push to main. A GitHub release carries all three builds: a .zip with a single portable .exe for Windows, the web build as a .zip, and a signed APK for Android 7.0 and newer, installed directly rather than from a store. There are no iOS or macOS builds, because both need a Mac to build and sign.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
