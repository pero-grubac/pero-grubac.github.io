---
order: 6
slug: git-discord-bot
title: "GitHub Discord Bot"
kind: tool
year: 2026
summary: "Manage GitHub issues and get activity reports from Discord."
metaDescription: "GitHub Discord Bot, a Python bot that bridges GitHub and Discord for solo work: manage issues, track activity and get reports without leaving the chat."
description: "A personal bot that brings my GitHub account into a Discord server: open issues with a slash command or a form, close them with one click, get commit and issue reports, and see pull requests, failed CI runs and releases as they happen. 237 tests at 99% coverage."
highlights:
  - "Open issues with /add or a form, close them with one click; labels detected from the title"
  - "HMAC-signed webhook posts issues, PRs, failed CI runs and releases, and no change twice"
  - "Monthly report on the 1st and a Monday reminder of stale issues, in your time zone"
  - "discord.py + Flask · Supabase PostgreSQL · Render, deployed after CI · 237 tests, 99% coverage"
stack: ["Python", "discord.py", "Flask", "PostgreSQL", "Supabase", "Discord API", "GitHub API", "Webhooks", "pytest"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/git-discord-bot"
commands:
  - cmd: "/add"
    text: "create an issue, in one line or a form"
  - cmd: "/list"
    text: "open issues, with a menu to close one"
  - cmd: "/done"
    text: "close an issue"
  - cmd: "/today"
    text: "issues created today"
  - cmd: "/stale"
    text: "open issues older than 14 days"
  - cmd: "/repos"
    text: "registered repositories"
  - cmd: "/register"
    text: "register one repository"
  - cmd: "/sync-repos"
    text: "register every repository you own"
  - cmd: "/repo-info"
    text: "language, stars, forks, last push"
  - cmd: "/stats"
    text: "commits & issues by period"
  - cmd: "/streak"
    text: "commit streak"
  - cmd: "/top-repo"
    text: "most active repo this month"
  - cmd: "/help"
    text: "every command, grouped"
featured: false
caseStudy: true
---

## What it does

GitHub Discord Bot brings my GitHub account into a Discord server. I built it for the Human–Computer Interaction course, so the interaction design mattered as much as the integration: autocomplete wherever a value can be guessed, buttons and menus instead of typed numbers, a form when there is more to say, and one card style whose colours carry meaning.

`/add` opens a GitHub issue in one line, or through a form with a description field when there is no title. Words such as *crash*, *ne radi*, *add* or *readme* in the title add the `bug`, `enhancement` or `documentation` label. Every new issue comes back as a card with a link to GitHub and a **Close** button, and `/list` shows the open issues across all repositories, with a menu to close any of them and pages instead of a cut-off list.

For activity, `/stats` counts commits and issues per repository for the last 7 days, this month or last month, `/streak` works out the current commit streak and the longest one in the last 90 days, and `/top-repo` names the most active repository of the month. The bot also posts on its own: a monthly report on the 1st and a reminder of stale issues every Monday, both at 09:00 in my time zone.

It works the other way round too. Issues opened or closed on GitHub, pull requests opened or merged, failed CI runs and published releases appear in a Discord channel through a signed webhook, while changes made from Discord are not announced a second time. Only the owner can use any of it, even if others on the server see the commands.

## Architecture

One Python process runs two things: the Discord bot on the asyncio event loop, and a small Flask server on its own thread for GitHub's webhook and the health check.

- **The Cogs** hold the slash commands, one module per area: issues, repositories, stats with the monthly report, activity, and reminders with the weekly task. Every command, autocomplete, button and menu passes the same owner check first.
- **The views** are the buttons, menus, pagers and the issue form. Their state lives in their `custom_id`, so the **Close** button and the `/list` controls still work on old messages after a restart.
- **Issue actions** open and close issues for the commands, the buttons and the form alike: GitHub first, then the database.
- **The webhook thread** verifies each delivery, saves issue changes to the database, and hands the card to the bot's event loop to post.
- **`core/`** holds the pure logic (labels, periods, paging, streaks, reports and access), and **`ui/embeds.py`** every card the bot sends, with Discord's limits in one place.
- **Supabase** keeps the registered repositories and the issues, one row per repository and issue number.

The GitHub and Supabase clients are synchronous, so every call goes through `asyncio.to_thread` and the bot keeps answering Discord while it waits.

## Decisions and why

- **Owner only, checked once.** Strangers get a private "not for you" card, and their autocomplete shows nothing.
- **One server, no global commands.** The commands are synced to the configured server only, so a change shows up at once and nothing is listed twice.
- **GitHub first, database second.** An issue is marked closed in the database only after GitHub accepted it, so a failure never leaves the two disagreeing.
- **One card per action.** Before the bot changes something on GitHub it remembers the change for five minutes, so the webhook GitHub sends back updates the database but posts nothing.
- **A form only when it helps.** `/add` with a title is one line; without one it opens a form, because a description doesn't fit in a slash option.
- **My clock, not the server's.** "Today", the streaks and the scheduled messages follow the configured time zone, daylight saving included; GitHub always gets UTC.
- **Fewer requests.** Repositories whose last push is older than the requested period are skipped, the rest are fetched in parallel, and repository names for autocomplete are cached for a minute.
- **One unreadable repository doesn't sink a report.** If the token may not read a repository's commits (`403`), `/stats`, `/streak` and `/top-repo` leave it out and log a warning instead of failing.

## Security

- **The webhook is signed.** Each delivery is checked against `X-Hub-Signature-256` with HMAC-SHA256, compared in constant time, and a bad signature gets `401`.
- **Owner only.** Nobody else on the server can create, close or browse issues, whatever they can see.
- **No privileged intents.** The bot uses only slash commands and components, so it never asks to read message content.
- **A least-privilege token.** The bot runs with a fine-grained GitHub token with an expiry date: read-only metadata and contents, and read and write issues.
- **Settings are checked at start-up.** The bot reads every setting from the environment and lists all the missing or invalid ones in one error instead of starting half-configured.

## Testing and deployment

There are 237 tests with pytest, pytest-asyncio and responses, at 99% coverage. They run in a few seconds with no network: the GitHub API is mocked, the commands run as async tests, and the pure logic in `core/` is tested with plain values. GitHub Actions runs Ruff and the tests on every push to `master`, but not when only the README, the demo GIF or other documentation changed, and a newer push cancels the run still in progress.

The bot runs as one web service on Render, from a Blueprint. Render deploys only after CI passes and ignores commits that only touch tests, workflows or documentation, so a README edit never restarts the bot. A free Render service sleeps after 15 minutes without HTTP traffic, which would also disconnect the bot, so UptimeRobot calls `/health` every five minutes. A daily task also reads one row from Supabase, so the free database is never paused for inactivity.
