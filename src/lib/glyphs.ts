// Sets text as SVG paths at build time, for the social images and the
// favicon (REDESIGN.md 6.8, 10.2, 10.7). It uses the site's own font files
// from @fontsource, so the images match the pages: Newsreader at the
// optical size of its type size (opsz 72 for display, as the h1), and
// Instrument Sans. fontkit can't apply a variable font's axes to a WOFF2
// file, so each file is unpacked to TrueType first (wawoff2).
// The site's fonts carry only the latin and latin-ext subsets. Like a
// browser, the setter falls back per character: Noto Serif for Greek (π)
// and Noto Sans Math for arrows (→ ⇄). Text needing a glyph that none of
// them has throws, and the caller falls back to /assets/og-card.png.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import * as fontkit from "fontkit";
import { decompress } from "wawoff2";

type Font = fontkit.Font;

export type Family = "serif" | "serif-italic" | "sans";

export interface TextStyle {
  family: Family;
  /** px */
  size: number;
  weight: number;
  /** Letter spacing in em, as in CSS */
  tracking?: number;
  /** Newsreader's optical size; by default the type size, as `font-optical-sizing: auto` does */
  opsz?: number;
}

/** A piece of text in one colour: a line is a list of these */
export interface Span {
  text: string;
  fill: string;
}

const require = createRequire(join(process.cwd(), "package.json"));
const file = (path: string) => readFile(require.resolve(path));

// The site's subsets first, then the fallbacks, in the order a browser would try them
const FILES: Record<Family, string[]> = {
  serif: [
    "@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2",
    "@fontsource-variable/newsreader/files/newsreader-latin-ext-opsz-normal.woff2",
    "@fontsource/noto-serif/files/noto-serif-greek-400-normal.woff",
    "@fontsource/noto-sans-math/files/noto-sans-math-latin-400-normal.woff",
  ],
  "serif-italic": [
    "@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2",
    "@fontsource-variable/newsreader/files/newsreader-latin-ext-opsz-italic.woff2",
    "@fontsource/noto-serif/files/noto-serif-greek-400-italic.woff",
    "@fontsource/noto-sans-math/files/noto-sans-math-latin-400-normal.woff",
  ],
  sans: [
    "@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
    "@fontsource-variable/instrument-sans/files/instrument-sans-latin-ext-wght-normal.woff2",
    "@fontsource/noto-sans-math/files/noto-sans-math-latin-400-normal.woff",
  ],
};

const loaded = new Map<string, Promise<Font>>();

/** A font file as fontkit reads it; WOFF2 unpacked to TrueType so its axes can be set */
function load(path: string): Promise<Font> {
  let font = loaded.get(path);
  if (!font) {
    font = file(path).then(async (data) => {
      const sfnt = path.endsWith(".woff2") ? Buffer.from(await decompress(data)) : data;
      return fontkit.create(sfnt) as Font;
    });
    loaded.set(path, font);
  }
  return font;
}

const instances = new Map<string, Promise<Font[]>>();

/** The fonts a style falls back through, with weight and optical size set where a font has those axes */
function chain(style: TextStyle): Promise<Font[]> {
  const opsz = Math.min(72, Math.max(6, style.opsz ?? style.size));
  const key = `${style.family}/${style.weight}/${opsz}`;
  let fonts = instances.get(key);
  if (!fonts) {
    fonts = Promise.all(
      FILES[style.family].map(async (path) => {
        const font = await load(path);
        const axes = Object.keys(font.variationAxes ?? {});
        if (!axes.length) return font;
        const settings: Record<string, number> = {};
        if (axes.includes("wght")) settings.wght = style.weight;
        if (axes.includes("opsz")) settings.opsz = opsz;
        return font.getVariation(settings);
      })
    );
    instances.set(key, fonts);
  }
  return fonts;
}

/** Splits text into runs that one font can set, the first font with the glyph winning. */
function runs(text: string, fonts: Font[]): { font: Font; text: string }[] {
  const out: { font: Font; text: string }[] = [];
  for (const ch of text) {
    const font = fonts.find((f) => f.hasGlyphForCodePoint(ch.codePointAt(0)!));
    if (!font) throw new Error(`no font has a glyph for "${ch}" (U+${ch.codePointAt(0)!.toString(16).toUpperCase()})`);
    const last = out.at(-1);
    if (last?.font === font) last.text += ch;
    else out.push({ font, text: ch });
  }
  return out;
}

/** A typesetter for one style: measures text and draws it as SVG paths. */
export async function setter(style: TextStyle) {
  const fonts = await chain(style);
  const track = (style.tracking ?? 0) * style.size;

  function measure(text: string): number {
    return runs(text, fonts).reduce(
      (width, run) => width + (run.font.layout(run.text).advanceWidth * style.size) / run.font.unitsPerEm + track * [...run.text].length,
      0
    );
  }

  /** `<path>` elements for `text` with its baseline starting at x, y; returns them and the pen position after */
  function draw(text: string, x: number, y: number, fill: string): { svg: string; x: number } {
    const paths: string[] = [];
    for (const run of runs(text, fonts)) {
      const scale = style.size / run.font.unitsPerEm;
      const { glyphs, positions } = run.font.layout(run.text);
      glyphs.forEach((glyph, i) => {
        const pos = positions[i]!;
        const d = glyph.path
          .scale(scale, -scale)
          .translate(x + pos.xOffset * scale, y - pos.yOffset * scale)
          .toSVG();
        if (d) paths.push(d);
        x += pos.xAdvance * scale + track;
      });
    }
    return { svg: paths.length ? `<path fill="${fill}" d="${round(paths.join(""))}"/>` : "", x };
  }

  /**
   * Breaks spans into lines no wider than `width`, at spaces; a word wider
   * than the line gets a line of its own. A separator "·" that would start
   * or end a line is dropped: the break separates instead.
   */
  function greedy(spans: Span[], width: number): Span[][] {
    const space = measure(" ");
    const words = spans.flatMap((s) => s.text.split(" ").filter(Boolean).map((text) => ({ text, fill: s.fill, w: measure(text) })));
    const lines: (typeof words)[] = [];
    let line: typeof words = [];
    let used = 0;
    for (const word of words) {
      const next = line.length ? used + space + word.w : word.w;
      if (line.length && next > width) {
        lines.push(line);
        line = [word];
        used = word.w;
      } else {
        line.push(word);
        used = next;
      }
    }
    if (line.length) lines.push(line);
    return lines.map((l, i) => l.filter((w, j) => w.text !== "·" || !((i > 0 && j === 0) || (i < lines.length - 1 && j === l.length - 1))));
  }

  /** Like `greedy`, in as few lines, but as even as they can be (CSS `text-wrap: balance`). */
  function wrap(spans: Span[], width: number): Span[][] {
    const lines = greedy(spans, width);
    if (lines.length < 2) return lines;
    let lo = width / 2;
    let hi = width;
    while (hi - lo > 2) {
      const mid = (lo + hi) / 2;
      if (greedy(spans, mid).length === lines.length) hi = mid;
      else lo = mid;
    }
    return greedy(spans, hi);
  }

  /** Draws one line of spans, a space between them, from x on baseline y */
  function drawLine(line: Span[], x: number, y: number): string {
    const space = measure(" ");
    let svg = "";
    line.forEach((span, i) => {
      const out = draw(span.text, x, y, span.fill);
      svg += out.svg;
      x = out.x + (i < line.length - 1 ? space : 0);
    });
    return svg;
  }

  const width = (line: Span[]) => line.reduce((w, s) => w + measure(s.text), 0) + measure(" ") * (line.length - 1);

  /** The ink's bounding box of `text` set from 0, 0 (y down, as in SVG) */
  function bounds(text: string): { minX: number; minY: number; maxX: number; maxY: number } {
    const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    let x = 0;
    for (const run of runs(text, fonts)) {
      const scale = style.size / run.font.unitsPerEm;
      const { glyphs, positions } = run.font.layout(run.text);
      glyphs.forEach((glyph, i) => {
        const pos = positions[i]!;
        const b = glyph.path.scale(scale, -scale).translate(x + pos.xOffset * scale, -pos.yOffset * scale).bbox;
        if (b.width > 0) {
          box.minX = Math.min(box.minX, b.minX);
          box.minY = Math.min(box.minY, b.minY);
          box.maxX = Math.max(box.maxX, b.maxX);
          box.maxY = Math.max(box.maxY, b.maxY);
        }
        x += pos.xAdvance * scale + track;
      });
    }
    return box;
  }

  return { measure, draw, wrap, drawLine, width, bounds, style, fonts };
}

/** Rounds the coordinates in path data to two decimals, which keeps the SVG small */
function round(d: string): string {
  return d.replace(/-?\d+\.\d+(e-?\d+)?/g, (n) => String(Math.round(Number(n) * 100) / 100));
}
