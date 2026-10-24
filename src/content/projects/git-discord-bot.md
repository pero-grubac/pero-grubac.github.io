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
caseStudy: true
---

## What it does

I built this personal productivity bot as a lightweight command center for a solo developer's GitHub work, inside Discord.

Issues are opened with a title, a description and a label, with autocomplete for the repository and the label, and closed again from Discord. The bot lists the open issues across all registered repositories, and the issues created today.

Repositories are registered one at a time, after the bot checks each one against the GitHub API, or synced into the database all at once. For any of them it shows the language, stars, forks, open issues and the last push.

For activity, it breaks down commits and issues for the last 7 days, this month and last month, works out the current and longest commit streak over the last 90 days, shows a grid of commit activity for the last 15 weeks, and names the most active repository of the month. Once a month it also posts a report to a dedicated Discord channel on its own.

It works in the other direction too: closing an issue on GitHub sends an instant notification to Discord.

## Architecture

The bot and a webhook receiver run together and talk to three outside services: Discord, GitHub and a PostgreSQL database on Supabase.

- **The bot** is written in Python with discord.py. Its commands are grouped into Cogs: issues and repositories, stats with the monthly report task, and activity for the streak, the heatmap and the top repository. The entry point loads the Cogs and syncs the slash commands with Discord at startup.
- **The webhook receiver** is a small Flask server, loaded as one more Cog. Each repository's GitHub webhook sends its issue events there as JSON, with a secret shared between GitHub and the bot.
- **GitHub's REST API** serves the issues, commits and search results. The bot uses it to create and close issues, check repositories and count activity.
- **Supabase** keeps the registered repositories and the issues. Each issue row ties a Discord message to a GitHub issue number and stores the issue's labels and whether it is open or closed.

Two limits come from GitHub. Its API returns at most 100 commits per request, so a repository with very many commits in one period can show incomplete counts. And GitHub has no account-level webhooks for individual users, so every repository needs its own webhook.

## Deployment

The bot, webhook receiver included, runs as one web service on Render. The free tier spins down after 15 minutes of inactivity, so an UptimeRobot monitor has to call the service's health endpoint every five minutes to keep the bot online. Syncing the slash commands adds about 5 to 10 seconds to each start.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
