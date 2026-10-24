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
caseStudy: true
---

## What it does

Countdown tracks the moments you are waiting for, such as a deadline, a flight or a 25-minute focus session. Each timer counts down for a duration or to a date and time, and can repeat daily, weekly, monthly or yearly. Timers can be tagged and filtered by tag, shared as a link, downloaded as an `.ics` calendar event, and exported to a JSON backup for another device. A finished timer plays one of five alert sounds synthesized with the Web Audio API, fires confetti (skipped under reduced motion) and can send a browser notification. It is plain HTML, CSS and JavaScript with no framework, build step or backend, keeps everything in `localStorage`, and installs as a PWA that works offline.

## How it works

Every timer stores one absolute target timestamp, and the display is always the target minus now. Nothing is decremented, so a timer is still right after a refresh, a closed browser, a night offline or a laptop that slept through it. The redraw loop runs on `requestAnimationFrame` at about 4 frames per second, pauses while the tab is hidden and recomputes as soon as the tab is visible again. When a timer crosses zero, the alerts run and a recurring timer moves on to its next occurrence. The pure modules (storage, formatting, the timer model, sharing, calendar export and backup) know nothing about the DOM, and a controller wires them to the UI.

## Decisions and why

- **The target is the truth.** Storing an instant instead of a counter is what makes refreshes, sleep and time zones a non-issue.
- **Recurrence counts from the first occurrence**, never from the previous one, so a monthly timer on the 31st goes Jan 31, Feb 28, Mar 31 instead of getting stuck on the 28th.
- **No server, even for sharing.** The whole countdown fits in the URL hash, which never reaches a server and works on static hosting.
- **One gate for data.** Stored timers, share links and backup files all pass through the same normalisation, so an old or hand-edited file cannot break the app.
- **Storage can fail.** Corrupt data is cleared, invalid records are dropped, and blocked storage falls back to an in-memory session with a visible notice.
- **Notifications are best-effort.** Browsers throttle timers in background tabs, so a notification can arrive a little late; on-time delivery would need real push and a backend.

## Testing and deployment

The 57 unit tests on Node's built-in test runner cover formatting, recurrence (month-end and leap-day clamping, skipped occurrences), share links with old or broken payloads, recovery from corrupt or blocked storage, the `.ics` builder and backup merging. The 10 Playwright tests run on desktop and mobile Chromium, from creating a countdown and a daily timer rolling over to a JSON export and import round trip, all without console errors. GitHub Actions also runs a Lighthouse CI audit, and only a green run on main is published to GitHub Pages, from exactly the commit that was tested.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
