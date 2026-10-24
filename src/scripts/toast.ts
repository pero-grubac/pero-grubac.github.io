// Shows a message in the toast from components/Toast.astro for a moment.
let timer: number | undefined;

export function toast(message: string) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.dataset.show = "";
  clearTimeout(timer);
  timer = window.setTimeout(() => delete el.dataset.show, 2400);
}
