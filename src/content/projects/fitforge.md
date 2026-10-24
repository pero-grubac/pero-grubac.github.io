---
order: 6
slug: fitforge
title: "FitForge"
kind: mobile
year: 2026
summary: "Plan weekly workouts, log sets and watch strength grow over time."
metaDescription: "FitForge, a Flutter workout tracker for Android: weekly plans from 230+ exercises, automatic progression, a rest timer and charts of your estimated 1RM."
description: "Plan weekly workouts, log sets as you train, and watch strength grow over time."
repeatsSummary: true
highlights:
  - "Plans per weekday from 230+ exercises, each with its own sets, reps and weight targets"
  - "Automatic progression after N good sets in a row (default 8); reps or seconds for bodyweight"
  - "Rest timer on the lock screen; charts with estimated 1RM (Epley) and personal records"
  - "JSON backup · Riverpod + GoRouter, SQLite · English, Serbian Latin and Cyrillic"
stack: ["Flutter", "Dart", "SQLite", "Riverpod", "GoRouter", "Android"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/fit_forge"
  apk: "https://github.com/pero-grubac/fit_forge/releases/latest"
image: "../../assets/fitforge/preview.webp"
imageAlt: "FitForge: home, a workout with progression and the rest timer, and progress charts with estimated 1RM"
featured: false
caseStudy: true
---

## What it does

FitForge is a fitness tracker for Android, built with Flutter. A workout plan belongs to a day of the week and holds exercises from a library of more than 230, or ones you create yourself, across nine muscle groups. An exercise is weighted, bodyweight (counted in reps) or timed (counted in seconds), and it can have a description, a YouTube tutorial link and its own picture.

- **Planning.** Every plan has its own targets for an exercise: sets, reps and starting weight. The same exercise can be a heavy 5×5 on Monday and a lighter 3×10 on Thursday, and both plans share one workout history. Plans can be renamed or moved to another day at any time.
- **Logging.** Sets are logged with the actual weight and reps and ticked off with one tap; the fields fill in from today's session, the progression suggestion or the last session of that plan. A rest timer starts after each completed set, and its countdown notification and "rest is over" alert keep working while the phone is locked. Each session shows its total volume and can have a note, and the last note comes back as a reminder.
- **Progress.** Charts show the heaviest weight of each session with the estimated one-rep max (Epley formula), and the volume of the last seven sessions, next to stat cards and a personal record. An exercise's history is combined across all plans and can be filtered by period.
- **Backup.** All plans, exercises and history export to one JSON file and import again on a new phone or after a reinstall. Images are not included.

The Home screen shows a new motivational quote on every visit, and your own quotes take priority over the built-in ones. The app is in English and in Serbian, in Latin and Cyrillic script.

## How it works

Automatic progression counts good sets in a row at the same weight. After N of them (8 by default), the next set goes up by the exercise's increment, then one more set moves up each workout until all sets are at the new weight, and the count starts again. A set with fewer reps than planned, or at a different weight, resets the count, and a missed set at the new weight repeats that week until it is clean. The increment and the number of sets before an increase are set per exercise. Bodyweight exercises go up in reps and timed ones in seconds. The rule runs live while logging: ticking a set updates the remaining sets and a banner such as "6/8 sets at 10 kg — then 12.5 kg". It can be turned off for the whole app or for one exercise.

The code is organised by feature (onboarding, plans, workout log, progress and settings), in layers. Data flows from the screen through a Riverpod provider and a repository to a DAO and SQLite. The DAOs and repositories are created in one place and injected, so tests can swap them. GoRouter handles navigation and fl_chart draws the charts.

SQLite holds seven tables. Exercises live in one global catalogue with unique names, and each plan places them with its own order and target sets. When a user upgrades from version 1.2.x, the database migrates on first launch: exercises with the same name in different plans are merged into one, and every plan keeps its own targets and all of its history.

## Testing and deployment

The tests cover the progression rule, the 1RM formula, backup, the database migration, the demo data, quote rotation and the rest timer. The app is published as an APK on GitHub Releases, so it installs without a Google Play account.
