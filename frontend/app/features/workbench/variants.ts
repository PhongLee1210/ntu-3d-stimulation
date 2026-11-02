import * as v from "valibot";

import type { TargetKey } from "./hints";

const VARIANTS: Readonly<Record<string, Partial<Record<TargetKey, readonly string[]>>>> = {
  "grounded-citation": {
    s1: ["lib-l1-r01", "lib-l1-r04"],
    s1_source: ["lib-l1-r01", "lib-l1-r04"],
    s3: ["lib-l1-r02", "lib-l1-r03"],
  },
  "chunk-tuning": {
    s1: ["lib-l2-r01", "lib-l2-r03"],
    s3: ["lib-l2-r02", "lib-l2-r04"],
  },
  "article-number-lookup": {
    s1: ["lib-l3-r01", "lib-l3-r02", "lib-l3-r04"],
    s3_t01: ["lib-l3-r02"],
    s2: ["lib-l3-r03"],
  },
};

export function pickVariant(
  levelId: string,
  target: TargetKey,
  seen: Readonly<Record<string, number>>,
): string | null {
  const cases = VARIANTS[levelId]?.[target];
  if (!cases || cases.length === 0) return null;
  return cases.reduce((best, id) => ((seen[id] ?? 0) < (seen[best] ?? 0) ? id : best));
}

const key = (levelId: string) => `vg.variants.v1.${levelId}`;
const SeenSchema = v.record(v.string(), v.pipe(v.number(), v.integer(), v.minValue(0)));

export function loadSeen(levelId: string): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(key(levelId));
    const json: unknown = raw === null ? null : JSON.parse(raw);
    if (Array.isArray(json)) return {};
    const parsed = v.safeParse(SeenSchema, json);
    return parsed.success ? parsed.output : {};
  } catch {
    return {};
  }
}

export function markSeen(levelId: string, caseId: string): void {
  const seen = loadSeen(levelId);
  try {
    window.localStorage.setItem(
      key(levelId),
      JSON.stringify({ ...seen, [caseId]: (seen[caseId] ?? 0) + 1 }),
    );
  } catch {}
}
