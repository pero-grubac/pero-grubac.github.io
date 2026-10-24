---
order: 29
slug: lora-score-table
title: "Lora Score Table"
kind: live
applicationCategory: GameApplication
year: 2026
summary: "Scorecard for Lora, a four-player card game of seven contracts."
metaDescription: "Lora Score Table, a scorecard for Lora, the four-player card game of seven contracts: round totals checked, house rules per game, final table as a PNG."
description: "Scorecard for Lora, a four-player card game played across seven contracts — lowest score wins."
highlights:
  - "All seven games, from Plus and Minus to Dame, K srca and Lora"
  - "Round totals checked (e.g. must add up to 8), with house rules per game"
  - "Winner after all 28 rounds; share the result or save the final table as a PNG"
  - "Offline PWA · vanilla JS · 27 unit + 6 Playwright e2e tests"
stack: ["JavaScript", "HTML/CSS", "PWA", "Playwright"]
links:
  live: "https://pero-grubac.github.io/lora-score-table/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/lora-score-table"
image: "../../assets/live/lora-score-table.webp"
imageAlt: "Lora Score Table: the grid of players and the seven games, with points being entered for one game"
featured: false
caseStudy: true
---

## What it does

Lora is a Balkan trick-taking game for four players. Each player picks each of the seven games once, in turn, which makes 28 rounds, and the lowest total wins. The app replaces the paper sheet: it marks whose turn it is, lets that player pick only a game they haven't played, takes everyone's points under their row, and keeps the running totals and a round history with the leader highlighted.

Every round has to add up. With 32 cards a deal has 8 tricks, and under the default rules each game hands out a fixed total, such as 8 for Minus or −8 for Plus; only the game called Lora goes unchecked. A round with the wrong total is not saved. House rules differ, so each total can be changed or its check switched off, before or during the game. After 28 rounds the app names the winner, or winners on a tie, and the result can be shared as text or saved as a PNG of the final table. The last 50 games are kept, with games played, wins and average total per player.

## Decisions and why

- **The rounds are the truth.** Totals, turns, played games and the winner are all derived from the list of rounds, so deleting a round fixes everything at once. The turn is the number of rounds mod 4, so no separate counter can get out of sync.
- **Points are entered, not computed, but checked.** Scoring varies from table to table, so the app records the points you type and only checks the round's total. That catches the usual mistakes, a missed trick or a wrong sign in Plus, without the app having to know who took which card.
- **History is a summary, not a replay**, so 50 games take a few kilobytes.
