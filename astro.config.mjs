// @ts-check
import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { subsetFonts } from "./src/integrations/subset-fonts.mjs";
import { OTHER_REPOS, SITE } from "./src/lib/other-repos.mjs";

/**
 * GitHub Pages user site: other repos are served as project pages under the
 * same domain, so this site must never create a
 * route with one of their names (src/lib/other-repos.mjs). Fails the build
 * when a page, or anything at the top of dist/ (public/ files included),
 * would take one of those paths. Compared without case, so not even a
 * look-alike path gets through.
 * @returns {import("astro").AstroIntegration}
 */
function reservedPaths() {
  const reserved = new Set(OTHER_REPOS.map((name) => name.toLowerCase()));
  return {
    name: "reserved-paths",
    hooks: {
      "astro:build:done": async ({ pages, dir }) => {
        const top = [...pages.map((p) => p.pathname.split("/")[0] ?? ""), ...(await readdir(dir))];
        const taken = [...new Set(top.map((name) => name.replace(/\.html$/, "")))].filter((name) =>
          reserved.has(name.toLowerCase())
        );
        if (taken.length)
          throw new Error(`${taken.map((t) => `/${t}/`).join(", ")}: served by another repo on this domain`);
      },
    },
  };
}

/**
 * When each file under src/ last changed: the date of the newest commit
 * that touches it. deploy.yml checks out the whole history for this; in a
 * shallow clone every file has the last commit's date. Outside git: none.
 * @returns {Map<string, string>}
 */
function lastChanged() {
  const dates = new Map();
  try {
    const log = execFileSync("git", ["log", "--format=%x00%cI", "--name-only", "--", "src"], { encoding: "utf8" });
    let date = "";
    for (const line of log.split("\n")) {
      if (line.startsWith("\0")) date = line.slice(1);
      else if (line && date && !dates.has(line)) dates.set(line, date);
    }
  } catch {
    // not a git checkout
  }
  return dates;
}

/** @type {Map<string, string> | undefined} */
let changed;

/**
 * The sitemap's lastmod: a case study changes with its
 * project file or its diagram; home and /apps/ show every project, so they
 * change with anything under src/.
 * @param {string} url
 */
function lastmodOf(url) {
  const dates = (changed ??= lastChanged());
  const slug = new URL(url).pathname.match(/^\/projects\/([^/]+)\/$/)?.[1];
  const files = slug ? [`src/content/projects/${slug}.md`, `src/components/diagrams/${slug}.astro`] : [...dates.keys()];
  const newest = files.map((f) => dates.get(f)).filter(Boolean).sort().at(-1);
  return newest && new Date(newest).toISOString();
}

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  // The CSS is small; in the page it costs no extra round trip before the first paint
  build: { inlineStylesheets: "always" },
  vite: { plugins: [subsetFonts()] },
  integrations: [
    reservedPaths(),
    // The 404 is left out by the integration itself; the filter keeps out
    // the images and the manifest, whose URLs don't end in a slash.
    sitemap({
      filter: (page) => page.endsWith("/"),
      serialize: (item) => ({ ...item, lastmod: lastmodOf(item.url) }),
    }),
  ],
});
