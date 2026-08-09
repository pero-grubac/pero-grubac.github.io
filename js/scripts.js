// ===== NAVBAR =====
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// ===== TAG FILTER =====
let activeFilter = null;

function normalizeTag(tag) {
  return tag.trim().toLowerCase();
}

function applyFilter(filter, opts = { scroll: false }) {
  activeFilter = filter;

  document.querySelectorAll(".stack-tag").forEach((el) => {
    el.classList.toggle(
      "active",
      !!filter && normalizeTag(el.dataset.tag) === normalizeTag(filter),
    );
  });

  const allCards = document.querySelectorAll(".project-card, .more-work-card");
  const matchedCards = [];

  allCards.forEach((card) => {
    const cardTags = (card.dataset.tags || "")
      .split(",")
      .map((t) => normalizeTag(t));

    if (!filter) {
      card.classList.remove("highlighted", "dimmed");
      card
        .querySelectorAll(".project-tag")
        .forEach((t) => t.classList.remove("matching"));
      return;
    }

    const matches = cardTags.includes(normalizeTag(filter));
    card.classList.toggle("highlighted", matches);
    card.classList.toggle("dimmed", !matches);

    if (matches) matchedCards.push(card);

    card.querySelectorAll(".project-tag").forEach((t) => {
      t.classList.toggle(
        "matching",
        normalizeTag(t.textContent) === normalizeTag(filter),
      );
    });
  });

  if (!filter) return;

  // Scroll to the first matched project (if triggered by a click)
  if (opts.scroll && matchedCards.length > 0) {
    matchedCards[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Stack tag clicks
  document.querySelectorAll(".stack-tag").forEach((el) => {
    el.addEventListener("click", () => {
      const tag = el.dataset.tag;
      const willActivate = activeFilter !== tag;
      applyFilter(willActivate ? tag : null, { scroll: willActivate });
      if (!willActivate) {
        document
          .getElementById("projects")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Project/card tag clicks + click outside to clear
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("project-tag")) {
      const tag = e.target.textContent.trim();
      const willActivate = activeFilter !== tag;
      applyFilter(willActivate ? tag : null, { scroll: willActivate });
      return;
    }
    if (
      !e.target.closest(".project-card") &&
      !e.target.closest(".more-work-card") &&
      !e.target.closest(".stack-tag")
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
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
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
    { type: "cmd", text: "./status --freelance" },
    { type: "out", text: "available ✓" },
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
