---
order: 12
slug: catan-map-generator
title: "Catan Map Generator"
kind: live
year: 2026
summary: "Balanced Catan boards from constraint-solving backtracking."
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
caseStudy: false
---
