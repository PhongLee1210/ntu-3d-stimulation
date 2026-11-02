import * as v from "valibot";

import type { Stars } from "~/features/progress/progress";

import type { Env } from "./bench";
import { diffGraphs, type Change } from "./diff";
import { GraphSchema, type Graph } from "./schema";
import type { RunMark } from "./storage";

export type Cell = "pass" | "fail" | "skip";

export interface HistoryRow {
  at: number;
  stars: Stars;
  cells: readonly { n: number; state: Cell }[];
}

export interface HistoryMatrix {
  columns: readonly number[];
  rows: readonly HistoryRow[];
}

export function historyMatrix(runs: readonly RunMark[]): HistoryMatrix {
  const columns = [...new Set(runs.flatMap((r) => r.cases.map((c) => c.n)))].sort((a, b) => a - b);
  const rows = runs.map((run) => {
    const verdict = new Map(run.cases.map((c) => [c.n, c.passed]));
    return {
      at: run.at,
      stars: run.stars,
      cells: columns.map((n) => {
        const passed = verdict.get(n);
        return { n, state: passed === undefined ? "skip" : passed ? "pass" : "fail" } as const;
      }),
    };
  });
  return { columns, rows };
}

export const lastPassing = (runs: readonly RunMark[]): RunMark | null =>
  runs.find((run) => run.stars >= 1) ?? null;

export function compare(
  env: Env,
  prev: RunMark,
  now: RunMark,
): { changes: Change[]; flipped: readonly { n: number; from: boolean; to: boolean }[] } | null {
  const before = parseGraph(prev.body);
  const after = parseGraph(now.body);
  if (before === null || after === null) return null;

  const prevVerdict = new Map(prev.cases.map((c) => [c.n, c.passed]));
  const flipped = now.cases.flatMap((c) => {
    const was = prevVerdict.get(c.n);
    return was === undefined || was === c.passed ? [] : [{ n: c.n, from: was, to: c.passed }];
  });
  return { changes: diffGraphs(env, before, after), flipped };
}

function parseGraph(body: string): Graph | null {
  try {
    const parsed = v.safeParse(GraphSchema, JSON.parse(body));
    return parsed.success ? parsed.output : null;
  } catch {
    return null;
  }
}
