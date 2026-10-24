---
order: 11
slug: devkit
title: "DevKit"
kind: live
applicationCategory: DeveloperApplication
year: 2026
summary: "30 developer tools in one tab; everything runs in the browser."
metaDescription: "DevKit: 30 developer tools in one browser tab, from a JSON formatter and JWT signing to regex, diff and cron. An installable offline PWA built with React."
description: "30 developer tools in 7 groups, in one tab. No backend, no tracking, no ads — everything runs in the browser and responds as you type."
highlights:
  - "Data: JSON, YAML, Base64, JWT decode & sign, hashes, Protobuf generator"
  - "Text & generators: regex, diff, SQL formatter, UUID v4/v7, passwords, TOTP, QR codes"
  - "Web & project: HTTP client, URL builder, IP/CIDR calculator, cron parser"
  - "Ctrl+K palette with fuzzy search over tools and saved snippets; a #/tool link per tool"
  - "Installable offline PWA, one lazy chunk per tool · 19 unit + 7 Playwright e2e tests"
stack: ["React", "JavaScript", "Vite", "PWA", "Playwright"]
links:
  live: "https://pero-grubac.github.io/devkit/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/devkit"
image: "../../assets/live/devkit.webp"
imageAlt: "DevKit: the JSON formatter with raw input and formatted output side by side, and the tool groups in the sidebar"
featured: false
caseStudy: true
---

## What it does

DevKit collects the small utilities developers keep searching for into one single-page React app, in seven groups: Data, Text, Generators, Converters, Web & Network, Design and Project. Among them are a JSON formatter, JWT decoding and HS256/384/512 signing, MD5 and SHA hashes, a generator that turns classes and ORM models into `.proto` definitions, a live regex tester, a line and character diff, a SQL formatter, UUID v4 and v7, TOTP codes, QR codes, an HTTP request builder that also writes the `curl`, `fetch` and `axios` code, a subnet calculator and a cron tool that lists the next runs.

Every tool reacts as you type and restores its last input after a reload. Ctrl+K opens a command palette that fuzzy-searches tools and saved snippets (`sha` finds Hash, `cidr` finds IP / CIDR). Any output can be saved to a snippet library, and opening a snippet switches to the tool that made it. Each tool has its own link, such as `#/jwt`, and the app installs as a PWA that works offline.

## How it works

One registry lists every tool, and the sidebar, the top bar and the palette are built from it. Choosing a tool sets the URL hash and adds a history entry; the app reads the tool id back from the hash, so the browser's back and forward buttons move between tools. Each tool is a self-contained folder and its own `React.lazy` chunk, and its algorithms (MD5, IEEE 754, chmod, the proto parser) are plain JavaScript with no React in them. Inputs and snippets are kept in `localStorage`. A service worker precaches the app, so it opens offline after the first visit and updates itself when a new version is deployed.

## Decisions and why

- **One chunk per tool.** The entry bundle carries only React and the shell: 69.5 kB gzipped, down from 121.9 kB for the single bundle before. The other tools are preloaded when the browser is idle, and a loaded tool renders without a Suspense round-trip, so switching tools never flashes a loading state.
- **Heavy libraries load late.** js-yaml and marked come from a CDN only when their tool is opened, which keeps the first load small.
- **Hash routes instead of a router.** The URL is the single source of truth, and links work on GitHub Pages without server rewrites.
- **Logic apart from the UI.** The algorithms, the fuzzy ranking, the route parsing and the input storage are plain modules, which is what makes them testable in Node.

## Security

- **Secrets are never stored.** JWT secrets and pasted tokens, the TOTP secret, generated passwords and HTTP request headers stay in memory only.
- **Crypto stays local.** SHA hashing, JWT signing and TOTP use the browser's Web Crypto API, and MD5 is plain JavaScript; none of it is sent anywhere.
- **Safe output.** Highlighted JSON is HTML-escaped, and generated `curl` commands quote embedded single quotes correctly.

## Testing and deployment

There are 19 unit tests on Node's built-in test runner. Among other things they check MD5 against the RFC 1321 vectors, a JWT against the jwt.io example, `curl` quoting, Python to proto3 generation, the fuzzy ranking and the size-capped input storage. The 7 Playwright tests each run on a desktop and a Pixel 7 viewport and fail on any console error; they cover the palette, deep links with back and forward, inputs surviving a reload, and the app working offline. GitHub Actions also runs lint and a Lighthouse CI report, and only a green run on main is deployed to GitHub Pages, from exactly the commit that was tested.
