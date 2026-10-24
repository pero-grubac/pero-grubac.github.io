---
order: 8
slug: etf-oglasi
title: "ETF Oglasi"
kind: mobile
year: 2025
summary: "University announcements and class schedules, offline; my thesis."
metaDescription: "ETF Oglasi, my graduation thesis: a Flutter app for university announcements and class schedules that works offline, with notifications and home screen widgets."
description: "University announcements and class schedules with full offline support — my graduation thesis."
repeatsSummary: true
highlights:
  - "All boards cached in SQLite; search ignores case, diacritics and Latin/Cyrillic script"
  - "Weekly schedules by programme and year, teacher or room; export to calendar (.ics)"
  - "New-announcement notifications per board, plus reminders 5–30 min before class"
  - "Home screen widgets in native Kotlin · Serbian Latin/Cyrillic + English"
stack: ["Flutter", "Dart", "Kotlin", "SQLite", "Riverpod", "WorkManager", "Android"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/ETFOglasi"
  apk: "https://github.com/pero-grubac/ETFOglasi/releases/latest"
image: "../../assets/etf_oglasi/preview.webp"
imageAlt: "ETF Oglasi: categories, announcements and class schedule"
featured: false
caseStudy: true
---

## What it does

I built ETF Oglasi as my graduation thesis project. It is an Android app for the announcements and class schedules of the Faculty of Electrical Engineering in Banja Luka, and it keeps working offline.

- **Announcements.** Every announcement board, with attachment downloads, "new" badges and unseen counts per board. Search ignores case, diacritics and the difference between Latin and Cyrillic script. Expired announcements are dimmed and listed last, and a saved announcement stays after it leaves the board.
- **Schedules.** A weekly class schedule by study programme and year, by teacher or by room, with the current hour highlighted, and room schedules week by week. The class schedule can be added to a calendar as an .ics file with weekly events.
- **Notifications and widgets.** The app notifies about new announcements on every board, at an interval the user chooses, and tapping a notification opens the board. A reminder can go off 5 to 30 minutes before each class, at the exact time. Two home screen widgets show today's classes, and the current and next class.
- **The rest.** Serbian in Latin and Cyrillic script, and English; an optional weekly check for a new version on GitHub; and a local error log that can be copied into a bug report. The log stays on the phone unless the user copies or shares it.

## How it works

The code is split by feature (announcements, schedule, settings and home), with shared code in a core module. Repositories handle the SQLite database, services call the faculty's ETF API, and Riverpod providers connect both to the screens. SQLite keeps the cached announcements and schedules and the saved announcements; settings live in SharedPreferences.

Announcements load from the network first and fall back to the stored copy when the phone is offline. Schedules work the other way round: the stored copy is shown first and refreshed in the background.

One periodic WorkManager task checks every board whose interval has passed for new announcements. The saved class schedule drives the class reminders and both widgets, and all three are refreshed whenever it changes. The widgets are native Android widget providers written in Kotlin.

## Decisions and why

- **The widgets' time logic is native.** It runs in Kotlin on the Android side, so the widgets stay current without the app running.
- **One background check for all boards.** A single periodic task covers every board, so the notifications cost one battery-friendly background check.
- **A way around battery savers.** Some phones, from Xiaomi, Huawei and Samsung among others, stop apps in the background to save battery, and then notifications stop arriving. The Notifications screen has a button that turns battery optimisation off for this app.

## Testing and deployment

Besides the Flutter tests and static analysis, the widgets' native time logic has its own Kotlin unit tests, and an integration test runs on an emulator or a connected phone.

Releases are built by GitHub Actions when a version tag is pushed. The workflow checks that the tag matches the app's version, runs the analyzer and the tests, builds the APKs, checks that they are signed with the release key, and creates a draft release that is published by hand; the in-app update check only sees published releases. There is one APK per CPU type (arm64-v8a and armeabi-v7a) and no universal APK, because a universal APK would get a lower version code and Android would refuse to install it over a split one.
