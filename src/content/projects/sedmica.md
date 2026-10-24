---
order: 28
slug: sedmica
title: "Sedmica"
kind: live
applicationCategory: GameApplication
year: 2026
summary: "Scorecard for the card game Sedmica, for 2–4 players."
metaDescription: "Sedmica, a digital scorecard for the card game Sedmica for 2–4 players: it checks every round as you enter it and keeps a history of the last 50 games."
description: "Digital scorecard for the card game Sedmica, for 2–4 players — the first player whose total reaches the limit (51 by default) loses."
highlights:
  - "Validates every round live: the points must add up to 8 or 9"
  - "Šuster rule: mark a round's loser to reset their total to 0 · undo the last round"
  - "History of the last 50 games with losses and average total per player"
  - "Offline PWA · vanilla JS · 31 unit + 8 Playwright e2e tests"
stack: ["JavaScript", "HTML/CSS", "PWA", "Playwright"]
links:
  live: "https://pero-grubac.github.io/sedmica/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/sedmica"
image: "../../assets/live/sedmica.webp"
imageAlt: "Sedmica: points for the current round for three players above the score table with four rounds and running totals"
featured: false
caseStudy: true
---

## What it does

In every round of Sedmica the players' points add up to 8 or 9, and the first player whose running total reaches the limit loses. Each player gets a card for the round's points, and a live sum turns green when the round adds up; a round that doesn't is refused. A player marked šuster is left out of that sum, scores 0 for the round, and their running total starts again from 0.

The table shows each round's points with the running total beneath them. The limit is 51 by default, or any whole number from 11 up. When a total reaches it, a banner names the loser and round entry is locked; if several players cross it in the same round, the highest total loses, and equal totals share the loss. The last round can be undone, which also reopens a finished game. Finished games go into a history of the last 50, with games, losses and average final total per player.

The interface is in Bosnian/Serbian/Croatian. The app has no build step and no dependencies, keeps the game through a reload, and installs as an offline PWA.

## Decisions and why

- **Scores are stored per round** and the totals are recomputed from them, so undo and the šuster reset can never drift out of sync.
- **The rules are pure functions**, so the end of the game is decided from the stored rounds and tested without a browser. That is also why undo can reopen a finished game.
- **History entries carry the game's id**, so a finished game is never stored twice, and undoing an ending takes it out of the history.
