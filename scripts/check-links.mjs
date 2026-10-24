// Checks every URL in the project content (src/content/projects/*.md): live
// apps, repos and APK downloads. Root-relative app paths such as /devkit/ are
// checked on the live domain. Redirects are followed; each link must end in a
// 200, otherwise the script exits with 1.
// usage: npm run check:links
import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";

const SITE = "https://pero-grubac.github.io";
const dir = new URL("../src/content/projects/", import.meta.url);

function frontmatter(file) {
  const text = readFileSync(new URL(file, dir), "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${file}: no frontmatter`);
  return parse(match[1]);
}

const links = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const p = frontmatter(file);
  const add = (what, url) => links.push({ order: p.order, project: p.slug, what, url: url.startsWith("/") ? SITE + url : url });
  if (p.links?.live) add("live", p.links.live);
  for (const r of p.links?.repos ?? []) add(`repo: ${r.label}`, r.url);
  if (p.links?.apk) add("apk", p.links.apk);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(url) {
  let last = { status: 0 };
  // HEAD first; some hosts refuse HEAD, so fall back to GET. Retry rate limits.
  for (const method of ["HEAD", "GET", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: { "user-agent": "pero-grubac.github.io link check" },
      });
      last = { status: res.status, final: res.url };
      if (res.status === 200) return last;
      if (res.status === 429) await sleep(5_000);
    } catch (e) {
      last = { status: 0, error: e.cause?.code || e.name };
    }
  }
  return last;
}

// Four at a time, so GitHub doesn't rate-limit the run
const results = [];
const queue = [...links];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const link = queue.shift();
      results.push({ ...link, ...(await check(link.url)) });
    }
  })
);

results.sort((a, b) => a.order - b.order || a.what.localeCompare(b.what));
for (const r of results) {
  const redirect = r.final && r.final !== r.url ? `  →  ${r.final}` : "";
  console.log(`${r.status === 200 ? "ok " : "BAD"} ${String(r.status || r.error).padEnd(5)} ${r.project.padEnd(24)} ${r.what.padEnd(18)} ${r.url}${redirect}`);
}
const bad = results.filter((r) => r.status !== 200);
console.log(`\n${results.length - bad.length} of ${results.length} links return 200`);
process.exitCode = bad.length ? 1 : 0;
