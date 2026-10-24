// Shared pieces of the browser tests: a `test` that fails on any console,
// page or network error, and small readers of the page's state.
import { test as base, expect, type Page } from "@playwright/test";

export { expect };

export const test = base.extend<{ errors: string[]; mp4: string[] }>({
  // Every test fails on a console error, an uncaught exception or a failed
  // request. Videos are exempt from "failed": pausing one aborts its request.
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(`console: ${m.text()}`));
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("requestfailed", (r) => !r.url().endsWith(".mp4") && errors.push(`failed: ${r.url()}`));
      page.on("response", (r) => r.status() >= 400 && !r.url().endsWith("/no-such-page/") && errors.push(`${r.status()} ${r.url()}`));
      await use(errors);
      expect(errors, "no console, page or network errors").toEqual([]);
    },
    { auto: true },
  ],
  // The demo videos the page has asked for
  mp4: async ({ page }, use) => {
    const mp4: string[] = [];
    page.on("request", (r) => r.url().endsWith(".mp4") && mp4.push(r.url()));
    await use(mp4);
  },
});

export const desktop = { viewport: { width: 1440, height: 900 } };
export const phone = { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };

/** How far the page is wider than the window (0 or less: no horizontal scroll) */
export const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** Elements that reach past the right edge of a `width` px window, except fixed ones and those inside `except` */
export const pokingOut = (page: Page, width: number, except = "") =>
  page.$$eval(
    "body *",
    (els, [w, ex]) =>
      els
        .filter((e) => e.getBoundingClientRect().right > (w as number) + 0.5 && getComputedStyle(e).position !== "fixed" && !(ex && e.closest(ex as string)))
        .map((e) => (typeof e.className === "string" && e.className) || e.tagName)
        .slice(0, 5),
    [width, except]
  );

/** Number of index or gallery entries on screen */
export const visible = (page: Page) => page.$$eval("[data-item]", (els) => els.filter((e) => e.getClientRects().length > 0).length);

/** The kinds of the index entries on screen, in order */
export const visibleKinds = (page: Page) =>
  page.$$eval("[data-item]", (els) => els.filter((e) => e.getClientRects().length > 0).map((e) => (e as HTMLElement).dataset.kind));

export const hash = (page: Page) => page.evaluate(() => location.hash);

export const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id);

export const activeText = (page: Page) => page.evaluate(() => document.activeElement?.textContent?.trim());

/** The top of an element relative to the window */
export const topOf = (page: Page, selector: string) => page.$eval(selector, (el) => el.getBoundingClientRect().top);

/** The masthead is sticky: in-page links scroll their target to just below it (scroll-padding-top) */
export const SCROLL_PAD = 84;

/**
 * Tabs through the whole page. Returns the label of each stop and the stops
 * without a visible focus ring: a 2px outline on the element, or on the
 * row or field that shows the focus for it (`ring` maps a stop to that).
 */
export async function tabThrough(page: Page, { max = 220, until }: { max?: number; until?: (label: string) => boolean } = {}) {
  const stops: string[] = [];
  const bad: string[] = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const ring = el.matches("[data-toggle]") ? el.closest(".entry")! : el.matches("[data-find]") ? el.closest(".find-in")! : el;
      const cs = getComputedStyle(ring);
      const r = el.getBoundingClientRect();
      const masthead = document.querySelector(".masthead")!.getBoundingClientRect();
      return {
        label: (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40),
        outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
        onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0,
        underMasthead: r.top < masthead.bottom && r.bottom > 0 && !el.closest(".masthead"),
      };
    });
    if (!info) break;
    if (stops.length && info.label === stops[0]) break; // wrapped around
    if (!info.onScreen || info.underMasthead) {
      // focus scrolling is smooth; let it finish before judging
      await page.waitForTimeout(1200);
      Object.assign(
        info,
        await page.evaluate(() => {
          const r = document.activeElement!.getBoundingClientRect();
          const masthead = document.querySelector(".masthead")!.getBoundingClientRect();
          return { onScreen: r.bottom > 0 && r.top < innerHeight, underMasthead: r.top < masthead.bottom && r.bottom > 0 && !document.activeElement!.closest(".masthead") };
        })
      );
    }
    stops.push(info.label);
    if (!info.outline || !info.onScreen || (info.underMasthead && info.label !== "Skip to content"))
      bad.push(`${info.label} (outline ${info.outline}, onScreen ${info.onScreen}, underMasthead ${info.underMasthead})`);
    if (until?.(info.label)) break;
  }
  return { stops, bad };
}
