---
order: 27
slug: yamb-table
title: "Yamb Table"
kind: live
year: 2026
summary: "Multiplayer scoresheet for Yamb, Yahtzee and Yatzy."
description: "Multiplayer scoresheet for Yamb, Yahtzee and Yatzy with a retro CRT look. Pass the phone around: each player fills in their own sheet while the others can peek, read-only."
highlights:
  - "Yamb's four columns with fill-order rules: down, up, free and announce"
  - "Mode-specific scoring: upper bonus, straights, full house, poker, Yamb bonus"
  - "Dice roller with up to eight ranked suggestions, filled in with one click"
  - "2–12 players · undo up to 10 moves, even after a reload"
  - "Installable offline PWA · 21 unit + 5 Playwright e2e tests"
stack: ["React", "JavaScript", "Vite", "PWA", "Playwright"]
links:
  live: "/yamb-table/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/yamb-table"
image: "../../assets/live/yamb-table.webp"
imageAlt: "Yamb Table: the dice roller with five dice and a suggested move above a player's scoresheet with the down, up, free and announce columns"
featured: false
caseStudy: true
---

## What it does

One phone goes around the table, for 2 to 12 players. A hand-over screen says whose turn it is, the player fills in their sheet by hand or from the built-in dice roller, and anyone can open the other sheets read-only.

In Yamb, the Balkan four-column game, the app enforces the column rules: down from the top, up from the bottom, free in any order, and najava, where a player announces a category before rolling and gets 0 there if they don't fill it. Before a game, two house rules can be chosen: how a straight scores and how the MAX/MIN bonus is counted. The dice roller offers up to eight ranked suggestions that fill a cell in one tap, and the straight's value follows the chosen rule and the roll number.

The game is saved after every move, and the last 10 moves can be undone, even after a reload. The app installs as a PWA and works offline.

## Decisions and why

- **The rules live in one pure module** that knows nothing about React, which is what makes the column rules, totals and suggestions testable.
- **Sheets are copied, never changed in place**, so a rejected turn leaves the sheet exactly as it was.
- **Undo stores snapshots, not inverse operations.** Each finished turn pushes the previous sheets and turn onto a 10-item history that persists with the game and can't drift out of sync.
- **The fonts are in the repository**, so the service worker precaches everything and the first offline start looks the same as online.

## Testing and deployment

21 unit tests cover scoring, house rules, column rules, turns, undo and the dice suggestions, and 5 Playwright tests run on desktop and mobile. Only a green CI run on main is deployed to GitHub Pages.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
