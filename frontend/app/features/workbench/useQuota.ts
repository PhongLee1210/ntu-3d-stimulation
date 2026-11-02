import { useEffect, useRef, useState } from "react";

import { PROJECTOR_SHARE } from "~/features/projector/projector";

import { claimRefund, fetchQuota } from "./api";
import { QUOTA_VI } from "./copy";
import type { Slip } from "./guess";
import {
  credit,
  loadLedger,
  loadRefundMarks,
  openMode,
  refundClaim,
  remaining,
  resetsAtLabel,
  saveLedger,
  saveRefundMarks,
  shiftCost,
  spend,
  utcDay,
  type OpenMode,
  type Pool,
  type ServerQuota,
} from "./quota";
import { llmCalls, type RunView } from "./run";

export interface QuotaView {
  left: number | null;
  refill: string | null;
  cost: number;
  mode: OpenMode;
  note: string | null;
  pool: Pool;
  awake: boolean;
}

export const WAKE_POLL_MS = 10_000;

const terminal = (run: RunView) => run.phase === "finished" || run.phase === "failed";

export function useQuota({
  levelId,
  cases,
  ours,
  samplesCached,
  slipOf,
  projector = false,
}: {
  levelId: string;
  cases: number;
  ours: RunView | null;
  samplesCached: boolean;
  slipOf: (runId: string) => Slip | null;
  projector?: boolean;
}): QuotaView {
  const pool: Pool = projector ? "projector" : "learner";
  const [server, setServer] = useState<ServerQuota | null>(null);
  const [ledger, setLedger] = useState(() => loadLedger(new Date()));
  const [note, setNote] = useState<string | null>(null);
  const charged = useRef(new Set<string>());
  const claimed = useRef(new Set<string>());

  useEffect(() => {
    const stop = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = async () => {
      const quota = await fetchQuota(stop.signal);
      if (stop.signal.aborted) return;
      setServer(quota);
      if (quota === null && projector) timer = setTimeout(() => void ask(), WAKE_POLL_MS);
    };
    void ask();
    return () => {
      stop.abort();
      clearTimeout(timer);
    };
  }, [projector]);

  useEffect(() => {
    if (ours === null || !terminal(ours) || charged.current.has(ours.runId)) return;
    charged.current.add(ours.runId);
    const calls = ours.scope === "bien_the" ? 0 : llmCalls(ours).real;
    const next = calls > 0 ? spend(loadLedger(new Date()), pool, calls, "level") : null;
    if (next) saveLedger(next);
    void fetchQuota().then((quota) => {
      setServer(quota);
      if (next) setLedger(next);
    });
  }, [ours, pool]);

  useEffect(() => {
    if (projector || ours?.scope !== "mau" || ours.phase !== "finished") return;
    if (claimed.current.has(ours.runId)) return;
    claimed.current.add(ours.runId);
    const marks = loadRefundMarks();
    const today = utcDay(new Date());
    const first = !marks.levels.includes(levelId);
    if (first) saveRefundMarks({ ...marks, levels: [...marks.levels, levelId] });
    if (!refundClaim(ours, slipOf(ours.runId), first, marks.refundedOn === today)) return;
    void claimRefund(ours.runId).then((result) => {
      if (result.ok) {
        saveRefundMarks({ ...loadRefundMarks(), refundedOn: today });
        if (result.refunded === 0) return;
        const next = credit(loadLedger(new Date()), "learner", result.refunded);
        saveLedger(next);
        setLedger(next);
        setNote(QUOTA_VI.refunded(result.refunded));
      } else if (result.code !== null) {
        setNote(result.code === "reserve_empty" ? QUOTA_VI.reserveEmpty : result.message);
      }
    });
  }, [ours, levelId, slipOf, projector]);

  const cost = shiftCost(cases, samplesCached);
  const left = projector
    ? remaining(ledger, pool, PROJECTOR_SHARE, server?.remaining ?? null)
    : server === null
      ? null
      : remaining(ledger, pool, server.learnerDaily, server.remaining);
  return {
    left,
    refill: server === null ? null : resetsAtLabel(server.resetsAt),
    cost,
    mode: left === null ? "shift" : openMode(left, cost),
    note,
    pool,
    awake: server !== null,
  };
}
