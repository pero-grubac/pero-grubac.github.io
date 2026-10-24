---
order: 25
slug: git-discord-bot
title: "GitHub Discord Bot"
kind: tool
year: 2026
summary: "Manage GitHub issues and get activity reports from Discord."
description: "A bot that bridges GitHub and Discord for solo work: manage issues, track activity and get reports without leaving chat."
highlights:
  - "Open issues with /add or a form, close them with one click; labels detected from the title"
  - "HMAC-signed webhook posts issues, PRs, failed CI runs and releases to Discord"
  - "Monthly report on the 1st and a Monday reminder of stale issues"
  - "discord.py + Flask · Supabase PostgreSQL · Render, deployed after CI · 232 tests, 99% coverage"
stack: ["Python", "PostgreSQL", "Flask", "Discord API", "GitHub API", "Webhooks", "Supabase", "pytest"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/git-discord-bot"
commands:
  - cmd: "/add"
    text: "create an issue"
  - cmd: "/done"
    text: "close an issue"
  - cmd: "/list"
    text: "open issues across repos"
  - cmd: "/today"
    text: "issues created today"
  - cmd: "/stale"
    text: "open issues older than 14 days"
  - cmd: "/streak"
    text: "commit streak"
  - cmd: "/stats"
    text: "commits & issues by period"
  - cmd: "/top-repo"
    text: "most active repo this month"
featured: false
caseStudy: false
---
