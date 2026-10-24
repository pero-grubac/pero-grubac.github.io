// @ts-check
import { readdir } from "node:fs/promises";
import { defineConfig } from "astro/config";

// GitHub Pages user site. Other repos are served as project pages under the
// same domain (REDESIGN.md section 2), so this site must never create a
// route with one of their names.
const RESERVED = [
  "arcane-keep",
  "devkit",
  "github-dashboard",
  "dev-timeline",
  "countdown",
  "catan-map-generator",
  "excuse-generator",
  "sedmica",
  "lora-score-table",
  "yamb-table",
  "brick-breaker",
  "Monte-Carlo-based-Pi-Calculator-py",
];

/**
 * Fails the build when a page, or anything at the top of dist/ (public/
 * files included), would take one of those paths. Compared without case,
 * so not even a look-alike path gets through.
 * @returns {import("astro").AstroIntegration}
 */
function reservedPaths() {
  const reserved = new Set(RESERVED.map((name) => name.toLowerCase()));
  return {
    name: "reserved-paths",
    hooks: {
      "astro:build:done": async ({ pages, dir }) => {
        const top = [...pages.map((p) => p.pathname.split("/")[0] ?? ""), ...(await readdir(dir))];
        const taken = [...new Set(top.map((name) => name.replace(/\.html$/, "")))].filter((name) =>
          reserved.has(name.toLowerCase())
        );
        if (taken.length)
          throw new Error(`${taken.map((t) => `/${t}/`).join(", ")}: served by another repo on this domain (REDESIGN.md section 2)`);
      },
    },
  };
}

export default defineConfig({
  site: "https://pero-grubac.github.io",
  trailingSlash: "always",
  integrations: [reservedPaths()],
});
