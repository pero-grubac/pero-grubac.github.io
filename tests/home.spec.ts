// The home page (REDESIGN.md section 7) in a browser: counts, search and
// hash, details on demand, the demo video, Copy, the stack terms, keyboard
// only, reduced motion, and 360 and 1440 px. Ported from the phase 3
// check script.
import { test, expect, desktop, phone, overflow, pokingOut, visible, visibleKinds, hash, activeId, activeText, topOf, tabThrough, videoOf, SCROLL_PAD } from "./helpers";

test.describe("home at 1440", () => {
  test.use(desktop);

  test("layout, headings and counts", async ({ page, videos }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await overflow(page), "no horizontal scroll").toBeLessThanOrEqual(0);
    expect(videos, "no video requested on load").toEqual([]);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("video"), "no <video> until one is played").toHaveCount(0);
    const flows = await page.$$eval(".flow", (els) => els.map((e) => e.textContent ?? ""));
    expect(flows, "four architecture lines").toHaveLength(4);
    expect(flows.filter((f) => /\d/.test(f)), "no counts in the architecture lines").toEqual([]);
    const levels = await page.$$eval("h1, h2, h3", (hs) => hs.map((h) => +h.tagName[1]!));
    expect(levels.every((l, i) => i === 0 || l <= levels[i - 1]! + 1), "heading levels never skip: " + levels.join("")).toBe(true);

    const counts = await page.$$eval("[data-filter]", (bs) => bs.map((b) => `${(b as HTMLElement).dataset.filter}=${b.querySelector("[data-count]")!.textContent}`));
    expect(counts.join(",")).toBe("=26,live=13,web=1,mobile=3,desktop=7,tool=2");
    const contents = await page.$$eval(".contents a", (as) => as.map((a) => a.textContent!.replace(/\s+/g, " ").trim()));
    expect(contents).toContain("Index of projects 26 projects");
    expect(contents).toContain("Browser apps 13 apps");
    await expect(page.locator("#apps .num")).toHaveText("13");
    await expect(page.locator("#apps li"), "three teaser screenshots").toHaveCount(3);
  });

  test("search, filters and the hash", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.fill("#q", "react");
    const kinds = await visibleKinds(page);
    expect(kinds, "react → 7 entries").toHaveLength(7);
    expect(kinds.slice(0, 2), "matching systems first").toEqual(["system", "system"]);
    expect(kinds.slice(2)).not.toContain("system");
    await expect(page.locator('[data-filter=""] [data-count]'), "All counts the systems while searching").toHaveText("7");
    await expect(page.locator('[data-filter="live"] [data-count]')).not.toHaveText("");
    expect(await hash(page)).toBe("#projects?q=react");
    await expect(page.locator("[data-status]")).toHaveText("7 projects match “react”");
    await page.click('[data-filter="live"]');
    expect(await hash(page)).toBe("#projects?kind=live&q=react");
    expect(await visibleKinds(page), "systems leave the list under a kind filter").not.toContain("system");
    await page.fill("#q", "zzzz");
    await expect(page.locator("[data-empty]")).toBeVisible();
    await expect(page.locator("[data-empty] p")).toHaveText("No live app matches “zzzz”.");
    await page.click("[data-clear]");
    expect(await page.inputValue("#q")).toBe("");
    expect(await visible(page), "Clear search keeps the kind").toBe(13);
    expect(await activeId(page), "Clear search focuses the box").toBe("q");
    await page.click('[data-filter=""]');
    expect(await visible(page)).toBe(26);
    expect(await hash(page)).toBe("#projects");
    await page.fill("#q", "spring boot");
    expect((await visibleKinds(page)).filter((k) => k === "system"), "spring boot finds the two Spring Boot systems").toHaveLength(2);
  });

  test("the state comes back from the hash", async ({ page }) => {
    await page.goto("/#projects?kind=mobile&q=flutter", { waitUntil: "networkidle" });
    expect(await page.inputValue("#q")).toBe("flutter");
    await expect(page.locator('[data-filter="mobile"]')).toHaveAttribute("aria-pressed", "true");
    expect(await visible(page)).toBe(3);
    await expect.poll(async () => Math.abs((await topOf(page, "#projects")) - SCROLL_PAD) < 4, { message: "scrolled to the index on load" }).toBe(true);
    await page.goto("about:blank");
    await page.goto("/#projects?q=C%23", { waitUntil: "networkidle" });
    expect(await page.inputValue("#q"), "q=C%23 restores C#").toBe("C#");
  });

  test("#p-<slug> opens that entry", async ({ page }) => {
    await page.goto("/#projects?kind=desktop", { waitUntil: "networkidle" });
    await page.goto("/#p-repohealth", { waitUntil: "networkidle" });
    await expect(page.locator("#d-repohealth")).toBeVisible();
    await expect(page.locator('[data-slug="repohealth"] [data-toggle]')).toHaveAttribute("aria-expanded", "true");
    // a hidden entry comes back: the filters are reset
    await page.click('[data-filter="desktop"]');
    await page.evaluate(() => (location.hash = "#p-devkit"));
    await expect(page.locator("#d-devkit")).toBeVisible();
    expect(await page.getAttribute('[data-filter=""]', "aria-pressed")).toBe("true");
    expect(await activeText(page), "the entry takes the focus").toBe("DevKit");
  });

  test("collapsed entries and their links", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const opens = await page.$$eval(".entry .open a", (as) => as.map((a) => [a.getAttribute("href"), (a as HTMLAnchorElement).target]));
    expect(opens, "13 live apps have a one-click Open").toHaveLength(13);
    expect(opens.map(([h]) => h)).toContain("https://repository-health-monitor.vercel.app/");
    expect(opens.every(([, t]) => t === "_blank")).toBe(true);
    const openText = await page.locator('[data-slug="devkit"] .open a').evaluate((a) => (a as HTMLElement).innerText);
    expect(openText).toContain("Open");
    expect(openText).toContain("↗");
    await expect(page.getByRole("link", { name: "Open DevKit", exact: true })).toHaveCount(1);
    await page.click('[data-slug="fitforge"] [data-toggle]');
    await expect(page.getByRole("link", { name: "Source code for FitForge", exact: true })).toHaveCount(1);
    await expect(page.locator('a[href*="repository-health"]').first()).toBeAttached();
    await expect(page.locator('a[href*="github.com/pero-grubac/repo"]'), "RepoHealth: no repo link").toHaveCount(0);
    await expect(page.locator('[data-term="FastAPI"], [data-term="GCP"]')).toHaveCount(0);
    await expect(page.locator(".stack .plain"), "FastAPI and GCP are plain text").toHaveCount(2);
  });

  test("details on demand", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const fitforge = page.locator('[data-slug="fitforge"] [data-toggle]');
    await fitforge.click();
    await expect(page.locator("#d-fitforge")).toBeVisible();
    await expect(fitforge).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#d-fitforge .desc"), "FitForge (repeatsSummary) shows no description").toHaveCount(0);
    const pane = (await page.locator("#d-fitforge .panel-body").boundingBox())!;
    const list = (await page.locator(".index").boundingBox())!;
    expect(pane.x, "the details read in the pane beside the list").toBeGreaterThan(list.x + list.width);
    await expect(page.locator("#d-fitforge .panel-title")).toBeVisible();
    // Tab from the open entry goes into its details
    await fitforge.focus();
    await page.keyboard.press("Tab");
    expect(await activeText(page)).toMatch(/^Read the case study/);
    await page.click('[data-slug="devkit"] [data-toggle]');
    await expect(page.locator("#d-fitforge"), "only one open at a time").toBeHidden();
    await expect(page.locator("#d-devkit")).toBeVisible();
    await expect(page.locator("#d-devkit .desc")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.locator("#d-devkit"), "Esc closes").toBeHidden();
    expect(await activeText(page), "focus returns to the entry").toBe("DevKit");
    await page.click('[data-slug="anova"] .sum');
    await expect(page.locator("#d-anova"), "clicking the row opens the entry").toBeVisible();
    await page.click('[data-slug="anova"] .sum');
    await expect(page.locator("#d-anova"), "clicking the row again closes it").toBeHidden();
    await page.fill("#q", "discord");
    await page.click('[data-slug="git-discord-bot"] [data-toggle]');
    await expect(page.locator("#d-git-discord-bot .cmds li"), "the bot shows its 8 commands instead of a screenshot").toHaveCount(8);
    await page.fill("#q", "zzz");
    await expect(page.locator("#d-git-discord-bot"), "filtering out the open entry closes it").toBeHidden();
    await expect(page.locator('[data-slug="git-discord-bot"] [data-toggle]')).toHaveAttribute("aria-expanded", "false");
    // system entries link to their feature
    await page.fill("#q", "rabbitmq");
    await page.click('.entry-system a[href="#incident-alert"]');
    await expect
      .poll(async () => (await topOf(page, "#incident-alert")) > -10 && (await topOf(page, "#incident-alert")) < 200, { message: "a system entry scrolls to its feature" })
      .toBe(true);
  });

  test("the demo video plays only on demand", async ({ page, videos }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const fig = page.locator("#incident-alert figure");
    await fig.scrollIntoViewIfNeeded();
    await fig.hover();
    await expect(page.locator("#incident-alert video"), "hover loads the video").toHaveCount(1);
    await expect(page.locator("#incident-alert video")).toHaveAttribute("preload", "none");
    await expect.poll(async () => (await videoOf(page, "#incident-alert figure"))?.playing, { message: "playing" }).toBe(true);
    const v = (await videoOf(page, "#incident-alert figure"))!;
    expect(v.sources, "AV1 WebM first, H.264 MP4 second").toEqual([
      { src: "/assets/incident_alert/demo.webm", type: 'video/webm; codecs="av01.0.05M.08"' },
      { src: "/assets/incident_alert/demo.mp4", type: 'video/mp4; codecs="avc1.64001f"' },
    ]);
    expect(v.chosen, "the browser plays the first source it can decode").toBe(v.firstPlayable);
    expect(new Set(videos.map((u) => new URL(u).pathname)), "and fetches only that one").toEqual(new Set([v.chosen]));
    await expect(fig).toHaveAttribute("data-state", "preview");
    await expect(page.locator("#incident-alert [data-play-text]"), "the button still offers Play demo while previewing").toHaveText("Play demo");
    expect(await page.getAttribute("#incident-alert video", "poster"), "the poster is the optimized still").toMatch(/\/_astro\/demo\..+\.(avif|webp)$/);
    await page.mouse.move(5, 5);
    await expect(fig, "leaving stops the hover video").toHaveAttribute("data-state", "idle");

    const chat = page.locator("#chat-room figure");
    await page.click("#chat-room [data-play]");
    await expect(chat, "Play demo plays (after the hover had started a preview)").toHaveAttribute("data-state", "playing");
    await expect.poll(async () => (await videoOf(page, "#chat-room figure"))?.playing, { message: "the video really plays" }).toBe(true);
    await expect(page.locator("#chat-room [data-play-text]")).toHaveText("Pause demo");
    await page.mouse.move(5, 5);
    await expect(chat, "a clicked video keeps playing when the pointer leaves").toHaveAttribute("data-state", "playing");
    await page.click("#chat-room [data-play]");
    await expect(chat, "Pause demo pauses").toHaveAttribute("data-state", "paused");
  });

  test("/ focuses the search, and types while typing", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("/");
    expect(await activeId(page)).toBe("q");
    await page.keyboard.type("/x");
    expect(await page.inputValue("#q")).toBe("/x");
  });

  test("Copy email", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.click("[data-copy]");
    await expect(page.locator("[data-copy-label]")).toHaveText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pero.grubac00@gmail.com");
    await expect(page.locator("#toast")).toHaveText("Email copied");
    await expect(page.locator("[data-copy-label]"), "back to Copy after 2 s").toHaveText("Copy", { timeout: 3000 });
  });

  test("stack terms match the technology exactly", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.click('[data-term="Flutter"]');
    await expect.poll(() => hash(page)).toBe("#projects?tech=Flutter");
    expect(await page.inputValue("#q")).toBe("Flutter");
    expect(await visible(page)).toBe(3);
    await expect(page.locator("[data-status]")).toHaveText("3 projects built with Flutter");
    expect(await activeId(page), "a stack term moves the focus to the search (mouse)").toBe("q");
    await expect.poll(async () => Math.abs((await topOf(page, "#projects")) - SCROLL_PAD) < 4, { message: "and scrolls to the index" }).toBe(true);

    await page.click('[data-term="Java"]');
    await expect.poll(() => visible(page), { message: '"Java" finds the 4 Java projects, not JavaScript' }).toBe(4);
    await page.fill("#q", "java");
    expect(await visible(page), 'typing "java" matches any part of a word').toBe(15);
    expect(await hash(page)).toBe("#projects?q=java");
    await page.goto("about:blank");
    await page.goto("/#projects?tech=Java", { waitUntil: "networkidle" });
    expect(await page.inputValue("#q")).toBe("Java");
    expect(await visible(page), "tech=Java comes back from the hash").toBe(4);
    await page.press("#q", "End");
    await page.keyboard.type("S");
    expect(await page.inputValue("#q")).toBe("JavaS");
    expect(await visible(page), "editing the box turns the technology into a typed query").toBe(11);
    expect(await hash(page)).toBe("#projects?q=JavaS");
  });

  test("links that must stay as they are", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const hrefs = await page.$$eval("a", (as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs).toContain("mailto:pero.grubac00@gmail.com");
    expect(hrefs).toContain("https://github.com/pero-grubac");
    expect(hrefs).toContain("https://www.linkedin.com/in/perogrubac/");
    // the systems, every index entry but RepoHealth, and the palette
    expect(new Set(hrefs.filter((h) => h?.startsWith("/projects/"))).size, "links to all 29 case studies").toBe(29);
  });
});

test.describe("home, keyboard only", () => {
  test.use(desktop);

  test("every Tab stop shows a focus ring on screen", async ({ page }) => {
    test.slow();
    await page.goto("/", { waitUntil: "networkidle" });
    const { stops, bad } = await tabThrough(page, { until: (label) => label.startsWith("linkedin.com") });
    expect(stops[0], "the first stop is the skip link").toBe("Skip to content");
    expect(stops.length, "Tab reaches the end of the page").toBeGreaterThan(60);
    expect(bad).toEqual([]);
  });

  test("open an entry, play a demo, pick a technology", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.focus('[data-slug="countdown"] [data-toggle]');
    await page.keyboard.press("Enter");
    await expect(page.locator("#d-countdown"), "Enter opens an entry").toBeVisible();
    await page.keyboard.press("Escape");
    await page.focus("#e-mobility-hub [data-play]");
    await page.keyboard.press("Enter");
    await expect(page.locator("#e-mobility-hub figure"), "Enter on Play demo plays").toHaveAttribute("data-state", "playing");
    await page.keyboard.press(" ");
    await expect(page.locator("#e-mobility-hub figure"), "Space pauses").toHaveAttribute("data-state", "paused");
    await page.focus('[data-term="Docker"]');
    await page.keyboard.press("Enter");
    await expect.poll(() => activeId(page), { message: "Enter on a stack term moves the focus to the search" }).toBe("q");
    expect(await page.inputValue("#q")).toBe("Docker");
  });
});

test.describe("home, reduced motion", () => {
  test.use({ ...desktop, contextOptions: { reducedMotion: "reduce" } });

  test("no smooth scrolling, no hover video, no fades", async ({ page, videos }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "instant scrolling").toBe("auto");
    const fig = page.locator("#incident-alert figure");
    await fig.scrollIntoViewIfNeeded();
    await fig.hover();
    await page.waitForTimeout(400);
    await expect(page.locator("#incident-alert video"), "hovering doesn't start the video").toHaveCount(0);
    expect(videos).toEqual([]);
    await page.click("#incident-alert [data-play]");
    await expect(fig, "a click still plays").toHaveAttribute("data-state", "playing");
    await expect.poll(async () => (await videoOf(page, "#incident-alert figure"))?.playing, { message: "the video really plays" }).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector("#incident-alert video")!).transitionDuration), "no video fade").toBe("0s");
    await page.mouse.move(5, 5);
    await page.waitForTimeout(200);
    await expect(fig, "leaving doesn't stop a clicked video").toHaveAttribute("data-state", "playing");
    expect(await page.evaluate(() => getComputedStyle(document.getElementById("toast")!).transitionDuration), "no toast transition").toBe("0s");
  });
});

test.describe("home at 360", () => {
  test.use(phone);

  test("layout, inline details, tap to play", async ({ page, videos }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => innerWidth)).toBe(360);
    expect(await overflow(page), "no horizontal scroll").toBeLessThanOrEqual(0);
    expect(await pokingOut(page, 360), "nothing pokes past the right edge").toEqual([]);
    await expect(page.locator(".reader"), "no reader pane").toBeHidden();
    await page.tap('[data-slug="fitforge"] [data-toggle]');
    const panel = (await page.locator("#d-fitforge").boundingBox())!;
    const entry = (await page.locator('[data-slug="fitforge"] .sum').boundingBox())!;
    expect(panel.y, "the details open inline under the entry").toBeGreaterThan(entry.y);
    expect(panel.x).toBeLessThan(40);
    // opening an entry below keeps it in place while the one above closes
    await page.locator('[data-slug="devkit"]').scrollIntoViewIfNeeded();
    const before = (await page.locator('[data-slug="devkit"]').boundingBox())!;
    await page.tap('[data-slug="devkit"] [data-toggle]');
    const after = (await page.locator('[data-slug="devkit"]').boundingBox())!;
    expect(Math.abs(after.y - before.y), "the tapped entry stays put").toBeLessThan(2);
    await expect(page.locator("#d-fitforge"), "the other entry closed").toBeHidden();
    const fig = page.locator("#incident-alert figure");
    await fig.tap({ position: { x: 60, y: 60 } });
    await expect(fig, "a tap plays the video").toHaveAttribute("data-state", "playing");
    await expect.poll(async () => (await videoOf(page, "#incident-alert figure"))?.playing, { message: "the video really plays" }).toBe(true);
    expect(videos.length).toBeGreaterThan(0);
    await fig.tap({ position: { x: 60, y: 60 } });
    await expect(fig, "a tap again pauses").toHaveAttribute("data-state", "paused");
    await page.tap('[data-term="Docker"]');
    await expect.poll(() => page.inputValue("#q")).toBe("Docker");
    expect(await activeId(page), "a tapped stack term searches without opening the keyboard").not.toBe("q");
  });
});
