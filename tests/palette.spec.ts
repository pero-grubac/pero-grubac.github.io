// The command palette (REDESIGN.md 8.3): ⌘K / Ctrl K and the Search pill,
// Esc, the backdrop, ↑ ↓ and Enter, fuzzy matching on title and stack,
// and what each kind of row does.
import { test, expect, desktop, phone, hash, topOf, SCROLL_PAD } from "./helpers";
import type { Page } from "@playwright/test";

const palette = (page: Page) => page.locator("#palette");
const input = (page: Page) => page.locator("[data-pal-q]");
/** The labels of the rows on screen, in order */
const rows = (page: Page) => page.$$eval("#pal-list [data-row]:not([hidden]) .label", (ls) => ls.map((l) => l.textContent));
const selected = (page: Page) => page.$eval('#pal-list [aria-selected="true"] .label', (l) => l.textContent).catch(() => null);

async function openWithKeys(page: Page) {
  await page.keyboard.press("Control+k");
  await expect(palette(page)).toHaveAttribute("open", "");
}

test.describe("palette at 1440", () => {
  test.use(desktop);

  test("Ctrl K opens and closes it, and the browser's shortcut never fires", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const prevented = page.evaluate(
      () => new Promise<boolean>((resolve) => document.addEventListener("keydown", (e) => e.key === "k" && setTimeout(() => resolve(e.defaultPrevented)), { once: true }))
    );
    await openWithKeys(page);
    expect(await prevented, "the shortcut calls preventDefault()").toBe(true);
    await expect(input(page), "the field has the focus").toBeFocused();
    await expect(page.locator("#palette .bar kbd")).toHaveText("esc");
    await page.keyboard.press("Control+k");
    await expect(palette(page)).not.toHaveAttribute("open", "");
    // also while typing in a field
    await page.focus("#q");
    await openWithKeys(page);
    await page.keyboard.press("Escape");
    await expect(palette(page), "Esc closes it").not.toHaveAttribute("open", "");
    await expect(page.locator("#q"), "the focus goes back where it was").toBeFocused();
  });

  test("the Search pill opens it; the backdrop closes it", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.click(".masthead [data-palette]");
    await expect(palette(page)).toHaveAttribute("open", "");
    await page.mouse.click(10, 880);
    await expect(palette(page)).not.toHaveAttribute("open", "");
    await expect(page.locator(".masthead [data-palette]")).toBeFocused();
  });

  test("it lists the sections, the pages, every project and Copy email", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    const labels = await rows(page);
    expect(labels.slice(0, 6)).toEqual(["Home", "About", "Systems", "Index of projects", "Browser apps", "Contact"]);
    expect(labels.at(-1)).toBe("Copy email");
    // 30 projects, and "Open …" for the 13 live apps; one theme, so no theme toggle
    expect(labels.length).toBe(6 + 30 + 13 + 1);
    expect(labels.filter((l) => l?.startsWith("Open "))).toHaveLength(13);
    expect(labels.join(" ")).not.toMatch(/theme/i);
    // every case study is in it (10.4)
    const studies = await page.$$eval('#pal-list a[href^="/projects/"]', (as) => as.length);
    expect(studies).toBe(29);
    // RepoHealth's repo is private: its row shows its details in the index, its app opens
    await expect(page.locator('#pal-list a:has(.label:text-is("RepoHealth"))')).toHaveAttribute("href", "/#p-repohealth");
    await expect(page.locator('#pal-list a:has(.label:text-is("Open RepoHealth"))')).toHaveAttribute("href", "https://repository-health-monitor.vercel.app/");
    await expect(page.locator('#pal-list a[href*="github.com"]')).toHaveCount(0);
  });

  test("↑ ↓ move, the list follows the field, fuzzy on title and stack", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    expect(await selected(page)).toBe("Home");
    await page.keyboard.press("ArrowDown");
    expect(await selected(page)).toBe("About");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    expect(await selected(page), "↑ from the first row wraps to the last").toBe("Copy email");
    await expect(input(page)).toHaveAttribute("aria-activedescendant", /^pal-\d+$/);

    await input(page).fill("devkit");
    expect((await rows(page)).slice(0, 2), "the title first, then its app").toEqual(["DevKit", "Open DevKit"]);
    expect(await selected(page)).toBe("DevKit");
    await expect(page.locator("[data-pal-status]")).toHaveText(/^\d+ results?$/);
    await input(page).fill("flutter");
    expect(await rows(page), "a technology finds the projects built with it").toEqual(expect.arrayContaining(["FitForge", "ETF Oglasi", "AssetManager"]));
    await input(page).fill("onlib");
    expect((await rows(page))[0], "letters in order match too").toBe("Online Library System");
    await input(page).fill("pi");
    expect(await rows(page), "π can be typed as pi").toEqual(expect.arrayContaining(["Monte Carlo π", "Monte Carlo π · Python"]));
    await input(page).fill("zzzzq");
    await expect(page.locator("[data-pal-none]")).toBeVisible();
    await expect(page.locator("[data-pal-none]")).toHaveText("Nothing matches “zzzzq”.");
    await expect(page.locator("[data-pal-status]")).toHaveText("No results");
  });

  test("Enter on a case study opens it", async ({ page }) => {
    await page.goto("/apps/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    await input(page).fill("chat room");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/projects/chat-room/");
    await expect(page.locator("h1")).toHaveText("Chat Room");
    await expect(palette(page)).not.toHaveAttribute("open", "");
  });

  test("a section of this page: it scrolls there, and Tab goes on from there", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    await input(page).fill("systems");
    expect(await selected(page)).toBe("Systems");
    await page.keyboard.press("Enter");
    await expect(palette(page)).not.toHaveAttribute("open", "");
    await expect.poll(async () => Math.abs((await topOf(page, "#systems")) - SCROLL_PAD) < 4, { message: "scrolled to Systems" }).toBe(true);
    expect(await hash(page)).toBe("#systems");
    await page.keyboard.press("Tab");
    const inSection = await page.evaluate(() => Boolean(document.activeElement?.closest("#systems")));
    expect(inSection, "the next Tab stop is in the section").toBe(true);
  });

  test("a project without a case study opens its entry in the index", async ({ page }) => {
    await page.goto("/projects/devkit/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    await input(page).fill("repohealth");
    expect(await selected(page)).toBe("RepoHealth");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/#p-repohealth");
    await expect(page.locator("#d-repohealth")).toBeVisible();
  });

  test("Open … opens the app in a new tab", async ({ page, context }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    await input(page).fill("open devkit");
    expect(await selected(page)).toBe("Open DevKit");
    const [tab] = await Promise.all([context.waitForEvent("page"), page.keyboard.press("Enter")]);
    // the app itself is another repo's; here the preview server answers 404
    await tab.waitForURL("**/devkit/");
    await tab.close();
    await expect(palette(page)).not.toHaveAttribute("open", "");
  });

  test("Copy email, from a page without the contact block", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/projects/anova/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    await input(page).fill("copy");
    await page.keyboard.press("Enter");
    await expect(page.locator("#toast")).toHaveText("Email copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pero.grubac00@gmail.com");
  });

  test("a click runs a row; hovering selects it", async ({ page }) => {
    await page.goto("/projects/anova/", { waitUntil: "networkidle" });
    await openWithKeys(page);
    await input(page).fill("echo");
    const row = page.locator('#pal-list a:has(.label:text-is("Echo Player"))');
    await row.hover();
    expect(await selected(page)).toBe("Echo Player");
    await expect(input(page), "pointing doesn't take the focus from the field").toBeFocused();
    await row.click();
    await page.waitForURL("**/projects/echo-player/");
  });

  test("it is on every page, and / does nothing while it's open", async ({ page }) => {
    for (const path of ["/", "/apps/", "/projects/fitforge/", "/no-such-page/"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await openWithKeys(page);
      await page.keyboard.press("/");
      expect(await input(page).inputValue(), `${path}: / types into the palette`).toBe("/");
      await page.keyboard.press("Escape");
    }
  });
});

test.describe("palette at 360", () => {
  test.use(phone);

  test("the pill opens it; it fits the screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.tap(".masthead [data-palette]");
    await expect(palette(page)).toHaveAttribute("open", "");
    const box = (await palette(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    await page.locator('#pal-list a:has(.label:text-is("Browser apps"))').tap();
    await page.waitForURL("**/apps/");
    await expect(page.locator("h1")).toHaveText("Browser apps");
    await expect(palette(page)).not.toHaveAttribute("open", "");
  });
});
