// /apple-touch-icon.png, 180×180: the "pg" monogram with room around it,
// since iOS rounds the corners.
import type { APIRoute } from "astro";
import { monogramPng } from "../lib/icons";
import { png } from "../lib/og";

export const GET: APIRoute = async () => png(await monogramPng(180, 34));
