import * as v from "valibot";

import { benchFromGraph, type Bench, type Env } from "./bench";
import { CONFIDENCE, EMPTY_SLIP, isEmptySlip, type Slip } from "./guess";
import { GraphSchema, type Graph } from "./schema";

const key = (levelId: string) => `vg.bench.v1.${levelId}`;
const SavedSchema = v.object({ version: v.number(), graph: GraphSchema });

export interface Saved {
  bench: Bench | null;
  discarded: boolean;
}

export function loadSaved(env: Env): Saved {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key(env.level.id));
  } catch {
    return { bench: null, discarded: false };
  }
  if (raw === null) return { bench: null, discarded: false };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { bench: null, discarded: true };
  }
  const parsed = v.safeParse(SavedSchema, json);
  if (!parsed.success || parsed.output.version !== env.level.version) {
    return { bench: null, discarded: true };
  }
  const bench = benchFromGraph(env, parsed.output.graph);
  return { bench, discarded: bench === null };
}

export function save(levelId: string, version: number, graph: Graph): boolean {
  try {
    window.localStorage.setItem(key(levelId), JSON.stringify({ version, graph }));
    return true;
  } catch {
    return false;
  }
}

const slipKey = (levelId: string) => `vg.guess.v1.${levelId}`;
const Count = v.pipe(v.number(), v.integer(), v.minValue(0));
const SlipSchema = v.object({
  passed: v.nullable(Count),
  failing: v.array(Count),
  bets: v.record(v.string(), v.object({ pass: v.boolean(), confidence: v.picklist(CONFIDENCE) })),
  asks: v.optional(v.record(v.string(), Count)),
});

export function loadSlip(levelId: string): Slip {
  try {
    const raw = window.localStorage.getItem(slipKey(levelId));
    const parsed = raw === null ? null : v.safeParse(SlipSchema, JSON.parse(raw));
    if (!parsed?.success) return EMPTY_SLIP;
    const { asks, ...rest } = parsed.output;
    return asks === undefined ? rest : { ...rest, asks };
  } catch {
    return EMPTY_SLIP;
  }
}

export function saveSlip(levelId: string, slip: Slip): void {
  try {
    if (isEmptySlip(slip)) window.localStorage.removeItem(slipKey(levelId));
    else window.localStorage.setItem(slipKey(levelId), JSON.stringify(slip));
  } catch {}
}

const historyKey = (levelId: string) => `vg.history.v1.${levelId}`;
const KEEP = 5;

const NextPickSchema = v.object({
  type: v.string(),
  param: v.optional(v.string()),
  slot: v.optional(v.picklist([0, 1, 2])),
  direction: v.picklist(["on", "off", "up", "down", "add", "remove"]),
});

const MarkSchema = v.object({
  body: v.string(),
  at: v.pipe(v.number(), v.integer(), v.minValue(0)),
  stars: v.picklist([0, 1, 2, 3]),
  tokens: Count,
  budget: Count,
  cases: v.array(
    v.object({
      n: Count,
      role: v.picklist(["visible", "hidden", "trap", "review"]),
      passed: v.boolean(),
    }),
  ),
  why: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  next: v.optional(NextPickSchema),
});
const HistorySchema = v.object({ runs: v.array(MarkSchema) });

export type RunMark = v.InferOutput<typeof MarkSchema>;

export function loadHistory(levelId: string): RunMark[] {
  try {
    const raw = window.localStorage.getItem(historyKey(levelId));
    const parsed = raw === null ? null : v.safeParse(HistorySchema, JSON.parse(raw));
    return parsed?.success ? parsed.output.runs : [];
  } catch {
    return [];
  }
}

export function recordRun(levelId: string, mark: RunMark): void {
  try {
    const runs = [mark, ...loadHistory(levelId)].slice(0, KEEP);
    window.localStorage.setItem(historyKey(levelId), JSON.stringify({ runs }));
  } catch {}
}

export function recordExtras(
  levelId: string,
  extras: { why?: number; next?: RunMark["next"] },
): void {
  try {
    const [latest, ...rest] = loadHistory(levelId);
    if (latest === undefined) return;
    const runs = [{ ...latest, ...extras }, ...rest];
    window.localStorage.setItem(historyKey(levelId), JSON.stringify({ runs }));
  } catch {}
}
