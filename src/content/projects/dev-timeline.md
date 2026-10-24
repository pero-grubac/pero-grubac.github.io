---
order: 15
slug: dev-timeline
title: "Dev Timeline"
kind: live
year: 2026
summary: "Turns a GitHub profile into a timeline of the languages used."
description: "Reads any public GitHub profile and turns language usage and repo topics into a skill timeline — which languages were used, and when."
highlights:
  - "Skills map: language and tooling bars plus a language-by-year heatmap"
  - "Timeline view: repos grouped by creation year, with tags and links"
  - "Default profile loads from a deploy-time snapshot, so no token ever reaches the browser"
  - "Contribution calendar for the last year · live scans cached in localStorage for an hour"
  - "React 19 + Vite, no UI or state libraries · 25 unit + 5 Playwright e2e tests"
stack: ["React", "JavaScript", "GitHub API", "Vite", "Playwright"]
links:
  live: "/dev-timeline/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/dev-timeline"
image: "../../assets/live/dev-timeline.webp"
imageAlt: "Dev Timeline: a scanned GitHub profile with totals for repositories, languages, topics, years and stars, a contribution heatmap and the start of the language list"
featured: false
caseStudy: false
---
