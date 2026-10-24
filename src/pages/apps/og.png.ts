// /apps/og.png: the social image of the apps gallery (REDESIGN.md 10.2).
import type { APIRoute } from "astro";
import { getProjects } from "../../lib/projects";
import { ogImage, png } from "../../lib/og";

export const GET: APIRoute = async () => {
  const apps = (await getProjects()).filter((p) => p.kind === "live");
  return png(
    await ogImage({
      label: `${apps.length} apps`,
      title: "Browser apps",
      line: "Developer tools, games, score tables and a few small utilities, each one running in your browser.",
    })
  );
};
