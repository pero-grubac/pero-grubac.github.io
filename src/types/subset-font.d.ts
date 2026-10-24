// subset-font (HarfBuzz's hb-subset in WebAssembly) ships no types; this is
// the part src/integrations/subset-fonts.mjs uses.
declare module "subset-font" {
  interface Options {
    targetFormat?: "sfnt" | "woff" | "woff2" | "truetype";
    /** Pin an axis to one value, or narrow it to a range */
    variationAxes?: Record<string, number | { min: number; max: number; default?: number }>;
  }
  /** The font with only the glyphs `text` needs (and every layout feature) */
  export default function subsetFont(font: Buffer, text: string, options?: Options): Promise<Buffer>;
}
