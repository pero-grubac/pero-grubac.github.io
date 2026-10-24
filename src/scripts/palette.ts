// The command palette (REDESIGN.md 8.3); the markup is in
// components/Palette.astro. ⌘K / Ctrl K opens and closes it, even while
// typing, and always calls preventDefault() so the browser's own shortcut
// never fires. A native modal <dialog> traps the focus and Esc closes it.
// The field is a combobox: ↑ ↓ move through the rows, Enter runs one.
import { copyEmail } from "./clipboard";

const dialog = document.getElementById("palette") as HTMLDialogElement;
const input = dialog.querySelector<HTMLInputElement>("[data-pal-q]")!;
const list = dialog.querySelector<HTMLElement>("[data-pal-list]")!;
const rows = [...list.querySelectorAll<HTMLElement>("[data-row]")];
const none = dialog.querySelector<HTMLElement>("[data-pal-none]")!;
const status = dialog.querySelector<HTMLElement>("[data-pal-status]")!;

let shown = rows;
let active = 0;
let opener: HTMLElement | null = null;
/** Set when a row moves to a section of this page: the focus then stays there, not on the opener */
let stay = false;

/**
 * How well `needle` matches `hay` (higher is better, −1 is no match): a
 * plain substring wins, earlier is better; otherwise the needle's letters
 * in order, with runs of adjacent letters counting more.
 */
function fuzzy(needle: string, hay: string): number {
  if (!needle) return 0;
  const at = hay.indexOf(needle);
  if (at >= 0) return 1000 - at;
  let from = 0;
  let score = 0;
  let last = -2;
  for (const ch of needle.replace(/\s+/g, "")) {
    const found = hay.indexOf(ch, from);
    if (found < 0) return -1;
    score += found === last + 1 ? 4 : 1;
    last = found;
    from = found + 1;
  }
  return score;
}

function select(i: number) {
  shown[active]?.setAttribute("aria-selected", "false");
  active = i;
  const row = shown[active];
  if (!row) {
    input.removeAttribute("aria-activedescendant");
    return;
  }
  row.setAttribute("aria-selected", "true");
  row.scrollIntoView({ block: "nearest" });
  input.setAttribute("aria-activedescendant", row.id);
}

/** Shows the rows that match the field, best first (in page order while it's empty). */
function render(announce = false) {
  const query = input.value.trim();
  const needle = query.toLowerCase();
  const scored = rows.map((row, i) => ({ row, i, score: fuzzy(needle, row.dataset.hay!) })).filter((x) => x.score >= 0);
  if (needle) scored.sort((a, b) => b.score - a.score || a.i - b.i);
  shown = scored.map((x) => x.row);
  for (const row of rows) {
    row.hidden = !shown.includes(row);
    row.setAttribute("aria-selected", "false");
  }
  list.replaceChildren(...shown, ...rows.filter((row) => row.hidden));
  list.hidden = shown.length === 0;
  none.hidden = shown.length > 0;
  none.querySelector("[data-pal-none-q]")!.textContent = query;
  list.scrollTop = 0;
  select(0);
  if (announce) status.textContent = shown.length ? `${shown.length} ${shown.length === 1 ? "result" : "results"}` : "No results";
}

function open() {
  if (dialog.open) return;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  input.value = "";
  status.textContent = "";
  render();
  dialog.showModal();
  input.focus();
}

/** Runs a row: copies the email, or lets its link do what links do. */
function run(row: HTMLElement, e: MouseEvent) {
  const modified = e.ctrlKey || e.metaKey || e.shiftKey;
  if (row.dataset.copyEmail) {
    dialog.close();
    copyEmail(row.dataset.copyEmail);
    return;
  }
  // a modified click opens a new tab or window: the palette stays open
  if (modified) return;
  const link = row as HTMLAnchorElement;
  const here = link.target !== "_blank" && link.pathname === location.pathname;
  stay = here;
  dialog.close();
  if (!here) return;
  // The browser gave the focus back to the opener; drop it, so Tab goes on from the section the link scrolls to
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  // A link to this very page would reload it; go to its top instead
  if (!link.hash) {
    e.preventDefault();
    window.scrollTo({ top: 0 });
  }
}

input.addEventListener("input", () => render(true));

input.addEventListener("keydown", (e) => {
  if (e.isComposing) return;
  const n = shown.length;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (n) select((active + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
  } else if (e.key === "Enter") {
    e.preventDefault();
    // a click, so a link follows its href and target as if it were clicked
    shown[active]?.click();
  }
});

list.addEventListener("click", (e) => {
  const row = (e.target as Element).closest<HTMLElement>("[data-row]");
  if (row) run(row, e);
});
// Keep the focus in the field when a row is pressed, so ↑ ↓ keep working
list.addEventListener("mousedown", (e) => e.preventDefault());
list.addEventListener("pointermove", (e) => {
  const row = (e.target as Element).closest<HTMLElement>("[data-row]");
  const i = row ? shown.indexOf(row) : -1;
  if (i >= 0 && i !== active) select(i);
});

// A click on the backdrop closes the palette
dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
// Browsers without the dialog's own focus restoring get it here
dialog.addEventListener("close", () => {
  if (!stay) opener?.focus({ preventScroll: true });
  stay = false;
});

for (const button of document.querySelectorAll<HTMLElement>("[data-palette]")) button.addEventListener("click", open);

document.addEventListener("keydown", (e) => {
  if (e.isComposing || e.altKey || e.shiftKey || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
  e.preventDefault();
  if (dialog.open) dialog.close();
  else open();
});

// Coming back with the back button must not find the palette still open
window.addEventListener("pageshow", () => dialog.open && dialog.close());
