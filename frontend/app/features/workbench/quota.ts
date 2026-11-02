import * as v from "valibot";

import type { Slip } from "./guess";
import { sampleVerdict, type RunView } from "./run";

export type Pool = "learner" | "projector";
export type Spend = "level" | "shift";

export interface Ledger {
  day: string;
  pools: Record<Pool, { used: number; refunded: number }>;
  spent: Record<Spend, number>;
}

export const SAMPLE_CALLS = 3;

const LEDGER_KEY = "vg.quota.v1";
const REFUND_KEY = "vg.refund.v1";

export const utcDay = (now: Date) => now.toISOString().slice(0, 10);

const Count = v.pipe(v.number(), v.integer(), v.minValue(0));
const PoolSchema = v.object({ used: Count, refunded: Count });
const LedgerSchema = v.object({
  day: v.string(),
  pools: v.object({ learner: PoolSchema, projector: PoolSchema }),
  spent: v.object({ level: Count, shift: Count }),
});

const fresh = (day: string): Ledger => ({
  day,
  pools: { learner: { used: 0, refunded: 0 }, projector: { used: 0, refunded: 0 } },
  spent: { level: 0, shift: 0 },
});

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadLedger(now: Date): Ledger {
  const day = utcDay(now);
  const parsed = v.safeParse(LedgerSchema, readJson(LEDGER_KEY));
  return parsed.success && parsed.output.day === day ? parsed.output : fresh(day);
}

export const saveLedger = (ledger: Ledger) => writeJson(LEDGER_KEY, ledger);

export function spend(ledger: Ledger, pool: Pool, calls: number, what: Spend): Ledger {
  const p = ledger.pools[pool];
  return {
    ...ledger,
    pools: { ...ledger.pools, [pool]: { ...p, used: p.used + calls } },
    spent: { ...ledger.spent, [what]: ledger.spent[what] + calls },
  };
}

export function credit(ledger: Ledger, pool: Pool, calls: number): Ledger {
  const p = ledger.pools[pool];
  return { ...ledger, pools: { ...ledger.pools, [pool]: { ...p, refunded: p.refunded + calls } } };
}

export function remaining(ledger: Ledger, pool: Pool, share: number, server: number | null) {
  const p = ledger.pools[pool];
  const mine = Math.max(0, share - p.used + p.refunded);
  return server === null ? mine : Math.max(0, Math.min(mine, server));
}

export const shiftCost = (cases: number, samplesCached: boolean) =>
  samplesCached ? cases - SAMPLE_CALLS : cases;

export type OpenMode = "shift" | "sample" | "recorded";

export function openMode(left: number, cost: number): OpenMode {
  if (left >= cost) return "shift";
  return left >= SAMPLE_CALLS ? "sample" : "recorded";
}

const QuotaSchema = v.object({
  remaining: Count,
  resets_at: v.string(),
  learner_daily: Count,
});

export interface ServerQuota {
  remaining: number;
  resetsAt: string;
  learnerDaily: number;
}

export function parseQuota(raw: unknown): ServerQuota | null {
  const parsed = v.safeParse(QuotaSchema, raw);
  if (!parsed.success) return null;
  const { remaining, resets_at, learner_daily } = parsed.output;
  return { remaining, resetsAt: resets_at, learnerDaily: learner_daily };
}

export function resetsAtLabel(at: string): string | null {
  const when = new Date(at);
  if (Number.isNaN(when.getTime())) return null;
  return `${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`;
}

export interface RefundMarks {
  levels: string[];
  refundedOn: string | null;
}

const RefundSchema = v.object({ levels: v.array(v.string()), refundedOn: v.nullable(v.string()) });

export function loadRefundMarks(): RefundMarks {
  const parsed = v.safeParse(RefundSchema, readJson(REFUND_KEY));
  return parsed.success ? parsed.output : { levels: [], refundedOn: null };
}

export const saveRefundMarks = (marks: RefundMarks) => writeJson(REFUND_KEY, marks);

export function refundClaim(
  run: RunView,
  slip: Slip | null,
  firstSample: boolean,
  refundedToday: boolean,
): boolean {
  if (!firstSample || refundedToday || slip === null) return false;
  if (sampleVerdict(run) !== "passed") return false;
  return run.cases.every((c) => {
    const bet = slip.bets[c.id];
    return bet?.confidence === "high" && bet.pass === c.graded?.passed;
  });
}
