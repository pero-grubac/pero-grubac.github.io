---
order: 14
slug: countdown
title: "Countdown"
kind: live
year: 2026
summary: "Timers to a duration or a date that survive refreshes and sleep."
description: "As many timers as you like, to a duration or a date. Remaining time is never stored or decremented: each timer keeps an absolute target and the display is always target − now, so it survives refreshes, sleep and offline periods."
highlights:
  - "Repaint loop pauses in hidden tabs and recalculates the moment you return"
  - "Share links carry the timer in the URL hash — the same moment in every timezone"
  - "Recurring timers with month-end clamping: Jan 31 → Feb 28 → Mar 31"
  - "Tags, .ics calendar export with RRULE, JSON backup · 5 synthesised alert sounds"
  - "Installable PWA · zero dependencies · 57 unit + 10 Playwright e2e tests"
stack: ["JavaScript", "Web Audio", "Canvas", "PWA", "Playwright"]
links:
  live: "/countdown/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/countdown"
image: "../../assets/live/countdown.webp"
imageAlt: "Countdown: five timers with the time left, tags, end dates and Share, Calendar, Edit and Delete buttons"
featured: false
caseStudy: false
---
