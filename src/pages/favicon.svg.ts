// /favicon.svg: the "pg" monogram.
import type { APIRoute } from "astro";
import { monogram } from "../lib/icons";

export const GET: APIRoute = async () => new Response(await monogram(32, 2), { headers: { "Content-Type": "image/svg+xml" } });
