---
order: 26
slug: github-dashboard
title: "GitHub Dashboard"
kind: live
year: 2026
summary: "Terminal-style analytics for any GitHub user, with no backend."
description: "Terminal-style analytics for any GitHub user, with no backend and no token in the browser. The default profile ships as a JSON snapshot built at deploy time; any other username loads live."
highlights:
  - "Profile, top languages, repositories by year and a GitHub-style contribution heatmap"
  - "Pinned repos first, the rest ranked by stars, forks and description; a \"vs\" comparison"
  - "Paginated REST fetches, with a CORS proxy fallback when requests are blocked"
  - "Exports to HTML, PNG or PDF · 19 unit + 10 Playwright e2e tests with the API mocked"
stack: ["React", "JavaScript", "GitHub API", "Vite", "Playwright"]
links:
  live: "/github-dashboard/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/github-dashboard"
image: "../../assets/live/github-dashboard.webp"
imageAlt: "GitHub Dashboard: repositories by year as a bar chart, a contribution heatmap for the last year and cards for the top repositories"
featured: false
caseStudy: true
---

## What it does

GitHub Dashboard turns a public GitHub profile into one dark, terminal-flavoured page: the profile, the top eight languages by number of repositories, frameworks and tools found by matching repository topics against curated lists, repositories by year, the top repositories and the six most recently updated ones. A terminal log narrates each loading step and names the data source.

The default profile also gets a GitHub-style contribution heatmap of the last year and its pinned repositories. A second username in the "vs" field loads another profile side by side, with repositories, stars, followers, account age and the overlap of their top five languages. The dashboard exports as a self-contained HTML file, a PNG, or a PDF through the browser's print dialog.

## How it works

There is no backend, and the browser never holds a token. At build time, a snapshot script in GitHub Actions reads the default profile, its repositories and their languages from the REST API and, with a token, the pinned repositories and the contribution calendar from the GraphQL API. It writes them into one static JSON file that ships with the site, so the default profile loads without any API calls.

Any other username loads live from the public REST API: the profile and every page of repositories, then the languages of each non-fork repository. Without a token, GitHub allows 60 requests an hour per IP, and each repository's languages cost one. A live profile is cached in localStorage for an hour. If a direct request fails, it is retried through public CORS proxies, which then see the requested URL.

Top repositories put the pinned ones first and fill the rest of the nine slots by a score: three points per star, two per fork, a base of five, and two more for a description.

## Decisions and why

- **Client-only.** The GitHub API supports CORS, so the app can be a static site on GitHub Pages.
- **A snapshot instead of a token.** Authenticated data is fetched once per build and served as a static file, so there is no secret in the browser and no backend.
- **Raw data in the snapshot.** It stores what the API returned, not the computed numbers, so the same aggregation code runs for snapshot and live data.
- **Languages by repository count, not by bytes**, so one large project does not drown out the rest.
- **PNG with a small dependency, PDF without one.** html-to-image, loaded only when PNG is clicked, saves re-implementing the styles in canvas; PDF uses the browser's print engine and a print stylesheet.

## Security

- **No token is bundled.** Earlier versions read the token through a variable that Vite embeds in the JavaScript, where anyone can read it. Now it lives only in the build step that makes the snapshot.
- **The HTML export escapes every user-provided string**, because names, descriptions and bios come from other users.

## Testing and deployment

19 unit tests cover the aggregation, the heatmap layout, the comparison, the snapshot and the HTML export. 10 Playwright tests run on desktop and mobile without touching the real API: GitHub, the avatars and the fonts are answered by the test, and the snapshot comes from a fixture. They check the snapshot load, the heatmap, the comparison, the three exports and the print stylesheet, and fail on any console error.

CI runs lint, the tests, the build and a Lighthouse report on every push and pull request, and only a green run on main is deployed to GitHub Pages. A daily run refreshes the snapshot; if GitHub refuses it, the deploy stops and the previous deployment stays online.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
