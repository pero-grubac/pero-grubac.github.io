// /site.webmanifest (REDESIGN.md 10.7): the name, the paper colour as theme
// and background, and the monogram icons.
import type { APIRoute } from "astro";
import { site } from "../lib/site";

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: site.name,
      start_url: "/",
      display: "browser",
      theme_color: "#f4f0e6",
      background_color: "#f4f0e6",
      icons: [
        { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    }),
    { headers: { "Content-Type": "application/manifest+json" } }
  );
