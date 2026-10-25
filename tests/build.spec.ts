// The build output (dist/) without a browser: internal links, the meta tags
// and structured data of every page, the sitemap,
// robots.txt, the icons and social images, and the font subsets.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test, expect } from "@playwright/test";
import * as fontkit from "fontkit";
import sharp from "sharp";
import { OTHER_REPOS, SITE } from "../src/lib/other-repos.mjs";

const dist = join(process.cwd(), "dist");
const SYSTEMS = ["incident-alert", "e-mobility-hub", "chat-room", "online-library-system"];
const DIAGRAMS = readdirSync("src/components/diagrams").map((f) => f.replace(/\.astro$/, ""));

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : name.endsWith(".html") ? [path] : [];
  });

interface Page {
  path: string;
  html: string;
  title: string;
  meta: (key: string) => string | undefined;
  canonical?: string | undefined;
  ld: Record<string, any>[];
}

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const pages: Page[] = htmlFiles(dist).map((file) => {
  const html = readFileSync(file, "utf8");
  const path = "/" + relative(dist, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  const head = html.slice(0, html.indexOf("</head>"));
  const meta = (key: string) => {
    const m = head.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`));
    return m ? decode(m[1]!) : undefined;
  };
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));
  return { path, html, title: decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""), meta, canonical: head.match(/<link rel="canonical" href="([^"]*)"/)?.[1], ld };
});
const page = (path: string) => pages.find((p) => p.path === path)!;
const studies = pages.filter((p) => p.path.startsWith("/projects/"));
/** Every item of a JSON-LD block, @graph or not */
const things = (p: Page) => p.ld.flatMap((block) => block["@graph"] ?? [block]);

test("32 pages: home, /apps/, the 404 and 29 case studies", () => {
  expect(pages.map((p) => p.path).sort()).toEqual(expect.arrayContaining(["/", "/apps/", "/404.html"]));
  expect(pages).toHaveLength(32);
  expect(studies).toHaveLength(29);
});

test("every internal link resolves to a file in dist/", () => {
  const broken: string[] = [];
  for (const p of pages)
    for (const [, href] of p.html.matchAll(/\s(?:href|src)="(\/[^"/][^"]*|\/)"/g)) {
      const path = decodeURI(href!.split(/[?#]/)[0]!);
      if (!existsSync(join(dist, path.endsWith("/") ? path + "index.html" : path))) broken.push(`${p.path} → ${href}`);
    }
  expect(broken).toEqual([]);
});

test("the other repos' apps are linked at absolute URLs, so they open in dev too", () => {
  const relative: string[] = [];
  const apps = new Set<string>();
  for (const p of pages) {
    for (const repo of OTHER_REPOS) {
      if (p.html.includes(`href="/${repo}/`)) relative.push(`${p.path} → /${repo}/`);
      if (p.html.includes(`href="${SITE}/${repo}/"`)) apps.add(repo);
    }
  }
  expect(relative, "no root-relative link to another repo").toEqual([]);
  // every other repo on this domain is a live app the site links to (check:links checks they answer)
  expect([...apps].sort()).toEqual([...OTHER_REPOS].sort());
});

test("demo videos: an AV1 WebM first, the H.264 MP4 second, both in dist/", () => {
  let figures = 0;
  for (const p of pages)
    for (const [, json] of p.html.matchAll(/<figure class="media"[^>]*data-video="([^"]+)"/g)) {
      figures++;
      const sources: { src: string; type: string }[] = JSON.parse(decode(json!));
      expect(sources.map((s) => s.type), p.path).toEqual(['video/webm; codecs="av01.0.08M.08"', 'video/mp4; codecs="avc1.640028"']);
      expect(sources[0]!.src.replace(/\.webm$/, ".mp4"), `${p.path}: the same video`).toBe(sources[1]!.src);
      for (const s of sources) expect(existsSync(join(dist, s.src)), `${p.path}: ${s.src}`).toBe(true);
    }
  expect(figures, "the four systems on home and on their case studies").toBe(8);
});

test("one h1 per page, and the RepoHealth repo is never linked", () => {
  for (const p of pages) {
    expect((p.html.match(/<h1[\s>]/g) ?? []).length, `${p.path}: one h1`).toBe(1);
    expect(p.html, `${p.path}: no link to the RepoHealth repo`).not.toMatch(/github\.com\/pero-grubac\/[^"]*repo(sitory)?-?health/i);
  }
});

test("case studies: a written body, its sections in the margin, a diagram where there is one", () => {
  for (const p of studies) {
    const slug = p.path.split("/")[2]!;
    const body = p.html.slice(p.html.indexOf('class="body'));
    const sections = (body.match(/<h2[\s>]/g) ?? []).length;
    const toc = (p.html.match(/<ol class="toc[^"]*"[^>]*>([\s\S]*?)<\/ol>/)?.[1]?.match(/<li/g) ?? []).length;
    expect(sections, `${p.path}: body sections`).toBeGreaterThanOrEqual(1);
    if (SYSTEMS.includes(slug)) expect(sections, `${p.path}: a system has all five`).toBe(5);
    expect(toc, `${p.path}: every section in "On this page"`).toBe(sections);
    expect(p.html, p.path).not.toContain("Case study in progress");
    expect(p.html, p.path).not.toContain("TODO(owner)");
    expect(p.html.includes("data-diagram-frame"), `${p.path}: ${DIAGRAMS.includes(slug) ? "has its" : "no"} architecture diagram`).toBe(DIAGRAMS.includes(slug));
  }
});

test("titles: short, the page's name first, unique", () => {
  expect(page("/").title).toBe("Pero Grubač | Backend Developer");
  expect(page("/apps/").title).toBe("Apps | Pero Grubač");
  expect(page("/404.html").title).toBe("Page not found | Pero Grubač");
  for (const p of studies) {
    const name = p.html.match(/<h1[^>]*>([^<]*)<\/h1>/)![1]!;
    expect(p.title, `${p.path}: "{Project} | Pero Grubač"`).toBe(`${decode(name)} | Pero Grubač`);
  }
  for (const p of pages) expect([...p.title].length, `${p.path}: at most 60 characters`).toBeLessThanOrEqual(60);
  expect(new Set(pages.map((p) => p.title)).size, "unique").toBe(pages.length);
});

test("descriptions: 140–160 characters, unique", () => {
  for (const p of pages) {
    const d = p.meta("description")!;
    // the home page's description is the one exception, at 167 characters
    if (p.path !== "/") expect([...d].length, `${p.path}: ${d}`).toBeGreaterThanOrEqual(140);
    if (p.path !== "/") expect([...d].length, `${p.path}: ${d}`).toBeLessThanOrEqual(160);
  }
  expect(new Set(pages.map((p) => p.meta("description"))).size, "unique").toBe(pages.length);
});

test("canonical, author, Open Graph and Twitter card on every page", () => {
  for (const p of pages) {
    const at = p.path;
    expect(p.meta("author"), at).toBe("Pero Grubač");
    expect(p.html, at).toMatch(/^<!DOCTYPE html><html lang="en">/);
    if (at === "/404.html") {
      expect(p.meta("robots"), "the 404 is noindex").toBe("noindex");
      expect(p.canonical, "and has no canonical URL").toBeUndefined();
    } else {
      expect(p.meta("robots"), at).toBeUndefined();
      expect(p.canonical, at).toBe(SITE + at);
      expect(p.meta("og:url"), at).toBe(p.canonical);
    }
    expect(p.meta("og:title"), at).toBe(p.title);
    expect(p.meta("og:description"), at).toBe(p.meta("description"));
    expect(p.meta("og:type"), at).toBe(at.startsWith("/projects/") ? "article" : "website");
    expect(p.meta("og:site_name"), at).toBe("Pero Grubač");
    expect(p.meta("og:locale"), at).toBe("en_US");
    expect(p.meta("og:image:width"), at).toBe("1200");
    expect(p.meta("og:image:height"), at).toBe("630");
    expect(p.meta("og:image:alt")?.length, at).toBeGreaterThan(20);
    expect(p.meta("twitter:card"), at).toBe("summary_large_image");
    expect(p.meta("twitter:title"), at).toBe(p.title);
    expect(p.meta("twitter:description"), at).toBe(p.meta("description"));
    expect(p.meta("twitter:image"), at).toBe(p.meta("og:image"));
    expect(p.meta("twitter:image:alt"), at).toBe(p.meta("og:image:alt"));
    expect(p.html.match(/<meta name="theme-color"/g), `${at}: one theme, one theme-color`).toHaveLength(1);
  }
  expect(page("/").meta("og:image")).toBe(`${SITE}/assets/og-card.png`);
  expect(page("/apps/").meta("og:image")).toBe(`${SITE}/apps/og.png`);
  for (const p of studies) expect(p.meta("og:image")).toBe(`${SITE}${p.path}og.png`);
});

test("social images: a 1200×630 PNG for home, /apps/ and every case study", async () => {
  const home = readFileSync(join(dist, "assets/og-card.png"));
  for (const p of [page("/"), page("/apps/"), ...studies]) {
    const file = join(dist, new URL(p.meta("og:image")!).pathname);
    const info = await sharp(file).metadata();
    expect([info.format, info.width, info.height], file).toEqual(["png", 1200, 630]);
    // made for this page, not the home page's card that stands in for one that fails
    if (p.path !== "/") expect(readFileSync(file).equals(home), `${file} is its own image`).toBe(false);
  }
});

test("structured data: home", () => {
  const items = things(page("/"));
  const person = items.find((t) => t["@type"] === "Person")!;
  expect(person).toMatchObject({
    name: "Pero Grubač",
    jobTitle: "Backend Developer",
    url: `${SITE}/`,
    image: `${SITE}/assets/avatar.jpeg`,
    email: "pero.grubac00@gmail.com",
    sameAs: ["https://github.com/pero-grubac", "https://www.linkedin.com/in/perogrubac/"],
    address: { "@type": "PostalAddress", addressLocality: "Banja Luka", addressCountry: "BA" },
  });
  expect(person.knowsAbout).toEqual(expect.arrayContaining(["Java", "C#", "Python", "Spring Boot", "ASP.NET", "Docker", "RabbitMQ"]));
  expect(items.find((t) => t["@type"] === "WebSite")).toMatchObject({ name: "Pero Grubač", url: `${SITE}/`, author: { "@id": person["@id"] } });
  const list = items.find((t) => t["@type"] === "ItemList")!;
  expect(list.itemListElement.map((i: any) => i.url)).toEqual(SYSTEMS.map((s) => `${SITE}/projects/${s}/`));
});

test("structured data: /apps/", () => {
  const list = things(page("/apps/")).find((t) => t["@type"] === "ItemList")!;
  expect(list.itemListElement).toHaveLength(13);
  for (const { item, position } of list.itemListElement) {
    expect(item, `#${position}`).toMatchObject({ "@type": "SoftwareApplication", operatingSystem: "Web browser", author: { name: "Pero Grubač" } });
    expect(item.applicationCategory, item.name).toMatch(/^[A-Z]\w+Application$/);
    expect(item.url, item.name).toMatch(/^https:\/\//);
    expect(item.description?.length, item.name).toBeGreaterThan(20);
    expect(item.codeRepository, `${item.name}: no repo link here`).toBeUndefined();
  }
});

test("structured data: every case study", () => {
  for (const p of studies) {
    const items = things(p);
    const code = items.find((t) => t["@type"] === "SoftwareSourceCode")!;
    expect(code, p.path).toMatchObject({ name: expect.any(String), url: SITE + p.path, author: { "@type": "Person", name: "Pero Grubač" } });
    expect(code.description?.length, p.path).toBeGreaterThan(30);
    expect([code.programmingLanguage].flat().length, `${p.path}: programmingLanguage`).toBeGreaterThan(0);
    const repos = [code.codeRepository].flat();
    expect(repos.length, `${p.path}: codeRepository`).toBeGreaterThan(0);
    for (const r of repos) expect(r).toMatch(/^https:\/\/github\.com\/pero-grubac\//);
    // the breadcrumb matches the one on the page
    const crumbs = items.find((t) => t["@type"] === "BreadcrumbList")!.itemListElement;
    const shown = [...p.html.matchAll(/<nav class="crumbs[\s\S]*?<\/nav>/g)][0]![0];
    const hrefs = [...shown.matchAll(/href="([^"]*)"/g)].map((m) => SITE + decode(m[1]!));
    expect(crumbs.map((c: any) => c.item), p.path).toEqual([...hrefs, SITE + p.path]);
    expect(crumbs.map((c: any) => c.position)).toEqual([1, 2, 3]);
  }
});

test("sitemap: every page but the 404, with lastmod", () => {
  const index = readFileSync(join(dist, "sitemap-index.xml"), "utf8");
  expect(index).toContain(`<loc>${SITE}/sitemap-0.xml</loc>`);
  const xml = readFileSync(join(dist, "sitemap-0.xml"), "utf8");
  const urls = [...xml.matchAll(/<url><loc>([^<]*)<\/loc><lastmod>([^<]*)<\/lastmod><\/url>/g)];
  const expected = pages.filter((p) => p.path !== "/404.html").map((p) => SITE + p.path);
  expect(urls.map((u) => u[1]).sort()).toEqual(expected.sort());
  for (const [, , lastmod] of urls) expect(new Date(lastmod!).getTime()).toBeGreaterThan(0);
  expect(xml).not.toContain("repository-health");
});

test("robots.txt allows everything and points to the sitemap", () => {
  const robots = readFileSync(join(dist, "robots.txt"), "utf8");
  // any line ending is valid (RFC 9309); a Windows checkout has CRLF
  expect(robots).toMatch(/^User-agent: \*\r?\nAllow: \/\r?\n/);
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
});

test("favicons and the manifest", async () => {
  const svg = readFileSync(join(dist, "favicon.svg"), "utf8");
  expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="32" height="32"/);
  const ico = readFileSync(join(dist, "favicon.ico"));
  expect([ico.readUInt16LE(2), ico.readUInt16LE(4), ico[6], ico[7]], "an icon with one 32×32 image").toEqual([1, 1, 32, 32]);
  const touch = await sharp(join(dist, "apple-touch-icon.png")).metadata();
  expect([touch.width, touch.height]).toEqual([180, 180]);
  const manifest = JSON.parse(readFileSync(join(dist, "site.webmanifest"), "utf8"));
  expect(manifest).toMatchObject({ name: "Pero Grubač", short_name: "Pero Grubač", theme_color: "#f4f0e6", background_color: "#f4f0e6" });
  for (const p of pages) {
    expect(p.html, p.path).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml">');
    expect(p.html, p.path).toContain('<link rel="manifest" href="/site.webmanifest">');
  }
});

test("fonts: the italic has one optical size; roman and italic latin are preloaded", () => {
  const cache = "node_modules/.cache/subset-fonts";
  for (const file of readdirSync(cache)) {
    const axes = Object.keys((fontkit.openSync(join(cache, file)) as fontkit.Font).variationAxes ?? {}).sort();
    const expected = file.includes("italic") || file.startsWith("instrument-sans") ? ["wght"] : ["opsz", "wght"];
    expect(axes, file).toEqual(expected);
  }
  for (const p of pages) {
    const preloads = [...p.html.matchAll(/<link rel="preload" href="\/_astro\/([a-z-]+)\.[^"]+\.woff2" as="font"/g)].map((m) => m[1]);
    expect(preloads, p.path).toEqual(["newsreader-latin-opsz-normal", "newsreader-latin-opsz-italic"]);
  }
});

test("the font subsets keep every glyph the pages show", () => {
  // The text of every page, as the fonts will have to set it
  let text = "";
  for (const p of pages) {
    const body = p.html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ");
    text += decode(body.replace(/<[^>]+>/g, " ")).replace(/&#x([0-9a-f]+);/gi, (_, x) => String.fromCodePoint(parseInt(x, 16)));
    text += [...body.matchAll(/placeholder="([^"]*)"/g)].map((m) => m[1]).join(" ");
  }
  const chars = [...new Set(text)].filter((c) => c.codePointAt(0)! > 32);
  const cache = "node_modules/.cache/subset-fonts";
  const files = readdirSync(cache);
  expect(files, "the build subset all six font files").toHaveLength(6);
  for (const file of files) {
    const family = file.startsWith("newsreader") ? "@fontsource-variable/newsreader" : "@fontsource-variable/instrument-sans";
    const original = fontkit.openSync(join("node_modules", family, "files", file)) as fontkit.Font;
    const subset = fontkit.openSync(join(cache, file)) as fontkit.Font;
    const lost = chars.filter((c) => original.hasGlyphForCodePoint(c.codePointAt(0)!) && !subset.hasGlyphForCodePoint(c.codePointAt(0)!));
    expect(lost, `${file}: glyphs the pages use`).toEqual([]);
  }
});
