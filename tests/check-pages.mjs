// Checks for the pages besides home (/apps/, the case studies, the 404) on
// the built site (dist/), served by `astro preview`. Written in phase 4;
// phase 5 turns it into real tests.
//   1. Every internal link on every built page resolves to a file in dist/
//      (app paths of the other repos, like /devkit/, are check:links' job).
//   2. In a browser at 1440 and 360 px, keyboard only and with reduced
//      motion: search, links, breadcrumb, pager, video, focus, overflow.
// usage: npm run build && npm run check:pages
//   PW_CHANNEL=msedge|chrome  browser channel (default: msedge on Windows, bundled Chromium elsewhere)
//   SHOTS=<dir>               also save screenshots there
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../", import.meta.url));
const dist = join(repo, "dist");
const require = createRequire(join(repo, "package.json"));
const { chromium } = require("@playwright/test");

const log = [];
let failed = 0;
const ok = (cond, msg) => {
  if (!cond) failed++;
  log.push(`${cond ? "PASS" : "FAIL"} ${msg}`);
};

/* ================= 1. internal links in dist/ ================= */
const OTHER_REPOS = /^\/(arcane-keep|devkit|github-dashboard|dev-timeline|countdown|catan-map-generator|excuse-generator|sedmica|lora-score-table|yamb-table|brick-breaker|Monte-Carlo-based-Pi-Calculator-py)\//;
const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : name.endsWith(".html") ? [path] : [];
  });
const pages = htmlFiles(dist);
const titles = new Map();
const broken = [];
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const page = "/" + relative(dist, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  ok(Boolean(title) && !titles.has(title), `${page}: a title of its own (${title})`);
  titles.set(title, page);
  ok((html.match(/<h1[\s>]/g) ?? []).length === 1, `${page}: one h1`);
  for (const [, href] of html.matchAll(/\s(?:href|src)="(\/[^"/][^"]*|\/)"/g)) {
    const path = decodeURI(href.split(/[?#]/)[0]);
    if (OTHER_REPOS.test(path)) continue;
    const target = join(dist, path.endsWith("/") ? path + "index.html" : path);
    if (!existsSync(target)) broken.push(`${page} → ${href}`);
  }
  ok(!/github\.com\/pero-grubac\/[^"]*repo(sitory)?-?health/i.test(html), `${page}: no link to the RepoHealth repo`);
}
ok(pages.length === 7, `seven pages built (${pages.length})`);
ok(broken.length === 0, "every internal link resolves" + (broken.length ? ": " + broken.slice(0, 8).join(" ; ") : ""));

/* ================= 2. in the browser ================= */
const port = 4398;
const base = `http://127.0.0.1:${port}`;
const shots = process.env.SHOTS;
if (shots) mkdirSync(shots, { recursive: true });
const shot = (page, name, opts = {}) => shots && page.screenshot({ path: `${shots}/${name}.png`, ...opts });

// --ignore-lock: run beside a preview server the owner may already have open
const server = spawn(process.execPath, [join(repo, "node_modules/astro/bin/astro.mjs"), "preview", "--port", String(port), "--host", "127.0.0.1", "--ignore-lock"], { cwd: repo });
let serverLog = "";
await new Promise((resolve, reject) => {
  server.stdout.on("data", (d) => (serverLog += d) && String(d).includes(String(port)) && resolve());
  server.stderr.on("data", (d) => (serverLog += d));
  server.on("exit", (code) => reject(new Error(`astro preview exited (${code}):\n${serverLog}`)));
});
const channel = process.env.PW_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined);
const browser = await chromium.launch(channel ? { channel } : {});

const errors = [];
const watch = (page, tag, mp4) => {
  page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(`${tag} console: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${tag} pageerror: ${e}`));
  page.on("response", (r) => r.status() >= 400 && !r.url().endsWith("/no-such-page/") && errors.push(`${tag} ${r.status()} ${r.url()}`));
  if (mp4) page.on("request", (r) => r.url().endsWith(".mp4") && mp4.push(r.url()));
};
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const visible = (page) => page.$$eval("[data-item]", (els) => els.filter((e) => e.getClientRects().length > 0).length);
const footer = (page) => page.$eval(".site-footer", (f) => f.textContent.replace(/\s+/g, " ").trim());

/** Tabs through the whole page; returns the stops and those without a visible focus ring. */
async function tabThrough(page) {
  const stops = [];
  const bad = [];
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press("Tab");
    let info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const ring = el.matches("[data-find]") ? el.closest(".find-in") : el;
      const cs = getComputedStyle(ring);
      const r = el.getBoundingClientRect();
      return {
        label: (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40),
        outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
        onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0,
      };
    });
    if (!info) break;
    if (!info.onScreen) {
      await page.waitForTimeout(1200); // focus scrolling is smooth
      info.onScreen = await page.evaluate(() => {
        const r = document.activeElement.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight;
      });
    }
    if (stops.length && info.label === stops[0]) break; // wrapped around
    stops.push(info.label);
    if (!info.outline || !info.onScreen) bad.push(`${info.label} (outline ${info.outline}, onScreen ${info.onScreen})`);
  }
  return { stops, bad };
}

/* ---------- /apps/ at 1440 ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, "apps");
  await page.goto(base + "/apps/", { waitUntil: "networkidle" });
  await shot(page, "apps-1440-top");
  await shot(page, "apps-1440-full", { fullPage: true });
  ok((await overflow(page)) <= 0, "apps 1440: no horizontal scroll");
  ok((await page.textContent("h1")) === "Browser apps", "apps: h1 Browser apps");
  ok((await visible(page)) === 13, `apps: 13 apps (${await visible(page)})`);
  ok((await page.getAttribute('.masthead a[href="/apps/"]', "aria-current")) === "page", "apps: masthead marks Apps as the current page");
  ok((await footer(page)).includes("/ to find an app"), "apps: footer hint for /: " + (await footer(page)));
  ok((await page.getByRole("link", { name: "Open DevKit", exact: true }).count()) === 1, 'apps: "Open DevKit"');
  ok((await page.getByRole("link", { name: "Source code for DevKit", exact: true }).count()) === 1, 'apps: "Source code for DevKit"');
  const repo = await page.locator('[data-item]:has(h2:text-is("RepoHealth"))');
  ok((await repo.locator(".private").textContent()) === "Private repo" && (await repo.locator('a[href*="github.com"]').count()) === 0, "apps: RepoHealth shows Private repo, no repo link");
  const alts = await page.$$eval(".gallery img", (imgs) => imgs.map((i) => i.alt));
  ok(alts.length === 13 && alts.every((a) => a.length > 20), "apps: every screenshot has its real alt");
  ok((await page.getAttribute(".gallery img >> nth=0", "fetchpriority")) === "high" && (await page.getAttribute(".gallery img >> nth=1", "loading")) === "lazy", "apps: first screenshot loads first, the rest lazily");
  ok((await page.locator(".shot").first().getAttribute("tabindex")) === "-1", "apps: screenshot links stay out of the tab order");

  await page.keyboard.press("/");
  ok((await page.evaluate(() => document.activeElement.id)) === "find-app", "apps: / focuses the find field");
  await page.keyboard.type("react");
  const n = await visible(page);
  ok(n === 5 && (await page.textContent("[data-status]")) === "5 apps match “react”", `apps: "react" → ${n}, status: ${await page.textContent("[data-status]")}`);
  await page.fill("[data-find]", "zzzz");
  ok((await page.isVisible("[data-empty]")) && (await page.textContent("[data-empty] p")).trim() === "No app matches “zzzz”.", "apps: empty state");
  await page.click("[data-clear]");
  ok((await visible(page)) === 13 && (await page.evaluate(() => document.activeElement.id)) === "find-app", "apps: Clear search shows all and focuses the field");

  await page.goto(base + "/apps/", { waitUntil: "networkidle" });
  const kb = await tabThrough(page);
  ok(kb.stops.length > 30, `apps: Tab reaches the whole page (${kb.stops.length} stops)`);
  ok(kb.bad.length === 0, "apps: every Tab stop shows a focus ring on screen" + (kb.bad.length ? ": " + kb.bad.slice(0, 6).join(" ; ") : ""));
  await ctx.close();
}

/* ---------- case studies at 1440 ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const mp4 = [];
  watch(page, "case", mp4);
  await page.goto(base + "/projects/incident-alert/", { waitUntil: "networkidle" });
  await shot(page, "case-1440-top");
  await shot(page, "case-1440-full", { fullPage: true });
  ok((await overflow(page)) <= 0, "case 1440: no horizontal scroll");
  ok(mp4.length === 0, "case: no video requested on load");
  ok((await page.textContent("h1")) === "Incident Alert", "case: h1 is the title");
  const crumbs = await page.$$eval(".crumbs li", (lis) => lis.map((l) => l.textContent.trim()));
  ok(crumbs.join(" / ") === "Home / Systems / Incident Alert", "case: breadcrumb " + crumbs.join(" / "));
  ok((await page.getAttribute('.crumbs a:text-is("Systems")', "href")) === "/#systems", "case: breadcrumb leads back to the systems");
  ok((await page.textContent(".dek")) === "Citizens report incidents on a map; moderators approve them first.", "case: the summary as the dek");
  ok(/React apps → ASP\.NET services ⇄ RabbitMQ \+ PostgreSQL/.test(await page.textContent(".flow")), "case: the flow line");
  ok((await page.getByRole("link", { name: "Source code for Incident Alert : Backend" }).count()) === 1, "case: the repo links");
  ok((await page.getAttribute(".media img", "fetchpriority")) === "high", "case: the figure loads first");
  ok((await page.textContent(".body")).includes("Four ASP.NET Core 10 services") && (await page.textContent(".body .note")) === "Case study in progress.", "case: description and the in-progress note while the body is empty");
  ok((await page.locator(".pager .prev").count()) === 0 && (await page.getAttribute(".pager .next", "href")) === "/projects/e-mobility-hub/", "case: first system has only Next → eMobilityHub");
  ok((await page.getByRole("link", { name: "Next system eMobilityHub" }).count()) === 1, 'case: pager link name "Next system eMobilityHub"');
  ok(!(await footer(page)).includes("/ to"), "case: no / hint in the footer (no find field)");
  await page.click("[data-play]");
  await page.waitForTimeout(400);
  ok((await page.getAttribute(".media", "data-state")) === "playing" && mp4.length === 1, "case: Play demo plays the video");

  // keep the pointer off the next page's figure, or hovering it starts a preview
  await page.mouse.move(0, 0);
  await page.goto(base + "/projects/online-library-system/", { waitUntil: "networkidle" });
  ok((await page.locator(".pager .next").count()) === 0 && (await page.getAttribute(".pager .prev", "href")) === "/projects/chat-room/", "case: last system has only Previous → Chat Room");
  await page.goto(base + "/projects/chat-room/", { waitUntil: "networkidle" });
  ok((await page.getAttribute(".pager .prev", "href")) === "/projects/e-mobility-hub/" && (await page.getAttribute(".pager .next", "href")) === "/projects/online-library-system/", "case: a middle system has both");
  const kb = await tabThrough(page);
  ok(kb.bad.length === 0 && kb.stops.some((s) => s.includes("Play demo: Chat Room")), `case: keyboard reaches everything with a visible ring (${kb.stops.length} stops)` + (kb.bad.length ? ": " + kb.bad.join(" ; ") : ""));
  // every case study is linked from the home page
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const fromHome = await page.$$eval('a[href^="/projects/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  ok(fromHome.length === 4, "case: all four case studies linked from home: " + fromHome.join(" "));
  await ctx.close();
}

/* ---------- 404 at 1440 ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, "404");
  const res = await page.goto(base + "/no-such-page/", { waitUntil: "networkidle" });
  await shot(page, "404-1440");
  ok(res.status() === 404 && (await page.textContent("h1")) === "This page doesn't exist.", `404: served for a missing path (${res.status()})`);
  ok((await page.getAttribute('meta[name="robots"]', "content")) === "noindex", "404: noindex");
  const links = await page.$$eval("main a", (as) => as.map((a) => a.getAttribute("href")));
  ok(links.join(" ") === "/ /apps/", "404: links to Home and Browser apps: " + links.join(" "));
  ok((await overflow(page)) <= 0, "404 1440: no horizontal scroll");
  await ctx.close();
}

/* ---------- reduced motion ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const mp4 = [];
  watch(page, "reduced", mp4);
  await page.goto(base + "/projects/chat-room/", { waitUntil: "networkidle" });
  await page.hover(".media");
  await page.waitForTimeout(400);
  ok(mp4.length === 0 && (await page.getAttribute(".media", "data-state")) === "idle", "reduced motion: hover doesn't start the case study video");
  await page.click("[data-play]");
  await page.waitForTimeout(300);
  ok((await page.getAttribute(".media", "data-state")) === "playing", "reduced motion: the button still plays");
  await ctx.close();
}

/* ---------- 360 ---------- */
{
  const m = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const mp = await m.newPage();
  watch(mp, "360");
  for (const path of ["/apps/", "/projects/incident-alert/", "/projects/online-library-system/", "/no-such-page/"]) {
    await mp.goto(base + path, { waitUntil: "networkidle" });
    const o = await mp.evaluate(() => document.documentElement.scrollWidth - 360);
    const wide = await mp.$$eval("body *", (els) => els.filter((e) => e.getBoundingClientRect().right > 360.5 && getComputedStyle(e).position !== "fixed").map((e) => e.className || e.tagName).slice(0, 4));
    ok(o <= 0 && wide.length === 0, `360 ${path}: no horizontal scroll` + (wide.length ? " " + wide.join(",") : ""));
    await shot(mp, `360${path.replace(/\//g, "-")}top`);
  }
  await mp.goto(base + "/apps/", { waitUntil: "networkidle" });
  await shot(mp, "360-apps-full", { fullPage: true });
  const cols = await mp.$$eval(".gallery li", (lis) => new Set(lis.map((l) => Math.round(l.getBoundingClientRect().left))).size);
  ok(cols === 1, `360: apps in one column (${cols})`);
  await mp.goto(base + "/projects/incident-alert/", { waitUntil: "networkidle" });
  await shot(mp, "360-case-full", { fullPage: true });
  await m.close();
}

ok(errors.length === 0, "no console, page or network errors" + (errors.length ? ": " + errors.slice(0, 8).join(" ; ") : ""));
await browser.close();
server.kill();
console.log(log.join("\n"));
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exitCode = failed ? 1 : 0;
