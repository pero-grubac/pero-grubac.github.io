// Tests of the built site (dist/), served by `astro preview`: the pages in
// a real browser at 360 and 1440 px, keyboard only and with reduced
// motion, the command palette, axe, and the SEO output of the build.
// usage: npm run build && npm test
//   PW_CHANNEL=msedge|chrome|bundled  browser (default: msedge on Windows,
//                             Playwright's own Chromium elsewhere, as in CI;
//                             "bundled" picks that one on Windows too. It
//                             has no H.264, so it plays the demos' AV1 WebM)
import { defineConfig } from "@playwright/test";

const PORT = 4399;
const channel = process.env.PW_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined);

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    channel: channel === "bundled" ? undefined : channel,
  },
  webServer: {
    // --ignore-lock: runs beside a preview server that may already be open
    command: `node node_modules/astro/bin/astro.mjs preview --port ${PORT} --host 127.0.0.1 --ignore-lock`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
  },
});
