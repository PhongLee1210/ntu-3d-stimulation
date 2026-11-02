export interface BinFill {
  docsPct: number;
  queryPct: number;
  overflow: boolean;
  overPct: number;
}

export function binFill({
  docs,
  query,
  total,
  budget,
}: {
  docs: number;
  query: number;
  total: number;
  budget: number;
}): BinFill {
  if (budget <= 0) {
    return { docsPct: total > 0 ? 100 : 0, queryPct: 0, overflow: total > 0, overPct: 0 };
  }
  return {
    docsPct: (docs / budget) * 100,
    queryPct: (query / budget) * 100,
    overflow: total > budget,
    overPct: Math.max(0, ((total - budget) / budget) * 100),
  };
}

export interface DroppedPiece {
  id: string;
  rank: number | null;
}

export function droppedRanks(
  dropped: readonly string[],
  retrieved: readonly { chunk_id: string; rank: number }[],
): { pieces: DroppedPiece[]; range: [number, number] | null } {
  const rank = new Map(retrieved.map((item) => [item.chunk_id, item.rank]));
  const pieces = dropped.map((id) => ({ id, rank: rank.get(id) ?? null }));
  const known = pieces.flatMap((p) => (p.rank === null ? [] : [p.rank]));
  return {
    pieces,
    range: known.length === 0 ? null : [Math.min(...known), Math.max(...known)],
  };
}
