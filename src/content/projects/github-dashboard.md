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
caseStudy: false
---
