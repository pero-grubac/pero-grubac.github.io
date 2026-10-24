// Read-side helpers for the projects collection. Every count and list the
// pages show is computed here from the content, never typed by hand.
import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">["data"];
export type Kind = Project["kind"];

/** All projects in `order`, the order every list on the site keeps. */
export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection("projects");
  return entries.map((e) => e.data).sort((a, b) => a.order - b.order);
}

/** Singular and plural nouns per kind, for counts and messages. */
export const KIND_NOUNS: Record<Kind, readonly [string, string]> = {
  system: ["system", "systems"],
  live: ["live app", "live apps"],
  web: ["web project", "web projects"],
  mobile: ["mobile app", "mobile apps"],
  desktop: ["desktop app", "desktop apps"],
  tool: ["tool", "tools"],
};

/** Filter buttons in this order; systems have none (7.4). */
const FILTER_KINDS = [
  ["live", "Live"],
  ["web", "Web"],
  ["mobile", "Mobile"],
  ["desktop", "Desktop"],
  ["tool", "Tool"],
] as const;

export interface KindCount {
  kind: Kind;
  label: string;
  count: number;
}

/** One entry per kind that has projects, with its count. */
export function kindCounts(projects: Project[]): KindCount[] {
  return FILTER_KINDS.map(([kind, label]) => ({ kind, label, count: projects.filter((p) => p.kind === kind).length })).filter(
    (k) => k.count > 0
  );
}

/** "1 tool", "13 live apps" */
export function countOf(n: number, kind: Kind): string {
  const [one, many] = KIND_NOUNS[kind];
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * What the index search matches against: title, summary and stack,
 * lower-cased. Fields are joined with a newline, which a search box can't
 * contain, so a query never matches across two fields.
 */
export function haystack(p: Project): string {
  return [p.title, p.summary, ...p.stack].join("\n").toLowerCase();
}

/**
 * A technology picked from a list (the stack in About) matches exactly:
 * only projects whose stack has it, so "Java" doesn't find JavaScript.
 * Typed searches match any part of the haystack instead.
 */
export function stackKey(p: Project): string {
  return p.stack.join("\n").toLowerCase();
}

/** The same test the browser runs on `data-stack` (scripts/project-index.ts). */
export function builtWith(p: Project, tech: string): boolean {
  return stackKey(p).split("\n").includes(tech.toLowerCase());
}

/** "A, B and C" */
export function listOf(items: readonly string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** Splits a flow line ("A → B ⇄ C + D") into nodes and the arrows between them. */
export function flowParts(flow: string): { text: string; op: boolean }[] {
  return flow.split(/\s*(→|⇄|\+)\s*/).map((text, i) => ({ text, op: i % 2 === 1 }));
}
