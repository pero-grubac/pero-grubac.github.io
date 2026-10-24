---
order: 18
slug: arcane-keep
title: "Arcane Keep"
kind: live
year: 2026
summary: "Endless tower defense on procedurally generated maps."
description: "Endless tower defense on procedurally generated maps, with waves that scale until they are genuinely dangerous. The whole simulation runs in tile space on a fixed 1/60 s timestep — no DOM, no React, no pixels — so combat is deterministic and seedable."
highlights:
  - "5 towers, 15 evolutions — including an Obelisk support tower that buffs everything in range"
  - "9 enemy types; Dread Lord bosses every 5th wave, Void Overlords from wave 20"
  - "Daily challenge: same map and waves for everyone, seeded from the date"
  - "All audio synthesised with Web Audio · 8 Vitest suites, 106 assertions · plays offline"
stack: ["React", "JavaScript", "Canvas", "Web Audio", "Vite", "Vitest", "PWA"]
links:
  live: "/arcane-keep/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/arcane-keep"
image: "../../assets/live/arcane-keep.webp"
imageAlt: "Arcane Keep: the battleground picker with the daily challenge and three maps, Forest Crossing, Ruins of Aldrath and Thorngate, each with a map preview"
featured: false
caseStudy: true
---

## What it does

A run starts with 220 gold and 20 lives. You place towers on free tiles, send the next wave, and spend what the kills pay between waves. Every enemy that reaches the keep costs lives, and at zero the run ends with a report of what carried it, from damage by tower to the costliest wave.

- **Five towers, fifteen evolutions.** After 4 upgrades a tower can evolve for 120 gold into a damage, speed or range branch, and it keeps its upgrades. Each branch changes how it works: Deadeye crits ignore all armour, Blizzard trades projectiles for a permanent damaging aura, Mortar lobs shells that can stun.
- **A support tower.** The Obelisk never fires and buffs every non-support tower in its radius instead; its branches make them hit harder, fire faster or reach further.
- **Nine enemy types**, among them Brood Mothers that burst into three Imps. A Dread Lord comes every 5th wave and shields its escort; from wave 20, a Void Overlord comes every 10th wave, heals itself and silences your nearest tower.
- **Abilities and terrain.** Meteor, Deep Freeze and Rally are on a cooldown. Water blocks building, high ground extends range, and rubble costs gold to clear.

You can play two handcrafted maps, a random map (reroll it, or type a seed to replay one), or the daily challenge: the same map and waves for everyone, seeded from the date. Progress saves between waves, so a closed tab continues from the start of the wave it was on. There are screen-reader announcements, a reduced-motion mode and optional status shapes, so chill, freeze and burn never rely on colour alone.

## How it works

The simulation runs in tiles and seconds on a fixed timestep, with no DOM, no React and no pixels anywhere near it. That lets one codebase drive a 60 fps canvas, a headless balance bot and the test suite. There is no backend.

- **Maps.** The generator walks a half-resolution lattice: path nodes sit only on even coordinates, joined through the odd tile between them. That keeps parallel corridors one empty tile apart, so a path never touches itself and there is always buildable ground beside it. The walk is a randomised depth-first search with backtracking, so it always reaches the exit. About 27% of maps get a second lane that merges before the keep. Water never takes a tile beside the road, because those are the tiles the player needs most.
- **Waves.** Each wave is built from a budget that grows with the wave number, spent on the enemy types unlocked so far. A wave holds at most 52 enemies so the screen stays readable, and budget that does not fit becomes extra strength per enemy. Health scales quadratically while the speed ramp is capped, so tower slots limit your damage while enemy health keeps climbing.
- **Drawing and sound.** There are no sprites or image files: towers are drawn from five base silhouettes, plus glow and aura rings for evolutions. All sound is synthesised with Web Audio.

## Decisions and why

- **Fixed 1/60 s steps.** The engine feeds each frame's time into an accumulator and integrates in exact steps, so 30, 60 and 144 fps produce the same simulation. A test checks it.
- **Only the renderer knows about pixels.** It is the one module that multiplies by the cell size, so positions survive a window resize.
- **Everything from the seed.** A wave is a pure function of the seed and its number, so the Intel tab previews exactly what will spawn. Combat rolls come from a seeded RNG, so a seed reproduces a whole run, and a saved run picks the RNG up where it stopped.
- **React stays out of the loop.** React only gets a small snapshot of the simulation, pushed when a cheap fingerprint changes, so the UI never re-renders per frame and the canvas never waits on React.
- **Obelisks do not buff each other**, so stacking them cannot spiral.
- **Shapes instead of art.** They scale to any cell size and cost nothing to extend: a sixteenth evolution needs no new art.

## Testing and deployment

Eight Vitest suites with 106 assertions are built around the properties that broke during development rather than line coverage: a deterministic RNG, paths that never touch themselves, a hard entity cap, frame-rate independence, and a run saved between waves and restored through JSON playing on bit-for-bit identically. A balance bot plays real waves end to end to catch stalls, leaks and unbounded entity growth.

On every push, a GitHub Actions workflow lints, tests and builds the game and publishes it to GitHub Pages, and a failing lint or test stops the deploy. A web manifest and a service worker make it installable, and after one visit it runs with no connection.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
