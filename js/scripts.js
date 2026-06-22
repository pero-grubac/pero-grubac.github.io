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

  // Slidovi slajdere tako da prvi highlightovani projekat bude vidljiv
  document.querySelectorAll(".more-work-track").forEach((track) => {
    if (!track._slider) return;
    const cards = Array.from(track.querySelectorAll(".more-work-card"));
    const firstMatchIdx = cards.findIndex((c) =>
      c.classList.contains("highlighted"),
    );
    if (firstMatchIdx >= 0) track._slider.goTo(firstMatchIdx);
  });

  // Skroluj na prvi matchovani projekat uopste (ako je trazeno)
  if (opts.scroll && matchedCards.length > 0) {
    // Damo slajderu da odradi transform, pa skrolujemo
    setTimeout(() => {
      matchedCards[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
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
      !e.target.closest(".stack-tag") &&
      !e.target.closest(".more-work-nav")
    ) {
      applyFilter(null);
    }
  });

  // Video lazy load
  const videos = document.querySelectorAll("video");
  const observer = new IntersectionObserver(
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
    observer.observe(v);
  });

  // ===== SLIDER FACTORY =====
  function initSlider(trackId, prevId, nextId, dotsId) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsContainer = document.getElementById(dotsId);

    if (!track || !prevBtn || !nextBtn) return;

    const cards = Array.from(track.querySelectorAll(".more-work-card"));
    const total = cards.length;
    let current = 0;

    function getVisible() {
      return window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
    }

    function maxStep() {
      return Math.max(0, total - getVisible());
    }

    function getCardWidth() {
      return cards[0] ? cards[0].offsetWidth + 16 : 0;
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxStep()));
      track.style.transform = `translateX(-${current * getCardWidth()}px)`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === maxStep();
      document.querySelectorAll(`#${dotsId} .more-work-dot`).forEach((d, i) => {
        d.classList.toggle("active", i === current);
      });
    }

    function buildDots() {
      dotsContainer.innerHTML = "";
      for (let i = 0; i <= maxStep(); i++) {
        const dot = document.createElement("span");
        dot.classList.add("more-work-dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));
    window.addEventListener("resize", () => {
      buildDots();
      goTo(0);
    });

    buildDots();
    goTo(0);

    // Izlozi kontroler na track da ga applyFilter moze koristiti
    track._slider = { goTo };
  }

  initSlider("moreTrack", "morePrev", "moreNext", "moreDots");
  initSlider("liveTrack", "livePrev", "liveNext", "liveDots");
});
