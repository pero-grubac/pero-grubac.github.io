// The projects index on the home page (REDESIGN.md 7.4): search, kind
// filters with live counts, the state mirrored in the URL hash
// (#projects?kind=live&q=react), and one entry open at a time; #p-<slug>
// opens that entry.
// A typed query matches any part of a title, summary or technology; a
// technology picked in About (#projects?tech=Java) matches the stack exactly.
// The markup is in components/home/ProjectIndex.astro.

const section = document.getElementById("projects")!;
const root = section.querySelector<HTMLElement>("[data-index]")!;
const input = root.querySelector<HTMLInputElement>("[data-find]")!;
const items = [...root.querySelectorAll<HTMLElement>("[data-item]")];
const filters = [...root.querySelectorAll<HTMLButtonElement>("[data-filter]")];
const empty = root.querySelector<HTMLElement>("[data-empty]")!;
const status = root.querySelector<HTMLElement>("[data-status]")!;

const state = { kind: "", q: "", tech: "" };
let open: HTMLElement | null = null;

/* ---------- details on demand ---------- */

function partsOf(item: HTMLElement) {
  const button = item.querySelector<HTMLButtonElement>("[data-toggle]")!;
  const panel = document.getElementById(button.getAttribute("aria-controls")!)!;
  return { button, panel };
}

/** Opens `item` (or closes the open entry when null), keeping the entry
    the visitor acted on where it was on screen when a panel above it closes. */
function setOpen(item: HTMLElement | null) {
  const anchor = item ?? open;
  if (item === open || !anchor) return;
  const before = anchor.getBoundingClientRect().top;
  if (open) {
    const { button, panel } = partsOf(open);
    button.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    delete open.dataset.open;
  }
  open = item;
  if (item) {
    const { button, panel } = partsOf(item);
    button.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    item.dataset.open = "";
  }
  const shift = anchor.getBoundingClientRect().top - before;
  if (shift) window.scrollBy({ top: shift, behavior: "instant" });
}

const toggle = (item: HTMLElement) => setOpen(open === item ? null : item);

for (const item of items) {
  if (item.dataset.kind === "system") continue;
  partsOf(item).button.addEventListener("click", () => toggle(item));
  // The whole row opens the entry, except its links and its details
  item.addEventListener("click", (e) => {
    const target = e.target as Element;
    if (target.closest("a, button, .panel") || getSelection()?.type === "Range") return;
    toggle(item);
  });
}

/* ---------- search and filters ---------- */

function apply(announce = false) {
  const needle = state.q.trim().toLowerCase();
  const tech = state.tech.toLowerCase();
  const counts = new Map<string, number>();
  let total = 0;
  let shown = 0;
  for (const item of items) {
    const kind = item.dataset.kind!;
    const matched = tech ? item.dataset.stack!.split("\n").includes(tech) : item.dataset.hay!.includes(needle);
    // Systems join the list only while searching, and only under "All"
    const hit = (kind !== "system" || needle !== "" || tech !== "") && matched;
    if (hit) {
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
      total++;
    }
    const visible = hit && (!state.kind || kind === state.kind);
    item.hidden = !visible;
    if (visible) shown++;
  }

  let active = filters[0]!;
  for (const button of filters) {
    const kind = button.dataset.filter!;
    button.querySelector("[data-count]")!.textContent = String(kind ? (counts.get(kind) ?? 0) : total);
    button.setAttribute("aria-pressed", String(kind === state.kind));
    if (kind === state.kind) active = button;
  }
  if (open?.hidden) setOpen(null);

  const query = state.tech || state.q.trim();
  empty.hidden = shown > 0;
  empty.querySelector("[data-empty-noun]")!.textContent = active.dataset.one!;
  empty.querySelector("[data-empty-q]")!.textContent = query;

  if (announce) {
    const noun = shown === 1 ? active.dataset.one : active.dataset.many;
    const match = state.tech
      ? ` built with ${state.tech}`
      : query
        ? ` ${shown === 1 ? "matches" : "match"} “${query}”`
        : "";
    status.textContent = `${shown} ${noun}${match}`;
  }
}

function writeHash() {
  const params = new URLSearchParams();
  if (state.kind) params.set("kind", state.kind);
  if (state.tech) params.set("tech", state.tech);
  else if (state.q.trim()) params.set("q", state.q.trim());
  const query = params.toString();
  history.replaceState(history.state, "", "#projects" + (query ? "?" + query : ""));
}

/** Restores the state from a #projects?… hash; false for any other hash. */
function readHash(): boolean {
  const hash = location.hash.slice(1);
  const at = hash.indexOf("?");
  if ((at < 0 ? hash : hash.slice(0, at)) !== "projects") return false;
  const params = new URLSearchParams(at < 0 ? "" : hash.slice(at + 1));
  const kind = params.get("kind") ?? "";
  state.kind = filters.some((b) => b.dataset.filter === kind) ? kind : "";
  state.tech = params.get("tech") ?? "";
  state.q = state.tech ? "" : (params.get("q") ?? "");
  input.value = state.tech || state.q;
  apply();
  return true;
}

/** Opens the entry a #p-<slug> hash names (the palette's link to a project's details); null for any other hash. */
function readEntryHash(): HTMLElement | null {
  const item = location.hash.startsWith("#p-") ? items.find((i) => `#p-${i.dataset.slug}` === location.hash) : undefined;
  if (!item) return null;
  if (item.hidden) {
    state.kind = state.q = state.tech = input.value = "";
    apply();
  }
  setOpen(item);
  item.scrollIntoView({ behavior: "instant" });
  return item;
}

/** Shows the projects built with `tech` (and resets the kind filter), as the stack terms in About do. */
export function findTech(tech: string, { scroll = false, focus = false } = {}) {
  state.tech = input.value = tech;
  state.q = state.kind = "";
  apply(true);
  writeHash();
  if (scroll) section.scrollIntoView();
  if (focus) input.focus({ preventScroll: true });
}

// Editing the box turns a picked technology back into a typed query
input.addEventListener("input", () => {
  state.q = input.value;
  state.tech = "";
  apply(true);
  writeHash();
});

for (const button of filters) {
  button.addEventListener("click", () => {
    state.kind = button.dataset.filter!;
    apply(true);
    writeHash();
  });
}

empty.querySelector("[data-clear]")!.addEventListener("click", () => {
  state.q = state.tech = input.value = "";
  apply(true);
  writeHash();
  input.focus();
});

window.addEventListener("hashchange", () => {
  if (readHash()) section.scrollIntoView();
  else readEntryHash()?.querySelector<HTMLElement>("[data-toggle]")?.focus({ preventScroll: true });
});

/* ---------- Esc closes the open entry (`/` is FindField's) ---------- */

document.addEventListener("keydown", (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]")) return;
  if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
  if (e.key === "Escape" && open) {
    const { button } = partsOf(open);
    setOpen(null);
    button.focus();
  }
});

/* ---------- a #projects?… or #p-<slug> link opened from elsewhere ---------- */

/**
 * Scrolls to what the hash names, and again once the fonts are in: a font
 * that arrives after the first scroll reflows the text above, and scroll
 * anchoring then leaves the section's top under the masthead. Not again if
 * the visitor has scrolled or pressed a key in the meantime.
 */
function land(scroll: () => void) {
  let moved = false;
  for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) addEventListener(type, () => (moved = true), { once: true, passive: true });
  requestAnimationFrame(scroll);
  document.fonts.ready.then(() => !moved && requestAnimationFrame(scroll));
}

if (readHash()) land(() => section.scrollIntoView({ behavior: "instant" }));
else if (location.hash.startsWith("#p-")) land(readEntryHash);
