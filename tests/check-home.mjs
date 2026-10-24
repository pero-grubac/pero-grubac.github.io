// Browser checks for the built home page (dist/), served by `astro preview`:
// counts, search, hash, details, video, copy, keyboard only, reduced motion,
// 360 and 1440 px. Written in phase 3; phase 5 turns it into real tests.
// usage: npm run build && npm run check:home
//   PW_CHANNEL=msedge|chrome  browser channel (default: msedge on Windows, bundled Chromium elsewhere)
//   SHOTS=<dir>               also save screenshots there
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(join(repo, "package.json"));
const { chromium } = require("@playwright/test");

const port = 4399;
const base = `http://127.0.0.1:${port}/`;
const shots = process.env.SHOTS;
if (shots) mkdirSync(shots, { recursive: true });
const shot = (page, name, opts = {}) => shots && page.screenshot({ path: `${shots}/${name}.png`, ...opts });

// --ignore-lock: run beside a preview server the owner may already have open
const server = spawn(process.execPath, [join(repo, "node_modules/astro/bin/astro.mjs"), "preview", "--port", String(port), "--host", "127.0.0.1", "--ignore-lock"], { cwd: repo });
let serverLog = "";
await new Promise((resolve, reject) => {
  server.stdout.on("data", (d) => (serverLog += d) && String(d).includes(String(port)) && resolve());
  server.stderr.on("data", (d) => (serverLog += d));
  server.on("exit", (code) => reject(new Error(`astro preview exited (${code}):
${serverLog}`)));
});

const channel = process.env.PW_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined);
const browser = await chromium.launch(channel ? { channel } : {});
const log = [];
let failed = 0;
const ok = (cond, msg) => {
  if (!cond) failed++;
  log.push(`${cond ? "PASS" : "FAIL"} ${msg}`);
};
const errors = [];
const watch = (page, tag, mp4) => {
  page.on("console", (m) => m.type() === "error" && errors.push(`${tag} console: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${tag} pageerror: ${e}`));
  page.on("requestfailed", (r) => !r.url().endsWith(".mp4") && errors.push(`${tag} failed ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && errors.push(`${tag} ${r.status()} ${r.url()}`));
  if (mp4) page.on("request", (r) => r.url().endsWith(".mp4") && mp4.push(r.url()));
};
const visible = (page) => page.$$eval("[data-item]", (els) => els.filter((e) => e.getClientRects().length > 0).length);
const visibleKinds = (page) => page.$$eval("[data-item]", (els) => els.filter((e) => e.getClientRects().length > 0).map((e) => e.dataset.kind));
const hash = (page) => page.evaluate(() => location.hash);
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const active = (page) => page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim(), id: document.activeElement?.id }));

/* ================= 1440 ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  const mp4 = [];
  watch(page, "1440", mp4);
  await page.goto(base, { waitUntil: "networkidle" });
  await shot(page, "1440-top");
  await shot(page, "1440-full", { fullPage: true });

  ok((await overflow(page)) <= 0, `1440: no horizontal scroll (${await overflow(page)})`);
  ok(mp4.length === 0, `1440: no video requested on load (${mp4.length})`);
  ok((await page.locator("h1").count()) === 1, "one h1");
  ok((await page.locator("video").count()) === 0, "no <video> in the page until played");
  const flows = await page.$$eval(".flow", (els) => els.map((e) => e.textContent));
  ok(flows.length === 4 && flows.every((f) => !/\d/.test(f)), "four architecture lines, no counts");
  const headings = await page.$$eval("h1, h2, h3", (hs) => hs.map((h) => +h.tagName[1]));
  ok(headings.every((l, i) => i === 0 || l <= headings[i - 1] + 1), "heading levels never skip: " + headings.join(""));

  const counts = await page.$$eval("[data-filter]", (bs) => bs.map((b) => b.dataset.filter + "=" + b.querySelector("[data-count]").textContent));
  ok(counts.join(",") === "=26,live=13,web=1,mobile=3,desktop=7,tool=2", "filter counts " + counts.join(","));
  const contents = await page.$$eval(".contents a", (as) => as.map((a) => a.textContent.replace(/\s+/g, " ").trim()));
  ok(contents.includes("Index of projects 26 projects") && contents.includes("Browser apps 13 apps"), "contents counts: " + contents.slice(-2).join(" | "));
  ok((await page.textContent("#apps .num")) === "13", "apps teaser count 13");
  ok((await page.locator("#apps li").count()) === 3, "three teaser screenshots");

  // search
  await page.fill("#q", "react");
  const k = await visibleKinds(page);
  ok(k.length === 7, `search react → ${k.length} visible`);
  ok(k[0] === "system" && k[1] === "system" && k.slice(2).every((x) => x !== "system"), "matching systems first: " + k.join(","));
  ok((await page.textContent('[data-filter=""] [data-count]')) === "7", "All counts the systems while searching");
  ok((await page.textContent('[data-filter="live"] [data-count]')) !== "", "kind counts follow the search");
  ok((await hash(page)) === "#projects?q=react", "hash mirrors search: " + (await hash(page)));
  ok((await page.textContent("[data-status]")) === "7 projects match “react”", "status: " + (await page.textContent("[data-status]")));
  await page.click('[data-filter="live"]');
  ok((await hash(page)) === "#projects?kind=live&q=react", "hash mirrors kind: " + (await hash(page)));
  ok(!(await visibleKinds(page)).includes("system"), "systems leave the list under a kind filter");
  await page.fill("#q", "zzzz");
  ok(await page.isVisible("[data-empty]"), "empty state visible");
  const emptyText = (await page.textContent("[data-empty] p")).trim();
  ok(emptyText === "No live app matches “zzzz”.", "empty text: " + emptyText);
  await page.click("[data-clear]");
  ok((await page.inputValue("#q")) === "" && (await visible(page)) === 13 && (await page.evaluate(() => document.activeElement.id)) === "q", "Clear search clears the query, keeps the kind, focuses the box");
  await page.click('[data-filter=""]');
  ok((await visible(page)) === 26 && (await hash(page)) === "#projects", "All shows 26 again, hash #projects");
  await page.fill("#q", "spring boot");
  ok((await visibleKinds(page)).filter((x) => x === "system").length === 2, "spring boot finds the two Spring Boot systems");
  await page.fill("#q", "");

  await page.goto("about:blank");
  await page.goto(base + "#projects?kind=mobile&q=flutter", { waitUntil: "networkidle" });
  ok((await page.inputValue("#q")) === "flutter" && (await page.getAttribute('[data-filter="mobile"]', "aria-pressed")) === "true" && (await visible(page)) === 3, "state restored from hash");
  const projTop = await page.evaluate(() => document.getElementById("projects").getBoundingClientRect().top);
  ok(Math.abs(projTop - 84) < 4, `scrolled to the index on load (top ${projTop})`);
  await page.goto(base + "#projects?q=C%23", { waitUntil: "networkidle" });
  ok((await page.inputValue("#q")) === "C#", "q=C%23 restores C#");
  await page.goto(base, { waitUntil: "networkidle" });

  // collapsed entries
  const opens = await page.$$eval(".entry .open a", (as) => as.map((a) => [a.getAttribute("href"), a.textContent.trim(), a.target]));
  ok(opens.length === 13 && opens.some(([h]) => h === "https://repository-health-monitor.vercel.app/") && opens.every(([, , t]) => t === "_blank"), `13 live apps have a one-click Open (${opens.length})`);
  const openName = await page.locator('[data-slug="devkit"] .open a').evaluate((a) => a.innerText);
  ok(openName.includes("Open") && openName.includes("↗"), "Open link text: " + openName);
  ok((await page.getByRole("link", { name: "Open DevKit", exact: true }).count()) === 1, 'accessible name "Open DevKit"');
  await page.click('[data-slug="fitforge"] [data-toggle]');
  ok((await page.getByRole("link", { name: "Source code for FitForge", exact: true }).count()) === 1, 'accessible name "Source code for FitForge"');
  await page.click('[data-slug="fitforge"] [data-toggle]');
  ok((await page.locator('a[href*="repository-health"]').count()) >= 1 && (await page.locator('a[href*="github.com/pero-grubac/repo"]').count()) === 0, "RepoHealth: live link, no repo link");
  ok((await page.locator('[data-term="FastAPI"], [data-term="GCP"]').count()) === 0 && (await page.locator(".stack .plain").count()) === 2, "FastAPI and GCP are plain text");

  // details on demand
  await page.click('[data-slug="fitforge"] [data-toggle]');
  ok(await page.isVisible("#d-fitforge"), "detail opens");
  ok((await page.getAttribute('[data-slug="fitforge"] [data-toggle]', "aria-expanded")) === "true", "aria-expanded true");
  ok((await page.locator("#d-fitforge .desc").count()) === 0, "FitForge (repeatsSummary) shows no description");
  const pane = await page.locator("#d-fitforge .panel-body").boundingBox();
  const list = await page.locator(".index").boundingBox();
  ok(pane.x > list.x + list.width, `detail reads in the pane beside the list (pane x ${Math.round(pane.x)}, list ends ${Math.round(list.x + list.width)})`);
  ok(await page.isVisible("#d-fitforge .panel-title"), "pane shows the title");
  await shot(page, "1440-detail");
  // Tab from the open entry goes into its details
  await page.focus('[data-slug="fitforge"] [data-toggle]');
  await page.keyboard.press("Tab");
  const afterTab = await active(page);
  ok(afterTab.text?.startsWith("Read the case study"), "Tab from an open entry goes into its details: " + afterTab.text);
  await page.click('[data-slug="devkit"] [data-toggle]');
  ok(!(await page.isVisible("#d-fitforge")) && (await page.isVisible("#d-devkit")), "only one open at a time");
  ok((await page.locator("#d-devkit .desc").count()) === 1, "DevKit shows its description");
  await page.keyboard.press("Escape");
  ok(!(await page.isVisible("#d-devkit")), "Esc closes");
  ok((await active(page)).text === "DevKit", "focus returns to the entry: " + (await active(page)).text);
  await page.click('[data-slug="anova"] .sum');
  ok(await page.isVisible("#d-anova"), "clicking the row opens the entry");
  await page.click('[data-slug="anova"] .sum');
  ok(!(await page.isVisible("#d-anova")), "clicking the row again closes it");
  await page.fill("#q", "discord");
  await page.click('[data-slug="git-discord-bot"] [data-toggle]');
  ok((await page.locator("#d-git-discord-bot .cmds li").count()) === 8, "Discord bot shows its 8 commands instead of a screenshot");
  await page.fill("#q", "zzz");
  ok(!(await page.isVisible("#d-git-discord-bot")) && (await page.getAttribute('[data-slug="git-discord-bot"] [data-toggle]', "aria-expanded")) === "false", "filtering out the open entry closes it");
  await page.fill("#q", "");
  // system entries link to their feature
  await page.fill("#q", "rabbitmq");
  await page.click('.entry-system a[href="#incident-alert"]');
  await page.waitForTimeout(800);
  const featTop = await page.evaluate(() => document.getElementById("incident-alert").getBoundingClientRect().top);
  ok(featTop < 200 && featTop > -10, `system entry scrolls to its feature (top ${Math.round(featTop)})`);
  await page.goto(base, { waitUntil: "networkidle" });

  // video on demand
  await page.locator("#incident-alert figure").scrollIntoViewIfNeeded();
  await page.hover("#incident-alert figure");
  await page.waitForTimeout(500);
  ok((await page.locator("#incident-alert video").count()) === 1 && mp4.length > 0, "hover loads and plays the video");
  ok((await page.getAttribute("#incident-alert video", "preload")) === "none", "video preload=none");
  ok((await page.evaluate(() => !document.querySelector("#incident-alert video").paused)), "video is playing");
  ok((await page.getAttribute("#incident-alert figure", "data-state")) === "preview", "hover is a preview");
  ok((await page.textContent("#incident-alert [data-play-text]")) === "Play demo", "button still offers Play demo while previewing");
  const poster = await page.getAttribute("#incident-alert video", "poster");
  ok(/\/_astro\/demo\..+\.(avif|webp)$/.test(poster || ""), "poster is the optimized still: " + poster);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(200);
  ok((await page.getAttribute("#incident-alert figure", "data-state")) === "idle", "leaving stops the hover video");
  await page.click("#chat-room [data-play]");
  await page.waitForTimeout(500);
  ok((await page.getAttribute("#chat-room figure", "data-state")) === "playing" && (await page.textContent("#chat-room [data-play-text]")) === "Pause demo", "clicking Play demo with a mouse plays (hover had started a preview)");
  await page.mouse.move(5, 5);
  ok((await page.getAttribute("#chat-room figure", "data-state")) === "playing", "a clicked video keeps playing after the pointer leaves");
  await page.click("#chat-room [data-play]");
  ok((await page.getAttribute("#chat-room figure", "data-state")) === "paused", "clicking Pause demo pauses");

  // keyboard shortcuts
  await page.mouse.move(5, 5);
  await page.locator("body").click({ position: { x: 2, y: 300 } }).catch(() => {});
  await page.keyboard.press("/");
  ok((await page.evaluate(() => document.activeElement.id)) === "q", "/ focuses search");
  await page.keyboard.type("/x");
  ok((await page.inputValue("#q")) === "/x", "/ types into the search while typing");
  await page.fill("#q", "");

  // copy
  await page.click("[data-copy]");
  await page.waitForTimeout(100);
  ok((await page.textContent("[data-copy-label]")) === "Copied", "Copy shows Copied");
  ok((await page.evaluate(() => navigator.clipboard.readText())) === "pero.grubac00@gmail.com", "clipboard has the email");
  ok((await page.textContent("#toast")) === "Email copied", "toast says Email copied");
  await page.waitForTimeout(2100);
  ok((await page.textContent("[data-copy-label]")) === "Copy", "Copy label back after 2s");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await shot(page, "1440-contact");

  // stack term: an exact stack match, unlike a typed query
  await page.click('[data-term="Flutter"]');
  await page.waitForTimeout(1800);
  ok((await page.inputValue("#q")) === "Flutter" && (await visible(page)) === 3 && (await hash(page)) === "#projects?tech=Flutter", "stack term shows the projects built with it: " + (await hash(page)));
  ok((await page.textContent("[data-status]")) === "3 projects built with Flutter", "status: " + (await page.textContent("[data-status]")));
  ok((await page.evaluate(() => document.activeElement.id)) === "q", "stack term moves focus to the search (mouse)");
  const t = await page.evaluate(() => document.getElementById("projects").getBoundingClientRect().top);
  ok(Math.abs(t - 84) < 4, `stack term scrolls to the index (top ${Math.round(t)})`);

  await page.click('[data-term="Java"]');
  await page.waitForTimeout(1800);
  const javaKinds = await visibleKinds(page);
  ok(javaKinds.length === 4, `"Java" from About finds the 4 Java projects, not JavaScript (${javaKinds.length})`);
  await page.fill("#q", "java");
  ok((await visible(page)) === 15 && (await hash(page)) === "#projects?q=java", `typing "java" matches any part of a word (${await visible(page)})`);
  await page.goto("about:blank");
  await page.goto(base + "#projects?tech=Java", { waitUntil: "networkidle" });
  ok((await page.inputValue("#q")) === "Java" && (await visible(page)) === 4, "tech=Java restored from the hash");
  await page.press("#q", "End");
  await page.keyboard.type("S");
  ok((await page.inputValue("#q")) === "JavaS" && (await visible(page)) === 11 && (await hash(page)) === "#projects?q=JavaS", "editing the box turns the technology into a typed query");

  // links that must stay as they are
  const hrefs = await page.$$eval("a", (as) => as.map((a) => a.getAttribute("href")));
  ok(hrefs.includes("mailto:pero.grubac00@gmail.com") && hrefs.includes("https://github.com/pero-grubac") && hrefs.includes("https://www.linkedin.com/in/perogrubac/"), "email, GitHub and LinkedIn links unchanged");
  ok(new Set(hrefs.filter((h) => h?.startsWith("/projects/"))).size === 29, "links to all 29 case studies (the systems and every index entry but RepoHealth)");
  await ctx.close();
}

/* ================= keyboard only, 1440 ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, "kbd");
  await page.goto(base, { waitUntil: "networkidle" });
  const stops = [];
  const invisible = [];
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const ring = el.matches("[data-toggle]") ? el.closest(".entry") : el.matches("#q") ? el.closest(".find-in") : el;
      const cs = getComputedStyle(ring);
      const r = el.getBoundingClientRect();
      return {
        label: (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40),
        outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
        onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0,
        underMasthead: r.top < document.querySelector(".masthead").getBoundingClientRect().bottom && r.bottom > 0 && !el.closest(".masthead"),
      };
    });
    if (!info) break;
    if (!info.onScreen && !info.underMasthead) {
      // focus scrolling is smooth; let it finish before judging
      await page.waitForTimeout(1600);
      Object.assign(info, await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { onScreen: r.bottom > 0 && r.top < innerHeight } }));
    }
    stops.push(info.label);
    if (!info.outline || !info.onScreen || (info.underMasthead && info.label !== "Skip to content")) invisible.push(`${info.label} (outline ${info.outline}, onScreen ${info.onScreen}, underMasthead ${info.underMasthead})`);
    if (info.label.startsWith("linkedin.com")) break;
  }
  ok(stops[0] === "Skip to content", "first Tab stop is the skip link: " + stops[0]);
  ok(stops.length > 60, `Tab reaches the end of the page (${stops.length} stops)`);
  ok(invisible.length === 0, "every Tab stop shows a 2px focus ring on screen" + (invisible.length ? ": " + invisible.slice(0, 8).join(" ; ") : ""));
  // open an entry and play a demo with the keyboard only
  await page.focus('[data-slug="countdown"] [data-toggle]');
  await page.keyboard.press("Enter");
  ok(await page.isVisible("#d-countdown"), "Enter opens an entry");
  await page.keyboard.press("Escape");
  await page.focus("#e-mobility-hub [data-play]");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  ok((await page.getAttribute("#e-mobility-hub figure", "data-state")) === "playing", "Enter on Play demo plays");
  await page.keyboard.press(" ");
  ok((await page.getAttribute("#e-mobility-hub figure", "data-state")) === "paused", "Space pauses");
  await page.focus('[data-term="Docker"]');
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  ok((await page.evaluate(() => document.activeElement.id)) === "q" && (await page.inputValue("#q")) === "Docker", "Enter on a stack term moves focus to the search");
  await ctx.close();
}

/* ================= reduced motion ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const mp4 = [];
  watch(page, "reduced", mp4);
  await page.goto(base, { waitUntil: "networkidle" });
  ok((await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)) === "auto", "reduced motion: instant scrolling");
  await page.locator("#incident-alert figure").scrollIntoViewIfNeeded();
  await page.hover("#incident-alert figure");
  await page.waitForTimeout(400);
  ok((await page.locator("#incident-alert video").count()) === 0 && mp4.length === 0, "reduced motion: hover does not start the video");
  await page.click("#incident-alert [data-play]");
  await page.waitForTimeout(400);
  ok((await page.getAttribute("#incident-alert figure", "data-state")) === "playing", "reduced motion: click still plays");
  ok((await page.evaluate(() => getComputedStyle(document.querySelector("#incident-alert video")).transitionDuration)) === "0s", "reduced motion: no video fade");
  await page.mouse.move(5, 5);
  await page.waitForTimeout(200);
  ok((await page.getAttribute("#incident-alert figure", "data-state")) === "playing", "reduced motion: leaving does not stop a clicked video");
  ok((await page.evaluate(() => getComputedStyle(document.getElementById("toast")).transitionDuration)) === "0s", "reduced motion: no toast transition");
  await ctx.close();
}

/* ================= 360 ================= */
{
  const m = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const mp = await m.newPage();
  const mp4 = [];
  watch(mp, "360", mp4);
  await mp.goto(base, { waitUntil: "networkidle" });
  const iw = await mp.evaluate(() => innerWidth);
  const mo = await mp.evaluate(() => document.documentElement.scrollWidth - 360);
  ok(iw === 360 && mo <= 0, `360: no horizontal scroll (layout ${iw}px, overflow ${mo})`);
  const wide = await mp.$$eval("body *", (els) => els.filter((e) => e.getBoundingClientRect().right > 360.5 && getComputedStyle(e).position !== "fixed").map((e) => e.className || e.tagName).slice(0, 5));
  ok(wide.length === 0, "360: nothing pokes past the right edge " + wide.join(","));
  await shot(mp, "360-top");
  await shot(mp, "360-full", { fullPage: true });
  ok(!(await mp.isVisible(".reader")), "360: no reader pane");
  await mp.tap('[data-slug="fitforge"] [data-toggle]');
  const panel = await mp.locator("#d-fitforge").boundingBox();
  const entry = await mp.locator('[data-slug="fitforge"] .sum').boundingBox();
  ok(panel && panel.y > entry.y && panel.x < 40, "360: details open inline under the entry");
  await mp.locator('[data-slug="fitforge"]').scrollIntoViewIfNeeded();
  await shot(mp, "360-detail");
  // opening an entry below keeps it in place while the one above closes
  await mp.locator('[data-slug="devkit"]').scrollIntoViewIfNeeded();
  const before = await mp.locator('[data-slug="devkit"]').boundingBox();
  await mp.tap('[data-slug="devkit"] [data-toggle]');
  const after = await mp.locator('[data-slug="devkit"]').boundingBox();
  ok(Math.abs(after.y - before.y) < 2, `360: the tapped entry stays put (${Math.round(before.y)} → ${Math.round(after.y)})`);
  ok(!(await mp.isVisible("#d-fitforge")), "360: the other entry closed");
  await mp.tap("#incident-alert figure", { position: { x: 60, y: 60 } });
  await mp.waitForTimeout(400);
  ok((await mp.getAttribute("#incident-alert figure", "data-state")) === "playing" && mp4.length > 0, "360: tap plays the video");
  await mp.tap("#incident-alert figure", { position: { x: 60, y: 60 } });
  ok((await mp.getAttribute("#incident-alert figure", "data-state")) === "paused", "360: tap again pauses");
  await mp.locator("#contact").scrollIntoViewIfNeeded();
  await shot(mp, "360-contact");
  await mp.tap('[data-term="Docker"]');
  await mp.waitForTimeout(800);
  ok((await mp.inputValue("#q")) === "Docker" && (await mp.evaluate(() => document.activeElement.id)) !== "q", "360: tapping a stack term searches without opening the keyboard");
  await m.close();
}

ok(errors.length === 0, "no console, page or network errors" + (errors.length ? ": " + errors.slice(0, 8).join(" ; ") : ""));
await browser.close();
server.kill();
console.log(log.join("\n"));
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exitCode = failed ? 1 : 0;
