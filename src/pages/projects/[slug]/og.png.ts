// /projects/<slug>/og.png: the case study's social image,
// with the project's flow line, or its summary when it has none.
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { kindLabel, type Project } from "../../../lib/projects";
import { ogImage, png } from "../../../lib/og";

export const getStaticPaths = (async () => {
  const entries = await getCollection("projects", (e) => e.data.caseStudy);
  return entries.map((e) => ({ params: { slug: e.data.slug }, props: { project: e.data } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ project: Project }> = async ({ props: { project: p } }) =>
  png(await ogImage({ label: kindLabel(p.kind), title: p.title, line: p.flow ?? p.summary, flow: Boolean(p.flow) }));
