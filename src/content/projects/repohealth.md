---
order: 5
slug: repohealth
title: "RepoHealth"
kind: live
# TODO(owner): year. The repo is private, so GitHub can't tell when it was created.
summary: "Scores each of my public repositories from 0 to 100, every week."
description: "A health monitor for all of my public repositories. Each one is checked for a README, a license, tests, CI/CD and recent commits, then scored from 0 to 100, every week."
highlights:
  - "Weekly scan of every public repository, with the time of the last scan shown"
  - "Totals at a glance: repositories, average score, passing and needing attention"
  - "Search plus passing / warning / critical filters; a card with the score per repo"
  - "SvelteKit on Vercel, with a strict Content Security Policy"
stack: ["SvelteKit", "JavaScript", "GitHub API", "Vercel"]
links:
  live: "https://repository-health-monitor.vercel.app/"
  repos: []
  privateRepo: true
image: "../../assets/live/repository-health-monitor.webp"
imageAlt: "RepoHealth: totals for repositories, average score, passing and needing attention, a search box with passing, warning and critical filters, and a score card per repository"
featured: false
caseStudy: false
---
