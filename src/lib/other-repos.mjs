// @ts-check
// This site is the GitHub Pages user site; other repos are served as project
// pages under the same domain (REDESIGN.md section 2). Their paths are taken:
// astro.config.mjs fails the build when a page would use one, and the
// content schema accepts a live app on this domain only at one of them.
// Plain JS, so astro.config.mjs can import it too.

export const SITE = "https://pero-grubac.github.io";

/** The other repos' paths, case-sensitive as GitHub Pages serves them */
export const OTHER_REPOS = [
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
