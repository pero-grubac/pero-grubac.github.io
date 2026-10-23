// Static checks for the portfolio: every local file the page points to
// exists, in-page anchors resolve, and every live app has a thumbnail.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");
const exists = (path) => existsSync(new URL(path.split(/[?#]/)[0], root));

const attrs = (name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]+)"`, "g"))].map((m) => m[1]);
const isLocal = (url) => !/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(url);

test("every local src, href, poster and srcset target exists", () => {
  const urls = [
    ...attrs("src"),
    ...attrs("href"),
    ...attrs("poster"),
    ...attrs("srcset").flatMap((s) => s.split(",").map((part) => part.trim().split(/\s+/)[0])),
  ].filter(isLocal);
  assert.ok(urls.length > 20, "found the page's assets");
  const missing = [...new Set(urls)].filter((u) => !exists(u));
  assert.deepEqual(missing, []);
});

test("every in-page #anchor points to an element id", () => {
  const ids = new Set(attrs("id"));
  const anchors = attrs("href").filter((h) => h.startsWith("#") && h.length > 1);
  const broken = anchors.filter((a) => !ids.has(a.slice(1)));
  assert.deepEqual(broken, []);
});

test("ids are unique", () => {
  const ids = attrs("id");
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dupes, []);
});

test("every live app links to its GitHub Pages site and has a thumbnail", () => {
  const apps = [...new Set([...html.matchAll(/href="https:\/\/pero-grubac\.github\.io\/([a-z0-9-]+)\/"/g)].map((m) => m[1]))];
  assert.ok(apps.length >= 10);
  for (const app of apps) {
    assert.ok(exists(`assets/live/${app}.webp`), `assets/live/${app}.webp is missing`);
  }
});

test("external links that open a new tab are protected", () => {
  const blanks = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
  const unsafe = blanks.filter((tag) => !/rel="[^"]*noopener/.test(tag));
  assert.deepEqual(unsafe, []);
});

test("the page has the essentials for sharing and search", () => {
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="description"\s+content="[^"]+"/);
  assert.match(html, /<meta property="og:image" content="[^"]+"/);
  assert.match(html, /<html lang="[a-z]{2}/);
});
