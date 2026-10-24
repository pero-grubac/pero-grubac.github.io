// Direction C — "Blueprint": the portfolio as a technical drawing sheet.
export default function render(ctx) {
  const { site, systems, others, liveApps, kinds, esc, haystack, kindLabel, actions, caseStudyLink, flowParts, img, scripts } = ctx;

  const schematic = (f) =>
    `<ol class="schem" aria-label="Architecture: ${esc(f)}">${flowParts(f)
      .map((x) => (x.node ? `<li class="node">${esc(x.node)}</li>` : `<li class="wire" aria-hidden="true"><span>${x.op}</span></li>`))
      .join("")}</ol>`;

  const commands = (p, cls = "cmds") =>
    `<ul class="${cls}" aria-label="Slash commands">${p.commands
      .map((c) => `<li><code>${esc(c.cmd)}</code><span>${esc(c.text)}</span></li>`)
      .join("")}</ul>`;

  const chips = (p) => `<ul class="chips" aria-label="Stack">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;

  const systemHtml = (p) => `
    <article class="sheet" id="${p.slug}" data-system data-title="${esc(p.title)}" data-hay="${esc(haystack(p))}">
      <header class="sheet-head">
        <h3>${esc(p.title)}</h3>
        <p class="sheet-sum">${esc(p.summary)}</p>
      </header>
      ${schematic(p.flow)}
      <div class="sheet-body">
        <figure class="media" data-video="${esc(p.video)}" data-title="${esc(p.title)}" data-state="idle">
          ${img(p, { eager: p.order === 1 })}
          <button type="button" class="play" data-play><span data-play-text>Play demo</span></button>
        </figure>
        <div class="sheet-text">
          <p>${esc(p.description)}</p>
          ${chips(p)}
          <div class="links">${caseStudyLink(p, "btn btn-amber")}${actions(p, "btn")}</div>
        </div>
      </div>
    </article>`;

  const tileHtml = (p) => `
    <li class="tile" data-item data-slug="${p.slug}" data-kind="${p.kind}" data-title="${esc(p.title)}" data-hay="${esc(haystack(p))}" id="p-${p.slug}">
      <div class="tile-thumb">${p.image ? img(p, { alt: "" }) : p.commands ? commands(p, "cmds cmds-mini") : ""}</div>
      <div class="tile-body">
        <span class="tile-kind">${kindLabel(p.kind).toLowerCase()}</span>
        <h3><button type="button" data-open-detail aria-haspopup="dialog">${esc(p.title)}</button></h3>
        <p>${esc(p.summary)}</p>
      </div>
      <div class="panel" hidden>
        ${p.image ? `<figure class="panel-fig">${img(p)}</figure>` : p.commands ? commands(p) : ""}
        <p>${esc(p.description)}</p>
        <h3 class="panel-h">Highlights</h3>
        <ul class="panel-hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        <h3 class="panel-h">Stack</h3>
        ${chips(p)}
        <div class="links">${actions(p, "btn")}</div>
      </div>
    </li>`;

  const teaserApps = liveApps.slice(0, 4);

  return `<!doctype html>
<html lang="en" data-email="${site.email}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="icon" href="../../assets/favicon.ico">
<title>Direction C · Blueprint | Pero Grubač</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Martian+Mono:wdth,wght@87.5,400..600&display=swap">
<style>
:root {
  color-scheme: dark;
  --bp: #123a7c;
  --bp-deep: #0c2a5e;
  --bp-raise: #164389;
  --ink: #f3f6ff;
  --ink-soft: #d5def5;
  --muted: #a9bce6;
  --line: rgb(243 246 255 / .6);
  --line-soft: rgb(243 246 255 / .24);
  --amber: #ffd166;
  --on-amber: #10264f;
  --red: #ff9f8f;
  --sans: "Archivo", "Segoe UI", system-ui, sans-serif;
  --mono: "Martian Mono", ui-monospace, Consolas, monospace;
  --rail: 236px;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
html { scroll-padding-top: 76px; -webkit-text-size-adjust: 100%; }
@media (min-width: 1024px) { html { scroll-padding-top: 24px; } }
body {
  margin: 0;
  color: var(--ink);
  background-color: var(--bp);
  background-image:
    linear-gradient(rgb(255 255 255 / .085) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / .085) 1px, transparent 1px),
    linear-gradient(rgb(255 255 255 / .035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / .035) 1px, transparent 1px);
  background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
  font: 400 1rem/1.6 var(--sans);
  font-stretch: 100%;
}
a { color: var(--amber); text-underline-offset: 3px; }
button { font: inherit; color: inherit; }
img { max-width: 100%; height: auto; display: block; }
:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
kbd { font: 500 .72em var(--mono); border: 1px solid var(--line-soft); padding: 1px 5px; }
.mono { font-family: var(--mono); }

/* ---------- rail / top bar ---------- */
.rail {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
  background: var(--bp-deep);
  border-bottom: 1px solid var(--line-soft);
}
.mono-mark { display: grid; place-items: center; width: 40px; height: 40px; border: 1.5px solid var(--ink); font: 800 1.05rem var(--sans); font-stretch: 70%; color: var(--ink); text-decoration: none; letter-spacing: .02em; flex: none; }
.rail nav { flex: 1; min-width: 0; }
.rail ul { display: flex; flex-wrap: wrap; gap: 2px 14px; list-style: none; margin: 0; padding: 0; }
.rail nav a { color: var(--ink-soft); text-decoration: none; font: 600 .85rem var(--sans); font-stretch: 75%; letter-spacing: .03em; text-transform: uppercase; }
.rail nav a:hover { color: var(--amber); }
.rail nav a[aria-current="true"] { color: var(--amber); }
.pal-btn { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: none; padding: 6px 10px; cursor: pointer; font: 500 .72rem var(--mono); flex: none; }
.pal-btn:hover { border-color: var(--amber); color: var(--amber); }
.rail-block { display: none; }
@media (max-width: 400px) { .pal-btn .lbl { display: none; } .rail ul { gap: 2px 11px; } }
@media (min-width: 1024px) {
  .rail { position: fixed; inset: 0 auto 0 0; width: var(--rail); flex-direction: column; align-items: stretch; gap: 28px; padding: 24px 22px; border-bottom: 0; border-right: 1px solid var(--line-soft); }
  .mono-mark { width: 64px; height: 64px; font-size: 1.6rem; }
  .rail nav { flex: none; }
  .rail ul { flex-direction: column; gap: 0; border-top: 1px solid var(--line-soft); }
  .rail li { border-bottom: 1px solid var(--line-soft); }
  .rail nav a { display: flex; justify-content: space-between; padding: 10px 2px; font-size: .95rem; }
  .rail nav a::after { content: "→"; opacity: 0; transition: opacity .15s; }
  .rail nav a:hover::after, .rail nav a[aria-current="true"]::after { opacity: 1; }
  .pal-btn { justify-content: space-between; padding: 10px 12px; }
  .rail-block { display: grid; margin-top: auto; border: 1px solid var(--line-soft); font: 400 .66rem/1.4 var(--mono); color: var(--muted); }
  .rail-block div { padding: 7px 9px; }
  .rail-block div + div { border-top: 1px solid var(--line-soft); }
  .rail-block b { display: block; color: var(--ink); font-weight: 500; }
  .page { margin-left: var(--rail); }
}

/* ---------- page + sections ---------- */
main > section { padding: clamp(48px, 7vw, 96px) clamp(16px, 4.5vw, 64px); max-width: 1240px; }
main > section + section { border-top: 1px solid var(--line-soft); }
h1, h2 { font-family: var(--sans); font-stretch: 68%; font-weight: 800; text-transform: uppercase; letter-spacing: .01em; line-height: .95; margin: 0; }
h2 { font-size: clamp(2.2rem, 5.5vw, 3.6rem); margin-bottom: 28px; display: flex; align-items: baseline; gap: 18px; }
h2::after { content: ""; flex: 1; height: 0; border-top: 1px solid var(--line); transform: translateY(-.25em); }
.lede { max-width: 58ch; color: var(--ink-soft); margin: -10px 0 36px; font-size: 1.08rem; }

/* ---------- hero ---------- */
.hero { display: grid; gap: 44px; padding-top: clamp(40px, 8vw, 110px) !important; position: relative; }
@media (min-width: 1180px) { .hero { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: center; } }
.dim { position: relative; display: block; width: 100%; border-top: 1px solid var(--line); margin: 0 0 18px; height: 0; }
.dim::before, .dim::after { content: ""; position: absolute; top: -6px; width: 1px; height: 11px; background: var(--line); }
.dim::before { left: 0; } .dim::after { right: 0; }
.dim span { position: absolute; left: 50%; top: 0; transform: translate(-50%, -50%); background: var(--bp); padding: 0 10px; font: 500 .7rem var(--mono); color: var(--muted); white-space: nowrap; }
.name-wrap { display: inline-block; max-width: 100%; }
h1 { font-size: clamp(3.4rem, 13vw, 8.6rem); }
.hero-line { font-size: clamp(1.15rem, 2.2vw, 1.45rem); line-height: 1.45; max-width: 36ch; margin: 26px 0 26px; color: var(--ink); font-stretch: 95%; }
.stamp { display: inline-block; padding: 8px 14px; border: 2px solid var(--amber); color: var(--amber); font: 600 .78rem var(--mono); text-decoration: none; transform: rotate(-2deg); }
.stamp:hover { background: var(--amber); color: var(--on-amber); }
.hero-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.btn { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border: 1px solid var(--line); background: transparent; color: var(--ink); text-decoration: none; font: 600 .9rem var(--sans); cursor: pointer; }
.btn:hover { border-color: var(--amber); color: var(--amber); }
.btn-amber { background: var(--amber); border-color: var(--amber); color: var(--on-amber); }
.btn-amber:hover { background: #ffe199; color: var(--on-amber); }
.btn.is-muted { border-style: dashed; color: var(--muted); cursor: default; }
.btn.is-muted:hover { border-color: var(--line); color: var(--muted); }
a.btn[target="_blank"]::after { content: "↗"; }
.drawing { border: 1px solid var(--line-soft); background: rgb(12 42 94 / .55); padding: 18px; }
.drawing svg { width: 100%; height: auto; display: block; }
.drawing .box { fill: var(--bp-deep); stroke: var(--ink); stroke-width: 1.5; }
.drawing .wire { fill: none; stroke: var(--amber); stroke-width: 1.5; stroke-dasharray: 5 7; animation: flow 1.6s linear infinite; }
.drawing .wire.rev { animation-direction: reverse; }
.drawing text { fill: var(--ink); font: 500 12px var(--mono); }
.drawing text.lbl { fill: var(--amber); font-size: 10px; }
.drawing .ah { fill: var(--amber); }
.drawing text.cap { fill: var(--muted); font-size: 10px; }
@keyframes flow { to { stroke-dashoffset: -24; } }
.titleblock { display: grid; grid-template-columns: auto minmax(0, 1fr); margin: 14px 0 0; border: 1px solid var(--line); font-size: .9rem; }
.titleblock dt, .titleblock dd { margin: 0; padding: 7px 10px; border-top: 1px solid var(--line-soft); }
.titleblock dt:first-of-type, .titleblock dt:first-of-type + dd { border-top: 0; }
.titleblock dt { font: 500 .66rem/2 var(--mono); color: var(--muted); border-right: 1px solid var(--line-soft); }
.titleblock dd { font-weight: 600; }

/* ---------- about ---------- */
.about { display: grid; gap: 40px; align-items: start; }
@media (min-width: 900px) { .about { grid-template-columns: 240px minmax(0, 1fr); } }
.detail-circle { position: relative; width: 200px; margin: 10px 0 0; }
.detail-circle img { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--ink); }
.detail-circle::before { content: ""; position: absolute; inset: -12px; border-radius: 50%; border: 1px dashed var(--line); }
.detail-circle figcaption { margin-top: 22px; font: 500 .7rem var(--mono); color: var(--muted); }
.about-text p { max-width: 62ch; margin: 0 0 1em; font-size: 1.08rem; }
.stack-grid { display: grid; gap: 22px; margin-top: 36px; }
@media (min-width: 760px) { .stack-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.stack-grid h3 { font: 600 .72rem var(--mono); color: var(--muted); margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--line-soft); }
.terms { display: flex; flex-wrap: wrap; gap: 6px; }
.terms button { border: 1px solid var(--line-soft); background: none; padding: 4px 9px; font: 600 .85rem var(--sans); cursor: pointer; }
.terms button:hover { border-color: var(--amber); color: var(--amber); }
.hint { font: 400 .72rem var(--mono); color: var(--muted); margin-top: 16px; }

/* ---------- systems ---------- */
.sheets { display: grid; gap: 28px; }
.sheet { border: 1px solid var(--line); background: rgb(12 42 94 / .55); }
.sheet-head { display: grid; gap: 4px 24px; padding: 18px 20px; border-bottom: 1px solid var(--line-soft); }
@media (min-width: 800px) { .sheet-head { grid-template-columns: auto minmax(0, 1fr); align-items: baseline; } }
.sheet h3 { margin: 0; font: 800 clamp(1.5rem, 3vw, 2rem)/1 var(--sans); font-stretch: 72%; text-transform: uppercase; letter-spacing: .01em; }
.sheet-sum { margin: 0; color: var(--ink-soft); }
.schem { list-style: none; margin: 0; padding: 22px 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 0; border-bottom: 1px solid var(--line-soft); }
.schem .node { border: 1.5px solid var(--ink); padding: 7px 12px; font: 500 .74rem var(--mono); background: var(--bp-deep); white-space: nowrap; }
.schem .wire { position: relative; width: 44px; height: 2px; background: var(--amber); }
.schem .wire span { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: var(--bp-deep); color: var(--amber); font: 600 .8rem var(--mono); padding: 0 4px; line-height: 1; }
@media (max-width: 640px) {
  .schem { flex-direction: column; align-items: flex-start; }
  .schem .wire { width: 2px; height: 26px; margin-left: 22px; }
  .schem .node { white-space: normal; }
}
.sheet-body { display: grid; gap: 24px; padding: 20px; }
@media (min-width: 980px) { .sheet-body { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 32px; } }
.media { position: relative; margin: 0; aspect-ratio: 16 / 10; overflow: hidden; background: var(--bp-deep); border: 1px solid var(--line-soft); cursor: pointer; }
.media img, .media video { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.media img, .tile-thumb img { filter: grayscale(1) contrast(1.05); mix-blend-mode: luminosity; opacity: .92; transition: filter .25s, opacity .25s; }
.media:hover img, .media:focus-within img, .tile:hover .tile-thumb img, .tile:focus-within .tile-thumb img { filter: none; mix-blend-mode: normal; opacity: 1; }
@media (hover: none) { .media img, .tile-thumb img { filter: none; mix-blend-mode: normal; opacity: 1; } }
.media video { position: absolute; inset: 0; opacity: 0; transition: opacity .2s; }
.media[data-state="playing"] video, .media[data-state="paused"] video { opacity: 1; }
.play { position: absolute; left: 0; bottom: 0; border: 0; border-top: 1px solid var(--line); border-right: 1px solid var(--line); background: var(--bp-deep); color: var(--ink); padding: 8px 14px; font: 500 .72rem var(--mono); cursor: pointer; }
.play::before { content: "▶ "; color: var(--amber); }
.media[data-state="playing"] .play::before { content: "❚❚ "; }
.sheet-text p { margin: 0 0 18px; }
.chips { display: flex; flex-wrap: wrap; gap: 5px; list-style: none; margin: 0 0 20px; padding: 0; }
.chips li { border: 1px solid var(--line-soft); padding: 2px 7px; font: 500 .68rem var(--mono); color: var(--ink-soft); }
.links { display: flex; flex-wrap: wrap; gap: 8px; }

/* ---------- projects ---------- */
.controls { display: grid; gap: 16px; margin-bottom: 22px; }
@media (min-width: 1000px) { .controls { grid-template-columns: minmax(0, 1fr) auto; align-items: end; } }
.search label { display: block; font: 500 .7rem var(--mono); color: var(--muted); margin-bottom: 6px; }
.search-box { display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: var(--bp-deep); padding: 0 12px; }
.search-box:focus-within { border-color: var(--amber); }
.search-box input { flex: 1; min-width: 0; border: 0; background: none; color: var(--ink); font: 500 1rem var(--sans); padding: 11px 0; }
.search-box input:focus { outline: none; }
.search-box input::placeholder { color: var(--muted); }
.seg { display: flex; flex-wrap: wrap; }
.seg button { border: 1px solid var(--line); margin: 0 -1px -1px 0; background: none; padding: 8px 12px; font: 600 .85rem var(--sans); font-stretch: 85%; cursor: pointer; }
.seg button [data-count] { font: 500 .68rem var(--mono); color: var(--muted); margin-left: 6px; }
.seg button:hover { background: var(--bp-raise); }
.seg button[aria-pressed="true"] { background: var(--ink); color: var(--bp-deep); position: relative; z-index: 1; }
.seg button[aria-pressed="true"] [data-count] { color: var(--bp-deep); }
.also { color: var(--ink-soft); margin: 0 0 16px; font-size: .95rem; }
.tiles { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 148px), 1fr)); }
@media (min-width: 700px) { .tiles { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; } }
.tile { position: relative; border: 1px solid var(--line-soft); background: rgb(12 42 94 / .55); display: flex; flex-direction: column; }
.tile:hover, .tile:focus-within { border-color: var(--ink); }
.tile::before, .tile::after { content: ""; position: absolute; width: 10px; height: 10px; border: 0 solid var(--amber); opacity: 0; transition: opacity .15s; pointer-events: none; }
.tile::before { top: -5px; left: -5px; border-top-width: 2px; border-left-width: 2px; }
.tile::after { bottom: -5px; right: -5px; border-bottom-width: 2px; border-right-width: 2px; }
.tile:hover::before, .tile:hover::after, .tile:focus-within::before, .tile:focus-within::after { opacity: 1; }
.tile-thumb { aspect-ratio: 16 / 10; overflow: hidden; background: var(--bp-deep); border-bottom: 1px solid var(--line-soft); }
.tile-thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.tile-body { padding: 10px 12px 14px; }
.tile-kind { font: 500 .62rem var(--mono); color: var(--amber); }
.tile h3 { margin: 2px 0 4px; font: 700 1.02rem/1.2 var(--sans); font-stretch: 85%; }
.tile h3 button { background: none; border: 0; padding: 0; text-align: left; cursor: pointer; }
.tile h3 button::after { content: ""; position: absolute; inset: 0; }
.tile h3 button:focus-visible { outline: none; }
.tile:has(button:focus-visible) { outline: 2px solid var(--amber); outline-offset: 3px; }
.tile-body p { margin: 0; font-size: .85rem; line-height: 1.45; color: var(--ink-soft); }
@media (max-width: 520px) { .tile-body p { display: none; } }
.cmds { list-style: none; margin: 0; padding: 12px 14px; background: var(--bp-deep); border: 1px solid var(--line-soft); font: 400 .72rem/1.8 var(--mono); }
.cmds li { display: grid; grid-template-columns: 9ch 1fr; gap: 8px; }
.cmds code { color: var(--amber); }
.cmds span { color: var(--ink-soft); }
.cmds-mini { border: 0; height: 100%; padding: 8px 10px; font-size: .58rem; line-height: 1.55; overflow: hidden; }
.cmds-mini li { grid-template-columns: 1fr; }
.cmds-mini span { display: none; }
.panel[hidden] { display: none; }
.empty { border: 1px dashed var(--line); padding: 28px; }
.empty p { margin: 0 0 14px; font: 500 .9rem var(--mono); }
.empty p::before { content: "! "; color: var(--red); }

/* ---------- drawer ---------- */
dialog.drawer { position: fixed; inset: 0 0 0 auto; margin: 0; width: min(560px, 100vw); max-width: 100vw; height: 100%; max-height: 100dvh; padding: 0; border: 0; border-left: 1px solid var(--line); background: var(--bp-deep); color: var(--ink); overflow: auto; }
dialog.drawer[open] { animation: slide .22s ease-out; }
@keyframes slide { from { transform: translateX(40px); opacity: 0; } }
dialog.drawer::backdrop { background: rgb(6 20 46 / .6); }
.drawer-head { position: sticky; top: 0; display: flex; align-items: start; justify-content: space-between; gap: 16px; padding: 18px 22px; background: var(--bp-deep); border-bottom: 1px solid var(--line-soft); z-index: 1; }
.drawer-head h2 { font-size: clamp(1.8rem, 6vw, 2.4rem); margin: 0; }
.drawer-head h2::after { display: none; }
.close { border: 1px solid var(--line); background: none; padding: 6px 12px; font: 500 .72rem var(--mono); cursor: pointer; flex: none; }
.close:hover { border-color: var(--amber); color: var(--amber); }
.drawer-slot { padding: 22px; }
.drawer-slot .panel-fig { margin: 0 0 18px; border: 1px solid var(--line-soft); }
.drawer-slot .panel-sum { font-size: 1.15rem; color: var(--ink); font-weight: 600; margin-top: 0; }
.drawer-slot p { color: var(--ink-soft); }
.panel-h { font: 600 .7rem var(--mono); color: var(--muted); margin: 22px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--line-soft); }
.panel-hl { margin: 0; padding-left: 1.1em; }
.panel-hl li { margin-bottom: 6px; }
.panel-hl li::marker { color: var(--amber); }
.drawer-slot .cmds { margin-bottom: 18px; }

/* ---------- apps teaser ---------- */
.apps { display: grid; gap: 30px; }
@media (min-width: 1000px) { .apps { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); align-items: center; } }
.apps-count { font: 800 clamp(1.6rem, 3.4vw, 2.3rem)/1.05 var(--sans); font-stretch: 72%; text-transform: uppercase; margin: 0 0 20px; }
.apps-count b { color: var(--amber); }
.contact-sheet { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
@media (min-width: 700px) { .contact-sheet { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.contact-sheet a { position: relative; display: block; color: var(--ink); text-decoration: none; font: 500 .68rem var(--mono); }
.contact-sheet a::before, .contact-sheet a::after { content: ""; position: absolute; width: 12px; height: 12px; border: 0 solid var(--line); }
.contact-sheet a::before { top: -7px; left: -7px; border-top-width: 1px; border-left-width: 1px; }
.contact-sheet a::after { top: -7px; right: -7px; border-top-width: 1px; border-right-width: 1px; }
.contact-sheet img { aspect-ratio: 4 / 3; object-fit: cover; object-position: top left; margin-bottom: 8px; border: 1px solid var(--line-soft); }
.contact-sheet a:hover { color: var(--amber); }
.contact-sheet a:hover img { border-color: var(--amber); }

/* ---------- contact ---------- */
.contact p { max-width: 50ch; font-size: 1.1rem; color: var(--ink-soft); }
.tb-contact { display: grid; grid-template-columns: auto minmax(0, 1fr); border: 1.5px solid var(--ink); max-width: 760px; margin-top: 28px; background: rgb(12 42 94 / .55); }
.tb-contact dt, .tb-contact dd { margin: 0; padding: 14px 16px; border-top: 1px solid var(--line-soft); min-width: 0; }
.tb-contact dt:first-of-type, .tb-contact dt:first-of-type + dd { border-top: 0; }
.tb-contact dt { font: 500 .68rem/1.9 var(--mono); color: var(--muted); border-right: 1px solid var(--line-soft); }
.tb-contact dd { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; font-weight: 600; font-size: 1.05rem; }
.tb-contact dd a { color: var(--ink); overflow-wrap: anywhere; }
.tb-contact dd a:hover { color: var(--amber); }
.tb-contact .btn { min-height: 32px; padding: 0 12px; font-size: .8rem; margin-left: auto; }
.tb-contact .btn[data-copied] { background: var(--amber); color: var(--on-amber); border-color: var(--amber); }

footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px 24px; padding: 18px clamp(16px, 4.5vw, 64px) 28px; border-top: 1px solid var(--line-soft); font: 400 .7rem var(--mono); color: var(--muted); max-width: 1240px; }
footer .keys { display: flex; gap: 16px; flex-wrap: wrap; }

/* ---------- palette + toast ---------- */
dialog.palette { width: min(620px, calc(100vw - 32px)); margin: 80px auto auto; padding: 0; border: 1.5px solid var(--ink); background: var(--bp-deep); color: var(--ink); }
dialog.palette::backdrop { background: rgb(6 20 46 / .6); }
.pal-input { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--line); }
.pal-input span { font: 600 .9rem var(--mono); color: var(--amber); }
.pal-input input { flex: 1; min-width: 0; background: none; border: 0; color: var(--ink); font: 500 1.05rem var(--sans); }
.pal-input input:focus { outline: none; }
#pal-list { list-style: none; margin: 0; padding: 6px 0; max-height: min(440px, 60vh); overflow: auto; }
#pal-list li { display: flex; justify-content: space-between; gap: 14px; padding: 8px 16px; cursor: pointer; }
#pal-list li[aria-selected="true"] { background: var(--ink); color: var(--bp-deep); }
#pal-list li[aria-selected="true"] .pal-hint { color: var(--bp-deep); }
.pal-hint { font: 400 .66rem/2 var(--mono); color: var(--muted); white-space: nowrap; }
.pal-none { color: var(--muted); }
.toast { position: fixed; left: 50%; bottom: 22px; transform: translate(-50%, 16px); opacity: 0; pointer-events: none; background: var(--amber); color: var(--on-amber); font: 600 .75rem var(--mono); padding: 10px 16px; transition: opacity .2s, transform .2s; z-index: 60; }
.toast[data-show="true"] { opacity: 1; transform: translate(-50%, 0); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
</style>
</head>
<body>
<header class="rail">
  <a class="mono-mark" href="#top" aria-label="Pero Grubač, back to the top">PG</a>
  <nav aria-label="Sections">
    <ul>
      <li><a href="#about">About</a></li>
      <li><a href="#systems">Systems</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#apps">Apps</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
  <button type="button" class="pal-btn" data-palette aria-label="Open the command palette"><span class="lbl">Commands</span><kbd><span data-mod>Ctrl</span> K</kbd></button>
  <div class="rail-block" aria-hidden="true">
    <div><b>Pero Grubač</b>Backend developer</div>
    <div><b>Banja Luka, BiH</b>Java · C# · Python</div>
  </div>
</header>

<div class="page">
<main>
  <section class="hero" id="top">
    <div>
      <div class="name-wrap">
        <div class="dim" aria-hidden="true"><span>backend developer</span></div>
        <h1>${esc(site.name)}</h1>
      </div>
      <p class="hero-line">${esc(site.heroLine)}</p>
      <a class="stamp" href="#contact">Available for freelance projects</a>
      <div class="hero-links">
        <a class="btn btn-amber" href="#systems">See the systems</a>
        <a class="btn" href="${site.github}" target="_blank" rel="noopener">GitHub</a>
        <a class="btn" href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>
    <div>
      <figure class="drawing" style="margin:0">
        <svg viewBox="0 0 440 250" role="img" aria-label="Diagram: services that talk to each other over a queue, a socket and REST">
          <defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="ah" d="M0 0L8 4L0 8z"/></marker></defs>
          <rect class="box" x="8" y="20" width="104" height="48"/><text x="60" y="49" text-anchor="middle">client</text>
          <rect class="box" x="168" y="20" width="104" height="48"/><text x="220" y="49" text-anchor="middle">service</text>
          <rect class="box" x="328" y="20" width="104" height="48"/><text x="380" y="49" text-anchor="middle">service</text>
          <rect class="box" x="168" y="170" width="104" height="48"/><text x="220" y="199" text-anchor="middle">queue</text>
          <rect class="box" x="328" y="170" width="104" height="48"/><text x="380" y="199" text-anchor="middle">worker</text>
          <path class="wire" d="M112 44 H166" marker-end="url(#ah)"/><text class="lbl" x="140" y="36" text-anchor="middle">REST</text>
          <path class="wire" d="M272 44 H326" marker-end="url(#ah)"/><text class="lbl" x="300" y="36" text-anchor="middle">socket</text>
          <path class="wire" d="M220 68 V168" marker-end="url(#ah)"/><text class="lbl" x="230" y="124">publish</text>
          <path class="wire" d="M272 194 H326" marker-end="url(#ah)"/><text class="lbl" x="300" y="186" text-anchor="middle">event</text>
          <text class="cap" x="8" y="244">Services that talk over queues, sockets and REST.</text>
        </svg>
      </figure>
      <dl class="titleblock">
        <dt>Name</dt><dd>${esc(site.name)}</dd>
        <dt>Role</dt><dd>Backend developer</dd>
        <dt>Based in</dt><dd>Banja Luka, BiH</dd>
        <dt>Stack</dt><dd>Java/Spring Boot · C#/.NET · Python/FastAPI</dd>
      </dl>
    </div>
  </section>

  <section id="about" aria-labelledby="about-h">
    <h2 id="about-h">About</h2>
    <div class="about">
      <figure class="detail-circle">
        <img src="${site.avatar}" alt="Pero Grubač" width="200" height="200" loading="lazy">
        <figcaption>Detail: the developer</figcaption>
      </figure>
      <div class="about-text">
        ${site.about.map((t) => `<p>${esc(t)}</p>`).join("")}
        <div class="stack-grid">
          ${Object.entries(site.stack)
            .map(([group, list]) => `<div><h3>${group}</h3><div class="terms">${list.map((t) => `<button type="button" data-term="${esc(t)}" aria-label="Search projects for ${esc(t)}">${esc(t)}</button>`).join("")}</div></div>`)
            .join("")}
        </div>
        <p class="hint">Select a technology to search the projects for it.</p>
      </div>
    </div>
  </section>

  <section id="systems" aria-labelledby="systems-h">
    <h2 id="systems-h">Systems</h2>
    <p class="lede">Backends made of several services that talk over queues, sockets and REST. Each one gets a case study.</p>
    <div class="sheets">${systems.map(systemHtml).join("")}</div>
  </section>

  <section id="projects" aria-labelledby="projects-h">
    <h2 id="projects-h">Projects</h2>
    <p class="lede">Live apps, mobile and desktop apps, and tools. Select one to open its details.</p>
    <div class="controls">
      <div class="search" role="search">
        <label for="q">Search title, summary or stack</label>
        <div class="search-box"><input id="q" type="search" placeholder="e.g. Flutter, PWA, Godot" autocomplete="off" spellcheck="false"><kbd aria-hidden="true">/</kbd></div>
      </div>
      <div class="seg" role="group" aria-label="Filter by kind">
        <button type="button" data-filter="" data-label="All" aria-pressed="true">All<span data-count>${others.length}</span></button>
        ${kinds.map((k) => `<button type="button" data-filter="${k.key}" data-label="${k.label}" aria-pressed="false">${k.label}<span data-count>${k.count}</span></button>`).join("")}
      </div>
    </div>
    <p class="sr-only" id="result-status" aria-live="polite"></p>
    <p class="also" id="also" hidden>Also among the systems above: <span data-also-list></span></p>
    <ul class="tiles">
      ${others.map(tileHtml).join("")}
    </ul>
    <div class="empty" id="empty" hidden>
      <p>No project matches “<span data-empty-q></span>”.</p>
      <button type="button" class="btn" data-clear>Clear search</button>
    </div>
  </section>

  <section id="apps" aria-labelledby="apps-h">
    <h2 id="apps-h">Browser apps</h2>
    <div class="apps">
      <div>
        <p class="apps-count"><b>${liveApps.length}</b> browser apps you can open right now</p>
        <a class="btn btn-amber" href="#projects?kind=live">Show the browser apps</a>
      </div>
      <ul class="contact-sheet">
        ${teaserApps.map((p) => `<li><a href="${esc(p.links.live)}" target="_blank" rel="noopener">${img(p)}${esc(p.title)} ↗</a></li>`).join("")}
      </ul>
    </div>
  </section>

  <section id="contact" class="contact" aria-labelledby="contact-h">
    <h2 id="contact-h">Let's work together</h2>
    <p>${esc(site.freelanceLine)}</p>
    <dl class="tb-contact">
      <dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a><button type="button" class="btn" data-copy aria-label="Copy email address"><span data-copy-label>Copy</span></button></dd>
      <dt>GitHub</dt><dd><a href="${site.github}" target="_blank" rel="noopener">github.com/pero-grubac ↗</a></dd>
      <dt>LinkedIn</dt><dd><a href="${site.linkedin}" target="_blank" rel="noopener">linkedin.com/in/perogrubac ↗</a></dd>
    </dl>
  </section>
</main>

<footer>
  <span>© <span data-year>2026</span> Pero Grubač</span>
  <span class="keys"><span><kbd>/</kbd> search</span><span><kbd><span data-mod>Ctrl</span> K</kbd> commands</span></span>
</footer>
</div>

<dialog class="drawer" id="drawer" aria-labelledby="drawer-title">
  <div class="drawer-head">
    <h2 id="drawer-title"></h2>
    <button type="button" class="close" data-close-drawer>Close <span aria-hidden="true">✕</span></button>
  </div>
  <div class="drawer-slot"></div>
</dialog>

<dialog class="palette" id="palette" aria-label="Command palette">
  <div class="pal-input">
    <span aria-hidden="true">&gt;</span>
    <input id="pal-q" type="text" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" aria-label="Type a command or a project" placeholder="Type a command or a project" autocomplete="off" spellcheck="false">
    <kbd>esc</kbd>
  </div>
  <ul id="pal-list" role="listbox" aria-label="Commands"></ul>
</dialog>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

${scripts({
  config: `
// Details open in a side drawer (<dialog>); the panel is moved in and back out.
window.ProtoConfig = (() => {
  const drawer = document.getElementById("drawer");
  const slot = drawer.querySelector(".drawer-slot");
  const title = document.getElementById("drawer-title");
  let cur = null;
  const restore = () => {
    if (!cur) return;
    cur.panel.hidden = true;
    cur.item.append(cur.panel);
    cur = null;
  };
  const detail = {
    open(slug) {
      const item = document.querySelector('[data-item][data-slug="' + slug + '"]');
      if (!item) return;
      restore();
      const panel = item.querySelector(".panel");
      panel.hidden = false;
      slot.append(panel);
      title.textContent = item.dataset.title;
      cur = { item, panel };
      if (!drawer.open) drawer.showModal();
      drawer.scrollTop = 0;
    },
    close() { if (drawer.open) drawer.close(); },
    current: () => cur && cur.item.dataset.slug,
  };
  drawer.addEventListener("close", () => {
    const btn = cur && cur.item.querySelector("[data-open-detail]");
    restore();
    btn && btn.focus({ preventScroll: true });
  });
  drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.close(); });
  drawer.querySelector("[data-close-drawer]").addEventListener("click", () => drawer.close());
  document.querySelectorAll("[data-open-detail]").forEach((b) =>
    b.addEventListener("click", () => detail.open(b.closest("[data-item]").dataset.slug))
  );
  // Rail highlights the section in view
  const links = [...document.querySelectorAll(".rail nav a")];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting)
      links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + e.target.id)));
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main > section").forEach((s) => io.observe(s));
  return { detail };
})();`,
})}
</body>
</html>`;
}
