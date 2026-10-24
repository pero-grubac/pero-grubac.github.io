/* Shared prototype behaviour: filter, search, URL hash, counts, details,
   copy email, on-demand demo video, command palette, keyboard shortcuts.
   A direction may set window.ProtoConfig before this runs:
     detail: { open(slug), close(), current() }   replaces inline disclosure
     afterOpen(item, panel) / beforeClose(item, panel)   disclosure hooks */
(() => {
  const cfg = window.ProtoConfig || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const scrollTo = (el) => el && el.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });

  const q = $("#q");
  const items = $$("[data-item]");
  const systems = $$("[data-system]");
  const filters = $$("[data-filter]");
  const empty = $("#empty");
  const also = $("#also");
  const status = $("#result-status");
  const projects = $("#projects");
  const toastEl = $("#toast");
  const state = { kind: "", q: "" };

  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.dataset.show = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.dataset.show = "false"), 2400);
  }

  /* ---------- details on demand ---------- */
  let open = null; // { item, btn, panel }
  const disclosure = {
    open(slug) {
      const item = items.find((i) => i.dataset.slug === slug);
      if (!item) return;
      const btn = $("[data-toggle]", item);
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (open && open.item === item) return;
      disclosure.close(false);
      btn.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      item.dataset.open = "true";
      open = { item, btn, panel };
      cfg.afterOpen?.(item, panel);
    },
    close(focus = true) {
      if (!open) return;
      const { item, btn, panel } = open;
      cfg.beforeClose?.(item, panel);
      btn.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      delete item.dataset.open;
      open = null;
      if (focus) btn.focus({ preventScroll: true });
    },
    current: () => open && open.item.dataset.slug,
  };
  const detail = cfg.detail || disclosure;
  if (!cfg.detail) {
    $$("[data-toggle]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const slug = btn.closest("[data-item]").dataset.slug;
        detail.current() === slug ? detail.close(false) : detail.open(slug);
      })
    );
  }

  /* ---------- filter + search ---------- */
  function apply() {
    const needle = state.q.trim().toLowerCase();
    const counts = {};
    let shown = 0;
    for (const it of items) {
      // System entries (if a direction lists them) only join the list while searching
      if (it.dataset.kind === "system" && !needle) {
        it.hidden = true;
        continue;
      }
      const hit = !needle || it.dataset.hay.includes(needle);
      if (hit) counts[it.dataset.kind] = (counts[it.dataset.kind] || 0) + 1;
      const visible = hit && (!state.kind || it.dataset.kind === state.kind);
      it.hidden = !visible;
      if (visible) shown++;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    for (const b of filters) {
      const k = b.dataset.filter;
      $("[data-count]", b).textContent = k ? counts[k] || 0 : total;
      b.setAttribute("aria-pressed", String(k === state.kind));
    }
    const current = detail.current();
    if (current && items.find((i) => i.dataset.slug === current)?.hidden) detail.close(false);

    const sys = needle ? systems.filter((s) => s.dataset.hay.includes(needle)) : [];
    if (also) {
      also.hidden = !sys.length;
      const list = $("[data-also-list]", also);
      if (list)
        list.innerHTML = sys
          .map((s) => `<a href="#${s.id}">${s.dataset.title}</a>`)
          .join(", ");
    }
    if (empty) {
      empty.hidden = shown > 0;
      $$("[data-empty-q]", empty).forEach((el) => (el.textContent = state.q.trim()));
    }
    if (status) {
      const kindName = state.kind ? $(`[data-filter="${state.kind}"]`)?.dataset.label?.toLowerCase() + " " : "";
      status.textContent = `${shown} ${kindName}project${shown === 1 ? "" : "s"}${needle ? ` match “${state.q.trim()}”` : ""}`;
    }
    cfg.afterApply?.(state, shown);
  }

  function writeHash() {
    const p = new URLSearchParams();
    if (state.kind) p.set("kind", state.kind);
    if (state.q.trim()) p.set("q", state.q.trim());
    const s = p.toString();
    history.replaceState(null, "", "#projects" + (s ? "?" + s : ""));
  }

  function readHash() {
    if (!location.hash.startsWith("#projects")) return false;
    const p = new URLSearchParams(location.hash.split("?")[1] || "");
    const kind = p.get("kind") || "";
    state.kind = filters.some((b) => b.dataset.filter === kind) ? kind : "";
    state.q = p.get("q") || "";
    if (q) q.value = state.q;
    apply();
    return true;
  }

  function setSearch(term, { kind = state.kind, scroll = false } = {}) {
    state.q = term;
    state.kind = kind;
    if (q) q.value = term;
    apply();
    writeHash();
    if (scroll) {
      scrollTo(projects);
      q?.focus({ preventScroll: true });
    }
  }

  q?.addEventListener("input", () => {
    state.q = q.value;
    apply();
    writeHash();
  });
  filters.forEach((b) =>
    b.addEventListener("click", () => {
      state.kind = b.dataset.filter;
      apply();
      writeHash();
    })
  );
  $$("[data-clear]").forEach((b) =>
    b.addEventListener("click", () => {
      setSearch("", { kind: "" });
      q?.focus();
    })
  );
  $$("[data-term]").forEach((b) => b.addEventListener("click", () => setSearch(b.dataset.term, { kind: "", scroll: true })));

  window.addEventListener("hashchange", () => {
    if (readHash()) scrollTo(projects);
  });

  /* ---------- copy email ---------- */
  async function copyEmail(btn) {
    const email = document.documentElement.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const t = Object.assign(document.createElement("textarea"), { value: email });
      document.body.append(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    toast("Email copied");
    if (!btn) return;
    const label = $("[data-copy-label]", btn) || btn;
    const was = label.dataset.text || label.textContent;
    label.dataset.text = was;
    label.textContent = "Copied";
    btn.dataset.copied = "true";
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      label.textContent = was;
      delete btn.dataset.copied;
    }, 2000);
  }
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => copyEmail(b)));

  /* ---------- theme (only when the direction has a toggle) ---------- */
  const themeBtn = $("[data-theme-toggle]");
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem(root.dataset.themeKey, next);
    } catch {}
    themeBtn?.setAttribute("aria-pressed", String(next === "light"));
  }
  if (themeBtn) {
    themeBtn.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "light"));
    themeBtn.addEventListener("click", toggleTheme);
  }

  /* ---------- demo video: still by default, plays only on user action ---------- */
  $$("[data-video]").forEach((fig) => {
    const img = $("img", fig);
    const btn = $("[data-play]", fig);
    const title = fig.dataset.title;
    let video;
    const ensure = () => {
      if (video) return video;
      video = document.createElement("video");
      Object.assign(video, { muted: true, loop: true, playsInline: true, preload: "none", poster: img.currentSrc || img.src });
      video.setAttribute("aria-hidden", "true");
      video.tabIndex = -1;
      video.src = fig.dataset.video;
      img.after(video);
      return video;
    };
    const setBtn = (playing) => {
      btn.setAttribute("aria-pressed", String(playing));
      btn.setAttribute("aria-label", `${playing ? "Pause" : "Play"} the demo video of ${title}`);
      const t = $("[data-play-text]", btn);
      if (t) t.textContent = playing ? "Pause" : "Play demo";
    };
    const play = () => {
      ensure().play().catch(() => {});
      fig.dataset.state = "playing";
      setBtn(true);
    };
    const stop = (reset) => {
      if (!video) return;
      video.pause();
      fig.dataset.state = reset ? "idle" : "paused";
      setBtn(false);
    };
    const toggle = () => (fig.dataset.state === "playing" ? stop(false) : play());
    setBtn(false);
    fig.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && !reduce.matches && play());
    fig.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && !reduce.matches && stop(true));
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    fig.addEventListener("click", (e) => {
      if (!e.target.closest("a, button")) toggle();
    });
  });

  /* ---------- prototype stand-ins for pages that don't exist yet ---------- */
  $$('[data-proto="case-study"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Case study pages come in phase 4");
    })
  );
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  const mac = /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform || navigator.platform || "");
  $$("[data-mod]").forEach((el) => (el.textContent = mac ? "⌘" : "Ctrl"));

  /* ---------- command palette ---------- */
  const pal = $("#palette");
  const palQ = $("#pal-q");
  const palList = $("#pal-list");
  const entries = JSON.parse($("#palette-data")?.textContent || "[]");
  let shownEntries = [];
  let active = 0;
  let opener = null;

  function fuzzy(needle, hay) {
    if (!needle) return 1;
    const i = hay.indexOf(needle);
    if (i >= 0) return 1000 - i;
    let from = 0, score = 0, last = -2;
    for (const ch of needle.replace(/\s+/g, "")) {
      const f = hay.indexOf(ch, from);
      if (f < 0) return -1;
      score += f === last + 1 ? 4 : 1;
      last = f;
      from = f + 1;
    }
    return score;
  }

  function renderPalette() {
    const needle = palQ.value.trim().toLowerCase();
    shownEntries = entries
      .map((e) => ({ e, s: fuzzy(needle, (e.label + " " + (e.keywords || "")).toLowerCase()) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => (needle ? b.s - a.s : 0))
      .map((x) => x.e);
    active = Math.min(active, Math.max(shownEntries.length - 1, 0));
    palList.innerHTML = shownEntries.length
      ? shownEntries
          .map(
            (e, i) =>
              `<li role="option" id="pal-${i}" aria-selected="${i === active}" data-i="${i}"><span class="pal-label">${e.label}</span><span class="pal-hint">${e.hint}</span></li>`
          )
          .join("")
      : `<li class="pal-none" role="presentation">Nothing matches “${palQ.value.trim().replace(/</g, "&lt;")}”</li>`;
    palQ.setAttribute("aria-activedescendant", shownEntries.length ? `pal-${active}` : "");
    $(`#pal-${active}`, palList)?.scrollIntoView({ block: "nearest" });
  }

  function openPalette() {
    if (!pal || pal.open) return;
    opener = document.activeElement;
    palQ.value = "";
    active = 0;
    renderPalette();
    pal.showModal();
    palQ.focus();
  }

  function run(e) {
    pal.close();
    if (e.type === "section") return scrollTo(document.getElementById(e.target));
    if (e.type === "url") return window.open(e.target, "_blank", "noopener");
    if (e.type === "hash") return (location.hash = e.target);
    if (e.type === "theme") return toggleTheme();
    if (e.type === "copy") return copyEmail($("[data-copy]"));
    if (e.type === "project") {
      const item = items.find((i) => i.dataset.slug === e.target);
      if (item?.hidden) setSearch("", { kind: "" });
      detail.open(e.target);
      scrollTo(item);
    }
  }

  if (pal) {
    $$("[data-palette]").forEach((b) => b.addEventListener("click", openPalette));
    palQ.addEventListener("input", () => {
      active = 0;
      renderPalette();
    });
    palQ.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        const n = shownEntries.length;
        if (!n) return;
        active = (active + (ev.key === "ArrowDown" ? 1 : n - 1)) % n;
        renderPalette();
      } else if (ev.key === "Enter" && shownEntries[active]) {
        ev.preventDefault();
        run(shownEntries[active]);
      }
    });
    palList.addEventListener("click", (ev) => {
      const li = ev.target.closest("[data-i]");
      if (li) run(shownEntries[+li.dataset.i]);
    });
    pal.addEventListener("click", (ev) => ev.target === pal && pal.close()); // backdrop
    pal.addEventListener("close", () => opener?.focus?.({ preventScroll: true }));
  }

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal?.open ? pal.close() : openPalette();
      return;
    }
    if (document.querySelector("dialog[open]")) return;
    if (e.key === "Escape" && detail.current()) {
      detail.close();
      return;
    }
    const typing = e.target.closest?.("input, textarea, select, [contenteditable]");
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") {
      e.preventDefault();
      q?.focus();
      q?.select();
    } else if ((e.key === "t" || e.key === "T") && themeBtn) {
      toggleTheme();
    }
  });

  window.Proto = { apply, state, detail, toast };
  if (!readHash()) apply();
  else requestAnimationFrame(() => scrollTo(projects));
})();
