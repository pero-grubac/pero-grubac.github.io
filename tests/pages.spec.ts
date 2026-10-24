// /apps/, the case studies and the 404 (REDESIGN.md 6.8, 8.1, 8.2, 8.5) in a
// browser at 1440 and 360 px, keyboard only and with reduced motion.
// Ported from the phase 4 check script.
import { test, expect, desktop, phone, overflow, pokingOut, visible, activeId, tabThrough, videoOf } from "./helpers";
import type { Page } from "@playwright/test";

const footer = (page: Page) => page.$eval(".site-footer", (f) => f.textContent!.replace(/\s+/g, " ").trim());
const crumbs = (page: Page) => page.$$eval(".crumbs a", (as) => as.map((a) => a.getAttribute("href")).join(" "));
const pager = (page: Page) =>
  page.$$eval(".pager a", (as) => as.map((a) => `${a.className}:${a.getAttribute("href")}:${a.querySelector(".dir")!.textContent!.trim()}`).join(" | "));

test.describe("/apps/ at 1440", () => {
  test.use(desktop);

  test("the gallery", async ({ page }) => {
    await page.goto("/apps/", { waitUntil: "networkidle" });
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await expect(page.locator("h1")).toHaveText("Browser apps");
    expect(await visible(page)).toBe(13);
    await expect(page.locator('.masthead a[href="/apps/"]'), "the masthead marks Apps as the current page").toHaveAttribute("aria-current", "page");
    expect(await footer(page)).toContain("/ to find an app");
    await expect(page.getByRole("link", { name: "Open DevKit", exact: true })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Source code for DevKit", exact: true })).toHaveCount(1);
    const repo = page.locator('[data-item]:has(h2:text-is("RepoHealth"))');
    await expect(repo.locator(".private")).toHaveText("Private repo");
    await expect(repo.locator('a[href*="github.com"]'), "RepoHealth has no repo link").toHaveCount(0);
    const alts = await page.$$eval(".gallery img", (imgs) => imgs.map((i) => (i as HTMLImageElement).alt));
    expect(alts).toHaveLength(13);
    expect(alts.filter((a) => a.length <= 20), "every screenshot has its real alt").toEqual([]);
    await expect(page.locator(".gallery img").first(), "the first screenshot loads first").toHaveAttribute("fetchpriority", "high");
    await expect(page.locator(".gallery img").nth(1), "the rest lazily").toHaveAttribute("loading", "lazy");
    await expect(page.locator(".shot").first(), "screenshot links stay out of the tab order").toHaveAttribute("tabindex", "-1");
  });

  test("find an app", async ({ page }) => {
    await page.goto("/apps/", { waitUntil: "networkidle" });
    await page.keyboard.press("/");
    expect(await activeId(page), "/ focuses the find field").toBe("find-app");
    await page.keyboard.type("react");
    expect(await visible(page)).toBe(5);
    await expect(page.locator("[data-status]")).toHaveText("5 apps match “react”");
    await page.fill("[data-find]", "zzzz");
    await expect(page.locator("[data-empty]")).toBeVisible();
    await expect(page.locator("[data-empty] p")).toHaveText("No app matches “zzzz”.");
    await page.click("[data-clear]");
    expect(await visible(page)).toBe(13);
    expect(await activeId(page), "Clear search focuses the field").toBe("find-app");
  });

  test("keyboard only", async ({ page }) => {
    test.slow();
    await page.goto("/apps/", { waitUntil: "networkidle" });
    const { stops, bad } = await tabThrough(page);
    expect(stops.length, "Tab reaches the whole page").toBeGreaterThan(30);
    expect(bad).toEqual([]);
  });
});

test.describe("case studies at 1440", () => {
  test.use(desktop);

  test("a system: Incident Alert", async ({ page, videos }) => {
    await page.goto("/projects/incident-alert/", { waitUntil: "networkidle" });
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(videos, "no video requested on load").toEqual([]);
    await expect(page.locator("h1")).toHaveText("Incident Alert");
    expect(await page.$$eval(".crumbs li", (lis) => lis.map((l) => l.textContent!.trim()).join(" / "))).toBe("Home / Systems / Incident Alert");
    await expect(page.locator('.crumbs a:text-is("Systems")'), "the breadcrumb leads back to the systems").toHaveAttribute("href", "/#systems");
    await expect(page.locator(".dek")).toHaveText("Citizens report incidents on a map; moderators approve them first.");
    await expect(page.locator(".flow")).toContainText("React apps → ASP.NET services ⇄ RabbitMQ + PostgreSQL");
    await expect(page.getByRole("link", { name: "Source code for Incident Alert : Backend" })).toHaveCount(1);
    const h2s = await page.$$eval(".body h2", (hs) => hs.map((h) => h.textContent).join(" | "));
    expect(h2s).toBe("What it does | Architecture | Decisions and why | Security | Testing and deployment");
    await expect(page.locator("text=Case study in progress.")).toHaveCount(0);
    expect(await page.content(), "no TODO on the page").not.toContain("TODO(owner)");
    const column = await page.evaluate(() => {
      const body = document.querySelector(".body")!;
      const cs = getComputedStyle(body.querySelector("p")!);
      return { left: body.getBoundingClientRect().left, h1: document.querySelector("h1")!.getBoundingClientRect().left, max: parseFloat(getComputedStyle(body).maxWidth), size: cs.fontSize, color: cs.color };
    });
    expect(Math.abs(column.left - column.h1), "the body lines up with the title").toBeLessThan(2);
    expect(Math.abs(column.max - 68 * 9.9), "68ch").toBeLessThan(15);
    expect(column.size).toBe("18px");
    expect(column.color, "ink").toBe("rgb(28, 26, 22)");
    await expect(page.locator(".architecture svg")).toHaveAttribute("aria-label", "Architecture of Incident Alert");
    await expect(page.locator(".architecture figcaption")).toHaveCount(1);
    expect(await page.getAttribute(".architecture [data-diagram-frame]", "tabindex"), "the diagram fits, so its frame is no Tab stop").toBeNull();
    expect(await page.getAttribute(".media img", "fetchpriority"), "below the diagram, the still isn't the priority").toBeNull();
    await expect(page.locator(".media img")).toHaveAttribute("loading", "lazy");
    await expect(page.locator(".pager .prev"), "the first system has no Previous").toHaveCount(0);
    await expect(page.locator(".pager .next")).toHaveAttribute("href", "/projects/e-mobility-hub/");
    await expect(page.getByRole("link", { name: "Next system eMobilityHub" })).toHaveCount(1);
    expect(await footer(page), "no / hint without a find field").not.toContain("/ to");
    await page.click("[data-play]");
    await expect(page.locator(".media"), "Play demo plays").toHaveAttribute("data-state", "playing");
    // the request goes out after the state changes: wait for the video to really play
    await expect.poll(async () => (await videoOf(page, ".media"))?.playing, { message: "the video really plays" }).toBe(true);
    const v = (await videoOf(page, ".media"))!;
    expect(v.chosen, "the first source the browser can decode").toBe(v.firstPlayable);
    expect(videos.map((u) => new URL(u).pathname), "one request, for that file").toEqual([v.chosen]);
  });

  test("the pager of the systems, and the keyboard", async ({ page }) => {
    test.slow();
    await page.goto("/projects/online-library-system/", { waitUntil: "networkidle" });
    await expect(page.locator(".pager .next"), "the last system has no Next").toHaveCount(0);
    await expect(page.locator(".pager .prev")).toHaveAttribute("href", "/projects/chat-room/");
    await page.goto("/projects/chat-room/", { waitUntil: "networkidle" });
    await expect(page.locator(".pager .prev")).toHaveAttribute("href", "/projects/e-mobility-hub/");
    await expect(page.locator(".pager .next")).toHaveAttribute("href", "/projects/online-library-system/");
    // keep the pointer off the figure, or hovering it starts a preview
    await page.mouse.move(0, 0);
    const { stops, bad } = await tabThrough(page);
    expect(stops.some((s) => s.includes("Play demo: Chat Room")), "the keyboard reaches Play demo").toBe(true);
    expect(bad).toEqual([]);
  });

  test("the other kinds", async ({ page }) => {
    await page.goto("/projects/devkit/", { waitUntil: "networkidle" });
    const open = page.locator(".primary a");
    await expect(open, "a live app: Open app at the top").toHaveCount(1);
    await expect(open, "at its absolute URL, so it works in dev too").toHaveAttribute("href", "https://pero-grubac.github.io/devkit/");
    expect(await open.evaluate((a) => getComputedStyle(a).color), "in accent").toBe("rgb(164, 50, 31)");
    expect(await crumbs(page), "back to Browser apps").toBe("/ /apps/");
    expect(await pager(page)).toBe("next:/projects/catan-map-generator/:Next live app →");
    await expect(page.locator(".flowline, .architecture, .media"), "a screenshot, no flow line, diagram or video").toHaveCount(0);
    await expect(page.locator(".shot img")).toHaveCount(1);
    const margin = await page.evaluate(() => {
      const m = document.querySelector(".margin")!;
      const body = document.querySelector(".body")!;
      return {
        sticky: getComputedStyle(m).position,
        right: m.getBoundingClientRect().left > body.getBoundingClientRect().right,
        labels: [...m.querySelectorAll(".label")].map((l) => l.textContent!.trim()).join(", "),
      };
    });
    expect(margin).toEqual({ sticky: "sticky", right: true, labels: "On this page, Built with, Code" });
    const toc = (await page.getAttribute(".toc a", "href"))!;
    await expect(page.locator(toc), '"On this page" links resolve').toHaveCount(1);

    await page.goto("/projects/fitforge/", { waitUntil: "networkidle" });
    await expect(page.locator(".primary a")).toContainText("Download APK");
    expect(await crumbs(page)).toBe("/ /#projects?kind=mobile");
    expect(await pager(page)).toBe("next:/projects/etf-oglasi/:Next mobile app →");
    await page.goto("/projects/git-discord-bot/", { waitUntil: "networkidle" });
    await expect(page.locator(".shot .cmds li"), "the bot's commands instead of a screenshot").toHaveCount(8);
    await expect(page.locator(".primary")).toHaveCount(0);
    expect(await pager(page)).toBe("prev:/projects/secure-repository/:← Previous tool");
    await page.goto("/projects/minimal-blog/", { waitUntil: "networkidle" });
    await expect(page.locator(".pager"), "the only web project has no prev/next").toHaveCount(0);
    await expect(page.locator(".margin a[href*='github.com']")).toHaveCount(1);
  });

  test("every case study is linked from home and /apps/", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.$$eval(".panel a[href^='/projects/']", (as) => as.length), "every index entry with a case study (all but RepoHealth)").toBe(25);
    await page.goto("/apps/", { waitUntil: "networkidle" });
    expect(await page.$$eval(".gallery a[href^='/projects/']", (as) => as.length), "every /apps/ card with a case study").toBe(12);
  });
});

test.describe("404", () => {
  test.use(desktop);

  test("served for a missing path", async ({ page }) => {
    const res = await page.goto("/no-such-page/", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("This page doesn't exist.");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    expect(await page.$$eval("main a", (as) => as.map((a) => a.getAttribute("href")).join(" ")), "links to Home and Browser apps").toBe("/ /apps/");
    expect(await overflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe("case study, reduced motion", () => {
  test.use({ ...desktop, contextOptions: { reducedMotion: "reduce" } });

  test("hover doesn't start the video, the button does", async ({ page, videos }) => {
    await page.goto("/projects/chat-room/", { waitUntil: "networkidle" });
    await page.hover(".media");
    await page.waitForTimeout(400);
    expect(videos).toEqual([]);
    await expect(page.locator(".media")).toHaveAttribute("data-state", "idle");
    await page.click("[data-play]");
    await expect(page.locator(".media")).toHaveAttribute("data-state", "playing");
    await expect.poll(async () => (await videoOf(page, ".media"))?.playing, { message: "the video really plays" }).toBe(true);
  });
});

test.describe("other pages at 360", () => {
  test.use(phone);

  for (const path of ["/apps/", "/projects/incident-alert/", "/projects/online-library-system/", "/projects/devkit/", "/projects/git-discord-bot/", "/projects/fitforge/", "/no-such-page/"]) {
    test(`${path}: no horizontal scroll`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      // a diagram may reach past the edge: it scrolls inside its own frame
      expect(await pokingOut(page, 360, "[data-diagram-frame]")).toEqual([]);
    });
  }

  test("one column, the margin above the body", async ({ page }) => {
    await page.goto("/projects/devkit/", { waitUntil: "networkidle" });
    const order = await page.evaluate(() => {
      const m = document.querySelector(".margin")!;
      return m.getBoundingClientRect().bottom <= document.querySelector(".body")!.getBoundingClientRect().top && getComputedStyle(m).position !== "sticky";
    });
    expect(order).toBe(true);
  });

  test("apps in one column", async ({ page }) => {
    await page.goto("/apps/", { waitUntil: "networkidle" });
    const columns = await page.$$eval(".gallery li", (lis) => new Set(lis.map((l) => Math.round(l.getBoundingClientRect().left))).size);
    expect(columns).toBe(1);
  });

  test("the diagram scrolls sideways in its frame", async ({ page }) => {
    await page.goto("/projects/incident-alert/", { waitUntil: "networkidle" });
    await expect(page.locator("[data-diagram-frame]"), "and the frame is a Tab stop").toHaveAttribute("tabindex", "0");
    expect(await page.$eval("[data-diagram-frame] svg", (svg) => svg.getBoundingClientRect().width), "at a readable size").toBeGreaterThanOrEqual(859);
    const frame = await page.$eval("[data-diagram-frame]", (f) => ({ scrolls: f.scrollWidth > f.clientWidth, thin: f.classList.contains("thin-scroll") }));
    expect(frame, "it scrolls, with the Journal scrollbar (6.4)").toEqual({ scrolls: true, thin: true });
  });
});
