---
order: 12
slug: catan-map-generator
title: "Catan Map Generator"
kind: live
applicationCategory: GameApplication
year: 2026
summary: "Balanced Catan boards from constraint-solving backtracking."
metaDescription: "Catan Map Generator: random, balanced Catan boards from constraint-solving backtracking, with share links, a fairness overlay and PNG export."
description: "Random, balanced Catan boards generated with constraint-solving backtracking instead of blind retries."
highlights:
  - "Standard (19 tiles), Cities & Knights with a barbarian track, Extended 5–6 player (30 tiles)"
  - "Places resources, then numbers densest-first; scores up to 8 candidates in ~2.5 s"
  - "Share links carry the finished map in the URL hash (21 bytes for a standard board)"
  - "Fairness overlay with pips per spot · PNG export · 54 unit + 14 Playwright e2e tests"
stack: ["JavaScript", "HTML/CSS", "SVG", "PWA", "Playwright"]
links:
  live: "/catan-map-generator/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/catan-map-generator"
image: "../../assets/live/catan-map-generator.webp"
imageAlt: "Catan Map Generator: a generated board of resource hexes with number tokens and harbours, below the map size and placement rule options"
featured: false
caseStudy: true
---

## What it does

Catan Map Generator builds random boards in three modes: the standard 3–4 player map with 19 land tiles, the Cities & Knights board with its own harbours and the barbarian ship track, and the 5–6 player extension with 30 land tiles. Three placement rules can each be switched off: no 6 next to an 8, no 2 next to a 12, and no two tiles of one resource touching. Ports follow the official layout of each mode.

An info bar shows the generation time, the score range of the candidates and whether the map meets every rule. An optional fairness overlay puts a pip total on every intersection, and the info bar adds the strongest spot and the pips each resource gets. A map can be shared as a link, exported as a PNG or printed on one page. It runs entirely in the browser, with no backend, runtime dependencies or build step, and works offline as a PWA.

## How it works

Generation runs in three stages and repeats until a budget of about 2.5 seconds runs out:

- **Resources** are placed by backtracking: hexes in a shuffled order, resource types in random order, and a step back whenever no type fits.
- **Numbers** are placed by backtracking too, densest centre tiles first, so the most constrained slots are filled earliest. If this stalls for about 150 ms, it starts over with a fresh resource layout.
- **Scoring** keeps up to 8 valid candidates and shows the best. An adjacent 6 and 8 costs 100 points, an adjacent 2 and 12 costs 40, touching tiles of one resource cost 20, and an unbalanced probability spread costs its variance, so a perfect map scores 0.

If no fully valid map turns up in time, a best-effort map is shown with a warning. Generation runs asynchronously, so the page never freezes.

In the fairness view, an intersection's strength is the sum of the pips of the land hexes it touches, where a token's pips count how many of the 36 two-dice rolls produce its number. The map is drawn as SVG and exported to PNG through the Canvas API.

## Decisions and why

- **A shuffled visit order**, so every hex has the same chance of any resource and the desert does not always land at the end.
- **Rejection on the spot.** A resource type that breaks a rule is skipped the moment it is tried, so the whole board never has to be undone.
- **Share links store the finished map, not a seed.** Generation is time-budgeted, so the same seed would not give the same map twice. The link is a version byte, a byte for the mode and rules, and one byte per land hex, in URL-safe base64: 21 bytes for a standard board. Ports are fixed per mode, so they are not stored. A link whose tiles and tokens are not exactly the set in the box is ignored, and a fresh map is generated.

## Testing and deployment

The 54 unit tests run on Node's built-in test runner and cover the hex grid against the real hex geometry, all three placement rules over many random runs, scoring and the fallback path, and share links, both round trips and corrupt ones. The 14 Playwright tests run in Chromium at a desktop and a phone size, from all three modes and a reopened share link to the PNG download, and any console error fails a test. GitHub Actions also runs a Lighthouse CI audit, and only a green run on main is published to GitHub Pages, from exactly the commit that was tested.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
