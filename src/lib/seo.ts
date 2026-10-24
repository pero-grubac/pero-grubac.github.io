// Structured data and absolute URLs for the <Seo>
// component. Every list here comes from the projects collection. The
// RepoHealth repo is private, so nothing here may link to it: its
// SoftwareApplication has no codeRepository, and it has no case study.
import { site } from "./site";
import { languagesOf, parentOf, type Project } from "./projects";

/** "/apps/" → "https://pero-grubac.github.io/apps/" (`site` in astro.config.mjs) */
export function absolute(path: string): string {
  return new URL(path, import.meta.env.SITE).href;
}

type Thing = Record<string, unknown>;

const PERSON_ID = absolute("/#person");

/** The owner, referenced by every page; described in full on the home page */
const author: Thing = { "@type": "Person", "@id": PERSON_ID, name: site.name, url: absolute("/") };

/** One value, or a list when there are several (codeRepository, programmingLanguage) */
const oneOrMany = (values: string[]) => (values.length === 1 ? values[0] : values);

/** Home: the owner, the site, and the systems with their case studies */
export function homeJsonLd(systems: Project[]): Thing {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...author,
        jobTitle: site.jobTitle,
        image: absolute("/assets/avatar.jpeg"),
        email: site.email,
        sameAs: [site.github, site.linkedin],
        address: { "@type": "PostalAddress", addressLocality: site.locality, addressCountry: site.country },
        knowsAbout: Object.values(site.stack).flat(),
      },
      { "@type": "WebSite", "@id": absolute("/#website"), name: site.name, url: absolute("/"), inLanguage: "en", author: { "@id": PERSON_ID } },
      {
        "@type": "ItemList",
        name: "Systems",
        itemListElement: systems.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: absolute(`/projects/${p.slug}/`),
        })),
      },
    ],
  };
}

/** /apps/: every live app as a SoftwareApplication that runs in the browser */
export function appsJsonLd(apps: Project[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Browser apps",
    itemListElement: apps.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: p.title,
        url: p.links.live,
        applicationCategory: p.applicationCategory,
        operatingSystem: "Web browser",
        description: p.description ?? p.summary,
        author,
      },
    })),
  };
}

/** A case study: the project's source code, and the breadcrumb the page shows */
export function caseStudyJsonLd(p: Project): Thing {
  const url = absolute(`/projects/${p.slug}/`);
  const parent = parentOf(p);
  const code: Thing = {
    "@type": "SoftwareSourceCode",
    name: p.title,
    description: p.description ?? p.summary,
    url,
    programmingLanguage: oneOrMany(languagesOf(p)),
    author,
  };
  if (p.links.repos.length) code.codeRepository = oneOrMany(p.links.repos.map((r) => r.url));
  return {
    "@context": "https://schema.org",
    "@graph": [
      code,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: absolute("/") },
          { name: parent.label, item: absolute(parent.href) },
          { name: p.title, item: url },
        ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      },
    ],
  };
}
