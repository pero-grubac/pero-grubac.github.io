// /assets/og-card.png: the home page's social image. Made at build time
// like the others, at the URL the earlier static card had, so links
// already shared keep their image.
import type { APIRoute } from "astro";
import { HOME_CARD, ogImage, png } from "../../lib/og";

export const GET: APIRoute = async () => png(await ogImage(HOME_CARD));
