---
order: 17
slug: snake
title: "Snake (Blavor)"
kind: desktop
year: 2023
summary: "Classic Snake for Windows with a second player and a demo bot."
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
caseStudy: false
---
