// The favicon (REDESIGN.md 6.8, 10.7): an italic Newsreader "pg" in ink on
// paper, made at build time as favicon.svg, favicon.ico (32×32) and
// apple-touch-icon.png (180×180). The italic at the optical size the site
// fixes it at (opsz 24, 6.3), a medium weight, so it holds up at 16 px.
import sharp from "sharp";
import { setter } from "./glyphs";

const PAPER = "#f4f0e6";
const INK = "#1c1a16";

/** The monogram as an SVG `size` px square, the letters at most `pad` px from its edges */
export async function monogram(size: number, pad: number): Promise<string> {
  // set once at 100 px to measure, then again at the size that fits
  const probe = await setter({ family: "serif-italic", size: 100, weight: 560, opsz: 24 });
  const b = probe.bounds("pg");
  const k = Math.min((size - 2 * pad) / (b.maxX - b.minX), (size - 2 * pad) / (b.maxY - b.minY));
  const type = await setter({ ...probe.style, size: 100 * k });
  const x = (size - (b.maxX - b.minX) * k) / 2 - b.minX * k;
  const y = (size - (b.maxY - b.minY) * k) / 2 - b.minY * k;
  const { svg } = type.draw("pg", x, y, INK);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${PAPER}"/>${svg}</svg>`;
}

export async function monogramPng(size: number, pad: number): Promise<Buffer> {
  return sharp(Buffer.from(await monogram(size, pad)))
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** An .ico file holding one PNG image, which every current browser reads */
export function ico(png: Buffer, size: number): Buffer {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); // reserved
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  head.writeUInt8(size % 256, 6); // width (0 means 256)
  head.writeUInt8(size % 256, 7); // height
  head.writeUInt8(0, 8); // no palette
  head.writeUInt8(0, 9); // reserved
  head.writeUInt16LE(1, 10); // colour planes
  head.writeUInt16LE(32, 12); // bits per pixel
  head.writeUInt32LE(png.length, 14); // image size
  head.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([head, png]);
}
