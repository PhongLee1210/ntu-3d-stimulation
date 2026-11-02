import {
  parseEvent,
  type CaseRole,
  type EventType,
  type Fact,
  type RunEvent,
  type RunReport,
  type StarResult,
} from "./schema";

type LlmFact = Extract<Fact, { kind: "llm" }>;

export type StreamState = "connecting" | "live" | "reconnecting" | "lost" | "closed";
export type Phase = "waiting" | "running" | "scored" | "finished" | "failed";

export interface StepView {
  block: string;
  state: "running" | "done";
  status?: string;
  summary?: string;
  ms?: number;
  tokens?: { in: number; out: number };
  facts?: Fact[];
}

export interface CaseView {
  id: string;
  n: number;
  role: CaseRole;
  vai: string;
  question?: string;
  state: "waiting" | "running" | "graded";
  steps: Readonly<Record<string, StepView>>;
  tokens: { in: number; out: number };
  answer?: string;
  graded?: {
    status: string;
    passed: boolean;
    counted: boolean;
    reason?: "daily_cap";
    criteria: Readonly<Record<string, boolean>>;
    labels: readonly string[];
  };
}

export interface RunView {
  runId: string;
  lastSeq: number;
  stream: StreamState;
  phase: Phase;
  cases: readonly CaseView[];
  ingestion: readonly { node: string; variant: string; chunks: number; avg_tokens: number }[];
  scope?: "mau" | "da_ghi" | "bien_the";
  score?: StarResult;
  report?: RunReport;
  models?: Readonly<Record<string, number>>;
  primaryModel?: string;
  failure?: { code: string; message_vi: string };
}

export type RunAction =
  | { kind: "reset"; runId: string }
  | { kind: "clear" }
  | { kind: "stream"; state: "connecting" | "live" | "reconnecting" | "lost" }
  | { kind: "event"; seq: number; event: RunEvent };

export const isActive = (run: RunView | null) =>
  run !== null && (run.phase === "waiting" || run.phase === "running" || run.phase === "scored");

function updateCase(run: RunView, id: string, update: (c: CaseView) => CaseView): RunView {
  return { ...run, cases: run.cases.map((c) => (c.id === id ? update(c) : c)) };
}

function apply(run: RunView, event: RunEvent): RunView {
  switch (event.type) {
    case "run.started": {
      const scope = event.scope;
      const started: RunView = {
        ...run,
        phase: "running",
        ingestion: event.ingestion,
        cases: event.cases.map((c, index) => ({
          id: c.id,
          n: index + 1,
          role: c.role,
          vai: c.vai,
          ...(c.question === undefined ? {} : { question: c.question }),
          state: "waiting",
          steps: {},
          tokens: { in: 0, out: 0 },
        })),
      };
      return scope === undefined ? started : { ...started, scope };
    }
    case "step.started":
      return updateCase(run, event.case, (c) => ({
        ...c,
        state: c.state === "graded" ? c.state : "running",
        steps: { ...c.steps, [event.node]: { block: event.block, state: "running" } },
      }));
    case "step.finished":
      return updateCase(run, event.case, (c) => {
        const answer = event.facts.find((fact): fact is LlmFact => fact.kind === "llm")?.answer;
        return {
          ...c,
          steps: {
            ...c.steps,
            [event.node]: {
              block: event.block,
              state: "done",
              status: event.status,
              summary: event.summary,
              ms: event.ms,
              tokens: event.tokens,
              facts: event.facts,
            },
          },
          tokens: { in: c.tokens.in + event.tokens.in, out: c.tokens.out + event.tokens.out },
          ...(answer === undefined ? {} : { answer }),
        };
      });
    case "case.graded":
      return updateCase(run, event.case, (c) => ({
        ...c,
        state: "graded",
        graded: {
          status: event.status,
          passed: event.passed,
          counted: event.counted,
          criteria: event.criteria,
          labels: event.labels,
          ...(event.reason === undefined ? {} : { reason: event.reason }),
        },
      }));
    case "run.scored":
      return { ...run, phase: "scored", score: event.score };
    case "run.finished":
      return {
        ...run,
        phase: "finished",
        stream: "closed",
        report: event.report,
        models: event.models,
        ...(event.primary_model === undefined ? {} : { primaryModel: event.primary_model }),
      };
    case "run.failed":
      return {
        ...run,
        phase: "failed",
        stream: "closed",
        failure: { code: event.code, message_vi: event.message_vi },
      };
  }
}

export function runReducer(run: RunView | null, action: RunAction): RunView | null {
  if (action.kind === "reset") {
    return {
      runId: action.runId,
      lastSeq: 0,
      stream: "connecting",
      phase: "waiting",
      cases: [],
      ingestion: [],
    };
  }
  if (run === null || action.kind === "clear") return null;
  if (action.kind === "stream") {
    return run.stream === "closed" ? run : { ...run, stream: action.state };
  }
  if (!Number.isFinite(action.seq) || action.seq <= run.lastSeq) return run;
  return { ...apply(run, action.event), lastSeq: action.seq };
}

const ENDINGS = new Set<EventType>(["run.scored", "run.finished", "run.failed"]);

export function frameAction(
  type: EventType,
  data: string,
  seq: number,
): Extract<RunAction, { kind: "event" }> | null {
  const event = parseEvent(type, data);
  if (event) return { kind: "event", seq, event };
  if (!ENDINGS.has(type)) return null;
  return {
    kind: "event",
    seq,
    event: {
      type: "run.failed",
      code: "internal",
      message_vi: "Máy chủ trả kết quả mà bàn thợ không đọc được.",
    },
  };
}

export const runningNodes = (c: CaseView) =>
  Object.entries(c.steps).flatMap(([node, step]) => (step.state === "running" ? [node] : []));

export function caseModel(c: CaseView): { model: string; replayed: boolean } | null {
  for (const step of Object.values(c.steps)) {
    for (const fact of step.facts ?? []) {
      if (fact.kind === "llm") return { model: fact.model, replayed: fact.replayed };
    }
  }
  return null;
}

export function fallbackAnswers(run: RunView): { fallback: number; answered: number } {
  let fallback = 0;
  let answered = 0;
  for (const c of run.cases) {
    const served = caseModel(c);
    if (served === null) continue;
    answered += 1;
    if (run.primaryModel !== undefined && served.model !== run.primaryModel) fallback += 1;
  }
  return { fallback, answered };
}

export function llmCalls(run: RunView): { real: number; replayed: number } {
  let real = 0;
  let replayed = 0;
  for (const c of run.cases) {
    for (const step of Object.values(c.steps)) {
      for (const fact of step.facts ?? []) {
        if (fact.kind !== "llm") continue;
        if (fact.replayed) replayed += 1;
        else real += 1;
      }
    }
  }
  return { real, replayed };
}

export function outTokenSpread(run: RunView): { low: number; high: number; cases: number } | null {
  const out = run.cases.flatMap((c) => (caseModel(c) === null ? [] : [c.tokens.out]));
  if (out.length === 0) return null;
  return { low: Math.min(...out), high: Math.max(...out), cases: out.length };
}

export const cappedRun = (run: RunView | null): boolean =>
  run?.cases.some((c) => c.graded?.reason === "daily_cap") ?? false;

export function sampleVerdict(run: RunView | null): "passed" | "failed" | "capped" | null {
  if (run?.scope !== "mau" || run.phase !== "finished") return null;
  if (cappedRun(run)) return "capped";
  return run.cases.every((c) => c.graded?.passed === true) ? "passed" : "failed";
}

const NOT_YOUR_FAULT = new Set(["skipped_budget", "llm_error", "timeout"]);
export const unfinished = (run: RunView) =>
  run.cases.filter((c) => c.graded && NOT_YOUR_FAULT.has(c.graded.status));

export type BenchRun = "none" | "stale" | "active" | "done";
export type BlockState = "idle" | "stale" | "queued" | "running" | "passed" | "error";

export function blockState(
  bench: BenchRun,
  step: StepView | undefined,
  { started, ingest, failedAnswer }: { started: boolean; ingest: boolean; failedAnswer: boolean },
): BlockState {
  if (bench === "none") return "idle";
  if (bench === "stale") return "stale";
  if (ingest) return started ? "passed" : bench === "active" ? "queued" : "idle";
  if (step?.state === "running") return "running";
  if (step) return step.status === "ok" && !failedAnswer ? "passed" : "error";
  return bench === "active" ? "queued" : "idle";
}
