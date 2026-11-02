import type { Fact } from "./schema";

type RetrievedItem = Extract<Fact, { kind: "retrieved" }>["items"][number];

export interface Star {
  chunkId: string;
  rank: number;
  score: number;
  dieu: number;
  khoan: readonly number[];
  stale: boolean;
  gold: boolean;
  x: number;
  y: number;
}

export interface Dome {
  stars: readonly Star[];
  missingGold: { rank: number } | null;
}

const SPREAD = (62 * Math.PI) / 180;
const RADIUS = 0.42;
const ORIGIN_X = 0.5;
const ORIGIN_Y = 0.05;

export function starField(
  items: readonly RetrievedItem[],
  goldChunks: readonly string[],
  goldRank: number | null,
): Dome {
  if (items.length === 0) return { stars: [], missingGold: null };

  const stars = items.map((item, index) => {
    const step = Math.ceil(index / 2);
    const side = index % 2 === 1 ? 1 : -1;
    const reach = items.length <= 1 ? 0 : step / Math.ceil((items.length - 1) / 2);
    const angle = reach * SPREAD * side;
    return {
      chunkId: item.chunk_id,
      rank: item.rank,
      score: item.score,
      dieu: item.dieu,
      khoan: item.khoan,
      stale: !item.hieu_luc,
      gold: goldChunks.includes(item.chunk_id),
      x: ORIGIN_X + RADIUS * Math.sin(angle),
      y: ORIGIN_Y + RADIUS * Math.cos(angle),
    };
  });

  const pulled = stars.some((s) => s.gold);
  return { stars, missingGold: goldRank !== null && !pulled ? { rank: goldRank } : null };
}
