// Shared content for the three prototypes: the extracted projects plus the
// fields the spec adds (slug, short summary, order, repos/apk/private).
import { readFileSync } from "node:fs";

const raw = JSON.parse(readFileSync(new URL("./projects.raw.json", import.meta.url), "utf8"));

// htmlId on the current site → slug + one-sentence summary (≤ ~70 chars)
const extra = {
  "incident-alert": ["incident-alert", "Citizens report incidents on a map; moderators approve them first."],
  "emobility-hub": ["e-mobility-hub", "Electric vehicle rental platform: four apps on one database."],
  "chat-room": ["chat-room", "Secure forum with two-factor sign-in and TLS on every hop."],
  "online-library": ["online-library-system", "Distributed library platform; each link uses the protocol that fits."],
  "repo-health": ["repohealth", "Scores each of my public repositories from 0 to 100, every week."],
  fitforge: ["fitforge", "Plan weekly workouts, log sets and watch strength grow over time."],
  "store-chain": ["store-chain-management", "Retail chain desktop app; the MySQL database enforces the rules."],
  "etf-oglasi": ["etf-oglasi", "University announcements and schedules, offline. My thesis."],
  "store-management": ["store-management", "Desktop app for a retail store, with admin and cashier roles."],
  "asset-manager": ["asset-manager", "Android app that tracks company assets, who has them and where."],
  devkit: ["devkit", "30 developer tools in one tab; everything runs in the browser."],
  "catan-map-generator": ["catan-map-generator", "Balanced Catan boards from constraint-solving backtracking."],
  "minimal-blog": ["minimal-blog", "Django blog with drafts, publishing and moderated comments."],
  countdown: ["countdown", "Timers to a duration or a date that survive refreshes and sleep."],
  "dev-timeline": ["dev-timeline", "Turns a GitHub profile into a timeline of the languages used."],
  "brick-breaker": ["brick-breaker", "Retro arcade game with 100 levels, 30 power-ups and an editor."],
  snake: ["snake", "Classic Snake for Windows with a second player and a demo bot."],
  "arcane-keep": ["arcane-keep", "Endless tower defense on procedurally generated maps."],
  "monte-carlo-pi-py": ["monte-carlo-pi-python", "Estimates π with NumPy in the browser, a notebook and the CLI."],
  anova: ["anova", "One-factor analysis of variance that updates as you type."],
  "monte-carlo-pi": ["monte-carlo-pi", "Throws random points at a square to estimate π, drawn live."],
  "echo-player": ["echo-player", "Adds a feedback echo to WAV recordings, with a live preview."],
  "secure-repository": ["secure-repository", "Document vault on a private certificate authority."],
  "emobility-rental": ["e-mobility-rental", "Multithreaded simulation of an electric vehicle rental company."],
  "discord-bot": ["git-discord-bot", "Manage GitHub issues and get activity reports from Discord."],
  "github-dashboard": ["github-dashboard", "Terminal-style analytics for any GitHub user, with no backend."],
  "yamb-table": ["yamb-table", "Multiplayer scoresheet for Yamb, Yahtzee and Yatzy."],
  sedmica: ["sedmica", "Scorecard for the card game Sedmica, for 2–4 players."],
  "lora-score-table": ["lora-score-table", "Scorecard for Lora, a four-player card game of seven contracts."],
  "excuse-exe": ["excuse-generator", "One button, one excuse, from 1,600+ in English and 1,250+ in Serbian."],
};

// Architecture lines: no counts next to technologies, each technology once
// (the current site has e.g. "2 × PostgreSQL" and TLS twice for Chat Room).
const flows = {
  "incident-alert": "React apps → ASP.NET services ⇄ RabbitMQ + PostgreSQL",
  "e-mobility-hub": "Angular → Nginx → Spring Boot API + JSP apps → MySQL",
  "chat-room": "React → Nginx → Spring Boot (WAF · SIEM) → MySQL",
  "online-library-system": "Java apps ⇄ REST · TCP/TLS · multicast · MQ · RMI + Redis",
};

export const projects = raw.map((p, i) => {
  const [slug, summary] = extra[p.htmlId];
  const repoLinks = p.links.filter((l) => l.url.startsWith("https://github.com/") && !l.url.includes("/releases/"));
  const apk = p.links.find((l) => l.url.includes("/releases/"));
  const live = p.live ? p.live.replace("https://pero-grubac.github.io/", "/") : undefined;
  return {
    kind: p.kind,
    title: p.title,
    slug,
    summary,
    description: p.description,
    flow: p.flow && flows[slug],
    highlights: p.highlights,
    stack: p.stack,
    links: {
      live: p.live,
      liveShort: live,
      repos: repoLinks.map((l) => ({ label: repoLinks.length > 1 ? l.label : "Source", url: l.url })),
      apk: apk?.url,
      privateRepo: (p.muted || []).some((m) => /private/i.test(m)) || undefined,
    },
    image: p.image ? "../../" + p.image : undefined,
    // Live thumbnails have alt="" on the current site; a neutral alt for the prototypes.
    imageAlt: p.imageAlt || (p.image ? `Screenshot of ${p.title}` : undefined),
    altFromSite: Boolean(p.imageAlt),
    video: p.video ? "../../" + p.video : undefined,
    commands: p.commands?.length ? p.commands : undefined,
    featured: p.kind === "system",
    caseStudy: p.kind === "system",
    order: i + 1,
  };
});

export const systems = projects.filter((p) => p.featured);
export const others = projects.filter((p) => !p.featured);
export const liveApps = projects.filter((p) => p.kind === "live");

// Kind labels in filter order; kinds without projects get no button.
const kindOrder = [
  ["live", "Live"],
  ["web", "Web"],
  ["mobile", "Mobile"],
  ["desktop", "Desktop"],
  ["tool", "Tool"],
];
export const kinds = kindOrder
  .map(([key, label]) => ({ key, label, count: others.filter((p) => p.kind === key).length }))
  .filter((k) => k.count > 0);

export const site = {
  name: "Pero Grubač",
  role: "Backend developer",
  heroLine: "Backend developer in Banja Luka. I build services that talk to each other over queues, sockets and REST.",
  email: "pero.grubac00@gmail.com",
  github: "https://github.com/pero-grubac",
  linkedin: "https://www.linkedin.com/in/perogrubac/",
  avatar: "../../assets/avatar.jpeg",
  about: [
    "I'm a Software Engineering graduate from Trebinje, now based in Banja Luka, with a focus on backend systems. I build reliable, scalable applications, from microservices to mobile apps.",
    "My work spans distributed systems with RabbitMQ and Docker, real-time platforms, REST APIs and full-stack web applications. I'm comfortable across several ecosystems and like picking the right tool for the job.",
    "I work professionally as a backend developer and I'm open to freelance work on backend, API or full-stack projects.",
  ],
  stack: {
    Languages: ["Java", "C#", "Python", "JavaScript", "TypeScript", "Dart"],
    Frameworks: ["Spring Boot", "ASP.NET", "FastAPI", "Flutter", "React", "Angular", "Django", "WPF", "SvelteKit", "Godot"],
    Infrastructure: ["Docker", "RabbitMQ", "PostgreSQL", "MySQL", "Redis", "Nginx", "Canvas", "PWA", "GCP", "Vite", "OpenSSL", "Testcontainers", "Playwright"],
  },
  freelanceLine: "Open to freelance projects, collaborations and interesting opportunities.",
};

// HTML helpers shared by the direction templates
export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const haystack = (p) => [p.title, p.summary, ...p.stack].join(" ").toLowerCase();

// Stack groups for the about section; a term no project matches is shown as plain text
export const stackGroups = Object.entries(site.stack).map(([group, list]) => ({
  group,
  terms: list.map((term) => ({ term, matches: projects.some((p) => haystack(p).includes(term.toLowerCase())) })),
}));
export const kindLabel = (k) => ({ system: "System", live: "Live", web: "Web", mobile: "Mobile", desktop: "Desktop", tool: "Tool" })[k];

// Every project's actions, in the same order everywhere: open app, APK, repos / private label
export function actions(p, cls = "") {
  const out = [];
  if (p.links.live) out.push(`<a class="${cls}" href="${esc(p.links.live)}" target="_blank" rel="noopener" aria-label="Open app: ${esc(p.title)} (opens in a new tab)">Open app</a>`);
  if (p.links.apk) out.push(`<a class="${cls}" href="${esc(p.links.apk)}" target="_blank" rel="noopener" aria-label="Download the APK of ${esc(p.title)}">Download APK</a>`);
  for (const r of p.links.repos) {
    const name = r.label === "Source" ? `Source code for ${p.title}` : `Source code for ${p.title}, ${r.label.toLowerCase()}`;
    const text = r.label === "Source" ? "Source" : `Source: ${r.label}`;
    out.push(`<a class="${cls}" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${esc(name)}">${esc(text)}</a>`);
  }
  if (p.links.privateRepo) out.push(`<span class="${cls} is-muted">Private repo</span>`);
  return out.join("\n");
}

export const caseStudyLink = (p, cls = "") =>
  `<a class="${cls}" href="/projects/${p.slug}/" data-proto="case-study" aria-label="Read the case study: ${esc(p.title)}">Read the case study</a>`;

// Flow strings ("A → B ⇄ C + D") split into nodes and connectors
export function flowParts(flow) {
  return flow.split(/\s*(→|⇄|\+)\s*/).map((t, i) => (i % 2 ? { op: t } : { node: t }));
}
