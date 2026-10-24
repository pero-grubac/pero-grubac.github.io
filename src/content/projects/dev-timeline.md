---
order: 15
slug: dev-timeline
title: "Dev Timeline"
kind: live
applicationCategory: DeveloperApplication
year: 2026
summary: "Turns a GitHub profile into a timeline of the languages used."
metaDescription: "Dev Timeline reads any public GitHub profile and turns its language usage and repo topics into a skill timeline: which languages were used, and when."
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
caseStudy: true
---

## What it does

Dev Timeline reads a public GitHub profile, looks at the languages and topics of every repository, and turns them into a skill map and a timeline. The skills view has bars for how many repositories use each language, bars for the most used topics as tools and frameworks, and a language-by-year heatmap. The timeline puts every non-fork repository on a vertical line by the year it was created, with its description, language, topics, stars and a link. My own profile is the default: it opens straight away and, when its snapshot includes it, shows a contribution calendar of the last year. Any other username can be scanned live.

## How it works

It is a single-page React app with no backend. The default profile comes from a JSON snapshot built at deploy time: a Node script on the GitHub Actions runner reads the repositories and their languages from the REST API and the contribution calendar from the GraphQL API, and writes a static file that is published next to the app. A scheduled deploy refreshes it daily.

Other usernames, and the default one when there is no snapshot, are scanned live from the public REST API without a token: the repositories 100 per page with forks skipped, then one languages request per repository. The result is cached per username in `localStorage` for an hour, and the ↺ button fetches live data past both the snapshot and the cache. The status bar shows which source the data came from.

## Decisions and why

- **No backend.** The GitHub API allows CORS, so the browser can call it directly and the app can live on GitHub Pages.
- **A snapshot instead of a token in the browser.** The static file gives the default profile instant loads, no rate limit and the contribution calendar, which only the GraphQL API provides and which needs a token, while the token stays on the CI runner.
- **Every language of a repository counts.** A React app with CSS and HTML counts for all three, which is closer to what was actually used.
- **Topics stand in for frameworks**, because GitHub has no framework field.
- **An hour's cache per username** keeps a reopened profile inside the anonymous limit of 60 requests an hour per IP.
- **Readable colours.** Very dark GitHub language colours are mixed towards white until they are bright enough on the dark background.

## Security

Earlier versions read a GitHub token at build time, and Vite inlines such variables into the JavaScript bundle, so anyone could copy the token from the browser's developer tools. Now no token ships to the browser: it lives in a repository secret, and only the snapshot script uses it, on the CI runner. The browser downloads the resulting JSON and calls the public API anonymously.

## Testing and deployment

There are 25 unit tests on Node's built-in test runner, for the aggregation, the snapshot, the calendar layout and the colours, and 5 Playwright tests on desktop and mobile with the GitHub API and the snapshot mocked. GitHub Actions lints, tests and builds the app and audits it with Lighthouse CI. The deploy runs after CI passes on main and daily at 04:17 UTC; if the API refuses the snapshot, the build stops and the previous deployment stays online.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
