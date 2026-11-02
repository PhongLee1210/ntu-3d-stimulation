import { unfinished, type CaseView, type RunView } from "./run";

export const CONFIDENCE = ["low", "medium", "high"] as const;
export type Confidence = (typeof CONFIDENCE)[number];

export interface Bet {
  pass: boolean;
  confidence: Confidence;
}

export interface Slip {
  passed: number | null;
  failing: readonly number[];
  bets: Readonly<Record<string, Bet>>;
  asks?: Readonly<Record<string, number>>;
}

export const EMPTY_SLIP: Slip = { passed: null, failing: [], bets: {} };

export const isEmptySlip = (slip: Slip) =>
  slip.passed === null &&
  slip.failing.length === 0 &&
  Object.keys(slip.bets).length === 0 &&
  Object.keys(slip.asks ?? {}).length === 0;

export interface Ask {
  id: string;
  legend: string;
  options: readonly string[];
}

export const W1_ATTACKS: readonly string[] = ["wt-w1-t01", "wt-w1-t02", "wt-w1-t03"];

export const ASKS: Readonly<Record<string, readonly Ask[]>> = {
  "direct-injection": [
    {
      id: "net_catches",
      legend: "Lưới chặn được mấy đòn trên 3?",
      options: ["0", "1", "2", "3"],
    },
    {
      id: "blocks_customer",
      legend: "Có khách thật nào bị chặn nhầm không?",
      options: ["Không", "Có"],
    },
  ],
};

const guards = (c: CaseView) =>
  Object.values(c.steps)
    .flatMap((step) => step.facts ?? [])
    .filter((f) => f.kind === "guard");

export function askGrade(levelId: string, id: string, run: RunView): number | null {
  if (run.phase !== "finished" || !ASKS[levelId]?.some((ask) => ask.id === id)) return null;
  if (id === "net_catches") {
    return run.cases.filter(
      (c) =>
        W1_ATTACKS.includes(c.id) &&
        guards(c).some((f) => f.by === "pattern" && f.decision === "block"),
    ).length;
  }
  if (id === "blocks_customer") {
    return run.cases.some((c) => c.graded?.labels.includes("guard.blocked_benign")) ? 1 : 0;
  }
  return null;
}

export interface Prediction {
  c: CaseView;
  pass: boolean;
  right: boolean;
  confidence?: Confidence;
}

export interface SlipGrade {
  count: { guess: number; actual: number; total: number } | null;
  predictions: Prediction[];
  surprises: Prediction[];
  asks: { ask: Ask; guess: number; actual: number }[];
  unfinished: number;
}

export function gradeSlip(slip: Slip, run: RunView, levelId?: string): SlipGrade | null {
  if (run.phase !== "finished") return null;
  const skipped = new Set(unfinished(run).map((c) => c.id));
  const predictions: Prediction[] = [];
  for (const c of run.cases) {
    if (!c.graded || skipped.has(c.id)) continue;
    const bet = slip.bets[c.id];
    const picked = c.role !== "visible" && slip.failing.length > 0;
    if (!bet && !picked) continue;
    const pass = bet ? bet.pass : !slip.failing.includes(c.n);
    predictions.push({
      c,
      pass,
      right: pass === c.graded.passed,
      ...(bet && { confidence: bet.confidence }),
    });
  }
  const graded = run.cases.filter((c) => c.graded?.counted && !skipped.has(c.id));
  const actual = graded.filter((c) => c.graded?.passed).length;
  return {
    count: slip.passed === null ? null : { guess: slip.passed, actual, total: graded.length },
    predictions,
    surprises: predictions.filter((p) => p.confidence === "high" && !p.right),
    asks: (levelId ? (ASKS[levelId] ?? []) : []).flatMap((ask) => {
      const guess = slip.asks?.[ask.id];
      const actual = askGrade(levelId ?? "", ask.id, run);
      return guess === undefined || actual === null ? [] : [{ ask, guess, actual }];
    }),
    unfinished: skipped.size,
  };
}

export type Why = "no_docs" | "cite" | "trap" | "budget";

const hasDocs = (c: CaseView) =>
  Object.values(c.steps).some((step) =>
    step.facts?.some((fact) => fact.kind === "pack" && fact.tokens.docs > 0),
  );

export function whyCase(run: RunView): { why: Why; c: CaseView | null } | null {
  if (run.phase !== "finished" || !run.score) return null;
  const skipped = new Set(unfinished(run).map((c) => c.id));
  for (const c of run.cases) {
    const g = c.graded;
    if (!g?.counted || g.passed || skipped.has(c.id)) continue;
    if (c.role === "trap") return { why: "trap", c };
    if (g.criteria.points === true && g.criteria.cited === false) return { why: "cite", c };
    if (!hasDocs(c)) return { why: "no_docs", c };
  }
  return run.score.s2 ? null : { why: "budget", c: null };
}
