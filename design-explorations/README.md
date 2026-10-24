# Design explorations (phase 0)

Three throwaway prototypes of the home page, built from the real content of
the current site. **The owner picked direction B (Journal)**; its design
system is written up in section 6 of `REDESIGN.md`. A and C stay here for
reference. None of this is deployed: the Astro build only outputs
`src/pages` and `public/`, and every prototype has
`<meta name="robots" content="noindex">`.

## How to open

The prototypes load project screenshots from `src/assets/` and the demo
videos and photo from `public/assets/` (relative `../../` paths), so serve
the **repo root**, not this folder:

```sh
node design-explorations/_scripts/serve.mjs   # http://127.0.0.1:8080/
```

Then open:

- http://127.0.0.1:8080/design-explorations/direction-a/
- http://127.0.0.1:8080/design-explorations/direction-b/
- http://127.0.0.1:8080/design-explorations/direction-c/

(`npx serve .` from the repo root works too. Opening the files directly
works, but "Copy email" needs `http://localhost` for the clipboard.)

## Direction A: Console

The whole page is one Windows Terminal window: a tab strip with the
sections as tabs, Windows caption buttons (minimise, maximise, close turns
red on hover), a dot-grid background that runs the length of the page, a
PowerShell prompt in the hero and a `Get-ChildItem .\systems` table that
lists the systems in the first screen. Projects are a dense
`Format-Table`-style list (Kind / Name / Summary, with dashed headers) that
expands inline into a `Format-List` view (Description : … Highlights : …).
Dark by default with a light theme on `t`, using the Windows Terminal
Campbell colours: near-black `#0c0c0c`, text `#cccccc`, cyan `#61d6d6` for
links and focus, green `#16c60c` for status and prompts, yellow `#f9f1a5`
for flow arrows and stack. Light theme: `#fafafa` with darkened versions of
the same accents. Fonts: **Cascadia Code** (Windows Terminal's own font)
for headings, tables and UI, **IBM Plex Sans** for running text.

## Direction B: Journal (chosen)

A printed long-form profile on warm paper with a grain texture. Big serif
name, an italic standfirst, and an "In this portfolio" contents box with
dotted leaders. The about text is set in two columns next to a 4:5
portrait. Each system is a magazine feature: headline and dek
with the architecture line on the left, the description on the right, and
the screenshot full width underneath. Projects are an "Index of projects"
with dotted leaders (title …… kind); on wide screens the selected entry
opens in a sticky reader pane beside the index, and on phones it expands
inline. Live apps have a one-click "Open" link in the index; while you
search, matching systems join the index at the top. Contact is a quiet
magazine colophon (the owner picked it over a letter-closing variant).
Light only: paper `#f4f0e6`, ink `#1c1a16`, muted `#6a6457`, one
accent, oxblood `#a4321f`, for links, flow arrows and the selected entry.
Fonts: **Newsreader** (display and text serif, optical sizes) and
**Instrument Sans** for labels, navigation and buttons.

## Direction C: Blueprint

The portfolio as a technical drawing sheet: blueprint blue with a fine and
a coarse grid all the way down, a fixed left rail with a monogram and a
small title block (it becomes a top bar on phones), and a dimension line
above the name in the hero. The hero has a small schematic of services
talking over REST, a socket and a queue (the dashed wires move unless
reduced motion is on) and a title block with name, role and location. Each
system is a drawing sheet whose `flow` string is drawn as boxes and wires.
Projects are a compact grid of tiles with screenshots tinted blue until
hover or focus; details open in a side drawer (`<dialog>`). Colours: blue
`#123a7c` / deep `#0c2a5e`, white ink `#f3f6ff`, muted `#a9bce6`, amber
`#ffd166` for actions, focus and wires. Fonts: **Archivo** (variable
width, condensed uppercase for headings) and **Martian Mono** for drawing
labels.

## What all three share

- Same content and order, taken from the old site (`legacy/index.html`). Every
  count (filters, apps teaser, contents box) is computed from the data.
- Search (`/` to focus) over title, summary and stack; filter by kind with
  live counts. The state is kept in the URL hash
  (`#projects?kind=live&q=react`) and restored on load. In A and C, a
  line under the filters links to matching systems; B lists them in the
  index instead (the chosen behaviour).
- Architecture lines show no counts next to technologies, and each
  technology appears once.
- Details on demand, one open at a time, `Esc` closes and focus returns to
  the project.
- Demo videos follow the video rule: the `demo.webp` still is shown, and
  `demo.mp4` is attached only when you hover (mouse, without reduced
  motion), click or tap. `preload="none"`, no frame around it.
- `Ctrl K` / `⌘K` command palette (sections, every project, copy email, and
  the theme toggle in A).
- "Copy" next to the email shows "Copied" for 2 s.
- Windows-style chrome only (A); no macOS dots anywhere. The about photo is
  the real `avatar.jpeg`.

Prototype stand-ins: "Read the case study" shows a note (those pages come
in phase 4), and the apps teaser links to `#projects?kind=live` instead of
`/apps/`. Live app screenshots use a placeholder alt ("Screenshot of …")
until real alts are written in phase 2.

## Regenerating

The pages are generated; don't edit the HTML by hand. The scripts live in
`_scripts/` and need only Node (and Playwright, already a dev dependency,
for the checks):

```sh
node design-explorations/_scripts/extract.mjs   # legacy/index.html → projects.raw.json
node design-explorations/_scripts/build.mjs     # projects.raw.json + templates → direction-*/index.html
node design-explorations/_scripts/check.mjs     # browser checks at 360 and 1440 px (all three, or: b)
```

`content.mjs` holds the shared data (slugs, short summaries, flow lines,
links), `core.js` the shared page script (search, filters, hash, details,
video, palette, copy), and `dir-a/b/c.mjs` one template each.
`check.mjs` starts its own server; on Windows it drives Edge
(`PW_CHANNEL` to change), and `SHOTS=<dir>` saves screenshots.

All six fonts exist as `@fontsource` packages for phase 1: A
`@fontsource-variable/cascadia-code` + `@fontsource/ibm-plex-sans`, B
`@fontsource-variable/newsreader` + `@fontsource-variable/instrument-sans`,
C `@fontsource-variable/archivo` + `@fontsource-variable/martian-mono`.
None of the directions needs Tailwind or a framework island.
