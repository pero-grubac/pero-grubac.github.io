// wawoff2 (Google's WOFF2 codec in WebAssembly) ships no types; this is the
// part src/lib/glyphs.ts uses.
declare module "wawoff2" {
  /** Unpacks a WOFF2 file into the TrueType/OpenType font it holds */
  export function decompress(woff2: Uint8Array): Promise<Uint8Array>;
}
