# Portfolio redesign spec — pero-grubac.github.io

This document is the single source of truth for rebuilding the portfolio.
It is written for Claude Code. Read it fully before writing any code, then
work through the phases in section 12 in order. If something in this spec
conflicts with what you find in the repo, stop and ask instead of guessing.

> **Git rule: commit only on the `redesign` branch.** All work happens on
> the `redesign` branch (created from `main`). You may `git add` and
> `git commit` there, and nowhere else: never commit to `main`.
> Before every commit, run `git branch --show-current` and stop if it is
> not `redesign`. Never push, merge, rebase, reset, or delete branches;
> the owner pushes and merges himself. Read-only commands (`git status`,
> `git diff`, `git log`, `git show`) are always fine.

**The visual design is not decided yet.** Phase 0 is a design exploration
where you build three different directions and the owner picks one. Do not
start phase 1 until the owner has chosen and section 6 has been filled in.

---

## 1. Context

Owner: Pero Grubač, backend developer (Banja Luka, BiH). Java/Spring Boot,
C#/.NET, Python/FastAPI. Open to freelance work.

The current site is a single long page. It lists every project with its
description, bullets, tags and links. It has become crowded: the backend
work, which is the owner's professional identity, is visually outweighed by
the long run of small browser apps, games and side projects.

### Goals

1. A visitor understands "backend developer who builds distributed systems"
   within the first screen.
2. Every project stays on the site, but the home page reads in under a
   minute. Detail is revealed on demand, never shown all at once.
3. Adding a new project means adding one content file, nothing else.
4. Live browser apps get their own gallery page where they can be visual.
5. The site looks good. The owner decides what "good" means in phase 0.
6. Fast, accessible, no tracking.

### Non-goals

- No blog, no CMS, no backend, no analytics.

---

## 2. Hard constraints

- Hosting: GitHub Pages **user site** (`pero-grubac.github.io` repo).
- Other repos are already served as project pages under this domain:
  `/arcane-keep/`, `/devkit/`, `/github-dashboard/`, `/dev-timeline/`,
  `/countdown/`, `/catan-map-generator/`, `/excuse-generator/`,
  `/sedmica/`, `/lora-score-table/`, `/yamb-table/`, `/brick-breaker/`,
  `/Monte-Carlo-based-Pi-Calculator-py/` (paths are case-sensitive).
  **Never create a route with any of these names.** All new routes live
  under `/`, `/apps/`, `/projects/<slug>/` and `/404`. RepoHealth is the
  one live app hosted elsewhere (Vercel), so it has no subpath here.
- Reuse every existing image and video under `/assets/` (paths listed in
  section 5). Do not delete `/assets/` or `assets/og-card.png`. Since
  phase 2 the project screenshots live in `src/assets/` (same sub-paths)
  so Astro can optimize them; `public/assets/` keeps `og-card.png`,
  `avatar.jpeg`, the favicons and the demo videos at their old URLs.
- **Video rule.** Systems show their `demo.webp` still by default.
  `demo.mp4` plays only on user action: hover on devices that can hover,
  click/tap everywhere (and a real play button for keyboard users). Use
  `preload="none"` with the still as the poster. Never autoplay on page
  load. No window frame or other chrome around videos.
- Keep the email, GitHub and LinkedIn links exactly as they are now.
- Lighthouse targets on the home page (mobile): Performance ≥ 95,
  Accessibility 100, Best Practices 100, SEO 100.
- Keep shipped JS on the home page small (target under 15 kB gzipped,
  unless the chosen direction needs more and the owner agrees).

---

## 3. Tech stack

- **Astro** (current stable; check with `npm view astro version`), static
  output, TypeScript strict. Pinned to **7.3.8** on 2026-10-24 (owner's
  call): 7.4 needs Node ≥ 22.23.4 and the owner's machine runs 22.18.0.
  Move to the latest 7.x once Node is updated. TypeScript stays on 6.x
  until `@astrojs/check` supports 7.
- **Content collections** with a Zod schema for projects (section 5).
  One Markdown file per project in `src/content/projects/`.
- Styling: plain CSS with custom properties by default. If the chosen
  design direction is much easier with Tailwind, propose it in the phase 0
  summary and let the owner decide.
- Interactivity as small vanilla TypeScript scripts inside Astro
  components. Add a framework island only if the chosen direction truly
  needs it.
- Fonts self-hosted via `@fontsource` packages (no runtime request to
  Google Fonts). Which fonts: decided in phase 0.
- Icons: no icon library and no `astro-icon`. The chosen direction
  (Journal) uses text glyphs for arrows: ↗ external, → onward, ↑ to a
  section above, ▶ play (see 6.4).
- Deploy: GitHub Actions with the official `withastro/action`, Pages
  source set to "GitHub Actions".
- `@astrojs/sitemap` for the sitemap.

Before installing anything, check current package names and versions on
npm. If a package above is deprecated, pick its documented successor and
note the change in the commit message.

---

## 4. Information architecture

```
/                       Home: hero, about, systems, all projects, contact
/apps/                  Gallery of every live app (kind: live)
/projects/<slug>/       Case study page (only for projects with caseStudy: true)
/404                    Not found
```

Navigation must give access to: home sections (projects, contact), `/apps/`,
the command palette, and the theme toggle (if the chosen direction has
two themes). Exact look is decided in phase 0.

---

## 5. Content model

### Schema (`src/content.config.ts`)

```ts
kind:        'system' | 'live' | 'web' | 'mobile' | 'desktop' | 'tool'
title:       string
slug:        string                 // kebab-case, unique
summary:     string                 // one sentence, max ~70 chars
description?: string                // one paragraph (the current site's text);
                                    // required for systems, shown in the
                                    // expanded view for everything else
flow?:       string                 // architecture one-liner, systems only;
                                    // no counts, each technology once
highlights:  string[]               // 2–5 short bullets, shown when expanded;
                                    // systems have none on the current site
stack:       string[]               // display names, e.g. "Spring Boot"
links: {
  live?:     string                 // absolute or root-relative URL
  repos:     { label: string; url: string }[]  // empty when the repo is private
  apk?:      string                 // Android download (latest GitHub release)
  privateRepo?: boolean             // true → show "Private repo" where
                                    // "Source" would be
}
image?:      image()                // relative to the project file, e.g.
                                    // ../../assets/live/devkit.webp
                                    // (a file in src/assets/)
imageAlt?:   string
video?:      string                 // public URL, e.g. /assets/chatroom/demo.mp4
                                    // (a file in public/assets/), systems
                                    // only; follows the video rule in section 2
commands?:   { cmd: string; text: string }[]  // slash commands (8.4)
featured:    boolean                // true only for kind 'system'
caseStudy:   boolean                // generates /projects/<slug>/
order:       number                 // position in the "All" list; every
                                    // filtered view keeps the same order
year?:       number                 // creation year if known from GitHub
```

Repo `label`: the part name when a project has several repos (`Backend`,
`Frontend`, `Management`), otherwise `Source`.

The file is named after the slug (`src/content/projects/<slug>.md`). The
schema is strict (unknown fields fail) and enforces what the pages rely
on, so **`astro build` fails on an invalid project file**:

- `summary` is one sentence of at most 75 characters.
- `featured` is true exactly for `system`. Systems need `description`,
  `flow` and `image`. Other kinds need 2–5 `highlights` and can't have
  `flow` or `video`.
- `links.live` is present exactly for `live`; `apk` only for `mobile`.
  Either `repos` is non-empty, or it's empty and `privateRepo: true`. A
  single repo is labelled `Source`; with several, none is.
- `image` and `imageAlt` come together, and the image file must exist.
  Without an image, `commands` is required (8.4). A `video` file must
  exist under `public/`.
- `flow` and `stack`: no counts next to a technology, each technology
  once (section 11). Repo and APK URLs are under
  `github.com/pero-grubac/`.
- Across files: every `order` is used once.

`npm run check:links` fetches every `live`, repo and `apk` URL (root-relative
app paths on `https://pero-grubac.github.io`), follows redirects and fails
unless each ends in 200. It hits the network, so it isn't part of CI.

Markdown body = long-form case study text (only rendered when
`caseStudy: true`). Leave the body empty for now; the owner will write it.

**Counts are never hard-coded.** Every number shown about the content
(filter counts, the apps teaser, the number of systems or projects, JSON-LD
lists) is computed from the collection at build time.

### Kind rule (how to classify a project)

Each project has exactly one `kind`, decided by what a visitor can do with
it, in this order of precedence:

1. Shown mainly for its architecture and code → `system`
2. Opens and runs in a browser at a live URL → `live`
3. A web project with no live demo (you run the server yourself) → `web`
4. Installs on a phone → `mobile`
5. Runs locally on a desktop → `desktop`
6. Anything else (bots, integrations, CLIs) → `tool`

Technologies are never categories. They go in `stack` and are searchable.

### Inventory (migrate all of these)

Take titles, descriptions, highlights, stack and image alts from the
current `index.html`, and `flow` from the table in the notes below. Write `summary` as one sentence of max ~70 chars,
shortened from the current text (no new facts). Row order is `order`: the
current order of the site, serious work first, games and score tables
last. Systems use the `demo.webp` stills; the old `demo.png` paths never
existed.

| order | slug | title | kind | featured | caseStudy | image | video | live | repos | apk | privateRepo |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | incident-alert | Incident Alert | system | ✓ | ✓ | /assets/incident_alert/demo.webp | /assets/incident_alert/demo.mp4 | – | IncidentAlert (Backend), IncidentAlertFrontend (Frontend), IncidentAlertFrontend-Mangement (Management) | – | – |
| 2 | e-mobility-hub | eMobilityHub | system | ✓ | ✓ | /assets/e-mobility-hub/demo.webp | /assets/e-mobility-hub/demo.mp4 | – | e-Mobility-Hub | – | – |
| 3 | chat-room | Chat Room | system | ✓ | ✓ | /assets/chatroom/demo.webp | /assets/chatroom/demo.mp4 | – | Chat-room | – | – |
| 4 | online-library-system | Online Library System | system | ✓ | ✓ | /assets/library/demo.webp | /assets/library/demo.mp4 | – | Online-Library-System | – | – |
| 5 | repohealth | RepoHealth | live | | | /assets/live/repository-health-monitor.webp | – | https://repository-health-monitor.vercel.app/ | – | – | ✓ |
| 6 | fitforge | FitForge | mobile | | | /assets/fitforge/preview.webp | – | – | fit_forge | fit_forge/releases/latest | – |
| 7 | store-chain-management | Store Chain Management | desktop | | | /assets/store_chain/preview.webp | – | – | Store-Chain-Management-System | – | – |
| 8 | etf-oglasi | ETF Oglasi | mobile | | | /assets/etf_oglasi/preview.webp | – | – | ETFOglasi | ETFOglasi/releases/latest | – |
| 9 | store-management | Store Management | desktop | | | /assets/store_management/preview.webp | – | – | Store-Management-System | – | – |
| 10 | asset-manager | AssetManager | mobile | | | /assets/asset_manager/preview.webp | – | – | AssetManager | – | – |
| 11 | devkit | DevKit | live | | | /assets/live/devkit.webp | – | /devkit/ | devkit | – | – |
| 12 | catan-map-generator | Catan Map Generator | live | | | /assets/live/catan-map-generator.webp | – | /catan-map-generator/ | catan-map-generator | – | – |
| 13 | minimal-blog | Minimal Blog | web | | | /assets/minimal_blog/preview.webp | – | – | Minimal-blog | – | – |
| 14 | countdown | Countdown | live | | | /assets/live/countdown.webp | – | /countdown/ | countdown | – | – |
| 15 | dev-timeline | Dev Timeline | live | | | /assets/live/dev-timeline.webp | – | /dev-timeline/ | dev-timeline | – | – |
| 16 | brick-breaker | Brick Breaker | live | | | /assets/live/brick-breaker.webp | – | /brick-breaker/ | brick-breaker | – | – |
| 17 | snake | Snake (Blavor) | desktop | | | /assets/snake/preview.webp | – | – | Snake | – | – |
| 18 | arcane-keep | Arcane Keep | live | | | /assets/live/arcane-keep.webp | – | /arcane-keep/ | arcane-keep | – | – |
| 19 | monte-carlo-pi-python | Monte Carlo π · Python | live | | | /assets/live/Monte-Carlo-based-Pi-Calculator-py.webp | – | /Monte-Carlo-based-Pi-Calculator-py/ | Monte-Carlo-based-Pi-Calculator-py | – | – |
| 20 | anova | ANOVA | desktop | | | /assets/anova/preview.webp | – | – | ANOVA-Application | – | – |
| 21 | monte-carlo-pi | Monte Carlo π | desktop | | | /assets/monte_carlo/preview.webp | – | – | Monte-Carlo-based-Pi-Calculator | – | – |
| 22 | echo-player | Echo Player | desktop | | | /assets/echo_player/preview.webp | – | – | Echo-player | – | – |
| 23 | secure-repository | Secure Repository | tool | | | /assets/secure_repository/preview.webp | – | – | Secure-Repository | – | – |
| 24 | e-mobility-rental | e-Mobility Rental | desktop | | | /assets/emobility_rental/preview.webp | – | – | e-Mobility-Rental-System | – | – |
| 25 | git-discord-bot | GitHub Discord Bot | tool | | | none (see 8.4) | – | – | git-discord-bot | – | – |
| 26 | github-dashboard | GitHub Dashboard | live | | | /assets/live/github-dashboard.webp | – | /github-dashboard/ | github-dashboard | – | – |
| 27 | yamb-table | Yamb Table | live | | | /assets/live/yamb-table.webp | – | /yamb-table/ | yamb-table | – | – |
| 28 | sedmica | Sedmica | live | | | /assets/live/sedmica.webp | – | /sedmica/ | sedmica | – | – |
| 29 | lora-score-table | Lora Score Table | live | | | /assets/live/lora-score-table.webp | – | /lora-score-table/ | lora-score-table | – | – |
| 30 | excuse-generator | excuse.exe | live | | | /assets/live/excuse-generator.webp | – | /excuse-generator/ | excuse-generator | – | – |

All repos and APK links are under `https://github.com/pero-grubac/`.
Verify every link returns 200 before finishing phase 2.

The `image` paths in the table are the old URLs. Since phase 2 those
files are in `src/assets/` under the same sub-path (Astro's `<Image>` only
optimizes images under `src/`, see 10.6), and the project files point to
them relatively. Videos, `og-card.png` and `avatar.jpeg` stay in
`public/assets/` at their old URLs.

`year` is the GitHub creation year of the project's repo (the earliest
one when there are several). RepoHealth has none: its repo is private
(`TODO(owner)` in its file).

Notes:

- Live app screenshots have `alt=""` on the current site (they sat inside
  a link that already carried the name). Write a real `imageAlt` for each
  in phase 2 from what the screenshot shows, and list them in the phase
  summary so the owner can check them.
- RepoHealth's repo is private and must stay private: `repos: []`,
  `privateRepo: true`. Never ask for or invent a GitHub link, and **never
  link to the repo anywhere**: not in the index, `/apps/`, the command
  palette, JSON-LD (no `codeRepository` for it) or the sitemap. Only the
  live Vercel URL is public. A "Private repo" label without a link is
  fine.
- `flow` strings differ from the current site: no counts next to
  technologies ("2 × PostgreSQL", "4 ASP.NET services") and each
  technology once. Use these:

  | slug | flow |
  |---|---|
  | incident-alert | React apps → ASP.NET services ⇄ RabbitMQ + PostgreSQL |
  | e-mobility-hub | Angular → Nginx → Spring Boot API + JSP apps → MySQL |
  | chat-room | React → Nginx → Spring Boot (WAF · SIEM) → MySQL |
  | online-library-system | Java apps ⇄ REST · TCP/TLS · multicast · MQ · RMI + Redis |

---

## 6. Design system

**Direction: B, "Journal"** (picked by the owner on 2026-10-24).
**Status: approved by the owner on 2026-10-24**, with the colophon
contact (6.7). The prototype
`design-explorations/direction-b/` is the visual reference; where the two
disagree, this section wins. The decisions are in 6.1–6.9, after the
exploration brief.

### 6.0 Design exploration brief (phase 0)

Build **three** standalone prototypes of the home page:

```
design-explorations/
  direction-a/index.html
  direction-b/index.html
  direction-c/index.html
  README.md        one paragraph per direction: concept, palette, fonts
```

Each prototype:

- Is a single self-contained HTML file (inline CSS and JS, fonts from a
  CDN are fine here since these are throwaway).
- Uses **real content**: the real hero text, about text, the systems and
  every other project from section 5, the apps teaser and contact. No
  lorem ipsum. Images and videos from `/assets/` via relative paths.
- Implements the functional requirements of section 7 at prototype level:
  projects collapsed by default, filter by kind, search, detail on demand.
  Counts are computed from the data, and videos follow the video rule in
  section 2.
- Works at 360px and at 1440px wide.

The three directions must be **genuinely different** from each other in
all of these: color and theme (light vs dark vs something else),
typography, overall layout concept, and how the project list is presented
(e.g. dense list, compact grid, sidebar index, tabs, bento, timeline...).
Do not make three variations of the same idea.

References: if a `design-references/` folder exists in the repo, read every
image and note in it first. **At least one direction must follow those
references closely**; the other two can explore freely. If the folder is
empty or missing, ask the owner whether they have references before
starting.

The owner has no references (answered 2026-10-24). Instead, all three
directions follow his earlier feedback, and explore freely beyond it:

- No macOS look: no traffic-light window dots anywhere. Where a window or
  terminal frame appears, it is Windows Terminal / Windows 11 style (thin
  minimize, maximize and close glyphs, monochrome, close turns red on
  hover).
- The about photo is a real `<img>` of `/assets/avatar.jpeg`, not initials.
- The background keeps some visual interest below the hero instead of a
  flat colour for the rest of the page.
- No frame around the demo videos (see the video rule in section 2).

Avoid generic defaults unless a reference asks for them: identical rounded
cards with soft shadows everywhere, gradient blobs, all-caps eyebrow labels
above every heading, numbered "01 / 02" markers on non-sequential content,
fade-in-on-scroll on every section.

When done: list the three directions in two sentences each, tell the owner
how to open them (`npx serve design-explorations` or similar), and **stop**.
The owner may pick one, or combine parts ("layout from A, colors from C").
Then fill in section 6 and wait for approval.

### 6.1 Principles

1. **Set like a printed page.** Paper, ink, rules and type carry the
   design: no cards with shadows, no gradients, no icons where a word
   works. Lines are the structure: a double rule opens a section,
   hairlines separate, dotted leaders join a name to its kind.
2. **Serif speaks, sans labels.** Everything a visitor reads (names,
   headings, prose, project titles) is Newsreader. Instrument Sans is only
   for small labels, navigation, buttons, captions and metadata.
3. **Backend first, then the index.** Systems are magazine features
   (headline, dek, architecture line, text, full-width figure).
   Everything else is a one-line index entry that opens on demand.
4. **One accent, used for meaning.** Oxblood marks what you can act on or
   what is selected (links in lists, the open entry, flow arrows,
   "Available"), never decoration.
5. **Nothing moves on its own.** Motion only follows a user action
   (opening an entry, playing a video, a toast).

### 6.2 Colour

One light theme: `color-scheme: light`, a single `theme-color`
`#f4f0e6`, no theme toggle. So navigation has no toggle, the palette has
no "Toggle theme" entry, and the footer has no `t` hint (sections 4, 7.7
and 8.3 apply "if there is a toggle").

| token | value | use | contrast on paper |
|---|---|---|---|
| `--paper` | `#f4f0e6` | page background (with grain) | — |
| `--paper-deep` | `#ebe5d6` | media placeholders, hover fill, selected palette row | — |
| `--card` | `#faf7f0` | reader pane, palette, system entries in the index, Copy button | — |
| `--ink` | `#1c1a16` | text, headings, double rules, pressed filter | 15.3 : 1 |
| `--ink-soft` | `#3d3a33` | standfirst, deks, summaries, secondary text | 10.0 : 1 |
| `--muted` | `#6a6457` | labels, captions, kinds, footer | 5.2 : 1 (4.7 on `--paper-deep`, the lowest allowed) |
| `--accent` | `#a4321f` | links in lists, selected entry, flow arrows, status | 6.0 : 1 |
| `--rule` | `#cdc4b0` | hairlines, borders (never text) | — |
| `--rule-soft` | `#ddd5c3` | row separators (never text) | — |

Text on `--ink` or `--accent` fills is `--paper` (15.3 : 1 and 6.0 : 1).
Grain: an inline SVG `feTurbulence` noise as a data URI (~9% alpha,
240px tile) on `body`, under everything, so the page keeps texture below
the hero. It must never lower text contrast.

### 6.3 Typography

- **Newsreader Variable** (`@fontsource-variable/newsreader`, `opsz.css`
  and `opsz-italic.css`: optical size 6–72 and weight axes). Family
  name in CSS: `"Newsreader Variable"`.
- **Instrument Sans Variable** (`@fontsource-variable/instrument-sans`,
  weight 400–700). Family name: `"Instrument Sans Variable"`.
- Subsets: latin + latin-ext only. Preload only the Newsreader roman
  latin file (h1 and body text). `font-display: swap`.
- Stacks: `--serif: "Newsreader Variable", Georgia, "Times New Roman",
  serif`; `--sans: "Instrument Sans Variable", "Segoe UI", system-ui,
  sans-serif`. No web mono font: the Discord command block uses
  `ui-monospace, Consolas, monospace`.

| role | font | size | line height | weight / style |
|---|---|---|---|---|
| Display (h1) | serif, opsz 72 | `clamp(3.4rem, 12vw, 9.4rem)` | 0.92 | 400, tracking −0.03em |
| Section (h2) | serif, opsz 72 | `clamp(2.2rem, 5vw, 3.6rem)` | 1.0 | 400, −0.02em |
| Feature title (h3, systems) | serif, opsz 60 | `clamp(2rem, 4vw, 2.9rem)` | 1.02 | 500, −0.015em |
| Standfirst (hero) | serif | `clamp(1.3rem, 2.6vw, 1.85rem)` | 1.35 | 300 italic |
| Dek / section intro | serif | 1.2–1.25rem | 1.4 | 400 italic |
| Index entry title (h3) | serif | 1.3rem | 1.25 | 500 |
| Body | serif | 1.125rem (18px) | 1.6 | 400, max 65ch |
| Small prose (summaries, highlights) | serif | 1rem | 1.6 | 400 |
| Label, nav, button | sans | 0.85–0.95rem | 1.4 | 500–600 |
| Caption, meta | sans | 0.8rem | 1.5 | 400–500 |

Counts in filters use old-style figures (`font-variant-numeric:
oldstyle-nums`).

### 6.4 Space, layout, radius, lines

- Spacing scale: `--s-1` 4px, `--s-2` 8, `--s-3` 12, `--s-4` 16,
  `--s-5` 24, `--s-6` 32, `--s-7` 48, `--s-8` 64, `--s-9` 96.
- Page: max width 1280px, side gutter `clamp(16px, 4vw, 48px)`, section
  padding `clamp(48px, 8vw, 96px)` top and bottom.
- Grid (12 columns): hero 8/4, about 8/4, system features 5/7 with a
  full-width figure, index 7/5 (list / reader), apps teaser 4/8,
  colophon 5/7.
- Breakpoints: 720px (masthead links wrap to a second row), 760 (about
  text in two columns), 900 (features split), 980 (reader pane appears),
  1000 (hero and about split).
- Radius: 0 for images, panels, reader and palette; 3px for `kbd` and
  filter buttons; 999px only for pill buttons (Search, Copy, Play demo).
- Lines: `3px double var(--ink)` opens a section; 1px `--rule`
  hairlines; 1px `--rule-soft` row separators; 1px dotted `--muted`
  leaders. The only shadow is the palette's print offset
  `8px 8px 0 var(--rule)`.
- Images: system figures 16:9 (`object-fit: cover`, top aligned),
  portrait 4:5 (`sepia(.12)`), apps teaser 4:3, reader thumbnails at
  their own ratio with a 1px `--rule` border. Videos follow the video
  rule (section 2): no frame.
- Icons: no icon library. Arrows are text glyphs: ↗ external, → onward,
  ↑ to a section above, ▶ play.

### 6.5 Motion

- Nothing animates on scroll or on load, and nothing autoplays.
- Allowed: the video fades in (0.25s) when the user plays it; the toast
  fades and slides (0.2s); in-page links scroll smoothly.
- `prefers-reduced-motion`: no transitions or animations, instant
  scrolling, and hovering does not start a video (click or tap still
  does).

### 6.6 Components

- **Masthead**: sticky, paper at 94% with a light blur, 1px bottom rule.
  Italic serif wordmark, sans section links, a "Search ⌘K" pill that
  opens the command palette.
- **Hero**: sans dateline (place and languages) → h1 → italic standfirst
  → byline links ("Available for freelance projects" in accent with a
  dot, systems, GitHub, LinkedIn). Right column: "In this portfolio", a
  contents list with dotted leaders and computed counts.
- **About**: text in two columns with a column rule, no drop cap; 4:5
  portrait with a caption. Stack as three label/value rows of underlined
  serif terms; terms no project matches are plain text (7.2).
- **System feature**: h3, italic dek, "Architecture" flow line (arrows
  in accent) | description, "Built with …" line, links ("Read the case
  study →" in accent, then Source links); full-width figure underneath
  with a "▶ Play demo" pill.
- **Index**: "Find in the index" input with a 2px ink underline; "Show"
  filter buttons (pressed = ink fill); entries `title …… kind [Open ↗]`
  with the summary below. While searching, matching systems sit on top
  on `--card` with an ↑. The open entry gets a 3px accent bar; its
  details show in the sticky reader pane from 980px, inline below that.
- **Apps teaser**: double rules above and below, a large light numeral
  (computed count), three captioned screenshots, "Browse the apps →".
- **Footer**: a colophon line, "© {year} Pero Grubač. Set in Newsreader
  and Instrument Sans.", plus `/` and `⌘K` hints.
- **Palette**: `--card` panel, italic serif input over a 2px ink rule,
  selected row on `--paper-deep` with the label in accent.
- **Toast**: ink pill with paper text, bottom centre.
- **Focus**: 2px solid accent outline with 3px offset; list rows show it
  around the whole row.

### 6.7 Contact: colophon

A quiet magazine colophon instead of a big call to action. No double
rule: the block sits between two 1px ink rules. On the left (5/12) the
h2 "Let's work together" (serif 400, `clamp(1.8rem, 3.4vw, 2.4rem)`) and
the freelance line in italic. On the right (7/12) a label/value list
(`dl`), sans labels in `--muted`, serif values at 1.05rem, hairlines
between rows:

| label | value |
|---|---|
| Email | the address as a normal-size link, then a small "Copy" pill (shows "Copied" for 2s) |
| GitHub | `github.com/pero-grubac` (link) |
| LinkedIn | `linkedin.com/in/perogrubac` (link) |
| Based in | Banja Luka, Bosnia and Herzegovina |

Below 900px the two halves stack; below 480px each label sits above its
value.

### 6.8 Other pages

- **/apps/**: same masthead and footer; h1 "Browser apps" and an italic
  intro; a grid of figures (4:3 screenshot, serif title, summary, "Built
  with …", "Open" and "Source" or "Private repo"); the same "Find"
  search on top.
- **Case study**: an article: sans breadcrumb, h1 title, italic dek
  (summary), "Architecture" flow line with `TODO(owner)` for a diagram,
  full-width figure, body at 65ch, then "Previous system / Next system".
- **404**: display serif "This page doesn't exist.", one italic line,
  links to Home and Browser apps.
- **OG images** (1200×630): flat paper background, name in small sans at
  the top, the title in Newsreader display, the flow line or summary in
  italic below, a double rule.
- **Favicon**: an italic Newsreader "pg" in ink on paper.

### 6.9 Budget and tooling

Plain CSS with custom properties (no Tailwind) and small vanilla scripts
(no framework island). The prototype's page script (search, filters,
hash, details, palette, copy, video) is about 4.5 kB gzipped, well under
the 15 kB budget.

---

## 7. Home page (`/`) — functional requirements

The look and order of elements follow the chosen direction. The following
behaviour is required regardless of the look.

### 7.1 Hero

- `h1`: "Pero Grubač".
- One line that makes the backend focus clear, based on: "Backend
  developer in Banja Luka. I build services that talk to each other over
  queues, sockets and REST." (the direction may rephrase).
- "Available for freelance projects" status linking to `#contact`.
- Links to the systems section, GitHub and LinkedIn.
- Any hero visual (illustration, diagram, screenshot, none) is decided in
  phase 0.

### 7.2 About

Short text from the current About section (keep the facts: Software
Engineering graduate from Trebinje, based in Banja Luka, distributed
systems with RabbitMQ and Docker, open to freelance). Photo
`/assets/avatar.jpeg`.

Stack (Languages / Frameworks / Infrastructure). Clicking an item sets the
project search to that term and scrolls to the projects. An item that no
project matches (computed at build time with the same matching as the
search; today FastAPI and GCP) is plain, non-clickable text.

### 7.3 Systems

The `featured` projects get the most visual weight on the page: title,
`flow` string, one-paragraph `description`, stack, screenshot (the still;
the demo video plays only on user action, see the video rule in section 2),
links to repos, and "Read the case study" → `/projects/<slug>/`.

### 7.4 All projects (`#projects`)

All non-featured projects, compact by default. This is the core fix for
the crowding.

- Filter by kind with counts computed from content: `All {n}`,
  `Live {n}`, `Web {n}`, `Mobile {n}`, `Desktop {n}`, `Tool {n}`. A kind
  with no projects gets no button. Never type a count by hand.
- Search input focused by `/`, matching title, summary and stack,
  case-insensitive. Search covers **all** projects, including the
  systems: while a query is active, matching systems join the list,
  listed first, marked `system` and linking to their entry in the systems
  section (they are not in the list when the search is empty). `All {n}`
  counts them; the kind filters don't. There is no separate "matching
  systems" line.
- Filter and search state mirrored in the URL hash (e.g.
  `#projects?kind=live&q=react`) and restored on load.
- Collapsed item shows at most: title, one-line summary, kind, optionally
  a thumbnail, and for live apps a one-click "Open" link (new tab,
  accessible name "Open {title}"), so a visitor can launch an app without
  expanding it.
- Details on demand (inline expand, drawer or modal; the direction
  decides): description, highlights, stack, "Open app" (live only),
  "Download APK" (when `apk` is set), "Source" per repo or a "Private repo"
  label. `Esc` closes. Only one open at a time.
- Never show the same sentence twice. Where the `description` is barely
  longer than the `summary` (today FitForge, Store Management, ETF Oglasi
  and AssetManager), the details don't repeat it under the summary.
- Empty search: "No project matches “{query}”." plus a "Clear search"
  button.

### 7.5 Apps teaser

A small block linking to `/apps/` with a few screenshots and the text
"{n} browser apps you can open right now" (or the direction's wording),
where `{n}` is the number of `live` projects.

### 7.6 Contact (`#contact`)

"Let's work together", one line about freelance work, email with a "Copy"
button (shows "Copied" for 2s), GitHub and LinkedIn links.

### 7.7 Footer

"© {current year} Pero Grubač" and keyboard hints (`/` search,
`⌘K` commands, `t` theme if there is a toggle).

---

## 8. Other pages and components

### 8.1 `/apps/`

Visual gallery of every `live` project: screenshot, title, summary, stack,
and two separate links, "Open" and "Source" ("Private repo" label instead
of "Source" when `privateRepo` is set). Same search component as the home
page. Styled in the chosen direction.

### 8.2 `/projects/<slug>/` (case study)

Generated only for `caseStudy: true`:

1. Breadcrumb back to the projects.
2. Title, summary, repo links.
3. Architecture: render the `flow` string; leave `TODO(owner)` for a proper
   diagram later.
4. Screenshot.
5. Markdown body. If empty, show the `description`, any highlights, and a
   note "Case study in progress." (no lorem ipsum).
6. Prev/next links to the other systems.

### 8.3 Command palette

Port the existing `Ctrl K` palette:
- Opens with `⌘K` / `Ctrl K`, closes with `Esc`, focus trapped, native
  `<dialog>`.
- Lists sections, `/apps/`, every project (opens live URL, case study, or
  its detail view), "Toggle theme", "Copy email".
- `↑ ↓` to move, `Enter` to run, fuzzy match on title and stack.

### 8.4 Discord bot (no screenshot)

`git-discord-bot` has no image. Wherever an image would appear, render its
slash-command list (the `commands` field) as a small code-style block. The
list, from the current site:

| command | what it does |
|---|---|
| `/add` | create an issue |
| `/done` | close an issue |
| `/list` | open issues across repos |
| `/today` | issues created today |
| `/stale` | open issues older than 14 days |
| `/streak` | commit streak |
| `/stats` | commits & issues by period |
| `/top-repo` | most active repo this month |

### 8.5 404

"This page doesn't exist." plus links to Home and Apps, in the chosen
direction's style.

---

## 9. Accessibility

- Semantic landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page.
- Clearly visible focus style on every interactive element.
- Expandable items use `<button aria-expanded aria-controls>`; drawers and
  modals use `<dialog>` with focus management.
- Filter controls are toggle buttons with `aria-pressed`.
- Search input has a label announced by screen readers.
- All images have meaningful `alt` (`imageAlt` in each project file:
  from the current site where it had one, written from the screenshot in
  phase 2 where it didn't).
- Text contrast meets WCAG AA in every theme.
- `prefers-reduced-motion` respected everywhere.
- Keyboard shortcuts don't fire while typing in an input.

---

## 10. SEO

Build one reusable `<Seo>` component used by every page. It takes
`title`, `description`, `image`, `imageAlt`, `type`, `noindex` and
`jsonLd`, and renders everything below. No page writes meta tags by hand.

### 10.1 Meta tags (every page)

- `<html lang="en">`, `<meta charset>`, viewport, `theme-color` (one per
  theme with `media="(prefers-color-scheme: …)"`).
- `<title>`: 50–60 characters, unique per page, pattern
  "{Page} | Pero Grubač". Home keeps the current title
  "Pero Grubač | Backend Developer".
- `<meta name="description">`: 140–160 characters, unique per page,
  written for humans (what the visitor will find), not stuffed with
  keywords. Home keeps the current description.
- `<link rel="canonical">` with the absolute URL, trailing slash style
  consistent with Astro's `trailingSlash` setting (pick `always` and use it
  everywhere: internal links, sitemap, canonical).
- `<meta name="author" content="Pero Grubač">`.
- Open Graph: `og:title`, `og:description`, `og:url`, `og:type`
  (`website` for home and /apps/, `article` for case studies),
  `og:image` (absolute URL, 1200×630), `og:image:alt`,
  `og:image:width/height`, `og:site_name`, `og:locale` `en_US`.
- Twitter: `summary_large_image` card with title, description, image,
  image alt.
- Optional `google-site-verification` meta, read from an env variable;
  leave a `TODO(owner)` if not set.

### 10.2 Social images

- Home keeps `/assets/og-card.png`.
- `/apps/` and every case study page get their own 1200×630 OG image,
  generated at build time (e.g. with `satori` + `@resvg/resvg-js` or the
  current Astro-recommended approach) using the chosen design: project
  title, flow string or summary, name. Fall back to `og-card.png` if
  generation fails.

### 10.3 Structured data (JSON-LD)

- Home: `Person` (name, jobTitle "Backend Developer", url, image
  `/assets/avatar.jpeg`, email, sameAs GitHub + LinkedIn, address
  locality Banja Luka, country BA, knowsAbout = main stack) and `WebSite`
  (name, url, author).
- Home: `ItemList` of the featured systems linking to their case
  studies.
- `/apps/`: `ItemList` of `SoftwareApplication` entries (name, url,
  applicationCategory, operatingSystem "Web browser", description,
  author).
- Case studies: `SoftwareSourceCode` (name, description,
  codeRepository, programmingLanguage, author) and `BreadcrumbList`.
- Validate every page with the Schema.org validator before phase 5 is done.

### 10.4 Crawling and indexing

- `@astrojs/sitemap` with `site` set to `https://pero-grubac.github.io`.
  Exclude `/404`. Include `lastmod`.
- `robots.txt` allowing everything and pointing to the sitemap.
- `404` page has `noindex`.
- `legacy/` and `design-explorations/` must never be deployed. Exclude
  them from the build output; if any of it ends up public, add `noindex`.
- No orphan pages: every case study is linked from the home page, from the
  command palette, and from prev/next links.

### 10.5 Content and markup

- Exactly one `h1` per page, logical heading order without skipping
  levels.
- Project titles are real headings (`h3` under the section `h2`), not
  styled `div`s, so search engines can read the structure.
- Descriptive link text ("Source code for FitForge" as accessible name,
  even if the visible text is "Source").
- Every image has a meaningful `alt`; decorative images use `alt=""`.
- Collapsed project details must still be in the HTML (hidden with
  `hidden`/`aria-expanded`, not loaded by JS later) so they are indexed.

### 10.6 Performance (Core Web Vitals)

- Use Astro's `<Image>` / `<Picture>` for every image: AVIF/WebP output,
  explicit `width`/`height` (no layout shift), `loading="lazy"` for
  everything below the fold.
- The largest image above the fold gets `loading="eager"` and
  `fetchpriority="high"`.
- Preload only the primary font file(s) used above the fold, with
  `font-display: swap`. Subset to Latin + Latin Extended (needed for
  "č", "ć", "š", "ž", "đ").
- No render-blocking third-party resources.
- Demo videos follow the video rule in section 2 (`preload="none"`, still
  as poster), so they add nothing to the initial page load.
- Targets on mobile: LCP < 2.0 s, CLS < 0.05, INP < 200 ms.

### 10.7 Favicons and manifest

- `favicon.svg`, `favicon.ico` (32×32), `apple-touch-icon.png` (180×180),
  `site.webmanifest` with name, short_name, theme and background color.
- Generate them from a simple monogram in the chosen design if none exist.

### 10.8 After launch (tell the owner, don't do it yourself)

In the phase 6 summary, list these as steps for the owner: add the site to
Google Search Console, submit the sitemap, request indexing for the home
page, and add the portfolio URL to the GitHub profile, LinkedIn and
Upwork profile.

---

## 11. Copy rules

- Plain, specific, active voice. Say what the thing does, not how
  impressive it is.
- Buttons and links say what happens: "Open app", "Source",
  "Read the case study", "Copy email".
- No "simply", "seamless", "cutting-edge", "passionate".
- No exclamation marks.
- Never show a count next to a technology ("2× PostgreSQL"), and list
  each technology once wherever technologies are listed (flow strings,
  stack lists). This applies only to those lists and architecture lines:
  counts inside sentences stay ("Four ASP.NET Core 10 services",
  "14 Playwright e2e tests").
- English only on the site.

---

## 12. Implementation phases

Each phase ends with a short summary of what changed, what's left, any
`TODO(owner)` items, and the commits made on `redesign` (see the git rule
at the top). **Stop after every phase and wait for the owner.**

**Phase 0: Design exploration**
- Follow section 6.0. Work on the `redesign` branch.
- Done when: three prototypes open in a browser, README describes them,
  owner has picked a direction and approved the filled-in section 6.

**Phase 1: Setup**
- Before touching anything, check that you are on `redesign` and the
  working tree is clean (commit pending work first).
- Create the Astro project. Move the current site files into `legacy/`
  (`git mv` or plain file moves); do not delete it until phase 6.
- Add design tokens from section 6, fonts, base layout, navigation,
  footer, theme handling with no flash on load.
- GitHub Actions deploy workflow (do not switch Pages source yet).
- Done when: `npm run build` passes and the empty layout matches the
  chosen prototype.

**Phase 2: Content**
- Schema + one project file per row of the inventory in section 5.
- Script `npm run check:links` that verifies every URL in content.
- Done when: build fails on an invalid project file, all links return 200.

**Phase 3: Home page**
- Everything in section 7, matching the chosen prototype.
- Done when: all requirements work at 360px and 1440px, keyboard only,
  and with reduced motion.

**Phase 4: Apps, case studies, 404**
- Sections 8.1, 8.2, 8.5.
- Done when: all routes build and none collides with section 2's list.

**Phase 5: Command palette, accessibility, SEO**
- Sections 8.3, 9, 10.
- Done when: Lighthouse targets in section 2 are met on home, /apps/ and
  one case study; every page has a unique title and description; JSON-LD
  validates; sitemap and robots.txt are correct; OG images render (check
  with an OG preview tool or by opening the image URLs).

**Phase 6: Launch**
- `deploy.yml` on `redesign` is already the Astro deploy (phase 1), and it
  only runs from `main`. So launching means merging `redesign` into
  `main`. Before that, have the owner check **Settings → Pages → Build and
  deployment → Source**: it must be "GitHub Actions". The old
  `deploy.yml` used `actions/deploy-pages`, so it most likely is, but the
  old README called the switch a one-time step. If it is still "Deploy from
  a branch", a merge would publish the repo root, which has no
  `index.html` any more. Give him step-by-step instructions to switch it
  if needed, then to merge and push (he does both himself).
- After he deploys, verify the live site, that every app subpath listed in
  section 2 (`/arcane-keep/` etc.) still loads, and that the RepoHealth
  link still opens.
- Remove `legacy/` and `design-explorations/` only after the owner
  confirms.
- Include the after-launch SEO steps from 10.8 in the summary.

---

## 13. Don't

- Don't commit anywhere but the `redesign` branch, and never commit to
  `main`. Don't push, merge, rebase, reset, or delete branches (see the
  git rule at the top).
- Don't start phase 1 before the owner picks a direction.
- Don't add analytics, cookies, or third-party scripts to the real site.
- Don't invent project facts. If something is missing, leave
  `TODO(owner)` and list it in the phase summary.
- Don't change the email, social links, or live app URLs.