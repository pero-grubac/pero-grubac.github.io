// Direction B — "Journal": a printed long-form portfolio on warm paper.
export default function render(ctx) {
  const { site, systems, others, liveApps, kinds, stackGroups, esc, haystack, kindLabel, actions, caseStudyLink, flowParts, img, scripts } = ctx;

  const flow = (f) =>
    flowParts(f)
      .map((x) => (x.node ? `<span class="n">${esc(x.node)}</span>` : ` <span class="op">${x.op}</span> `))
      .join("");

  const commands = (p) =>
    `<ul class="cmds" aria-label="Slash commands">${p.commands
      .map((c) => `<li><code>${esc(c.cmd)}</code> ${esc(c.text)}</li>`)
      .join("")}</ul>`;

  const systemHtml = (p) => `
    <article class="feature" id="${p.slug}" data-system data-title="${esc(p.title)}" data-hay="${esc(haystack(p))}">
      <div class="feature-head">
        <h3>${esc(p.title)}</h3>
        <p class="dek">${esc(p.summary)}</p>
        <p class="flow"><span class="flow-label">Architecture</span>${flow(p.flow)}</p>
      </div>
      <div class="feature-body">
        <p class="desc">${esc(p.description)}</p>
        <p class="built">Built with ${p.stack.map(esc).join(", ")}.</p>
        <div class="links">${caseStudyLink(p, "lnk lnk-strong")}${actions(p, "lnk")}</div>
      </div>
      <figure class="media" data-video="${esc(p.video)}" data-title="${esc(p.title)}" data-state="idle">
        ${img(p, { eager: p.order === 1 })}
        <button type="button" class="play" data-play><span data-play-text>Play demo</span></button>
      </figure>
    </article>`;

  // Systems join the index only while searching; they point at their feature above.
  const systemEntryHtml = (p) => `
    <li class="entry entry-system" data-item data-slug="${p.slug}" data-kind="system" data-hay="${esc(haystack(p))}" hidden>
      <p class="e-title"><a href="#${p.slug}">${esc(p.title)}</a></p>
      <span class="leader" aria-hidden="true"></span>
      <span class="e-kind">system</span>
      <span class="e-open" aria-hidden="true">↑</span>
      <p class="e-sum">${esc(p.summary)}</p>
    </li>`;

  const entryHtml = (p) => `
    <li class="entry" data-item data-slug="${p.slug}" data-kind="${p.kind}" data-hay="${esc(haystack(p))}" id="p-${p.slug}">
      <h3 class="e-title"><button type="button" data-toggle aria-expanded="false" aria-controls="d-${p.slug}">${esc(p.title)}</button></h3>
      <span class="leader" aria-hidden="true"></span>
      <span class="e-kind">${kindLabel(p.kind).toLowerCase()}</span>
      <span class="e-open">${p.links.live ? `<a href="${esc(p.links.live)}" target="_blank" rel="noopener" aria-label="Open ${esc(p.title)} (opens in a new tab)">Open</a>` : ""}</span>
      <p class="e-sum">${esc(p.summary)}</p>
      <div class="panel" id="d-${p.slug}" hidden>
        <p class="panel-title" aria-hidden="true">${esc(p.title)}</p>
        ${p.image ? `<figure class="panel-fig">${img(p)}${p.altFromSite ? `<figcaption>${esc(p.imageAlt)}</figcaption>` : ""}</figure>` : p.commands ? commands(p) : ""}
        <p class="panel-desc">${esc(p.description)}</p>
        <ul class="panel-hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        <p class="built">Built with ${p.stack.map(esc).join(", ")}.</p>
        <div class="links">${actions(p, "lnk")}</div>
      </div>
    </li>`;

  const kindSummary = [`${others.length} projects`, ...kinds.map((k) => `${k.count} ${k.label.toLowerCase()}`)].join(" · ");
  const teaserApps = liveApps.slice(0, 3);

  return `<!doctype html>
<html lang="en" data-email="${site.email}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="icon" href="../../assets/favicon.ico">
<title>Direction B · Journal | Pero Grubač</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..600&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..600&display=swap">
<style>
:root {
  color-scheme: light;
  --paper: #f4f0e6;
  --paper-deep: #ebe5d6;
  --card: #faf7f0;
  --ink: #1c1a16;
  --ink-soft: #3d3a33;
  --muted: #6a6457;
  --accent: #a4321f;
  --rule: #cdc4b0;
  --rule-soft: #ddd5c3;
  --serif: "Newsreader", Georgia, "Times New Roman", serif;
  --sans: "Instrument Sans", "Segoe UI", system-ui, sans-serif;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
html { scroll-padding-top: 84px; -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  color: var(--ink);
  background-color: var(--paper);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .3 0 0 0 0 .25 0 0 0 0 .15 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  font: 400 1.125rem/1.6 var(--serif);
  font-optical-sizing: auto;
}
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 4px; }
button { font: inherit; color: inherit; }
img { max-width: 100%; height: auto; display: block; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
kbd { font: 500 .78em var(--sans); border: 1px solid var(--rule); border-radius: 3px; padding: 0 .35em; background: var(--card); }
.wrap { max-width: 1280px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 48px); }

/* ---------- masthead ---------- */
.masthead { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--paper) 94%, transparent); backdrop-filter: blur(6px); border-bottom: 1px solid var(--rule); }
.masthead .wrap { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 24px; min-height: 60px; padding-top: 8px; padding-bottom: 8px; }
.wordmark { font: italic 500 1.2rem var(--serif); text-decoration: none; }
.masthead nav ul { display: flex; flex-wrap: wrap; gap: 4px 22px; list-style: none; margin: 0; padding: 0; font: 500 .9rem var(--sans); }
.masthead nav a { text-decoration: none; color: var(--ink-soft); }
.masthead nav a:hover { color: var(--accent); text-decoration: underline; }
.find { display: inline-flex; align-items: center; gap: 10px; background: none; border: 1px solid var(--rule); border-radius: 999px; padding: 5px 8px 5px 14px; font: 500 .85rem var(--sans); color: var(--ink-soft); cursor: pointer; }
.find:hover { border-color: var(--ink); }
.mast-right { display: flex; align-items: center; gap: 22px; }
@media (max-width: 720px) {
  .masthead nav { order: 3; width: 100%; padding-bottom: 4px; }
  .masthead nav ul { gap: 4px 18px; font-size: .85rem; }
}

/* ---------- hero ---------- */
.hero { padding: clamp(40px, 8vw, 110px) 0 clamp(40px, 6vw, 80px); display: grid; gap: 48px; }
@media (min-width: 1000px) { .hero { grid-template-columns: minmax(0, 8fr) minmax(0, 4fr); align-items: end; } }
.dateline { font: 500 .85rem var(--sans); color: var(--muted); margin: 0 0 18px; }
h1 { font-weight: 400; font-size: clamp(3.4rem, 12vw, 9.4rem); line-height: .92; letter-spacing: -.03em; margin: 0; font-variation-settings: "opsz" 72; }
.standfirst { font-style: italic; font-weight: 300; font-size: clamp(1.3rem, 2.6vw, 1.85rem); line-height: 1.35; max-width: 30ch; margin: 28px 0 30px; color: var(--ink-soft); }
.byline { display: flex; flex-wrap: wrap; gap: 10px 26px; font: 500 .95rem var(--sans); align-items: center; }
.byline a { text-decoration: none; border-bottom: 1px solid var(--rule); padding-bottom: 2px; }
.byline a:hover { border-color: var(--accent); color: var(--accent); }
.byline .avail { color: var(--accent); border-color: currentColor; display: inline-flex; align-items: center; gap: 8px; }
.byline .avail::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.contents { border-top: 2px solid var(--ink); padding-top: 12px; font-size: 1rem; }
.contents h2 { font: 600 .85rem var(--sans); margin: 0 0 8px; color: var(--muted); }
.contents ol { list-style: none; margin: 0; padding: 0; }
.contents li a { display: flex; align-items: baseline; gap: 8px; padding: 7px 0; text-decoration: none; border-bottom: 1px solid var(--rule-soft); }
.contents li a::after { content: attr(data-note); font: 500 .8rem var(--sans); color: var(--muted); order: 3; }
.contents li a span.dots { flex: 1; border-bottom: 1px dotted var(--muted); transform: translateY(-4px); order: 2; }
.contents li a:hover { color: var(--accent); }

/* ---------- sections ---------- */
main > section { padding: clamp(48px, 8vw, 96px) 0; }
.sec-head { border-top: 3px double var(--ink); padding-top: 18px; margin-bottom: clamp(28px, 4vw, 48px); display: grid; gap: 8px 48px; }
@media (min-width: 900px) { .sec-head { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); align-items: baseline; } }
.sec-head h2 { font-weight: 400; font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 1; margin: 0; letter-spacing: -.02em; font-variation-settings: "opsz" 72; }
.sec-head p { margin: 0; font-style: italic; color: var(--ink-soft); max-width: 46ch; font-size: 1.2rem; }

/* ---------- about ---------- */
.about { display: grid; gap: 40px; }
@media (min-width: 1000px) { .about { grid-template-columns: minmax(0, 8fr) minmax(0, 4fr); } }
.about-text { column-gap: 48px; column-rule: 1px solid var(--rule-soft); }
@media (min-width: 760px) { .about-text { columns: 2; } }
.about-text p { margin: 0 0 1em; hyphens: auto; }
.portrait { margin: 0; }
.portrait img { width: 100%; max-width: 380px; aspect-ratio: 4 / 5; object-fit: cover; filter: sepia(.12) contrast(1.02); }
.portrait figcaption { font: 500 .8rem var(--sans); color: var(--muted); margin-top: 10px; border-top: 1px solid var(--rule); padding-top: 8px; max-width: 380px; }
.tools { margin-top: 48px; border-top: 1px solid var(--rule); }
.tools > div { display: grid; gap: 4px 32px; padding: 14px 0; border-bottom: 1px solid var(--rule-soft); }
@media (min-width: 760px) { .tools > div { grid-template-columns: 180px minmax(0, 1fr); } }
.tools h3 { font: 600 .85rem var(--sans); margin: 0; color: var(--muted); padding-top: 4px; }
.terms { font-size: 1.15rem; line-height: 1.7; }
.terms button { background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; text-decoration-color: var(--rule); text-underline-offset: 5px; }
.terms button:hover { color: var(--accent); text-decoration-color: currentColor; }
.terms .term { white-space: nowrap; }
.terms .plain { color: var(--ink-soft); }
.terms .sep { color: var(--muted); }
.tools-hint { font: 400 .85rem var(--sans); color: var(--muted); margin: 12px 0 0; }

/* ---------- systems (features) ---------- */
.feature { display: grid; gap: 24px 48px; padding-bottom: clamp(44px, 6vw, 72px); }
.feature + .feature { border-top: 1px solid var(--rule); padding-top: clamp(44px, 6vw, 72px); }
@media (min-width: 900px) { .feature { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); } .feature .media { grid-column: 1 / -1; } }
.media { position: relative; margin: 0; aspect-ratio: 16 / 9; overflow: hidden; background: var(--paper-deep); cursor: pointer; }
.media img, .media video { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.media video { position: absolute; inset: 0; opacity: 0; transition: opacity .25s; }
.media[data-state="playing"] video, .media[data-state="paused"] video { opacity: 1; }
.play { position: absolute; right: 14px; bottom: 14px; border: 0; border-radius: 999px; padding: 7px 14px; background: var(--card); color: var(--ink); font: 600 .8rem var(--sans); cursor: pointer; box-shadow: 0 1px 0 var(--rule); }
.play::before { content: "▶ "; color: var(--accent); }
.media[data-state="playing"] .play::before { content: "❚❚ "; }
.feature h3 { font-weight: 500; font-size: clamp(2rem, 4vw, 2.9rem); line-height: 1.02; margin: 0 0 12px; letter-spacing: -.015em; font-variation-settings: "opsz" 60; }
.dek { font-style: italic; font-size: 1.25rem; color: var(--ink-soft); margin: 0 0 20px; line-height: 1.4; }
.flow { font: 500 .9rem/1.7 var(--sans); margin: 0; padding-top: 14px; border-top: 1px solid var(--rule); color: var(--ink-soft); }
.flow-label { display: block; font-weight: 600; color: var(--muted); font-size: .8rem; margin-bottom: 2px; }
.flow .op { color: var(--accent); font-weight: 600; }
.desc { margin: 0 0 18px; }
.built { font: 400 .9rem/1.6 var(--sans); color: var(--muted); margin: 0 0 18px; }
.links { display: flex; flex-wrap: wrap; gap: 10px 22px; font: 600 .95rem var(--sans); }
.lnk { color: var(--ink); text-decoration: underline; text-decoration-color: var(--rule); }
.lnk:hover { color: var(--accent); text-decoration-color: currentColor; }
.lnk-strong { color: var(--accent); text-decoration-color: currentColor; }
.lnk-strong::after { content: " →"; }
a.lnk[target="_blank"]::after { content: " ↗"; }
.lnk.is-muted { color: var(--muted); text-decoration: none; font-weight: 500; }

/* ---------- index (projects) ---------- */
.index-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px 56px; }
@media (min-width: 980px) { .index-grid { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); align-items: start; } }
.find-row { display: grid; gap: 14px; margin-bottom: 18px; }
.find-in { display: flex; align-items: baseline; gap: 14px; border-bottom: 2px solid var(--ink); padding-bottom: 6px; }
.find-in label { font: 600 .85rem var(--sans); color: var(--muted); white-space: nowrap; }
.find-in input { flex: 1; min-width: 0; width: 100%; border: 0; background: none; font: italic 400 1.35rem var(--serif); color: var(--ink); padding: 4px 0; }
.find-in input:focus { outline: none; }
.find-in:focus-within { border-color: var(--accent); }
.find-in input::placeholder { color: var(--muted); }
.show { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 4px; font: 500 .9rem var(--sans); }
.show > span { color: var(--muted); margin-right: 6px; }
.show button { background: none; border: 0; padding: 4px 8px; border-radius: 3px; cursor: pointer; color: var(--ink-soft); }
.show button [data-count] { font-variant-numeric: oldstyle-nums; color: var(--muted); margin-left: 3px; }
.show button:hover { background: var(--paper-deep); }
.show button[aria-pressed="true"] { background: var(--ink); color: var(--paper); }
.show button[aria-pressed="true"] [data-count] { color: inherit; opacity: .75; }
.index { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--ink); }
.entry { position: relative; display: grid; grid-template-columns: auto minmax(24px, 1fr) auto 3.6rem; column-gap: 10px; align-items: baseline; padding: 12px 6px 12px 0; border-bottom: 1px solid var(--rule-soft); }
.e-open { text-align: right; font: 600 .85rem var(--sans); position: relative; z-index: 2; }
.e-open a { color: var(--accent); text-decoration: underline; text-decoration-color: currentColor; text-underline-offset: 4px; }
.e-open a[target="_blank"]::after { content: " ↗"; }
.e-open a:hover { color: var(--ink); }
.entry-system { background: var(--card); }
.entry-system .e-title a { text-decoration: none; }
.entry-system .e-title a::after { content: ""; position: absolute; inset: 0; }
.entry-system .e-kind { color: var(--accent); }
.entry-system + .entry:not(.entry-system) { border-top: 1px solid var(--ink); }
.e-title { margin: 0; font-weight: 500; font-size: 1.3rem; line-height: 1.25; }
.e-title button { background: none; border: 0; padding: 0; text-align: left; cursor: pointer; }
.e-title button::after { content: ""; position: absolute; inset: 0; }
.e-title button:focus-visible { outline: none; }
.entry:has(button:focus-visible) { outline: 2px solid var(--accent); outline-offset: 2px; }
.leader { border-bottom: 1px dotted var(--muted); transform: translateY(-6px); }
.e-kind { font: italic 400 1rem var(--serif); color: var(--muted); }
.e-sum { grid-column: 1 / -1; margin: 2px 0 0; font-size: 1rem; color: var(--ink-soft); }
.entry:hover .e-title, .entry[data-open] .e-title { color: var(--accent); }
.entry[data-open] { box-shadow: inset 3px 0 0 var(--accent); padding-left: 14px; }
.panel { grid-column: 1 / -1; position: relative; z-index: 1; padding: 16px 0 6px; cursor: auto; }
.panel[hidden] { display: none; }
.panel-title { display: none; }
.panel-fig { margin: 0 0 16px; }
.panel-fig img { border: 1px solid var(--rule); }
.panel-fig figcaption { font: 400 .8rem var(--sans); color: var(--muted); margin-top: 6px; }
.panel-desc { margin: 0 0 12px; }
.panel-hl { margin: 0 0 14px; padding: 0; list-style: none; font-size: 1rem; }
.panel-hl li { padding-left: 1.2em; text-indent: -1.2em; margin-bottom: 4px; }
.panel-hl li::before { content: "– "; color: var(--accent); }
.cmds { list-style: none; margin: 0 0 16px; padding: 14px 16px; background: var(--card); border: 1px solid var(--rule); font: .92rem/1.7 var(--sans); color: var(--ink-soft); }
.cmds code { font: 600 .85rem ui-monospace, Consolas, monospace; color: var(--accent); }
.reader { position: sticky; top: 92px; background: var(--card); border: 1px solid var(--rule); padding: 22px 24px; max-height: calc(100vh - 112px); overflow: auto; display: none; }
@media (min-width: 980px) { .reader { display: block; } }
.reader .panel { padding: 0; }
.reader .panel-title { display: block; font-weight: 500; font-size: 2rem; line-height: 1.05; margin: 0 0 14px; letter-spacing: -.01em; }
.reader-empty p { margin: 0 0 10px; color: var(--ink-soft); font-style: italic; }
.reader-empty .tally { font: 500 .85rem var(--sans); color: var(--muted); font-style: normal; }
.empty { padding: 28px 0; border-bottom: 1px solid var(--rule-soft); }
.empty p { font-style: italic; font-size: 1.25rem; margin: 0 0 12px; }
.empty button { border: 1px solid var(--ink); background: none; border-radius: 999px; padding: 6px 16px; font: 600 .85rem var(--sans); cursor: pointer; }

/* ---------- apps teaser ---------- */
.apps-box { border-top: 3px double var(--ink); border-bottom: 3px double var(--ink); padding: 28px 0; display: grid; gap: 28px; }
@media (min-width: 900px) { .apps-box { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); align-items: center; } }
.apps-box h2 { font: 600 .85rem var(--sans); color: var(--muted); margin: 0 0 14px; }
.apps-num { font-weight: 300; font-size: clamp(4rem, 10vw, 7rem); line-height: 1; margin: 0; font-variation-settings: "opsz" 72; }
.apps-line { font-style: italic; font-size: 1.3rem; margin: 6px 0 16px; }
.apps-shots { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; list-style: none; margin: 0; padding: 0; }
@media (max-width: 560px) { .apps-shots { grid-template-columns: repeat(2, minmax(0, 1fr)); } .apps-shots li:nth-child(3) { display: none; } }
.apps-shots a { text-decoration: none; font: 500 .85rem var(--sans); }
.apps-shots img { aspect-ratio: 4 / 3; object-fit: cover; object-position: top left; border: 1px solid var(--rule); margin-bottom: 8px; }
.apps-shots a:hover { color: var(--accent); }

/* ---------- contact ---------- */
.copy { border: 1px solid var(--rule); background: var(--card); border-radius: 999px; padding: 2px 10px; margin-left: 6px; font: 600 .75rem/1.5 var(--sans); color: var(--ink-soft); cursor: pointer; vertical-align: 2px; }
.copy:hover { border-color: var(--ink); color: var(--ink); }
.copy[data-copied] { background: var(--accent); border-color: var(--accent); color: var(--paper); }
.proto-switch { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 0 0 36px; padding: 8px 12px; border: 1px dashed var(--muted); font: 500 .8rem var(--sans); color: var(--muted); width: fit-content; max-width: 100%; }
.proto-switch button { border: 1px solid var(--rule); background: none; border-radius: 3px; padding: 3px 10px; font: inherit; color: var(--ink-soft); cursor: pointer; }
.proto-switch button[aria-pressed="true"] { background: var(--ink); border-color: var(--ink); color: var(--paper); }

/* variant 1: the closing of a letter */
.letter { max-width: 40rem; }
.letter p { margin: 0 0 .5em; font-size: 1.2rem; line-height: 1.6; }
.letter .letter-lead { font-style: italic; color: var(--ink-soft); margin-bottom: 1.2em; }
.letter .lnk { font-weight: 500; overflow-wrap: anywhere; }
.signoff { margin-top: 1.6em !important; font-style: italic; font-size: 1.6rem !important; font-weight: 400; }
.signoff::before { content: "— "; color: var(--muted); }

/* variant 2: a magazine colophon */
.colophon { display: grid; gap: 28px 56px; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); padding: 26px 0; }
@media (min-width: 900px) { .colophon { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); } }
.col-lead h2 { font-weight: 400; font-size: clamp(1.8rem, 3.4vw, 2.4rem); line-height: 1.05; margin: 0 0 10px; letter-spacing: -.01em; }
.col-lead p { margin: 0; font-style: italic; color: var(--ink-soft); max-width: 36ch; }
.col-list { margin: 0; }
.col-list div { display: grid; grid-template-columns: 7rem minmax(0, 1fr); gap: 4px 16px; padding: 9px 0; border-bottom: 1px solid var(--rule-soft); align-items: baseline; }
.col-list div:first-child { padding-top: 0; }
.col-list div:last-child { border-bottom: 0; }
.col-list dt { font: 600 .8rem var(--sans); color: var(--muted); }
.col-list dd { margin: 0; min-width: 0; font-size: 1.05rem; }
.col-list .lnk { font: inherit; overflow-wrap: anywhere; }
@media (max-width: 480px) { .col-list div { grid-template-columns: 1fr; } }

footer { border-top: 1px solid var(--rule); padding: 22px 0 34px; font: 400 .85rem var(--sans); color: var(--muted); }
footer .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px; }

/* ---------- palette ---------- */
dialog.palette { width: min(620px, calc(100vw - 32px)); margin: 90px auto auto; padding: 0; border: 1px solid var(--ink); background: var(--card); color: var(--ink); box-shadow: 8px 8px 0 var(--rule); }
dialog.palette::backdrop { background: rgb(28 26 22 / .25); }
.pal-input { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 2px solid var(--ink); }
.pal-input input { flex: 1; min-width: 0; border: 0; background: none; font: italic 400 1.3rem var(--serif); }
.pal-input input:focus { outline: none; }
#pal-list { list-style: none; margin: 0; padding: 8px 0; max-height: min(440px, 60vh); overflow: auto; }
#pal-list li { display: flex; align-items: baseline; gap: 10px; padding: 7px 18px; cursor: pointer; }
#pal-list li .pal-label { font-size: 1.1rem; }
#pal-list li .pal-hint { margin-left: auto; font: 500 .78rem var(--sans); color: var(--muted); }
#pal-list li[aria-selected="true"] { background: var(--paper-deep); }
#pal-list li[aria-selected="true"] .pal-label { color: var(--accent); }
.pal-none { color: var(--muted); font-style: italic; }
.toast { position: fixed; left: 50%; bottom: 24px; transform: translate(-50%, 16px); opacity: 0; pointer-events: none; background: var(--ink); color: var(--paper); font: 500 .85rem var(--sans); padding: 10px 18px; border-radius: 999px; transition: opacity .2s, transform .2s; z-index: 50; }
.toast[data-show="true"] { opacity: 1; transform: translate(-50%, 0); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
</style>
</head>
<body>
<header class="masthead">
  <div class="wrap">
    <a class="wordmark" href="#top">Pero Grubač</a>
    <nav aria-label="Sections">
      <ul>
        <li><a href="#about">About</a></li>
        <li><a href="#systems">Systems</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#apps">Apps</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
    <button type="button" class="find" data-palette aria-label="Open the command palette">Search <kbd><span data-mod>Ctrl</span> K</kbd></button>
  </div>
</header>

<main class="wrap">
  <section class="hero" id="top">
    <div>
      <p class="dateline">Banja Luka, Bosnia and Herzegovina · Java, C# and Python</p>
      <h1>${esc(site.name)}</h1>
      <p class="standfirst">${esc(site.heroLine)}</p>
      <div class="byline">
        <a class="avail" href="#contact">Available for freelance projects</a>
        <a href="#systems">Read about the systems</a>
        <a href="${site.github}" target="_blank" rel="noopener">GitHub</a>
        <a href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>
    <nav class="contents" aria-labelledby="contents-h">
      <h2 id="contents-h">In this portfolio</h2>
      <ol>
        ${systems.map((p) => `<li><a href="#${p.slug}" data-note="system"><span>${esc(p.title)}</span><span class="dots" aria-hidden="true"></span></a></li>`).join("")}
        <li><a href="#projects" data-note="${others.length} projects"><span>Index of projects</span><span class="dots" aria-hidden="true"></span></a></li>
        <li><a href="#apps" data-note="${liveApps.length} apps"><span>Browser apps</span><span class="dots" aria-hidden="true"></span></a></li>
      </ol>
    </nav>
  </section>

  <section id="about" aria-labelledby="about-h">
    <div class="sec-head"><h2 id="about-h">About</h2></div>
    <div class="about">
      <div>
        <div class="about-text">${site.about.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
        <div class="tools">
          ${stackGroups
            .map(({ group, terms }) => `<div><h3>${group}</h3><p class="terms" style="margin:0">${terms
              .map(({ term, matches }, i) => {
                const t = matches
                  ? `<button type="button" data-term="${esc(term)}" aria-label="Find ${esc(term)} in the projects index">${esc(term)}</button>`
                  : `<span class="plain">${esc(term)}</span>`;
                return `<span class="term">${t}${i < terms.length - 1 ? '<span class="sep">,</span>' : ""}</span> `;
              })
              .join("")}</p></div>`)
            .join("")}
          <p class="tools-hint">Select a technology to find it in the projects index.</p>
        </div>
      </div>
      <figure class="portrait">
        <img src="${site.avatar}" alt="Pero Grubač" width="380" height="475" loading="lazy">
        <figcaption>Pero Grubač, backend developer</figcaption>
      </figure>
    </div>
  </section>

  <section id="systems" aria-labelledby="systems-h">
    <div class="sec-head"><h2 id="systems-h">Systems</h2><p>Backends made of several services that talk over queues, sockets and REST. Each one gets a case study.</p></div>
    ${systems.map(systemHtml).join("")}
  </section>

  <section id="projects" aria-labelledby="projects-h">
    <div class="sec-head"><h2 id="projects-h">Index of projects</h2><p>Live apps, mobile and desktop apps, and tools, with the most serious work first.</p></div>
    <div class="index-grid">
      <div>
        <div class="find-row" role="search">
          <div class="find-in">
            <label for="q">Find in the index</label>
            <input id="q" type="search" placeholder="a title or a technology" autocomplete="off" spellcheck="false">
            <kbd aria-hidden="true">/</kbd>
          </div>
          <div class="show" role="group" aria-label="Filter by kind">
            <span aria-hidden="true">Show</span>
            <button type="button" data-filter="" data-label="All" aria-pressed="true">All<span data-count>${others.length}</span></button>
            ${kinds.map((k) => `<button type="button" data-filter="${k.key}" data-label="${k.label}" aria-pressed="false">${k.label}<span data-count>${k.count}</span></button>`).join("")}
          </div>
        </div>
        <p class="sr-only" id="result-status" aria-live="polite"></p>
        <ul class="index">
          ${systems.map(systemEntryHtml).join("")}
          ${others.map(entryHtml).join("")}
        </ul>
        <div class="empty" id="empty" hidden>
          <p>No project matches “<span data-empty-q></span>”.</p>
          <button type="button" data-clear>Clear search</button>
        </div>
      </div>
      <aside class="reader" aria-label="Project details">
        <div class="reader-empty" id="reader-empty">
          <p>Select a project in the index to read about it here.</p>
          <p class="tally">${kindSummary}</p>
        </div>
        <div id="reader-slot"></div>
      </aside>
    </div>
  </section>

  <section id="apps" aria-labelledby="apps-h">
    <div class="apps-box">
      <div>
        <h2 id="apps-h">Browser apps</h2>
        <p class="apps-num">${liveApps.length}</p>
        <p class="apps-line">browser apps you can open right now.</p>
        <a class="lnk lnk-strong" href="#projects?kind=live">Browse the apps</a>
      </div>
      <ul class="apps-shots">
        ${teaserApps.map((p) => `<li><a href="${esc(p.links.live)}" target="_blank" rel="noopener">${img(p)}${esc(p.title)} ↗</a></li>`).join("")}
      </ul>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="proto-switch" role="group" aria-label="Prototype only: contact variant">
      <span>Prototype only · contact variant</span>
      <button type="button" data-variant="letter" aria-pressed="true">1 · Letter</button>
      <button type="button" data-variant="colophon" aria-pressed="false">2 · Colophon</button>
    </div>

    <!-- Variant 1: the closing of a letter -->
    <div class="cv" data-variant-panel="letter">
      <div class="sec-head"><h2>Let's work together</h2></div>
      <div class="letter">
        <p class="letter-lead">${esc(site.freelanceLine)}</p>
        <p>Write to me at <a class="lnk" href="mailto:${site.email}">${site.email}</a> <button type="button" class="copy" data-copy aria-label="Copy email address"><span data-copy-label>Copy</span></button></p>
        <p>or find me on <a class="lnk" href="${site.github}" target="_blank" rel="noopener">GitHub</a> and <a class="lnk" href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a>.</p>
        <p class="signoff">Pero Grubač</p>
      </div>
    </div>

    <!-- Variant 2: a magazine colophon -->
    <div class="cv" data-variant-panel="colophon" hidden>
      <div class="colophon">
        <div class="col-lead">
          <h2>Let's work together</h2>
          <p>${esc(site.freelanceLine)}</p>
        </div>
        <dl class="col-list">
          <div><dt>Email</dt><dd><a class="lnk" href="mailto:${site.email}">${site.email}</a> <button type="button" class="copy" data-copy aria-label="Copy email address"><span data-copy-label>Copy</span></button></dd></div>
          <div><dt>GitHub</dt><dd><a class="lnk" href="${site.github}" target="_blank" rel="noopener">github.com/pero-grubac</a></dd></div>
          <div><dt>LinkedIn</dt><dd><a class="lnk" href="${site.linkedin}" target="_blank" rel="noopener">linkedin.com/in/perogrubac</a></dd></div>
          <div><dt>Based in</dt><dd>Banja Luka, Bosnia and Herzegovina</dd></div>
        </dl>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <span>© <span data-year>2026</span> Pero Grubač. Set in Newsreader and Instrument Sans.</span>
    <span>Press <kbd>/</kbd> to search the index, <kbd><span data-mod>Ctrl</span> K</kbd> for commands.</span>
  </div>
</footer>

<dialog class="palette" id="palette" aria-label="Command palette">
  <div class="pal-input">
    <input id="pal-q" type="text" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" aria-label="Go to a section or project" placeholder="Go to a section or project…" autocomplete="off" spellcheck="false">
    <kbd>esc</kbd>
  </div>
  <ul id="pal-list" role="listbox" aria-label="Results"></ul>
</dialog>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

${scripts({
  config: `
// Wide screens read the open entry in the sticky reader; narrow ones read it inline.
window.ProtoConfig = (() => {
  const wide = matchMedia("(min-width: 980px)");
  let cur = null;
  const place = () => {
    if (!cur) return;
    const [item, panel] = cur;
    const slot = document.getElementById("reader-slot");
    if (wide.matches) slot.append(panel); else item.append(panel);
    document.getElementById("reader-empty").hidden = wide.matches;
  };
  wide.addEventListener("change", place);
  return {
    afterOpen(item, panel) { cur = [item, panel]; place(); },
    beforeClose(item, panel) { item.append(panel); document.getElementById("reader-empty").hidden = false; cur = null; },
  };
})();

// Prototype only: switch between the two contact variants (?contact=colophon)
(() => {
  const buttons = [...document.querySelectorAll("[data-variant]")];
  const panels = [...document.querySelectorAll("[data-variant-panel]")];
  const set = (v) => {
    panels.forEach((p) => (p.hidden = p.dataset.variantPanel !== v));
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.variant === v)));
  };
  set(new URLSearchParams(location.search).get("contact") === "colophon" ? "colophon" : "letter");
  buttons.forEach((b) => b.addEventListener("click", () => {
    set(b.dataset.variant);
    history.replaceState(null, "", "?contact=" + b.dataset.variant + location.hash);
  }));
})();`,
})}
</body>
</html>`;
}
