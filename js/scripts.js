// ===== NAVBAR =====
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// ===== TAG FILTER =====
// A card's tags are exactly the .project-tag buttons it shows — no separate
// data-tags list to keep in sync, so a card can never be highlighted by a tag
// the visitor can't see on it.
let activeFilter = null;
const CARD_SELECTOR = ".project-card, .more-work-card";

function normalizeTag(tag) {
  return tag.trim().toLowerCase();
}

function cardTags(card) {
  return Array.from(card.querySelectorAll(".project-tag")).map((t) =>
    normalizeTag(t.textContent),
  );
}

function applyFilter(filter, opts = { scroll: false }) {
  activeFilter = filter;
  const wanted = filter ? normalizeTag(filter) : null;

  document.querySelectorAll(".stack-tag").forEach((el) => {
    const on = !!wanted && normalizeTag(el.dataset.tag) === wanted;
    el.classList.toggle("active", on);
    el.setAttribute("aria-pressed", on);
  });

  const matchedCards = [];
  document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
    const matches = !!wanted && cardTags(card).includes(wanted);
    card.classList.toggle("highlighted", matches);
    card.classList.toggle("dimmed", !!wanted && !matches);
    if (matches) matchedCards.push(card);

    card.querySelectorAll(".project-tag").forEach((t) => {
      const on = !!wanted && normalizeTag(t.textContent) === wanted;
      t.classList.toggle("matching", on);
      t.setAttribute("aria-pressed", on);
    });
  });

  updateFilterStatus(filter, matchedCards.length);

  // Scroll to the first matched project (if triggered by a click)
  if (wanted && opts.scroll && matchedCards.length > 0) {
    matchedCards[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function updateFilterStatus(filter, count) {
  const box = document.getElementById("filterStatus");
  if (!box) return;
  box.hidden = !filter;
  if (!filter) return;
  document.getElementById("filterStatusTag").textContent = filter;
  document.getElementById("filterStatusCount").textContent =
    count === 1 ? "1 match" : `${count} matches`;
}

function toggleFilter(tag) {
  const willActivate = activeFilter === null ||
    normalizeTag(activeFilter) !== normalizeTag(tag);
  applyFilter(willActivate ? tag : null, { scroll: willActivate });
  return willActivate;
}

// Show how many cards each Tech Stack tag reaches; tags with no project on
// the page are hidden (they reappear automatically once a card uses them).
function initStackCounts() {
  const counts = new Map();
  document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
    new Set(cardTags(card)).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
  });
  document.querySelectorAll(".stack-tag").forEach((el) => {
    const n = counts.get(normalizeTag(el.dataset.tag)) || 0;
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
    projects: document.querySelectorAll(CARD_SELECTOR).length,
    live: document.querySelectorAll(".live-card").length,
  };
  document.querySelectorAll("[data-stat]").forEach((el) => {
    if (values[el.dataset.stat] !== undefined) el.textContent = values[el.dataset.stat];
  });
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
// No saved choice = follow the OS. The first click pins the opposite of
// whatever is showing right now.
function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const root = document.documentElement;
  const current = () =>
    root.dataset.theme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  const label = () =>
    btn.setAttribute(
      "aria-label",
      current() === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  label();
  btn.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* private mode etc. — the choice just won't persist */
    }
    label();
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
      const card = e.target.closest(`${CARD_SELECTOR}, .stack-card`);
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
  initStackCounts();
  initStats();
  initNavToggle();
  initThemeToggle();
  initSpotlight();

  // Stack tag clicks
  document.querySelectorAll(".stack-tag").forEach((el) => {
    el.addEventListener("click", () => {
      if (!toggleFilter(el.dataset.tag)) {
        document
          .getElementById("projects")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.getElementById("filterStatusClear")?.addEventListener("click", () =>
    applyFilter(null),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeFilter) applyFilter(null);
  });

  // Project/card tag clicks + click outside to clear
  document.addEventListener("click", (e) => {
    const tagEl = e.target.closest(".project-tag");
    if (tagEl) {
      toggleFilter(tagEl.textContent);
      return;
    }
    if (
      !e.target.closest(CARD_SELECTOR) &&
      !e.target.closest(".stack-tag") &&
      !e.target.closest(".filter-status")
    ) {
      applyFilter(null);
    }
  });

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
