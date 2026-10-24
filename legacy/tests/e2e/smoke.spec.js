import { test, expect } from "@playwright/test";

// External resources (fonts, icons, videos from other hosts) are not part of
// what these tests check, so they are answered empty instead of fetched.
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.fulfill({ status: 204, body: "" }));
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
});

test.afterEach(async ({ page }) => {
  expect(page.errors, "no JavaScript errors").toEqual([]);
});

const visibleRows = (page) => page.locator("#indexList .index-row:visible");

test("loads with all sections", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle(/Pero Grubač/);
  for (const id of ["about", "stack", "projects", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  expect(await visibleRows(page).count()).toBeGreaterThan(10);
});

test("search narrows the projects and is kept in the URL", async ({ page }) => {
  await page.goto("./");
  const all = await visibleRows(page).count();
  await page.locator("#q").fill("pwa");
  await expect.poll(() => visibleRows(page).count()).toBeLessThan(all);
  await expect(page).toHaveURL(/[?&]q=pwa/);

  await page.goto("./?q=pwa");
  await expect(page.locator("#q")).toHaveValue("pwa");
});

test("kind filter shows only live apps", async ({ page }) => {
  await page.goto("./");
  await page.locator('.kind[data-kind="live"]').click();
  await expect(page.locator('.kind[data-kind="live"]')).toHaveAttribute("aria-pressed", "true");
  const kinds = await visibleRows(page).evaluateAll((rows) => rows.map((r) => r.dataset.kind));
  expect(kinds.length).toBeGreaterThan(0);
  expect(new Set(kinds)).toEqual(new Set(["live"]));
});

test("command menu opens with Ctrl+K and closes with Escape", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut");
  await page.goto("./");
  await page.keyboard.press("Control+k");
  await expect(page.locator("#palette")).toBeVisible();
  await page.keyboard.type("countdown");
  await page.keyboard.press("Escape");
  await expect(page.locator("#palette")).toBeHidden();
});

test("theme toggle switches and is remembered", async ({ page }) => {
  await page.goto("./");
  const before = await page.evaluate(() => document.documentElement.dataset.theme || "");
  await page.locator("#themeToggle").click();
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(after).not.toBe(before);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(after);
});

test("a deep link opens that project's row", async ({ page }) => {
  await page.goto("./#countdown");
  await expect(page.locator("details#countdown")).toHaveAttribute("open", "", { timeout: 10_000 });
});

test("nothing is wider than the screen", async ({ page }) => {
  await page.goto("./");
  const { scroll, width } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: window.innerWidth,
  }));
  expect(scroll).toBeLessThanOrEqual(width);
  await expect(page.locator("#themeToggle")).toBeInViewport();
});
