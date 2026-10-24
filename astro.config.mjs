// @ts-check
import { defineConfig } from "astro/config";

// GitHub Pages user site. Other repos are served as project pages under the
// same domain (/devkit/, /arcane-keep/, …; see REDESIGN.md section 2), so
// this site must never create a route with one of those names.
export default defineConfig({
  site: "https://pero-grubac.github.io",
  trailingSlash: "always",
});
