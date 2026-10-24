---
order: 30
slug: excuse-generator
title: "excuse.exe"
kind: live
applicationCategory: EntertainmentApplication
year: 2026
summary: "One button, one excuse, from 1,600+ in English and 1,250+ in Serbian."
metaDescription: "excuse.exe: one button, one excuse, from 1,600+ in English and 1,250+ in Serbian, with no repeats until the whole list has been used. An offline PWA."
description: "One button, one excuse — from 1,600+ in English and 1,250+ in Serbian, with no repeats until the whole list has been used."
highlights:
  - "Seven categories as filter chips, from Work and Tech to Absurd; an excuse of the day"
  - "Every excuse has its own link (#en-0042); favourites saved per language"
  - "Offline PWA: network-first pages, cached files refreshed in the background"
  - "Zero dependencies, self-hosted fonts · 27 unit + 12 Playwright e2e tests"
stack: ["JavaScript", "HTML/CSS", "PWA", "Playwright"]
links:
  live: "https://pero-grubac.github.io/excuse-generator/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/excuse-generator"
image: "../../assets/live/excuse-generator.webp"
imageAlt: "excuse.exe: a generated tech excuse with the category chips, the Generate excuse button and Copy, Share and Saved buttons"
featured: false
caseStudy: true
---

## What it does

Seven categories, from Work and Tech to Mood, Social and Absurd, sit as filter chips under the title. A new excuse comes with the button, the space bar or Enter, and nothing repeats within the current filter until every excuse in it has been shown. There is also an excuse of the day: one per local date and language, the same on every device.

Every excuse has a stable id such as en-0042, which the address bar always shows, so Share sends a link that opens exactly that excuse and switches the language if needed. The app switches between English and Serbian at any time, keeps favourites per language, and copies or shares an excuse in one tap. It has no framework, no build step and no runtime dependencies, makes no external requests, and works offline after the first visit.

## Decisions and why

- **One JSON file per language.** Excuses are data, not code: easy to edit, easy to validate, and only the active language is loaded.
- **Stable ids instead of positions**, so links and favourites survive edits, reordering and new excuses.
- **A set of used ids per filter instead of a shuffled list.** Changing the category keeps what you have already seen.
- **Pure logic in its own module.** Picking, id lookup, the daily pick and the favourites migration have no DOM access, so they are unit-tested directly.
- **Network-first pages, with cached files refreshed in the background.** Visitors get an instant offline app, and since nothing is cached on localhost, development never fights a stale cache.

## Testing

There are 27 unit tests and 12 Playwright tests on desktop and mobile. The data tests check every excuse file for ids, categories, blanks and duplicates, and check that the "N+" counts in the subtitle are true.
