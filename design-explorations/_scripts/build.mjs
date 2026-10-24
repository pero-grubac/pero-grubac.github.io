// Renders the three phase-0 prototypes into design-explorations/direction-*/.
// usage: node design-explorations/_scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as content from "./content.mjs";
import a from "./dir-a.mjs";
import b from "./dir-b.mjs";
import c from "./dir-c.mjs";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const core = readFileSync(new URL("./core.js", import.meta.url), "utf8");

// width/height straight from the WebP header, so every <img> reserves its box
function webpSize(file) {
  const buf = readFileSync(file);
  const type = buf.toString("ascii", 12, 16);
  if (type === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (type === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
  }
  if (type === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  throw new Error("unknown webp " + file);
}
const sizes = {};
for (const p of content.projects) if (p.image) sizes[p.image] = webpSize(join(repo, p.image.replace("../../", "")));

const { esc } = content;
function img(p, { eager = false, cls = "", alt } = {}) {
  const [w, h] = sizes[p.image];
  return `<img class="${cls}" src="${esc(p.image)}" alt="${esc(alt ?? p.imageAlt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function paletteJSON({ theme = false } = {}) {
  const sec = (target, label) => ({ type: "section", target, label, hint: "section" });
  const entries = [
    sec("top", "Top of the page"),
    sec("about", "About"),
    sec("systems", "Systems"),
    sec("projects", "All projects"),
    { type: "hash", target: "#projects?kind=live", label: "Browser apps", hint: "/apps/ (prototype: live filter)", keywords: "apps gallery" },
    sec("contact", "Contact"),
    ...content.projects.map((p) => {
      const keywords = p.stack.join(" ");
      if (p.featured) return { type: "section", target: p.slug, label: p.title, hint: "system · case study", keywords };
      if (p.links.live) return { type: "url", target: p.links.live, label: p.title, hint: "open app ↗", keywords };
      return { type: "project", target: p.slug, label: p.title, hint: `${content.kindLabel(p.kind).toLowerCase()} · details`, keywords };
    }),
    ...(theme ? [{ type: "theme", label: "Toggle theme", hint: "t" }] : []),
    { type: "copy", label: "Copy email", hint: content.site.email },
  ];
  return JSON.stringify(entries).replace(/</g, "\\u003c");
}

// The block every direction puts at the end of <body>
function scripts({ theme = false, config = "" } = {}) {
  return `<script type="application/json" id="palette-data">${paletteJSON({ theme })}</script>
<script>${config}</script>
<script>${core}</script>`;
}

const ctx = { ...content, img, scripts, sizes };

for (const [dir, render] of [["direction-a", a], ["direction-b", b], ["direction-c", c]]) {
  const out = join(repo, "design-explorations", dir);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "index.html"), render(ctx));
  console.log("wrote", dir);
}
