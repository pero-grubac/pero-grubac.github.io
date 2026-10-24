<div align="center">

# 🌐 pero-grubac.github.io

[![CI](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/pero-grubac/pero-grubac.github.io/actions/workflows/deploy.yml)
![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/tests-Playwright_·_axe-2EAD33?logo=playwright&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse-checked_in_CI-F44B21?logo=lighthouse&logoColor=white)

**My portfolio: backend systems as magazine features with case studies and architecture diagrams, every other project in one searchable index, and a gallery of browser apps. Built with Astro, set like a printed page.**

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-pero--grubac.github.io-4C8AF5?style=for-the-badge)](https://pero-grubac.github.io)

<img src="readme_assets/home.webp" alt="The home page: the name Pero Grubač in a large serif, the line Backend developer in Banja Luka. I build services that talk to each other over queues, sockets and REST, links to the systems, GitHub and LinkedIn, and an In this portfolio list of the four systems, the index of projects and the browser apps" width="800">

</div>

---

## 📌 Project Overview

A static portfolio for a backend developer. The four systems come first, each as a feature with its architecture line, a demo video that plays only when you ask for it, and a case study with an architecture diagram. Every other project is a one-line entry in an index that opens on demand, with search and kind filters, and the browser apps have a gallery of their own.

Each project is one Markdown file. A strict schema checks it at build time, and every count on the site is computed from those files.

---

## ✨ Features

- 🏗️ **Systems as features**: headline, architecture line, description, and a demo video (AV1 WebM, with an H.264 MP4 as fallback) that loads only on hover, click or tap
- 📖 **Case studies** for every project with a public repo, with an architecture diagram where a project has parts that talk to each other, and a sticky margin: on this page, stack, code
- 🔎 **Index of projects**: search by title, summary or technology, kind filters with live counts, one entry open at a time; the state lives in the URL (`#projects?kind=live&q=react`)
- 🧭 **Command palette** (`Ctrl` / `⌘` + `K`) on every page: sections, every project, open an app, copy the email
- 🖼️ **Browser apps** gallery at `/apps/`, each app one click from its screenshot
- 🗞️ **Social images** for every page, set at build time in the site's own fonts
- ♿ **Accessible**: keyboard only, visible focus everywhere, reduced motion respected, axe clean
- ⚡ **Fast**: about 3 kB of JavaScript on the home page, fonts subset to the characters the site uses

### 🗂️ Projects

**Featured systems** (each with a demo video and a case study):

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
| `/` | Find in the index (home) or in the apps (`/apps/`) |
| `Ctrl` / `⌘` + `K` | Command palette, from any page, even while typing |
| `↑` `↓` `Enter` | Move through the palette and run a row |
| `Esc` | Close the palette, or the open index entry |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| Astro 7 | Static site: pages, content collections, image pipeline (AVIF and WebP), sitemap |
| TypeScript (strict) | Components, the content schema and the browser scripts |
| Zod (via Astro) | The project schema: the build fails on an invalid project file |
| CSS custom properties | The design tokens: paper, ink, one accent, rules; no framework |
| Vanilla TypeScript | Search, filters and hash state, the palette, the demo videos, Copy |
| Newsreader and Instrument Sans | Self-hosted from `@fontsource`, subset at build time with HarfBuzz |
| fontkit and sharp | Social images and favicons, typeset as paths in the site's own fonts |
| Playwright and axe | Browser tests at 360 and 1440 px, keyboard only, reduced motion, accessibility |
| Lighthouse CI | Performance, accessibility, best practices and SEO on every push |
| GitHub Actions and GitHub Pages | CI and deployment |

---

## 📁 Project Structure

> `REDESIGN.md`, `design-explorations/` and `legacy/` are the redesign's spec, its
> design prototypes and the old hand-written site; they are removed after
> the launch.

```
pero-grubac.github.io/
├── src/
│   ├── content/projects/      One Markdown file per project (<slug>.md)
│   ├── content.config.ts      The projects schema; the build fails on an invalid file
│   ├── assets/                Project screenshots and the portrait, optimized by Astro
│   ├── pages/                 Routes: index, apps, projects/[slug] (case studies), 404, and endpoints
│   │                          for the social images (og.png), favicons and site.webmanifest
│   ├── layouts/Base.astro     Head (<Seo>), icons, fonts, masthead, main, footer, toast, palette
│   ├── components/            Seo, Palette, Masthead, Footer, FontFaces and shared pieces (links, demo figure, …)
│   │   ├── home/              The home page sections: hero, about, systems, index, apps, contact
│   │   ├── diagram/           Shapes for architecture diagrams (Diagram, Node, Edge, Actor, Group)
│   │   └── diagrams/          One architecture diagram per system, named after its slug
│   ├── lib/                   Project helpers, the owner's facts, structured data (seo.ts), the other
│   │                          repos' app paths (other-repos.mjs: the path guard and live links share it),
│   │                          and the build-time typesetter for social images and favicons (glyphs, og, icons)
│   ├── integrations/          subset-fonts.mjs: cuts the font files down to what the site uses (build only)
│   ├── scripts/               Browser scripts: the projects index, the palette, copy, the toast
│   ├── types/                 Declarations for the two build packages that ship none
│   └── styles/                tokens.css (design tokens), global.css
├── public/                    robots.txt; assets/: demo videos, avatar, og-card.png, served at /assets/
├── scripts/check-links.mjs    Checks every live, repo and APK link in the content
├── tests/                     Playwright: home, other pages, palette, axe, and the build output (SEO)
├── playwright.config.ts       Runs the tests against `astro preview` of dist/
├── lighthouserc.json          Lighthouse on mobile: home, /apps/, a case study (REDESIGN.md section 2)
├── astro.config.mjs           Static output, trailingSlash "always", sitemap, inlined CSS, font subsetting,
│                              and a guard for the other repos' paths
├── design-explorations/       Phase 0 prototypes (direction B is the reference)
├── legacy/                    The old hand-written site, until launch
├── REDESIGN.md                The redesign spec
└── .github/workflows/
    ├── ci.yml                 astro check + build, Playwright tests and Lighthouse on every push and PR
    └── deploy.yml             After CI passes on main: withastro/action → GitHub Pages
```

---

## 📦 Installation

You need [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/) 22.12 or newer.

```bash
git clone https://github.com/pero-grubac/pero-grubac.github.io.git
cd pero-grubac.github.io
npm install
```

---

## ▶️ Usage

```bash
npm run dev        # http://localhost:4321, reloads on change
npm run check      # TypeScript and Astro diagnostics
npm run build      # static site in dist/
npm run preview    # serves dist/
npm test           # Playwright tests of the built site (run npm run build first)
npm run lighthouse # Lighthouse on mobile for home, /apps/ and a case study (needs Chrome)
npm run check:links  # every live, repo and APK link in the content must return 200
```

### Adding a project

Add one file, `src/content/projects/<slug>.md`, with the fields described
in section 5 of `REDESIGN.md` (copy an existing project of the same kind),
and put its screenshot under `src/assets/`. `npm run build` tells you
exactly which field is wrong if something doesn't fit.

With `caseStudy: true` (every project but RepoHealth) it also gets a page
at `/projects/<slug>/`, with its own social image and a `metaDescription`
of 140–160 characters for search results. Its case study is the Markdown
body of the same file, written from the project's README; a project with
several parts that talk to each other can also have an architecture
diagram, `src/components/diagrams/<slug>.astro`. A live app also names its
`applicationCategory`. See sections 5, 6.8, 8.2 and 10 of `REDESIGN.md`.

### Demo videos

A system's demo plays only when a visitor asks for it, from two files in
`public/assets/<name>/`: `demo.webm` (AV1), which the page offers first,
and `demo.mp4` (H.264) for browsers that can't decode AV1, such as Safari
on most Apple devices. The WebM is there because some Chromium builds,
including the one Playwright tests with, can't play H.264. The project
file names only the MP4 (`video:`); the build fails if the WebM beside it
is missing. To make the WebM from the MP4 with FFmpeg:

```bash
ffmpeg -i demo.mp4 -an -c:v libsvtav1 -crf 42 -preset 5 -svtav1-params scm=1 -pix_fmt yuv420p demo.webm
```

`scm=1` is SVT-AV1's screen-content mode, which keeps UI text sharp. Compare
it with the MP4 (`ffmpeg -i demo.webm -i demo.mp4 -lavfi ssim -f null -`)
and lower `-crf` if the SSIM is under about 0.98; Incident Alert's busy map
needed 36. The page declares both files as level 3.1 (`av01.0.05M.08`,
`avc1.64001f`), which covers video up to about 960×720.

### Tests

`npm test` runs the Playwright tests against the built site (run
`npm run build` first); it starts its own `astro preview` on port 4399
beside any you have open. Locally it uses Edge on Windows (`PW_CHANNEL`
to change); CI uses Playwright's own Chromium, which has no H.264 decoder.
To test with that one locally too: `npx playwright install chromium`, then
`PW_CHANNEL=bundled npm test`.

| File | What it checks |
|------|----------------|
| `tests/home.spec.ts` | Counts, search and hash, details on demand, the demo video, Copy, stack terms, keyboard only, reduced motion, 360 and 1440 px |
| `tests/pages.spec.ts` | `/apps/`, the case studies (breadcrumb, pager, margin, diagram) and the 404, the same ways |
| `tests/palette.spec.ts` | The command palette: shortcut, Esc, backdrop, ↑ ↓ Enter, fuzzy matching, every kind of row |
| `tests/a11y.spec.ts` | axe (WCAG 2.1 A and AA) on every kind of page, with an entry open and with the palette open |
| `tests/build.spec.ts` | `dist/` without a browser: internal links, titles and descriptions, canonical, Open Graph, JSON-LD, sitemap, robots.txt, icons, social images, demo video sources, font subsets |

`npm run lighthouse` runs Lighthouse CI (fetched with `npx`) on mobile
for home, `/apps/` and a case study, and fails below the targets of
`REDESIGN.md` section 2: performance 95, the rest 100. The old site's
tests are kept in `legacy/tests/` and no longer run.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    MD[src/content/projects<br/>one .md per project] --> Z{Schema<br/>content.config.ts}
    Z --> B[astro build]
    F[@fontsource fonts] --> SF[subset-fonts] --> B
    B --> P[Pages<br/>home · /apps/ · case studies · 404]
    B --> E[Endpoints<br/>og.png · favicons · manifest]
    B --> S[Sitemap · robots.txt]
    P & E & S --> D[(dist/)] --> GP[GitHub Pages]
```

Everything is decided at build time: counts, the index, the palette rows, the structured data and the social images all come from the project files. The browser gets plain HTML with every project's details already in it, and small scripts that show and hide them.

### Opening a shared link

```mermaid
sequenceDiagram
    autonumber
    actor U as Visitor
    participant P as Home page
    participant I as Index

    U->>P: open /#projects?kind=live&q=react
    P->>I: read the hash: kind and query
    I-->>U: matching live apps, counts per kind
    P->>U: scroll to the index, again once the fonts are in
    U->>I: edit the search
    I->>P: update the hash, so the view can be shared
```

---

## 🚀 CI/CD

| Workflow | Runs on | What it does |
|----------|---------|--------------|
| `ci.yml` | Every push (including `main`) and pull request | Three jobs side by side: `astro check` and `astro build`; the Playwright tests; Lighthouse (reports kept as an artifact) |
| `deploy.yml` | After **CI passes on `main`**, or a manual run | `withastro/action` builds `dist/` and uploads it; `actions/deploy-pages` publishes it |

Deploy is chained to CI (`workflow_run`): a push to `main` is tested once, and only a green run is published, from exactly the commit that was tested. Documentation-only commits start neither. Nothing deploys from other branches, so the redesign goes live only when `redesign` is merged into `main`.

CI **skips documentation-only changes** (`*.md`, `readme_assets/`, `LICENSE`, `.gitignore`, `.vscode/`), and a newer run on the same branch cancels the older one. Only the build output (`dist/`) is deployed; `legacy/` and `design-explorations/` never are.

**One-time setup:** **Settings → Pages → Build and deployment → Source** → **GitHub Actions**. Until then GitHub keeps publishing `main` directly and the checks don't gate the deploy.

---

## 🧭 Design Decisions

- **Backend first.** The systems get the most space; small apps and games sit in a compact index that opens on demand, so the home page reads in under a minute.
- **One file per project.** Adding a project means adding one Markdown file; a strict schema rejects anything the pages can't show, and no count is ever typed by hand.
- **Static and small.** No framework on the page and no backend: plain HTML, a few kilobytes of script, and details that are in the HTML for search engines even while collapsed.
- **Set like a printed page.** Paper, ink, rules and two typefaces carry the design; one accent colour marks only what you can act on.
- **Nothing moves on its own.** Videos play only on hover, click or tap, and with reduced motion only on click or tap.
- **State in the URL**, so any view of the index can be shared.
- **Checked on every push**: browser tests, axe and Lighthouse run in CI, and the deploy publishes only a commit that passed them.
