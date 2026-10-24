// Direction A — "Console": the page is one Windows Terminal window.
export default function render(ctx) {
  const { site, systems, others, liveApps, kinds, esc, haystack, kindLabel, actions, caseStudyLink, flowParts, img, scripts } = ctx;

  const flow = (f) =>
    `<p class="flow"><span class="sr-only">Architecture: </span>${flowParts(f)
      .map((x) => (x.node ? `<span class="n">${esc(x.node)}</span>` : `<span class="op">${x.op}</span>`))
      .join(" ")}</p>`;

  const commands = (p) =>
    `<ul class="cmds" aria-label="Slash commands">${p.commands
      .map((c) => `<li><code>${esc(c.cmd)}</code><span>${esc(c.text)}</span></li>`)
      .join("")}</ul>`;

  const systemHtml = (p) => `
    <article class="sys" id="${p.slug}" data-system data-title="${esc(p.title)}" data-hay="${esc(haystack(p))}">
      <figure class="media" data-video="${esc(p.video)}" data-title="${esc(p.title)}" data-state="idle">
        ${img(p, { eager: p.order === 1 })}
        <button type="button" class="play" data-play><span class="play-glyph" aria-hidden="true"></span><span data-play-text>Play demo</span></button>
      </figure>
      <div class="sys-text">
        <h3>${esc(p.title)}</h3>
        ${flow(p.flow)}
        <p class="desc">${esc(p.description)}</p>
        <p class="stack"><span class="sr-only">Stack: </span>${p.stack.map(esc).join('<span aria-hidden="true"> · </span>')}</p>
        <div class="links">${caseStudyLink(p, "btn btn-primary")}${actions(p, "btn")}</div>
      </div>
    </article>`;

  const rowHtml = (p) => `
    <li class="row" data-item data-slug="${p.slug}" data-kind="${p.kind}" data-hay="${esc(haystack(p))}" id="p-${p.slug}">
      <span class="r-kind k-${p.kind}">${kindLabel(p.kind).toLowerCase()}</span>
      <h3 class="r-name"><button type="button" data-toggle aria-expanded="false" aria-controls="d-${p.slug}">${esc(p.title)}</button></h3>
      <p class="r-sum">${esc(p.summary)}</p>
      <div class="detail" id="d-${p.slug}" hidden>
        <div class="d-media">${p.image ? img(p) : p.commands ? commands(p) : ""}</div>
        <dl class="fl">
          <div><dt>Description</dt><dd>${esc(p.description)}</dd></div>
          <div><dt>Highlights</dt><dd><ul class="hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></dd></div>
          <div><dt>Stack</dt><dd class="d-stack">${p.stack.map(esc).join(", ")}</dd></div>
          <div><dt>Links</dt><dd class="links">${actions(p, "btn")}</dd></div>
        </dl>
      </div>
    </li>`;

  const teaserApps = liveApps.slice(0, 4);

  return `<!doctype html>
<html lang="en" data-theme="dark" data-theme-key="proto-a-theme" data-email="${site.email}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="icon" href="../../assets/favicon.ico">
<title>Direction A · Console | Pero Grubač</title>
<script>try{var t=localStorage.getItem("proto-a-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/cascadia-code@5.2.1/index.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<style>
:root, :root[data-theme="dark"] {
  color-scheme: dark;
  --desk: #060708;
  --win: #0c0c0c;
  --strip: #1b1b1b;
  --tab-hover: #262626;
  --pane: #121314;
  --line: #2a2c30;
  --line-strong: #3b3e44;
  --fg: #cccccc;
  --fg-strong: #f2f2f2;
  --muted: #9a9ea6;
  --cyan: #61d6d6;
  --green: #16c60c;
  --yellow: #f9f1a5;
  --blue: #7aa2ff;
  --magenta: #e07de0;
  --close: #c42b1c;
  --sel: rgb(97 214 214 / 0.09);
  --dot: rgb(255 255 255 / 0.07);
  --on-accent: #0c0c0c;
}
:root[data-theme="light"] {
  color-scheme: light;
  --desk: #e4e4e4;
  --win: #fafafa;
  --strip: #ededed;
  --tab-hover: #e2e2e2;
  --pane: #ffffff;
  --line: #dcdcdc;
  --line-strong: #c3c3c3;
  --fg: #383a42;
  --fg-strong: #0f1012;
  --muted: #5f626b;
  --cyan: #0b6e7a;
  --green: #1d7a20;
  --yellow: #7a5a00;
  --blue: #2b59c3;
  --magenta: #8f2f8f;
  --close: #c42b1c;
  --sel: rgb(11 110 122 / 0.07);
  --dot: rgb(0 0 0 / 0.07);
  --on-accent: #ffffff;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
html { scroll-padding-top: 64px; -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--desk);
  color: var(--fg);
  font: 400 1rem/1.6 "IBM Plex Sans", system-ui, sans-serif;
}
.mono, h1, h2, h3, .tabs, .flow, .stack, .btn, .r-kind, kbd, code, .fl dt, .prompt, .status, .kinds button, input { font-family: "Cascadia Code Variable", ui-monospace, Consolas, monospace; }
a { color: var(--cyan); text-underline-offset: 3px; }
button { font: inherit; color: inherit; }
img { max-width: 100%; height: auto; display: block; }
:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
kbd { font-size: .8em; border: 1px solid var(--line-strong); border-bottom-width: 2px; padding: 0 .4em; border-radius: 4px; color: var(--muted); }

/* ---------- the window ---------- */
.window {
  max-width: 1240px;
  margin: 0 auto;
  background-color: var(--win);
  background-image: radial-gradient(var(--dot) 1px, transparent 1.4px);
  background-size: 22px 22px;
  min-height: 100vh;
}
@media (min-width: 1100px) {
  body { padding: 24px; }
  .window { border: 1px solid var(--line-strong); }
}
.titlebar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: stretch; gap: 4px;
  background: var(--strip);
  border-bottom: 1px solid var(--line);
  height: 44px;
  padding-left: 8px;
}
.tabs { display: flex; align-items: flex-end; gap: 2px; margin: 0; padding: 0; list-style: none; overflow-x: auto; scrollbar-width: none; flex: 1 1 auto; min-width: 0; }
.tabs::-webkit-scrollbar { display: none; }
.tabs a {
  display: flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 14px;
  border-radius: 8px 8px 0 0;
  color: var(--muted); text-decoration: none; font-size: .82rem; white-space: nowrap;
}
.tabs a:hover { background: var(--tab-hover); color: var(--fg); }
.tabs a[aria-current="true"] { background: var(--win); color: var(--fg-strong); }
.tabs .tab-icon { color: var(--green); font-weight: 700; }
.tb-actions { display: flex; align-items: center; gap: 2px; flex: none; }
.icon-btn {
  display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 10px;
  background: none; border: 0; border-radius: 6px; color: var(--muted); cursor: pointer; font-size: .8rem;
}
.icon-btn:hover { background: var(--tab-hover); color: var(--fg); }
.icon-btn svg { width: 16px; height: 16px; }
.icon-btn .lbl { font-family: "Cascadia Code Variable", monospace; }
.caption { display: none; align-items: stretch; margin-left: 6px; }
.caption span { width: 46px; display: grid; place-items: center; color: var(--muted); font-size: 12px; }
.caption span:hover { background: var(--tab-hover); color: var(--fg); }
.caption span.close:hover { background: var(--close); color: #fff; }
@media (min-width: 900px) { .caption { display: flex; } }
@media (max-width: 560px) { .icon-btn .lbl, .tb-kbd { display: none; } .tabs a { padding: 0 10px; } }
:root[data-theme="dark"] .sun, :root[data-theme="light"] .moon { display: none; }

/* ---------- sections ---------- */
main > section { padding: clamp(40px, 7vw, 88px) clamp(16px, 5vw, 64px); }
main > section + section { border-top: 1px solid var(--line); }
h2 {
  display: flex; align-items: center; gap: 16px;
  margin: 0 0 28px; font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 600; color: var(--fg-strong); letter-spacing: -.01em;
}
h2::after { content: ""; flex: 1; border-top: 1px dashed var(--line-strong); }
.lede { max-width: 62ch; color: var(--muted); margin: -12px 0 32px; }

/* ---------- hero ---------- */
.hero { display: grid; gap: 40px; align-items: end; padding-top: clamp(48px, 9vw, 120px) !important; }
@media (min-width: 1000px) { .hero { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); } }
.prompt { color: var(--muted); font-size: .9rem; margin: 0 0 18px; overflow-wrap: anywhere; }
.prompt .ps { color: var(--green); }
.prompt .path { color: var(--cyan); }
.cursor { display: inline-block; width: .6em; height: 1.1em; vertical-align: -.2em; background: var(--fg); margin-left: 4px; animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
h1 { margin: 0; font-size: clamp(2.6rem, 9vw, 5.6rem); line-height: 1; font-weight: 700; color: var(--fg-strong); letter-spacing: -.035em; }
.hero-line { font-size: clamp(1.1rem, 2.2vw, 1.35rem); max-width: 34ch; margin: 22px 0 26px; color: var(--fg); }
.status { display: inline-flex; align-items: center; gap: 10px; color: var(--green); font-size: .9rem; text-decoration: none; padding: 6px 12px 6px 10px; border: 1px solid color-mix(in srgb, var(--green) 45%, transparent); border-radius: 6px; }
.status::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--green) 25%, transparent); }
.status:hover { background: color-mix(in srgb, var(--green) 10%, transparent); }
.hero-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
.ls { border: 1px solid var(--line); background: var(--pane); font-family: "Cascadia Code Variable", monospace; font-size: .82rem; }
.ls-head { padding: 10px 14px; border-bottom: 1px solid var(--line); color: var(--muted); overflow-wrap: anywhere; }
.ls-head .ps { color: var(--green); }
.ls table { width: 100%; border-collapse: collapse; }
.ls th { text-align: left; font-weight: 400; color: var(--fg-strong); padding: 10px 14px 0; }
.ls th span { display: block; color: var(--muted); }
.ls td { padding: 8px 14px; vertical-align: top; border-top: 1px solid transparent; }
.ls td:first-child { white-space: nowrap; }
.ls td a { color: var(--fg-strong); text-decoration: none; }
.ls td a:hover { color: var(--cyan); text-decoration: underline; }
.ls tr:last-child td { padding-bottom: 14px; }
.ls .f { color: var(--muted); }
@media (max-width: 640px) { .ls .f { display: none; } }

/* ---------- buttons ---------- */
.btn {
  display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 14px;
  border: 1px solid var(--line-strong); border-radius: 6px; background: transparent;
  color: var(--fg); text-decoration: none; font-size: .85rem; cursor: pointer;
}
.btn:hover { border-color: var(--cyan); color: var(--cyan); }
.btn-primary { background: var(--cyan); border-color: var(--cyan); color: var(--on-accent); font-weight: 600; }
.btn-primary:hover { color: var(--on-accent); filter: brightness(1.1); }
.btn.is-muted { color: var(--muted); border-style: dashed; cursor: default; }
.btn.is-muted:hover { border-color: var(--line-strong); color: var(--muted); }
a.btn[target="_blank"]::after { content: "↗"; font-size: .9em; }

/* ---------- about ---------- */
.about { display: grid; gap: 40px; }
@media (min-width: 860px) { .about { grid-template-columns: 220px minmax(0, 1fr); } }
.photo img { width: 100%; max-width: 220px; aspect-ratio: 1; object-fit: cover; border: 1px solid var(--line-strong); filter: saturate(.9); }
.photo figcaption { font-family: "Cascadia Code Variable", monospace; font-size: .75rem; color: var(--muted); margin-top: 8px; }
.about-text p { max-width: 64ch; margin: 0 0 1em; font-size: 1.05rem; }
.fl { margin: 0; display: grid; gap: 10px; }
.fl > div { display: grid; grid-template-columns: 15ch minmax(0, 1fr); gap: 0 12px; }
.fl dt, .fl .dt { color: var(--muted); font-size: .85rem; font-weight: 400; margin: 0; font-family: "Cascadia Code Variable", monospace; }
.fl dt::after, .fl .dt::after { content: " :"; float: right; }
.fl dd { margin: 0; min-width: 0; }
@media (max-width: 560px) { .fl > div { grid-template-columns: 1fr; } .fl dt::after, .fl .dt::after { content: ""; } }
.stack-block { margin-top: 36px; padding-top: 28px; border-top: 1px dashed var(--line); }
.terms { display: flex; flex-wrap: wrap; gap: 4px 6px; }
.terms button { background: none; border: 0; padding: 2px 6px; margin: -2px 0; border-radius: 4px; color: var(--yellow); font-size: .85rem; cursor: pointer; }
.terms button:hover { background: var(--sel); text-decoration: underline; text-underline-offset: 3px; }
.hint { color: var(--muted); font-size: .85rem; margin: 14px 0 0; }

/* ---------- systems ---------- */
.sys { display: grid; gap: 28px; padding: 32px 0; }
.sys + .sys { border-top: 1px dashed var(--line); }
@media (min-width: 980px) { .sys { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 44px; align-items: start; } }
.media { position: relative; margin: 0; background: var(--pane); cursor: pointer; aspect-ratio: 16 / 10; overflow: hidden; }
.media img, .media video { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.media video { position: absolute; inset: 0; opacity: 0; transition: opacity .2s; }
.media[data-state="playing"] video, .media[data-state="paused"] video { opacity: 1; }
.play {
  position: absolute; left: 12px; bottom: 12px; display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border: 0; border-radius: 6px; background: rgb(12 12 12 / .82); color: #f2f2f2;
  font-family: "Cascadia Code Variable", monospace; font-size: .78rem; cursor: pointer;
}
.play-glyph { width: 0; height: 0; border-left: 8px solid currentColor; border-top: 5px solid transparent; border-bottom: 5px solid transparent; }
.media[data-state="playing"] .play-glyph { width: 8px; height: 10px; border: 0; border-left: 3px solid currentColor; border-right: 3px solid currentColor; }
.sys h3 { margin: 0 0 12px; font-size: clamp(1.35rem, 2.6vw, 1.75rem); color: var(--fg-strong); letter-spacing: -.01em; }
.flow { margin: 0 0 18px; font-size: .82rem; line-height: 1.9; color: var(--fg); }
.flow .n { white-space: nowrap; border-bottom: 1px solid var(--line-strong); }
.flow .op { color: var(--yellow); padding: 0 2px; }
.desc { margin: 0 0 16px; }
.stack { font-size: .78rem; color: var(--muted); margin: 0 0 20px; line-height: 1.8; }
.links { display: flex; flex-wrap: wrap; gap: 8px; }

/* ---------- projects ---------- */
.controls { display: grid; gap: 14px; margin-bottom: 18px; }
@media (min-width: 900px) { .controls { grid-template-columns: minmax(0, 1fr) auto; align-items: center; } }
.search { display: flex; align-items: center; gap: 10px; border: 1px solid var(--line-strong); background: var(--pane); padding: 0 12px; border-radius: 6px; min-height: 44px; }
.search:focus-within { border-color: var(--cyan); }
.search .ps { color: var(--green); font-family: "Cascadia Code Variable", monospace; font-size: .85rem; }
.search input { flex: 1; min-width: 0; background: none; border: 0; color: var(--fg-strong); font-size: .9rem; padding: 10px 0; }
.search input:focus { outline: none; }
.search input::placeholder { color: var(--muted); }
.kinds { display: flex; flex-wrap: wrap; gap: 6px; }
.kinds button { border: 1px solid var(--line-strong); background: transparent; border-radius: 6px; padding: 6px 10px; font-size: .8rem; color: var(--fg); cursor: pointer; }
.kinds button [data-count] { color: var(--muted); margin-left: 4px; }
.kinds button:hover { border-color: var(--cyan); }
.kinds button[aria-pressed="true"] { background: var(--fg-strong); color: var(--win); border-color: var(--fg-strong); }
.kinds button[aria-pressed="true"] [data-count] { color: inherit; opacity: .7; }
.result-status { font-family: "Cascadia Code Variable", monospace; font-size: .78rem; color: var(--muted); margin: 0 0 6px; }
.also { font-size: .9rem; margin: 0 0 12px; color: var(--muted); }
.table-head, .row { display: grid; grid-template-columns: 5.5rem minmax(0, 15rem) minmax(0, 1fr); column-gap: 18px; padding: 0 12px; }
.table-head { padding: 0 13px; }
.table-head { font-family: "Cascadia Code Variable", monospace; font-size: .82rem; color: var(--fg-strong); }
.table-head span::after { content: attr(data-dash); display: block; color: var(--muted); }
.rows { list-style: none; margin: 4px 0 0; padding: 0; background: var(--pane); border: 1px solid var(--line); }
.row { position: relative; padding-top: 11px; padding-bottom: 11px; border-top: 1px solid var(--line); align-items: baseline; }
.row:first-child { border-top: 0; }
.row:hover { background: var(--sel); }
.row[data-open] { background: var(--sel); box-shadow: inset 3px 0 0 var(--cyan); }
.r-kind { font-size: .78rem; }
.k-live { color: var(--green); } .k-web { color: var(--cyan); } .k-mobile { color: var(--yellow); } .k-desktop { color: var(--blue); } .k-tool { color: var(--magenta); }
.r-name { margin: 0; font-size: .92rem; font-weight: 600; }
.r-name button { background: none; border: 0; padding: 0; color: var(--fg-strong); text-align: left; cursor: pointer; }
.r-name button::after { content: ""; position: absolute; inset: 0; }
.r-name button:focus-visible { outline: none; }
.row:has(button:focus-visible) { outline: 2px solid var(--cyan); outline-offset: -2px; }
.r-name button::before { content: "▸ "; color: var(--muted); }
.r-name button[aria-expanded="true"]::before { content: "▾ "; color: var(--cyan); }
.r-sum { margin: 0; color: var(--muted); font-size: .92rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detail { grid-column: 2 / -1; position: relative; z-index: 1; display: grid; gap: 22px; padding: 18px 0 8px; cursor: auto; }
.detail[hidden] { display: none; }
@media (min-width: 1000px) { .detail { grid-template-columns: minmax(0, 1fr) 300px; } .d-media { order: 2; } }
.d-media img { border: 1px solid var(--line); }
.detail .fl dd { font-size: .95rem; }
.hl { margin: 0; padding-left: 1.1em; }
.hl li { margin-bottom: 4px; }
.hl li::marker { content: "- "; color: var(--muted); font-family: "Cascadia Code Variable", monospace; }
.d-stack { font-family: "Cascadia Code Variable", monospace; font-size: .8rem !important; color: var(--yellow); }
.cmds { list-style: none; margin: 0; padding: 12px 14px; background: var(--win); border: 1px solid var(--line); font-family: "Cascadia Code Variable", monospace; font-size: .78rem; display: grid; gap: 4px; }
.cmds li { display: grid; grid-template-columns: 10ch 1fr; gap: 10px; }
.cmds code { color: var(--cyan); }
.cmds span { color: var(--muted); }
@media (max-width: 700px) {
  .table-head { display: none; }
  .row { grid-template-columns: minmax(0, 1fr) auto; row-gap: 2px; }
  .r-kind { grid-column: 2; grid-row: 1; }
  .r-name { grid-column: 1; grid-row: 1; }
  .r-sum { grid-column: 1 / -1; white-space: normal; }
  .detail { grid-column: 1 / -1; }
}
.empty { border: 1px dashed var(--line-strong); padding: 24px; margin-top: 12px; }
.empty p { margin: 0 0 14px; font-family: "Cascadia Code Variable", monospace; color: var(--fg-strong); }
.empty p::before { content: "Get-Project : "; color: var(--close); filter: brightness(1.4); }

/* ---------- apps teaser ---------- */
.apps { display: grid; gap: 28px; }
@media (min-width: 900px) { .apps { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); align-items: center; } }
.apps-count { font-family: "Cascadia Code Variable", monospace; font-size: clamp(1.2rem, 2.4vw, 1.5rem); color: var(--fg-strong); margin: 0 0 18px; line-height: 1.35; }
.apps-count b { color: var(--green); font-weight: 700; }
.shots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; list-style: none; margin: 0; padding: 0; }
@media (min-width: 640px) { .shots { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.shots a { display: block; color: var(--fg); text-decoration: none; font-family: "Cascadia Code Variable", monospace; font-size: .75rem; }
.shots img { aspect-ratio: 16 / 10; object-fit: cover; object-position: top; border: 1px solid var(--line); margin-bottom: 6px; transition: border-color .15s; }
.shots a:hover img { border-color: var(--cyan); }

/* ---------- contact ---------- */
.contact h2 { font-size: clamp(1.8rem, 5vw, 3rem); }
.contact p { max-width: 52ch; }
.mail { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 28px 0; padding: 14px 16px; background: var(--pane); border: 1px solid var(--line); }
.mail .ps { color: var(--green); font-family: "Cascadia Code Variable", monospace; }
.mail a { font-family: "Cascadia Code Variable", monospace; font-size: clamp(.95rem, 2.4vw, 1.2rem); color: var(--fg-strong); overflow-wrap: anywhere; }
.mail .btn { margin-left: auto; }
.mail .btn[data-copied] { border-color: var(--green); color: var(--green); }
.socials { display: flex; gap: 10px; flex-wrap: wrap; }

/* ---------- footer ---------- */
footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px 24px; padding: 12px clamp(16px, 5vw, 64px); background: var(--strip); border-top: 1px solid var(--line); font-family: "Cascadia Code Variable", monospace; font-size: .75rem; color: var(--muted); }
footer .keys { display: flex; gap: 16px; flex-wrap: wrap; }

/* ---------- palette + toast ---------- */
dialog.palette { width: min(640px, calc(100vw - 32px)); margin: 72px auto auto; padding: 0; border: 1px solid var(--line-strong); border-radius: 8px; background: var(--strip); color: var(--fg); box-shadow: 0 20px 60px rgb(0 0 0 / .45); }
dialog.palette::backdrop { background: rgb(0 0 0 / .35); }
.pal-input { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--line); }
.pal-input span { color: var(--green); font-family: "Cascadia Code Variable", monospace; }
.pal-input input { flex: 1; min-width: 0; background: none; border: 0; color: var(--fg-strong); font-size: .95rem; }
.pal-input input:focus { outline: none; }
#pal-list { list-style: none; margin: 0; padding: 6px; max-height: min(420px, 60vh); overflow: auto; }
#pal-list li { display: flex; justify-content: space-between; gap: 16px; padding: 8px 10px; border-radius: 4px; cursor: pointer; font-size: .9rem; }
#pal-list li[aria-selected="true"] { background: var(--sel); box-shadow: inset 3px 0 0 var(--cyan); color: var(--fg-strong); }
.pal-hint { color: var(--muted); font-family: "Cascadia Code Variable", monospace; font-size: .75rem; white-space: nowrap; }
.pal-none { color: var(--muted); }
.toast { position: fixed; left: 50%; bottom: 20px; transform: translate(-50%, 20px); opacity: 0; pointer-events: none; padding: 10px 16px; background: var(--fg-strong); color: var(--win); font-family: "Cascadia Code Variable", monospace; font-size: .8rem; border-radius: 6px; transition: opacity .2s, transform .2s; z-index: 50; }
.toast[data-show="true"] { opacity: 1; transform: translate(-50%, 0); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
</style>
</head>
<body>
<div class="window">
  <header class="titlebar">
    <nav aria-label="Sections" style="display:contents">
      <ul class="tabs">
        <li><a href="#top" aria-current="true"><span class="tab-icon" aria-hidden="true">&gt;_</span>pero</a></li>
        <li><a href="#about">about</a></li>
        <li><a href="#systems">systems</a></li>
        <li><a href="#projects">projects</a></li>
        <li><a href="#apps">apps</a></li>
        <li><a href="#contact">contact</a></li>
      </ul>
    </nav>
    <div class="tb-actions">
      <button type="button" class="icon-btn" data-palette aria-label="Open the command palette">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
        <kbd class="tb-kbd"><span data-mod>Ctrl</span> K</kbd>
      </button>
      <button type="button" class="icon-btn" data-theme-toggle aria-label="Light theme">
        <svg class="moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>
        <svg class="sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3" stroke="currentColor" stroke-width="1.3"/></svg>
        <span class="lbl">theme</span>
      </button>
      <div class="caption" aria-hidden="true"><span>&#x2500;</span><span>&#x25A1;</span><span class="close">&#x2715;</span></div>
    </div>
  </header>

  <main>
    <section class="hero" id="top">
      <div>
        <p class="prompt"><span class="ps">PS</span> <span class="path">C:\\Users\\pero&gt;</span> Get-Profile</p>
        <h1>${esc(site.name)}</h1>
        <p class="hero-line">${esc(site.heroLine)}</p>
        <a class="status" href="#contact">Available for freelance projects</a>
        <div class="hero-links">
          <a class="btn btn-primary" href="#systems">See the systems</a>
          <a class="btn" href="${site.github}" target="_blank" rel="noopener">GitHub</a>
          <a class="btn" href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
        </div>
      </div>
      <div class="ls">
        <p class="ls-head" style="margin:0"><span class="ps">PS</span> C:\\Users\\pero&gt; Get-ChildItem .\\systems<span class="cursor" aria-hidden="true"></span></p>
        <table>
          <thead><tr><th scope="col">Name<span aria-hidden="true">----</span></th><th scope="col" class="f">Flow<span aria-hidden="true">----</span></th></tr></thead>
          <tbody>
            ${systems.map((p) => `<tr><td><a href="#${p.slug}">${esc(p.title)}</a></td><td class="f">${esc(p.flow)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section id="about" aria-labelledby="about-h">
      <h2 id="about-h">About</h2>
      <div class="about">
        <figure class="photo" style="margin:0">
          <img src="${site.avatar}" alt="Pero Grubač" width="220" height="220" loading="lazy">
          <figcaption>avatar.jpeg · Banja Luka</figcaption>
        </figure>
        <div class="about-text">
          ${site.about.map((t) => `<p>${esc(t)}</p>`).join("")}
          <div class="stack-block">
            <div class="fl">
              ${Object.entries(site.stack)
                .map(([group, list]) => `<div><h3 class="dt">${group}</h3><div class="terms">${list.map((t) => `<button type="button" data-term="${esc(t)}" aria-label="Search projects for ${esc(t)}">${esc(t)}</button>`).join("")}</div></div>`)
                .join("")}
            </div>
            <p class="hint">Select a technology to search the projects for it.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="systems" aria-labelledby="systems-h">
      <h2 id="systems-h">Systems</h2>
      <p class="lede">Backends made of several services that talk over queues, sockets and REST. Each one gets a case study.</p>
      ${systems.map(systemHtml).join("")}
    </section>

    <section id="projects" aria-labelledby="projects-h">
      <h2 id="projects-h">Projects</h2>
      <p class="lede">Live apps, mobile and desktop apps, and tools. Select a row for details.</p>
      <div class="controls">
        <div class="search" role="search">
          <span class="ps" aria-hidden="true">PS&gt;</span>
          <label for="q" class="sr-only">Search projects</label>
          <input id="q" type="search" placeholder="Search title, summary or stack" autocomplete="off" spellcheck="false">
          <kbd aria-hidden="true">/</kbd>
        </div>
        <div class="kinds" role="group" aria-label="Filter by kind">
          <button type="button" data-filter="" data-label="All" aria-pressed="true">all<span data-count>${others.length}</span></button>
          ${kinds.map((k) => `<button type="button" data-filter="${k.key}" data-label="${k.label}" aria-pressed="false">${k.label.toLowerCase()}<span data-count>${k.count}</span></button>`).join("")}
        </div>
      </div>
      <p class="result-status" id="result-status" aria-live="polite"></p>
      <p class="also" id="also" hidden>Also in the systems above: <span data-also-list></span></p>
      <div class="table-head" aria-hidden="true"><span data-dash="----">Kind</span><span data-dash="----">Name</span><span data-dash="-------">Summary</span></div>
      <ul class="rows">
        ${others.map(rowHtml).join("")}
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
          <p class="apps-count"><b>${liveApps.length}</b> browser apps you can open right now.</p>
          <a class="btn btn-primary" href="#projects?kind=live">Show all browser apps</a>
        </div>
        <ul class="shots">
          ${teaserApps.map((p) => `<li><a href="${esc(p.links.live)}" target="_blank" rel="noopener">${img(p)}${esc(p.title)} ↗</a></li>`).join("")}
        </ul>
      </div>
    </section>

    <section id="contact" class="contact" aria-labelledby="contact-h">
      <h2 id="contact-h">Let's work together</h2>
      <p>${esc(site.freelanceLine)}</p>
      <div class="mail">
        <span class="ps" aria-hidden="true">&gt;</span>
        <a href="mailto:${site.email}">${site.email}</a>
        <button type="button" class="btn" data-copy aria-label="Copy email address"><span data-copy-label>Copy</span></button>
      </div>
      <div class="socials">
        <a class="btn" href="${site.github}" target="_blank" rel="noopener">GitHub</a>
        <a class="btn" href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </section>
  </main>

  <footer>
    <span>© <span data-year>2026</span> Pero Grubač</span>
    <span class="keys"><span><kbd>/</kbd> search</span><span><kbd><span data-mod>Ctrl</span> K</kbd> commands</span><span><kbd>t</kbd> theme</span></span>
  </footer>
</div>

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
  theme: true,
  config: `
// Active tab follows the section in view
addEventListener("DOMContentLoaded", () => {
  const tabs = [...document.querySelectorAll(".tabs a")];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      tabs.forEach((t) => t.setAttribute("aria-current", String(t.getAttribute("href") === "#" + e.target.id)));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main > section").forEach((s) => io.observe(s));
});`,
})}
</body>
</html>`;
}
