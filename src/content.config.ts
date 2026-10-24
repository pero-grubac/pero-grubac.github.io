// Projects collection (REDESIGN.md section 5): one Markdown file per project
// in src/content/projects/, named after its slug. The schema rejects
// anything the site can't render correctly, so `astro build` fails on an
// invalid project file.
import { existsSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { defineCollection } from "astro:content";
import { glob, type Loader } from "astro/loaders";
import { z } from "astro/zod";
import { OTHER_REPOS, SITE } from "./lib/other-repos.mjs";

const KINDS = ["system", "live", "web", "mobile", "desktop", "tool"] as const;
// schema.org applicationCategory values (Google's list) that fit these apps
const APP_CATEGORIES = [
  "DeveloperApplication",
  "EducationalApplication",
  "EntertainmentApplication",
  "GameApplication",
  "UtilitiesApplication",
] as const;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GITHUB = /^https:\/\/github\.com\/pero-grubac\/[\w.-]+(?:\/[\w./-]*)?$/;
// An absolute https URL, so the link works wherever the site runs (in dev
// too). On this domain it must be one of the other repos' apps, e.g.
// https://pero-grubac.github.io/devkit/ (section 2).
const LIVE = /^https:\/\/\S+$/;
const ON_SITE = new RegExp(`^${SITE.replace(/[.]/g, "\\.")}/`);
const APP_PATHS = new Set(OTHER_REPOS.map((repo) => `${SITE}/${repo}/`));

const text = z.string().trim().min(1);

const projects = defineCollection({
  loader: projectsLoader(),
  schema: ({ image }) =>
  z
    .object({
      order: z.number().int().positive(),
      slug: z.string().regex(KEBAB, "slug must be kebab-case"),
      title: text,
      kind: z.enum(KINDS),
      year: z.number().int().min(2000).max(2100).optional(),
      summary: text
        .max(75, "summary: one sentence of about 70 characters")
        .refine((s) => !/[.!?]\s+\S/.test(s), "summary: one sentence only"),
      // The case study page's meta description (10.1): what a visitor will find there
      metaDescription: text.min(140, "metaDescription: 140–160 characters").max(160, "metaDescription: 140–160 characters").optional(),
      description: text.optional(),
      // The description only rewords the summary, so the expanded view
      // leaves it out instead of showing the same sentence twice (7.4)
      repeatsSummary: z.boolean().default(false),
      flow: text.optional(),
      highlights: z.array(text).max(5).default([]),
      stack: z.array(text).min(1),
      links: z
        .object({
          live: z
            .string()
            .regex(LIVE, `links.live: an absolute https URL, such as ${SITE}/devkit/`)
            .refine(
              (url) => !ON_SITE.test(url) || APP_PATHS.has(url),
              `links.live on this domain must be one of the other repos' apps (src/lib/other-repos.mjs), such as ${SITE}/devkit/`
            )
            .optional(),
          repos: z
            .array(z.object({ label: text, url: z.string().regex(GITHUB, "repo URL must be under github.com/pero-grubac/") }).strict())
            .default([]),
          apk: z.string().regex(GITHUB, "apk URL must be under github.com/pero-grubac/").optional(),
          privateRepo: z.boolean().optional(),
        })
        .strict(),
      // Path relative to this file, e.g. ../../assets/live/devkit.webp
      image: image().optional(),
      imageAlt: text.optional(),
      // Public URL of the demo video, e.g. /assets/chatroom/demo.mp4, with
      // an AV1 demo.webm of the same name beside it
      video: z
        .string()
        .regex(/^\/assets\/[\w./-]+\.mp4$/, "video: a path like /assets/<name>/demo.mp4")
        .refine((p) => existsSync(join(process.cwd(), "public", p)), "video: file not found under public/")
        // The first source: AV1, for browsers without H.264 (components/DemoFigure.astro)
        .refine(
          (p) => existsSync(join(process.cwd(), "public", p.replace(/\.mp4$/, ".webm"))),
          "video: put an AV1 demo.webm beside the demo.mp4 (see README, Demo videos)"
        )
        .optional(),
      commands: z.array(z.object({ cmd: z.string().regex(/^\/[\w-]+$/), text }).strict()).optional(),
      // What kind of app a live app is, for the structured data on /apps/ (10.3)
      applicationCategory: z.enum(APP_CATEGORIES).optional(),
      featured: z.boolean(),
      caseStudy: z.boolean(),
    })
    .strict()
    .superRefine((p, ctx) => {
      const fail = (message: string, path: string[]) => ctx.addIssue({ code: "custom", message, path });
      const system = p.kind === "system";

      if (p.featured !== system) fail("featured must be true exactly for kind 'system'", ["featured"]);
      if (system) {
        if (!p.description) fail("systems need a description (7.3)", ["description"]);
        if (!p.flow) fail("systems need a flow line (7.3)", ["flow"]);
        if (!p.image) fail("systems need a screenshot (7.3)", ["image"]);
      } else {
        if (p.flow) fail("flow is for systems only", ["flow"]);
        if (p.video) fail("video is for systems only", ["video"]);
        if (p.highlights.length < 2) fail("2–5 highlights", ["highlights"]);
      }
      if (p.repeatsSummary && (system || !p.description))
        fail("repeatsSummary is for non-system projects that have a description", ["repeatsSummary"]);

      // Section 11: no counts next to technologies, each technology once
      if (p.flow) {
        if (/\d/.test(p.flow)) fail("flow: no counts next to technologies", ["flow"]);
        const words = p.flow.toLowerCase().split(/[^\p{L}\p{N}.#]+/u).filter((w) => w.length > 1);
        const dupes = words.filter((w, i) => words.indexOf(w) !== i);
        if (dupes.length) fail(`flow: each technology once (repeated: ${[...new Set(dupes)].join(", ")})`, ["flow"]);
      }
      const stack = p.stack.map((s) => s.toLowerCase());
      if (new Set(stack).size !== stack.length) fail("stack: each technology once", ["stack"]);
      if (p.stack.some((s) => /^\d|\d\s*[×x]\s/.test(s))) fail("stack: no counts next to technologies", ["stack"]);

      if (p.caseStudy && !p.metaDescription) fail("a case study page needs a metaDescription (10.1)", ["metaDescription"]);
      if ((p.kind === "live") !== Boolean(p.applicationCategory))
        fail("applicationCategory is required for kind 'live' and only for it", ["applicationCategory"]);
      if ((p.kind === "live") !== Boolean(p.links.live)) fail("links.live is required for kind 'live' and only for it", ["links", "live"]);
      if (p.links.apk && p.kind !== "mobile") fail("links.apk is for mobile apps", ["links", "apk"]);
      if (Boolean(p.links.privateRepo) !== (p.links.repos.length === 0))
        fail("either list the repos, or set privateRepo: true with no repos", ["links", "repos"]);
      if (p.links.repos.length === 1 && p.links.repos[0]!.label !== "Source")
        fail('a single repo is labelled "Source"', ["links", "repos", "0", "label"]);
      if (p.links.repos.length > 1 && p.links.repos.some((r) => r.label === "Source"))
        fail("with several repos, label each by its part (Backend, Frontend, …)", ["links", "repos"]);

      if (Boolean(p.image) !== Boolean(p.imageAlt)) fail("image and imageAlt go together", ["imageAlt"]);
      if (!p.image && !p.commands?.length) fail("without a screenshot, list the commands to show instead (8.4)", ["image"]);
    }),
});

// The glob loader plus the rules that span files: the file name is the
// slug, and every `order` and every `metaDescription` is used once.
function projectsLoader(): Loader {
  const files = glob({
    pattern: "*.md",
    base: "./src/content/projects",
    generateId: ({ entry, base, data }) => {
      const name = basename(entry, extname(entry));
      if (data.slug !== name) throw new Error(`src/content/projects/${entry}: slug "${String(data.slug)}" must match the file name`);
      // image() only resolves the file when a page renders it; check it here so
      // a wrong path fails every build, not just the ones that render it.
      if (typeof data.image === "string" && !existsSync(new URL(data.image, new URL(entry, base))))
        throw new Error(`src/content/projects/${entry}: image "${data.image}" not found`);
      return name;
    },
  });
  return {
    name: "projects",
    load: async (context) => {
      await files.load(context);
      const seen = new Map<string, string>();
      for (const { id, data } of context.store.values()) {
        for (const field of ["order", "metaDescription"]) {
          const value = data[field];
          if (value === undefined) continue;
          if (seen.has(`${field}:${value}`)) throw new Error(`projects: ${field} ${JSON.stringify(value)} is used by both "${seen.get(`${field}:${value}`)}" and "${id}"`);
          seen.set(`${field}:${value}`, id);
        }
      }
    },
  };
}

export const collections = { projects };
