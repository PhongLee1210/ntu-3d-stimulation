import type { Fact } from "./schema";
import type { StepView } from "./run";

type Retrieved = Extract<Fact, { kind: "retrieved" }>;

export interface LedgerRow {
  id: string;
  rank: number | null;
  inBin: boolean;
  cited: boolean;
  ghost: boolean;
}

export interface Ledger {
  rows: LedgerRow[];
  counts: { cited: number; inBin: number; ghost: number };
}

export function packerSaw(
  steps: Readonly<Record<string, StepView>>,
): readonly Retrieved["items"][number][] {
  let last: readonly Retrieved["items"][number][] = [];
  for (const step of Object.values(steps)) {
    for (const fact of step.facts ?? []) {
      if (fact.kind === "retrieved") last = fact.items;
    }
  }
  return last;
}

export function citationLedger(
  retrieved: readonly Retrieved["items"][number][],
  included: readonly string[],
  cited: readonly string[],
): Ledger {
  const bin = new Set(included);
  const said = new Set(cited);
  const ranked = [...retrieved].sort((a, b) => a.rank - b.rank);

  const order: string[] = [];
  const add = (id: string) => {
    if (!order.includes(id)) order.push(id);
  };
  for (const item of ranked) add(item.chunk_id);
  for (const id of included) add(id);
  for (const id of cited) add(id);

  const rank = new Map(ranked.map((item) => [item.chunk_id, item.rank]));
  const rows = order.map((id) => {
    const inBin = bin.has(id);
    const wasCited = said.has(id);
    return { id, rank: rank.get(id) ?? null, inBin, cited: wasCited, ghost: wasCited && !inBin };
  });
  const citedRows = rows.filter((r) => r.cited);
  return {
    rows,
    counts: {
      cited: citedRows.length,
      inBin: citedRows.filter((r) => r.inBin).length,
      ghost: citedRows.filter((r) => r.ghost).length,
    },
  };
}
