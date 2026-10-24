// axe (WCAG 2.1 A and AA) on every kind of page and in the states Lighthouse
// never sees: an open index entry, a search with no match, the palette.
import AxeBuilder from "@axe-core/playwright";
import { test, expect, desktop, phone } from "./helpers";
import type { Page } from "@playwright/test";

const axe = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
};

for (const [name, viewport] of [
  ["1440", desktop],
  ["360", phone],
] as const) {
  test.describe(`axe at ${name}`, () => {
    test.use(viewport);

    for (const path of ["/", "/apps/", "/projects/incident-alert/", "/projects/devkit/", "/projects/git-discord-bot/", "/no-such-page/"]) {
      test(path, async ({ page }) => {
        await page.goto(path, { waitUntil: "networkidle" });
        expect(await axe(page)).toEqual([]);
      });
    }

    test("home, with an entry open and a search with no match", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.click('[data-slug="fitforge"] [data-toggle]');
      expect(await axe(page)).toEqual([]);
      await page.fill("#q", "zzzz");
      expect(await axe(page)).toEqual([]);
    });

    test("the palette, open", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.click(".masthead [data-palette]");
      await page.keyboard.type("dev");
      expect(await axe(page)).toEqual([]);
      await page.keyboard.type("zzzz");
      expect(await axe(page)).toEqual([]);
    });
  });
}
