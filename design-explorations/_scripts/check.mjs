// Drives the prototypes in a real browser: errors, overflow at 360/1440, and behaviour.
// usage: node design-explorations/_scripts/check.mjs [a|b|c]
//   PW_CHANNEL=msedge|chrome  browser channel (default: msedge on Windows, bundled Chromium elsewhere)
//   SHOTS=<dir>               also save screenshots there
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(repo + "package.json");
const { chromium } = require("@playwright/test");

const port = 4377;
const base = `http://127.0.0.1:${port}/design-explorations/`;
const shots = process.env.SHOTS;
if (shots) mkdirSync(shots, { recursive: true });
const shot = (page, name, opts = {}) => shots && page.screenshot({ path: `${shots}/${name}.png`, ...opts });
const only = process.argv[2];

const server = spawn(process.execPath, [fileURLToPath(new URL("./serve.mjs", import.meta.url)), String(port)]);
await new Promise((resolve) => server.stdout.once("data", resolve));

const channel = process.env.PW_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined);
const browser = await chromium.launch(channel ? { channel } : {});
const results = [];
let failed = 0;
for (const dir of ["direction-a", "direction-b", "direction-c"].filter((d) => !only || d.endsWith(only))) {
  const log = [];
  const ok = (cond, msg) => {
    if (!cond) failed++;
    log.push(`${cond ? "PASS" : "FAIL"} ${msg}`);
  };
  const isB = dir.endsWith("b");
  const isC = dir.endsWith("c");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  const errors = [];
  const mp4 = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("requestfailed", (r) => errors.push("failed " + r.url()));
  page.on("response", (r) => r.status() >= 400 && errors.push(r.status() + " " + r.url()));
  page.on("request", (r) => r.url().endsWith(".mp4") && mp4.push(r.url()));
  await page.goto(base + dir + "/", { waitUntil: "networkidle" });
  await shot(page, `${dir}-1440-top`);
  await shot(page, `${dir}-1440-full`, { fullPage: true });

  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok((await overflow()) <= 0, `no horizontal scroll at 1440 (${await overflow()})`);
  ok(mp4.length === 0, `no video requested on load (${mp4.length})`);
  ok((await page.locator("h1").count()) === 1, "one h1");
  const flows = await page.$$eval(".flow, .schem, .ls .f", (els) => els.map((e) => e.textContent));
  ok(flows.length > 0 && flows.every((f) => !/\d/.test(f)), "architecture lines have no counts");

  const counts = await page.$$eval("[data-filter]", (bs) => bs.map((b) => b.dataset.filter + "=" + b.querySelector("[data-count]").textContent));
  ok(counts.join(",") === "=26,live=13,web=1,mobile=3,desktop=7,tool=2", "filter counts " + counts.join(","));
  // count what is actually rendered, not the hidden property (CSS display can override it)
  const visible = () => page.$$eval("[data-item]", (els) => els.filter((e) => e.getClientRects().length > 0).length);
  const visibleKinds = () => page.$$eval("[data-item]", (els) => els.filter((e) => e.getClientRects().length > 0).map((e) => e.dataset.kind));

  await page.fill("#q", "react");
  // B also lists the matching systems (Incident Alert, Chat Room), first
  ok((await visible()) === (isB ? 7 : 5), `search react → ${await visible()} visible`);
  if (isB) {
    const k = await visibleKinds();
    ok(k[0] === "system" && k[1] === "system" && k.slice(2).every((x) => x !== "system"), "matching systems are listed first: " + k.join(","));
    ok((await page.textContent('[data-filter=""] [data-count]')) === "7", "All count includes systems while searching");
  }
  ok((await page.evaluate(() => location.hash)) === "#projects?q=react", "hash mirrors search: " + (await page.evaluate(() => location.hash)));
  await page.click('[data-filter="live"]');
  ok((await page.evaluate(() => location.hash)) === "#projects?kind=live&q=react", "hash mirrors kind: " + (await page.evaluate(() => location.hash)));
  await page.fill("#q", "zzzz");
  ok(await page.isVisible("#empty"), "empty state visible");
  ok((await page.textContent("#empty p")).includes("“zzzz”"), "empty text: " + (await page.textContent("#empty p")).trim());
  await page.click("#empty [data-clear]");
  ok((await visible()) === 26 && (await page.inputValue("#q")) === "", "clear search resets (systems leave the list)");
  await page.fill("#q", "spring boot");
  if (isB) {
    ok((await page.locator("#also").count()) === 0, "no separate systems line");
    ok((await visibleKinds()).filter((k) => k === "system").length === 2, "spring boot finds the two Spring Boot systems");
  } else {
    ok(await page.isVisible("#also"), "systems hint: " + (await page.textContent("#also")).trim());
  }
  await page.fill("#q", "");

  await page.goto(base + dir + "/#projects?kind=mobile&q=flutter", { waitUntil: "networkidle" });
  ok((await page.inputValue("#q")) === "flutter" && (await page.getAttribute('[data-filter="mobile"]', "aria-pressed")) === "true" && (await visible()) === 3, "state restored from hash");
  await page.goto(base + dir + "/", { waitUntil: "networkidle" });

  if (isB) {
    const open = await page.$$eval(".entry .e-open a", (as) => as.map((a) => a.getAttribute("href")));
    ok(open.length === 13 && open.includes("https://repository-health-monitor.vercel.app/"), `collapsed live apps have an Open link (${open.length})`);
    ok((await page.locator('[data-term="FastAPI"], [data-term="GCP"]').count()) === 0 && (await page.locator(".terms .plain").count()) === 2, "FastAPI and GCP are plain text");
    const firstLetter = await page.evaluate(() => getComputedStyle(document.querySelector(".about-text p"), "::first-letter").float);
    ok(firstLetter === "none", "no drop cap");
  }

  // details on demand
  const opener = isC ? '[data-slug="fitforge"] [data-open-detail]' : '[data-slug="fitforge"] [data-toggle]';
  await page.click(opener);
  const openNow = () => (isC ? page.evaluate(() => document.getElementById("drawer").open) : page.isVisible("#d-fitforge"));
  ok(await openNow(), "detail opens");
  if (!isC) {
    await page.click('[data-slug="devkit"] [data-toggle]');
    ok(!(await page.isVisible("#d-fitforge")) && (await page.isVisible("#d-devkit")), "only one open at a time");
  }
  await page.waitForTimeout(300);
  await shot(page, `${dir}-1440-detail`);
  await page.keyboard.press("Escape");
  ok(!(await openNow()) && !(await page.isVisible(isC ? "#drawer" : "#d-devkit")), "Esc closes detail");
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  ok(/FitForge|DevKit/.test(focused || ""), "focus returns to trigger: " + focused);

  // video on demand
  await page.hover("#incident-alert [data-video]");
  await page.waitForTimeout(400);
  ok((await page.locator("#incident-alert video").count()) === 1 && mp4.length > 0, "hover loads + plays video");
  ok((await page.getAttribute("#incident-alert video", "preload")) === "none", "video preload=none");
  await page.mouse.move(5, 5);

  // keyboard
  await page.keyboard.press("/");
  ok((await page.evaluate(() => document.activeElement.id)) === "q", "/ focuses search");
  await page.keyboard.press("Escape");
  await page.locator("body").click({ position: { x: 2, y: 400 } }).catch(() => {});
  await page.keyboard.press("Control+k");
  ok(await page.evaluate(() => document.getElementById("palette").open), "Ctrl K opens palette");
  await page.keyboard.type("asset");
  await shot(page, `${dir}-1440-palette`);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  ok(!(await page.evaluate(() => document.getElementById("palette").open)) && (isC ? await page.evaluate(() => document.getElementById("drawer").open) : await page.isVisible("#d-asset-manager")), "palette Enter opens AssetManager detail");
  await page.keyboard.press("Escape");

  // copy (the first visible Copy button)
  const copy = page.locator("[data-copy]:visible").first();
  await copy.click();
  await page.waitForFunction(() => [...document.querySelectorAll("[data-copy-label]")].some((l) => l.textContent === "Copied"), null, { timeout: 2000 }).catch(() => {});
  ok((await copy.locator("[data-copy-label]").textContent()) === "Copied", "copy shows Copied");
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "?");
  ok(clip === "pero.grubac00@gmail.com", "clipboard has email: " + clip);

  if (isB) {
    ok((await page.locator("#contact [data-copy]").count()) === 1 && (await page.locator("[data-variant], .proto-switch").count()) === 0, "one contact section (colophon), no prototype switch");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await shot(page, `${dir}-1440-contact`);
  }

  // stack term
  await page.click('[data-term="Flutter"]');
  ok((await page.inputValue("#q")) === "Flutter" && (await visible()) === 3, "stack term searches projects");

  if (dir.endsWith("a")) {
    await page.locator("#q").blur();
    await page.keyboard.press("t");
    ok((await page.evaluate(() => document.documentElement.dataset.theme)) === "light", "t toggles theme");
    await page.keyboard.press("t");
  }

  // mobile
  const m = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const mp = await m.newPage();
  mp.on("pageerror", (e) => errors.push("mobile " + String(e)));
  await mp.goto(base + dir + "/", { waitUntil: "networkidle" });
  const iw = await mp.evaluate(() => innerWidth);
  const mo = await mp.evaluate(() => document.documentElement.scrollWidth - 360);
  ok(iw === 360 && mo <= 0, `no horizontal scroll at 360 (layout ${iw}px, overflow ${mo})`);
  await shot(mp, `${dir}-360-top`);
  if (isB) {
    await mp.locator("#contact").scrollIntoViewIfNeeded();
    await shot(mp, `${dir}-360-contact`);
  }
  await mp.tap(opener);
  await mp.waitForTimeout(300);
  await shot(mp, `${dir}-360-detail`);
  await m.close();

  ok(errors.length === 0, "no console/page/network errors" + (errors.length ? ": " + errors.slice(0, 6).join(" ; ") : ""));
  results.push(`== ${dir}\n` + log.join("\n"));
  await ctx.close();
}
await browser.close();
server.kill();
console.log(results.join("\n"));
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exitCode = failed ? 1 : 0;
