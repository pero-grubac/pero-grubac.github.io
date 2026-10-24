<div align="center">

# 🌐 pero-grubac.github.io

[![CI](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/deploy.yml)
![HTML5](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Build](https://img.shields.io/badge/build_step-none-2EA44F)
![Tests](https://img.shields.io/badge/tests-6_unit_·_7_e2e-2EA44F?logo=nodedotjs&logoColor=white)

**My portfolio: 30 projects behind one search bar, live apps that open in place, a command menu and a light/dark theme, in plain HTML, CSS and JavaScript.**

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-pero--grubac.github.io-4C8AF5?style=for-the-badge)](https://pero-grubac.github.io)

<img src="readme_assets/demo.gif" alt="Portfolio demo: the hero, searching projects for pwa, opening the Countdown and Catan rows with their previews, the Ctrl+K command menu and switching between dark and light theme" width="800">

</div>

---

## 📌 Project Overview

A portfolio built from scratch without frameworks or a build step. Every project is in one **Projects** section with a single search bar (`grep -i …`) and kind filters. Rows open in place with a preview, a short description and the key points, and live apps launch straight from their row.

Searches and filters live in the URL, so `?q=docker`, `?kind=live` or `#arcane-keep` opens that exact view.

---

## ✨ Features

- 🔎 **One search for everything**: names, descriptions and tags, with matches highlighted; clicking a Tech Stack tag searches for it
- 🗂️ **Kind filters**: systems · live · mobile · desktop · web · tool
- 🎬 **Featured systems** with demo videos that play only while on screen
- 📂 **Index rows** that open in place, with previews of every live app
- ⌨️ **Command menu** (`Ctrl` + `K`): jump to a project, launch an app, copy the email, switch theme
- 🌗 **Light and dark theme** following the system, switchable and remembered
- 🔗 **Shareable views** through `?q=`, `?kind=` and `#project`
- 📱 **Responsive**, with a collapsible menu on phones
- ♿ **Keyboard first**: everything is reachable without a mouse

### 🗂️ Projects

**Featured systems** (each with a demo video):

1. **Incident Alert**: citizen incident reports with moderation, four .NET 10 services (ASP.NET · MassTransit/RabbitMQ · ML.NET · React · Docker)
2. **eMobilityHub**: electric vehicle rental platform, four apps on one database (Spring Boot · Angular · JSP · MySQL · Docker)
3. **Chat Room**: secure forum with 2FA, OAuth2, WAF, SIEM and TLS on every hop (Spring Boot · React · JWT · Docker)
4. **Online Library System**: seven Java apps (REST · TCP/TLS sockets · UDP multicast · RabbitMQ · RMI · Redis)

**Index**:

- **Live apps**: [RepoHealth](https://repository-health-monitor.vercel.app/), Brick Breaker, Monte Carlo π · Python, Arcane Keep, DevKit, GitHub Dashboard, Dev Timeline, Countdown, Catan Map Generator, excuse.exe, Sedmica, Lora Score Table, Yamb Table
- **Mobile**: FitForge, AssetManager, ETF Oglasi (Flutter · Dart · SQLite)
- **Desktop**: Store Management, Store Chain Management (C# · WinForms · MySQL), e-Mobility Rental (Java · Swing), ANOVA, Echo Player, Monte Carlo π, Snake (C# · WPF)
- **Web**: Minimal Blog (Python · Django · PostgreSQL)
- **Tools**: Secure Repository (C# · OpenSSL · PKI), GitHub Discord Bot (Python · discord.py · Flask · PostgreSQL)

### ⌨️ Keyboard

| Key | Action |
|-----|--------|
| `/` | Search projects |
| `Ctrl` + `K` | Command menu |
| `t` | Toggle light / dark theme |
| `j` / `k` | Move between index rows · `Enter` opens · `o` launches a live app |
| `Esc` | Clear the search |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Structure, `<details>` rows, `<dialog>` command menu |
| CSS3 | OKLCH colour tokens (light + dark), animations, responsive layout |
| Vanilla JavaScript | Search, filters, command menu, keyboard shortcuts, theme, lazy video |
| Google Fonts | Space Grotesk (display) · Inter (body) · JetBrains Mono (code/labels) |
| Font Awesome | Icons |
| `node:test` | Static checks: links, assets, anchors, ids, thumbnails |
| Playwright | End-to-end smoke tests on desktop and phone |
| Lighthouse CI | Performance, accessibility, best practices and SEO on every pull request |
| GitHub Actions + GitHub Pages | CI and deployment |

---

## 📁 Project Structure

```
pero-grubac.github.io/
├── index.html                 The whole page
├── css/styles.css             Tokens, light/dark theme, layout, components
├── js/scripts.js              Search, filters, command menu, keyboard, theme, videos
├── assets/
│   ├── avatar.jpeg, favicon.ico, apple-touch-icon.png
│   ├── og-card.png            Link-preview image
│   ├── live/                  Live app screenshots (800×500 WebP)
│   ├── incident_alert/ …      Featured systems: demo.mp4 + poster
│   └── fitforge/, snake/ …    Mobile, desktop and tool previews (16:10 WebP)
├── tests/
│   ├── site.test.js           Links, assets, anchors, unique ids, thumbnails, meta tags
│   └── e2e/                   Playwright smoke tests and a tiny static server
├── readme_assets/demo.gif
├── playwright.config.js
├── lighthouserc.json
├── package.json               Test scripts only; the site has no dependencies
└── .github/workflows/
    ├── ci.yml                 Static checks, e2e, Lighthouse on pull requests and branches
    └── deploy.yml             Checks, then deploy to GitHub Pages
```

---

## 📦 Installation

You need [Git](https://git-scm.com/) and, for the tests only, [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/pero-grubac/pero-grubac.github.io.git
cd pero-grubac.github.io
npm install        # test tools only
```

---

## ▶️ Usage

```bash
npm start          # http://localhost:8080
```

Any static server works too (`python -m http.server`, VS Code Live Server).

### Tests

```bash
npm test           # static checks
npm run test:e2e   # browser smoke tests (desktop + phone)
```

The static checks fail if any local file the page points to is missing, an in-page `#anchor` has no target, an id is duplicated, a live app has no thumbnail, or a `target="_blank"` link lacks `rel="noopener"`. The e2e tests load the page, search, filter, open a deep link, use the command menu, switch the theme and make sure nothing is wider than a phone screen; any JavaScript error fails them.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    HTML[index.html<br/>cards · index rows · dialog] --> JS[js/scripts.js]
    JS --> IDX[buildIndex<br/>name · tags · text per item]
    IDX --> S[Search + kind filters]
    S <--> URL[(URL<br/>?q · ?kind · #id)]
    JS --> P[Command menu<br/>Ctrl+K]
    P --> S
    JS --> T[Theme toggle] <--> LS[(localStorage)]
    JS --> V[IntersectionObserver<br/>plays videos on screen]
```

### Opening a shared link

```mermaid
sequenceDiagram
    autonumber
    actor U as Visitor
    participant P as Page
    participant I as Index

    U->>P: open /?q=pwa#countdown
    P->>I: build the index from the page
    P->>I: apply ?q and ?kind
    I-->>U: matching projects, matches highlighted
    P->>I: find #countdown
    I-->>U: row opened and scrolled into view
```

---

## 🚀 CI/CD

| Workflow | Runs on | What it does |
|----------|---------|--------------|
| `ci.yml` | Every push (including `main`) and pull request | Static checks, Playwright e2e (desktop + phone), Lighthouse report |
| `deploy.yml` | After **CI passes on `main`**, or a manual run | Publishes the site's files to GitHub Pages; the tests already ran in CI |

Deploy is chained to CI (`workflow_run`): a push to `main` is tested once, and only a green run is published, from exactly the commit that was tested. Documentation-only commits start neither.

CI **skips documentation-only changes** (`*.md`, `readme_assets/`, `LICENSE`, `.gitignore`, `.vscode/`), and a newer run on the same branch cancels the older one. Only the site's files are deployed (`index.html`, `css/`, `js/`, `assets/`). Lighthouse scores are warnings, so a low score is visible in the report without blocking a change.

**One-time setup:** **Settings → Pages → Build and deployment → Source** → **GitHub Actions**. Until then GitHub keeps publishing `main` directly and the checks don't gate the deploy.

---

## 🧭 Design Decisions

- **No framework, no build.** The page is content first; plain HTML is fast, crawlable and works without JavaScript, which then adds search and shortcuts on top.
- **One search for everything** instead of separate sections, so a visitor looking for "docker" or "pwa" finds every match at once.
- **State in the URL**, so any view can be shared.
- **Videos only play on screen**, which keeps the page light on phones.
- **Decorations never widen the page**: the background glows are clipped to their sections, and a test checks that nothing is wider than the screen.
