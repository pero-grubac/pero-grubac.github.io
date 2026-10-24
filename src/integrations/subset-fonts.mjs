// @ts-check
// Smaller font files in the build (REDESIGN.md 6.3, 10.6). The @fontsource
// files carry every glyph of the latin and latin-ext subsets and the full
// weight and optical-size ranges, about 500 kB in all; Lighthouse's mobile
// LCP pays for every byte. This Vite plugin cuts each file down, in the
// build only (dev serves the originals):
//   - glyphs: printable ASCII, the Serbian letters, typographic punctuation,
//     and every other character found anywhere in src/, so text added to
//     the content keeps its glyphs without a change here;
//   - axes: only the ranges the CSS uses (AXES below), still variable in
//     weight; the italic, which only appears at 16–30 px, has its optical
//     size fixed at 24 (owner's call, phase 5 review), half its bytes.
// The @font-face rules (components/FontFaces.astro) keep the packages'
// unicode-ranges; a character a file doesn't have falls back to the next
// font in the stack, as it does for π and the arrows today.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import subsetFont from "subset-font";

/**
 * Axis ranges per font file, the first match by file name winning. A
 * number pins the axis. FontFaces.astro declares the same weights.
 * @type {[RegExp, Record<string, number | { min: number; max: number }>][]}
 */
const AXES = [
  [/^newsreader-.*-italic\./, { wght: { min: 300, max: 600 }, opsz: 24 }],
  [/^newsreader-/, { wght: { min: 300, max: 600 }, opsz: { min: 16, max: 72 } }],
  [/^instrument-sans-/, { wght: { min: 400, max: 600 } }],
];

const BASE =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("") + " ČčĆćĐđŠšŽž‘’‚“”„–—…·•×−©°²³¹";

/** Every character in the site's sources (pages, components, content, scripts, styles) */
async function sourceText(dir = "src") {
  let text = "";
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) text += await sourceText(path);
    else if (/\.(astro|md|mdx|ts|mjs|css)$/.test(entry.name)) text += await readFile(path, "utf8");
  }
  return text;
}

/** @returns {import("vite").Plugin} */
export function subsetFonts() {
  /** @type {Promise<string> | undefined} */
  let text;
  /** @type {Map<string, Promise<string>>} */
  const done = new Map();
  const cache = join("node_modules", ".cache", "subset-fonts");

  return {
    name: "subset-fonts",
    apply: "build",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!/^@fontsource(-variable)?\/[^/]+\/files\/.+\.woff2\?url$/.test(source)) return null;
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (!resolved) return null;
      const file = resolved.id.split("?")[0] ?? resolved.id;
      let out = done.get(file);
      if (!out) {
        out = (async () => {
          text ??= sourceText().then((src) => [...new Set(BASE + src)].join(""));
          const subset = await subsetFont(await readFile(file), await text, {
            targetFormat: "woff2",
            variationAxes: AXES.find(([name]) => name.test(basename(file)))?.[1],
          });
          await mkdir(cache, { recursive: true });
          const path = join(process.cwd(), cache, basename(file));
          await writeFile(path, subset);
          return path;
        })();
        done.set(file, out);
      }
      // Vite's own asset handling takes it from here: hashed name, URL in the page
      return (await out) + "?url";
    },
  };
}
