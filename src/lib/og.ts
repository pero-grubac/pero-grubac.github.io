// Social images, 1200×630 PNG, made at build time (REDESIGN.md 6.8, 10.2):
// flat paper, the name in small sans at the top with the kind of page
// opposite, a double rule, the title in Newsreader display, and the flow
// line (arrows in accent, as on the page) or the summary in italic. The
// text is set as paths (lib/glyphs.ts) and sharp turns the SVG into a PNG.
// If anything fails, the page's image is /assets/og-card.png instead.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { setter, type Span } from "./glyphs";
import { flowParts } from "./projects";
import { site } from "./site";

const W = 1200;
const H = 630;
const X = 80; // side margin
const C = { paper: "#f4f0e6", ink: "#1c1a16", inkSoft: "#3d3a33", muted: "#6a6457", accent: "#a4321f" };

export interface Card {
  /** Top right, opposite the name: "Live app", "13 apps" */
  label: string;
  title: string;
  /** The italic line under the title */
  line: string;
  /** `line` is an architecture line: its arrows are drawn in accent */
  flow?: boolean;
}

async function svgOf(card: Card): Promise<string> {
  const out: string[] = [];
  const name = await setter({ family: "sans", size: 30, weight: 600 });
  const label = await setter({ family: "sans", size: 26, weight: 500 });
  out.push(name.draw(site.name, X, 104, C.ink).svg);
  out.push(label.draw(card.label, W - X - label.measure(card.label), 104, C.muted).svg);

  // The double rule that opens a section on the site, scaled up
  out.push(`<rect x="${X}" y="134" width="${W - 2 * X}" height="2" fill="${C.ink}"/>`);
  out.push(`<rect x="${X}" y="141" width="${W - 2 * X}" height="2" fill="${C.ink}"/>`);

  // The title: as large as fits in two lines
  const titleSpans = [{ text: card.title, fill: C.ink }];
  let title = await setter({ family: "serif", size: 132, weight: 400, tracking: -0.025 });
  let titleLines = title.wrap(titleSpans, W - 2 * X);
  while (title.style.size > 72 && (titleLines.length > 2 || titleLines.some((l) => title.width(l) > W - 2 * X))) {
    title = await setter({ ...title.style, size: title.style.size - 6 });
    titleLines = title.wrap(titleSpans, W - 2 * X);
  }
  // The italic line: the flow with its arrows in accent, or the summary
  const spans: Span[] = card.flow
    ? flowParts(card.line).map((part) => ({ text: part.text, fill: part.op ? C.accent : C.inkSoft }))
    : [{ text: card.line, fill: C.inkSoft }];
  // the italic at the optical size the site fixes it at (6.3)
  let italic = await setter({ family: "serif-italic", size: 40, weight: 300, opsz: 24 });
  let lines = italic.wrap(spans, 980);
  while (italic.style.size > 30 && lines.length > 3) {
    italic = await setter({ ...italic.style, size: italic.style.size - 2 });
    lines = italic.wrap(spans, 980);
  }

  // Title and line as one block, a little above the middle of the space under the rule
  const ts = title.style.size;
  const is = italic.style.size;
  const titleLead = ts * 0.98;
  const italicLead = is * 1.32;
  const cap = ts * 0.68; // Newsreader's cap height at opsz 72
  const gap = ts * 0.3 + 34 + is * 0.75; // last title baseline → first italic baseline
  const block = cap + (titleLines.length - 1) * titleLead + gap + (lines.length - 1) * italicLead + is * 0.25;
  const top = 143;
  const bottom = H - 64;
  let y = top + Math.max(44, (bottom - top - block) * 0.42) + cap;
  for (const line of titleLines) {
    out.push(title.drawLine(line, X, y));
    y += titleLead;
  }
  y += gap - titleLead;
  for (const line of lines) {
    out.push(italic.drawLine(line, X, y));
    y += italicLead;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${out.join("")}</svg>`;
}

/** The card as a PNG; /assets/og-card.png (with a warning) if it can't be made */
export async function ogImage(card: Card): Promise<Buffer> {
  try {
    return await sharp(Buffer.from(await svgOf(card)))
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();
  } catch (err) {
    console.warn(`[og] "${card.title}": ${err instanceof Error ? err.message : err}; using /assets/og-card.png instead`);
    return readFile(join(process.cwd(), "public/assets/og-card.png"));
  }
}

/** The response of an endpoint that serves a PNG */
export function png(data: Buffer): Response {
  return new Response(new Uint8Array(data), { headers: { "Content-Type": "image/png" } });
}
