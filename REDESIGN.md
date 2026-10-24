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
  section 5). Do not delete `/assets/` or `assets/og-card.png`.
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
  output, TypeScript strict.
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
- Icons: `astro-icon` with the Tabler set unless the chosen direction
  calls for something else.
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

### Schema (`src/content.config.ts` or the location the current Astro
version expects)

```ts
kind:        'system' | 'live' | 'web' | 'mobile' | 'desktop' | 'tool'
title:       string
slug:        string                 // kebab-case, unique
summary:     string                 // one sentence, max ~70 chars
description?: string                // one paragraph (the current site's text);
                                    // required for systems, shown in the
                                    // expanded view for everything else
flow?:       string                 // architecture one-liner, systems only
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
image?:      string                 // path under /assets/
imageAlt?:   string
video?:      string                 // path under /assets/, systems only;
                                    // follows the video rule in section 2
commands?:   { cmd: string; text: string }[]  // slash commands (8.4)
featured:    boolean                // true only for kind 'system'
caseStudy:   boolean                // generates /projects/<slug>/
order:       number                 // position in the "All" list; every
                                    // filtered view keeps the same order
year?:       number                 // creation year if known from GitHub
```

Repo `label`: the part name when a project has several repos (`Backend`,
`Frontend`, `Management`), otherwise `Source`.

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

Take titles, descriptions, highlights, stack, flow and image alts from the
current `index.html`. Write `summary` as one sentence of max ~70 chars,
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

Notes:

- Live app screenshots have `alt=""` on the current site (they sat inside
  a link that already carried the name). Write a real `imageAlt` for each
  in phase 2 from what the screenshot shows, and list them in the phase
  summary so the owner can check them.
- RepoHealth's repo is private and will never be public: `repos: []`,
  `privateRepo: true`. Never ask for or invent a GitHub link.

---

## 6. Design system

**To be filled in after phase 0.** Once the owner picks a direction, write
the decisions here (color tokens for each theme, typefaces and type scale,
spacing scale, radius, motion rules, and 3–5 principles that make the
direction what it is). Get the owner's OK on this section before phase 1.

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
project search to that term and scrolls to the projects.

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
  case-insensitive.
- Filter and search state mirrored in the URL hash (e.g.
  `#projects?kind=live&q=react`) and restored on load.
- Collapsed item shows at most: title, one-line summary, kind, and
  optionally a thumbnail.
- Details on demand (inline expand, drawer or modal; the direction
  decides): description, highlights, stack, "Open app" (live only),
  "Download APK" (when `apk` is set), "Source" per repo or a "Private repo"
  label. `Esc` closes. Only one open at a time.
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
- All images have meaningful `alt` (take from the current site).
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
- Give the owner step-by-step instructions to switch the Pages source to
  GitHub Actions in the repo settings (he does it and pushes himself).
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