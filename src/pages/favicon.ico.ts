// /favicon.ico, 32×32: the "pg" monogram for browsers and tools that ask
// for the .ico.
import type { APIRoute } from "astro";
import { ico, monogramPng } from "../lib/icons";

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(ico(await monogramPng(32, 2), 32)), { headers: { "Content-Type": "image/x-icon" } });
