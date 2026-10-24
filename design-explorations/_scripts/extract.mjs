// Pulls every project out of the current site's index.html into projects.raw.json.
// usage: node design-explorations/_scripts/extract.mjs [path/to/index.html]
// (defaults to the repo's index.html; after phase 1 that is legacy/index.html)
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync(process.argv[2] || new URL("../../index.html", import.meta.url), "utf8");
const out = new URL("./projects.raw.json", import.meta.url);

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const text = (s) => decode(s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
const all = (re, s) => [...s.matchAll(re)];
const one = (re, s) => (s.match(re) || [])[1];

const projects = [];

// Featured systems
for (const m of all(/<article class="project-card[^"]*" id="([^"]+)" data-kind="system">([\s\S]*?)<\/article>/g, html)) {
  const [, id, body] = m;
  const info = body.slice(body.indexOf('class="project-info"'));
  const paras = all(/<p(?: class="([^"]*)")?>([\s\S]*?)<\/p>/g, info);
  projects.push({
    htmlId: id,
    kind: "system",
    title: text(one(/<h3>([\s\S]*?)<\/h3>/, body)),
    badge: text(one(/featured-badge">([\s\S]*?)<\/span>/, body) || ""),
    flow: text(paras.find((p) => p[1] === "project-arch")[2]),
    description: text(paras.find((p) => !p[1])[2]),
    highlights: [],
    stack: all(/project-tag">([\s\S]*?)<\/button>/g, body).map((t) => text(t[1])),
    links: all(/<a href="([^"]+)"[^>]*class="project-link"[^>]*>([\s\S]*?)<\/a>/g, body).map((l) => ({ url: l[1], label: text(l[2]) })),
    image: one(/poster="([^"]+)"/, body),
    video: one(/<source src="([^"]+)"/, body),
    imageAlt: one(/<img [^>]*alt="([^"]*)"/, body),
  });
}

// Index rows
for (const m of all(/<div class="index-row" data-kind="([a-z]+)">([\s\S]*?)<\/details>([\s\S]*?)<\/div>\s*(?=<div class="index-row"|<\/div>)/g, html)) {
  const [, kind, body, after] = m;
  const img = body.match(/<img\s+src="([^"]+)"\s+alt="([^"]*)"/);
  const muted = all(/project-link--muted">([\s\S]*?)<\/span>/g, body).map((s) => text(s[1]));
  projects.push({
    htmlId: one(/<details id="([^"]+)"/, body),
    kind,
    title: text(one(/row-name">([\s\S]*?)<\/span>/, body)),
    isNew: /row-new/.test(body),
    rowStack: text(one(/row-stack">([\s\S]*?)<\/span>/, body)),
    description: text(one(/<div class="row-text">\s*<p>([\s\S]*?)<\/p>/, body)),
    highlights: all(/<li>([\s\S]*?)<\/li>/g, one(/<ul class="row-facts">([\s\S]*?)<\/ul>/, body) || "").map((l) => text(l[1])),
    stack: all(/project-tag">([\s\S]*?)<\/button>/g, body).map((t) => text(t[1])),
    links: all(/<a href="([^"]+)"[^>]*class="project-link"[^>]*>([\s\S]*?)<\/a>/g, body).map((l) => ({ url: l[1], label: text(l[2]) })),
    muted,
    live: one(/class="row-launch" href="([^"]+)"/, after),
    image: img && img[1],
    imageAlt: img && decode(img[2]),
    commands: all(/<li><code>([^<]+)<\/code><span>([\s\S]*?)<\/span><\/li>/g, body).map((c) => ({ cmd: c[1], text: text(c[2]) })),
  });
}

writeFileSync(out, JSON.stringify(projects, null, 2));
console.log(projects.length, "projects");
for (const p of projects) console.log(p.kind.padEnd(8), p.title.padEnd(26), (p.image || "-").padEnd(46), p.live || "", p.links.map((l) => l.label).join("|"), p.muted?.join("|") || "");
