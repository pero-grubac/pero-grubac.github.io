// ===== NAVBAR =====
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// ===== PROJECT SEARCH =====
// One search box filters the featured cards and the index rows together.
// An item's tags are exactly the .project-tag buttons it shows — no separate
// list to keep in sync.
const ITEM_SELECTOR = ".project-card, .index-row";
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollBehavior = reduceMotion ? "auto" : "smooth";

let items = [];
let knownTags = new Set();
let activeKind = "";

function buildIndex() {
  document.querySelectorAll(".project-tag").forEach((t) => {
    t.dataset.word = norm(t.textContent);
  });
  items = Array.from(document.querySelectorAll(ITEM_SELECTOR)).map((el) => {
    const details = el.querySelector("details");
    return {
      el,
      kind: el.dataset.kind,
      id: el.id || details?.id,
      details,
      name: (el.querySelector("h3, .row-name")?.textContent || "").trim(),
      launch: el.querySelector(".row-launch")?.href || null,
      tags: Array.from(el.querySelectorAll(".project-tag")).map((t) => t.dataset.word),
      haystack: norm(el.textContent),
      // Plain-text spots that get <mark> highlights
      marks: Array.from(el.querySelectorAll("h3, .row-name, .row-stack")).map((node) => ({
        node,
        text: node.textContent.trim(),
      })),
    };
  });
  // A search term that is exactly one of these matches that tag only —
  // "java" must not match "javascript".
  knownTags = new Set(items.flatMap((i) => i.tags));
}

const WORD_CHAR = /[a-z0-9#+]/;
const isWholeAt = (lower, i, len) =>
  !WORD_CHAR.test(lower[i - 1] || "") && !WORD_CHAR.test(lower[i + len] || "");

// specs: [{ t: "java", whole: true }] — whole = exact tag, word-bounded
function highlight(node, text, specs) {
  node.textContent = "";
  const lower = text.toLowerCase();
  const ranges = [];
  specs.forEach(({ t, whole }) => {
    let i = lower.indexOf(t);
    while (i !== -1) {
      if (!whole || isWholeAt(lower, i, t.length)) ranges.push([i, i + t.length]);
      i = lower.indexOf(t, i + t.length);
    }
  });
  ranges.sort((x, y) => x[0] - y[0]);
  let pos = 0;
  for (const [start, end] of ranges) {
    if (start < pos) continue;
    node.append(text.slice(pos, start));
    const m = document.createElement("mark");
    m.textContent = text.slice(start, end);
    node.append(m);
    pos = end;
  }
  node.append(text.slice(pos));
}

function applySearch({ syncUrl = true } = {}) {
  const query = norm(document.getElementById("q").value);
  // A query that is exactly a tag (incl. "spring boot") is one exact term;
  // otherwise each word is a term — known tags exact, the rest substring.
  const specs = !query
    ? []
    : knownTags.has(query)
      ? [{ t: query, whole: true }]
      : query.split(" ").map((t) => ({ t, whole: knownTags.has(t) }));

  let shown = 0;
  const shownByGroup = { system: 0, index: 0 };
  items.forEach((it) => {
    const match =
      (!activeKind || it.kind === activeKind) &&
      specs.every(({ t, whole }) => (whole ? it.tags.includes(t) : it.haystack.includes(t)));
    it.el.hidden = !match;
    if (match) {
      shown++;
      shownByGroup[it.kind === "system" ? "system" : "index"]++;
    }
    it.marks.forEach((m) => highlight(m.node, m.text, specs));
  });

  document.querySelectorAll("[data-group]").forEach((label) => {
    label.hidden = shownByGroup[label.dataset.group] === 0;
  });
  document.querySelectorAll(".project-tag").forEach((t) => {
    const on = !!query && t.dataset.word === query;
    t.classList.toggle("matching", on);
    t.setAttribute("aria-pressed", on);
  });
  document.querySelectorAll(".stack-tag").forEach((t) => {
    const on = !!query && norm(t.dataset.tag) === query;
    t.classList.toggle("active", on);
    t.setAttribute("aria-pressed", on);
  });

  document.getElementById("searchEmpty").hidden = shown > 0;
  document.getElementById("searchHint").textContent =
    query || activeKind ? `${shown} of ${items.length} projects · esc to clear` : "";

  if (syncUrl) {
    const url = new URL(location.href);
    query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
    activeKind ? url.searchParams.set("kind", activeKind) : url.searchParams.delete("kind");
    history.replaceState(null, "", url);
  }
}

function setKind(kind) {
  activeKind = kind;
  document.querySelectorAll(".kind").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.kind === kind)),
  );
  applySearch();
}

// Keeps `anchor` at the same spot on screen while items above it disappear,
// so clicking a tag doesn't make the page jump away from what you clicked.
function setQuery(value, { anchor = null, scrollToSearch = false } = {}) {
  const before = anchor?.getBoundingClientRect().top;
  document.getElementById("q").value = value;
  applySearch();
  if (anchor && !anchor.hidden) {
    window.scrollBy(0, anchor.getBoundingClientRect().top - before);
  }
  if (scrollToSearch) {
    document.querySelector(".search").scrollIntoView({ behavior: scrollBehavior, block: "start" });
  }
}

function clearSearch() {
  document.getElementById("q").value = "";
  setKind("");
}

function openItem(it) {
  if (it.el.hidden) clearSearch();
  if (it.details) it.details.open = true;
  it.el.scrollIntoView({ behavior: scrollBehavior, block: "start" });
  const focusTarget = it.details?.querySelector("summary");
  focusTarget?.focus({ preventScroll: true });
}

const visibleSummaries = () =>
  items.filter((i) => i.details && !i.el.hidden).map((i) => i.details.querySelector("summary"));

function initSearch() {
  buildIndex();
  const input = document.getElementById("q");

  input.addEventListener("input", () => applySearch());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (input.value || activeKind) clearSearch();
      else input.blur();
    } else if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      visibleSummaries()[0]?.focus();
    }
  });
  document.querySelectorAll(".kind").forEach((b) => {
    const n = b.dataset.kind ? items.filter((i) => i.kind === b.dataset.kind).length : items.length;
    const sup = document.createElement("sup");
    sup.textContent = n;
    b.append(sup);
    b.addEventListener("click", () => setKind(b.dataset.kind));
  });

  // Tag clicks search for that tag; clicking the active tag clears it.
  document.addEventListener("click", (e) => {
    const tag = e.target.closest(".project-tag");
    if (tag) {
      const word = tag.dataset.word;
      setQuery(norm(input.value) === word ? "" : word, { anchor: tag.closest(ITEM_SELECTOR) });
      return;
    }
    const stack = e.target.closest(".stack-tag");
    if (stack) {
      const word = norm(stack.dataset.tag);
      setQuery(norm(input.value) === word ? "" : word, { scrollToSearch: true });
      return;
    }
    const suggestion = e.target.closest("[data-q]");
    if (suggestion) {
      setKind("");
      setQuery(suggestion.dataset.q);
    }
  });

  // Restore ?q= / ?kind= from a shared link, then #id opens that project
  const params = new URLSearchParams(location.search);
  if (params.get("q")) input.value = params.get("q");
  if (params.get("kind")) setKind(params.get("kind"));
  else applySearch({ syncUrl: false });
  const fromHash = items.find((i) => i.id && i.id === location.hash.slice(1));
  if (fromHash) openItem(fromHash);
}

// Show how many projects each Tech Stack tag reaches; tags with no project on
// the page are hidden (they reappear automatically once a project uses them).
function initStackCounts() {
  document.querySelectorAll(".stack-tag").forEach((el) => {
    const n = items.filter((i) => i.tags.includes(norm(el.dataset.tag))).length;
    if (n === 0) {
      el.remove();
      return;
    }
    const badge = document.createElement("span");
    badge.className = "stack-count";
    badge.textContent = n;
    el.appendChild(badge);
    el.setAttribute("aria-pressed", "false");
  });
}

// Keep the About stats honest by counting what's actually on the page.
function initStats() {
  const values = {
    projects: items.length,
    live: items.filter((i) => i.kind === "live").length,
  };
  document.querySelectorAll("[data-stat]").forEach((el) => {
    if (values[el.dataset.stat] !== undefined) el.textContent = values[el.dataset.stat];
  });
}

// ===== TOAST =====
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
}

async function copyEmail() {
  const email = document.querySelector(".contact-email").textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    toast("email copied");
  } catch (e) {
    location.href = `mailto:${email}`;
  }
}

// ===== MOBILE NAV =====
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  if (!toggle) return;
  const setOpen = (open) => {
    navbar.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open);
  };
  toggle.addEventListener("click", () =>
    setOpen(!navbar.classList.contains("nav-open")),
  );
  document.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => setOpen(false)),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

// ===== THEME TOGGLE =====
// No saved choice = follow the OS. The first switch pins the opposite of
// whatever is showing right now.
const currentTheme = () =>
  document.documentElement.dataset.theme ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

function updateThemeLabel() {
  document
    .getElementById("themeToggle")
    ?.setAttribute(
      "aria-label",
      currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
}

function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (e) {
    /* private mode etc. — the choice just won't persist */
  }
  updateThemeLabel();
  return next;
}

function initThemeToggle() {
  updateThemeLabel();
  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
}

// ===== COMMAND PALETTE (ctrl/cmd + k) + KEYBOARD SHORTCUTS =====
function initPalette() {
  const palette = document.getElementById("palette");
  const input = document.getElementById("paletteInput");
  const list = document.getElementById("paletteList");
  if (!palette) return;
  let shown = [];
  let index = 0;

  const go = (id) => () =>
    document.getElementById(id).scrollIntoView({ behavior: scrollBehavior });
  const commands = [
    ...["about", "stack", "projects", "contact"].map((id) => ({ verb: "go", label: id, run: go(id) })),
    ...items.map((it) => ({
      verb: "view",
      label: it.name,
      hint: it.kind,
      run: () => openItem(it),
    })),
    ...items
      .filter((it) => it.launch)
      .map((it) => ({
        verb: "launch",
        label: it.name,
        hint: "↗",
        run: () => window.open(it.launch, "_blank", "noopener"),
      })),
    { verb: "run", label: "toggle theme", hint: "t", run: () => toast(`theme: ${toggleTheme()}`) },
    { verb: "run", label: "copy email", run: copyEmail },
    {
      verb: "run",
      label: "show live apps only",
      run: () => {
        setKind("live");
        document.querySelector(".search").scrollIntoView({ behavior: scrollBehavior });
      },
    },
    {
      verb: "open",
      label: "github profile",
      hint: "↗",
      run: () => window.open("https://github.com/pero-grubac", "_blank", "noopener"),
    },
  ];

  function render() {
    const terms = norm(input.value).split(" ").filter(Boolean);
    shown = commands.filter((c) => {
      const text = `${c.verb} ${c.label} ${c.hint || ""}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    });
    // Whatever was typed can always be run as a project search
    const typed = norm(input.value);
    if (typed) {
      shown.push({
        verb: "search",
        label: `"${typed}" in projects`,
        hint: "/",
        run: () => setQuery(typed, { scrollToSearch: true }),
      });
    }
    index = Math.min(index, Math.max(shown.length - 1, 0));
    list.textContent = "";
    if (!shown.length) {
      const li = document.createElement("li");
      li.className = "none";
      li.textContent = "no matching command";
      list.append(li);
      input.removeAttribute("aria-activedescendant");
      return;
    }
    shown.forEach((c, i) => {
      const li = document.createElement("li");
      li.id = `cmd-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === index));
      const verb = document.createElement("span");
      verb.className = "verb";
      verb.textContent = c.verb;
      const label = document.createElement("span");
      label.textContent = c.label;
      li.append(verb, label);
      if (c.hint) {
        const h = document.createElement("span");
        h.className = "hint";
        h.textContent = c.hint;
        li.append(h);
      }
      li.addEventListener("mousemove", () => select(i));
      li.addEventListener("click", () => run(i));
      list.append(li);
    });
    input.setAttribute("aria-activedescendant", `cmd-${index}`);
  }

  function select(i) {
    if (i === index) return;
    list.children[index]?.setAttribute("aria-selected", "false");
    index = i;
    const li = list.children[index];
    li?.setAttribute("aria-selected", "true");
    li?.scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", `cmd-${index}`);
  }

  function run(i) {
    const c = shown[i];
    if (!c) return;
    palette.close();
    c.run();
  }

  function open() {
    if (palette.open) return;
    input.value = "";
    index = 0;
    render();
    palette.showModal();
    input.focus();
  }

  input.addEventListener("input", () => {
    index = 0;
    render();
  });
  input.addEventListener("keydown", (e) => {
    const n = Math.max(shown.length, 1);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      select((index + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      select((index - 1 + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(index);
    }
  });
  palette.addEventListener("click", (e) => {
    if (e.target === palette) palette.close(); // click on the backdrop
  });
  document.getElementById("paletteBtn")?.addEventListener("click", open);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette.open ? palette.close() : open();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || palette.open) return;
    const t = e.target;
    if (t instanceof Element && t.closest("input, textarea, select, [contenteditable]")) return;

    if (e.key === "/") {
      e.preventDefault();
      const q = document.getElementById("q");
      q.closest(".search").scrollIntoView({ behavior: scrollBehavior, block: "start" });
      q.focus({ preventScroll: true });
      q.select();
    } else if (e.key === "t") {
      toast(`theme: ${toggleTheme()}`);
    } else if (e.key === "Escape" && (document.getElementById("q").value || activeKind)) {
      clearSearch();
    } else if (e.key === "j" || e.key === "k") {
      const rows = visibleSummaries();
      if (!rows.length) return;
      const i = rows.indexOf(document.activeElement);
      const next = i === -1 ? 0 : Math.min(Math.max(i + (e.key === "j" ? 1 : -1), 0), rows.length - 1);
      rows[next].focus();
      rows[next].scrollIntoView({ block: "nearest", behavior: scrollBehavior });
    } else if (e.key === "o") {
      const it = items.find((i) => i.el.contains(document.activeElement));
      if (it?.launch) window.open(it.launch, "_blank", "noopener");
    }
  });
}

// ===== CURSOR SPOTLIGHT =====
// Feeds the pointer position into --mx/--my on the hovered card; the glow
// itself is a CSS background. Skipped on touch and for reduced motion.
function initSpotlight() {
  if (
    !window.matchMedia("(hover: hover)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  let last = null;
  let pending = null;
  const clear = (card) => {
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
  };
  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target.closest(".project-card, .stack-card");
      if (last && last !== card) clear(last);
      last = card;
      if (!card || pending) return;
      pending = requestAnimationFrame(() => {
        pending = null;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => last && clear(last));
}

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initStackCounts();
  initStats();
  initNavToggle();
  initThemeToggle();
  initPalette();
  initSpotlight();

  // Video lazy load — playback is entirely observer-driven (no autoplay attribute in HTML)
  const videos = document.querySelectorAll("video");
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.play();
        else entry.target.pause();
      });
    },
    { threshold: 0.2 },
  );
  videos.forEach((v) => {
    v.pause();
    videoObserver.observe(v);
  });

  // ===== SCROLL REVEAL =====
  // Deliberately not IntersectionObserver-based: a fast flick, Page Down,
  // "End", or landing directly on a #anchor can jump the viewport clean over
  // a section in a single frame, so it never registers as "intersecting" and
  // stays opacity:0 forever. Checking live geometry on scroll/resize (plus
  // once up front) always catches up, however the user got there.
  // .stagger grids reveal on their own (so a grid far down a long section
  // animates when *it* arrives), children one after another via --i.
  const revealEls = Array.from(document.querySelectorAll(".reveal, .stagger"));
  document.querySelectorAll(".stagger").forEach((group) => {
    Array.from(group.children).forEach((child, i) =>
      child.style.setProperty("--i", i),
    );
  });
  if (revealEls.length) {
    let revealTicking = false;
    function checkReveal() {
      revealTicking = false;
      const vh = window.innerHeight;
      revealEls.forEach((el) => {
        if (el.classList.contains("is-visible")) return;
        const rect = el.getBoundingClientRect();
        // No lower bound on rect.top: a section already scrolled fully past
        // (both edges above the viewport) must still reveal immediately —
        // it was skipped, not "not yet reached".
        if (rect.top < vh * 0.9) {
          el.classList.add("is-visible");
          if (el.classList.contains("stagger")) {
            // Drop the per-card delay once the entrance has played, so
            // hover and filter transitions aren't delayed afterwards.
            const total = el.children.length * 70 + 500;
            setTimeout(() => el.classList.add("stagger-done"), total);
          }
        }
      });
    }
    function onRevealScroll() {
      if (!revealTicking) {
        revealTicking = true;
        requestAnimationFrame(checkReveal);
      }
    }
    window.addEventListener("scroll", onRevealScroll, { passive: true });
    window.addEventListener("resize", onRevealScroll);
    checkReveal();
  }

  // ===== HERO TERMINAL =====
  initHeroTerminal();
});

// ===== HERO TERMINAL TYPING EFFECT =====
function initHeroTerminal() {
  const body = document.getElementById("heroTerminalBody");
  if (!body) return;

  const script = [
    { type: "cmd", text: "whoami" },
    { type: "out", text: "pero-grubac — backend developer" },
    { type: "cmd", text: "cat focus.txt" },
    { type: "out", text: "distributed systems · REST APIs · microservices" },
    { type: "cmd", text: "ls ~/live" },
    { type: "out", text: "arcane-keep  countdown  devkit  +7 more" },
  ];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function renderStatic() {
    body.innerHTML = script
      .map((line) =>
        line.type === "cmd"
          ? `<div class="hero-terminal-line"><span class="hero-terminal-prompt">$</span>${line.text}</div>`
          : `<div class="hero-terminal-line hero-terminal-output">${line.text}</div>`,
      )
      .join("");
  }

  if (reduceMotion) {
    renderStatic();
    return;
  }

  let i = 0;
  function typeLine() {
    if (i >= script.length) {
      setTimeout(() => {
        body.innerHTML = "";
        i = 0;
        typeLine();
      }, 2200);
      return;
    }

    const line = script[i];
    const el = document.createElement("div");
    el.className =
      "hero-terminal-line" + (line.type === "out" ? " hero-terminal-output" : "");

    if (line.type === "cmd") {
      const prompt = document.createElement("span");
      prompt.className = "hero-terminal-prompt";
      prompt.textContent = "$";
      el.appendChild(prompt);
    }

    const textNode = document.createElement("span");
    el.appendChild(textNode);
    const cursor = document.createElement("span");
    cursor.className = "hero-terminal-cursor";
    el.appendChild(cursor);
    body.appendChild(el);

    let c = 0;
    const speed = line.type === "cmd" ? 55 : 18;
    const timer = setInterval(() => {
      textNode.textContent += line.text[c];
      c++;
      if (c >= line.text.length) {
        clearInterval(timer);
        cursor.remove();
        i++;
        setTimeout(typeLine, line.type === "cmd" ? 300 : 500);
      }
    }, speed);
  }

  typeLine();
}
