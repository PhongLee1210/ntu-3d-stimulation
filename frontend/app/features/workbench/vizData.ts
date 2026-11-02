export interface VizData {
  corpus: Readonly<Record<string, string>>;
  articles: Readonly<Record<string, readonly [number, number, number][]>>;
  in_force: Readonly<Record<string, boolean>>;
  strips: Readonly<
    Record<string, readonly [string, number, number[], number, number, number, boolean][]>
  >;
  ranks: Readonly<
    Record<string, Readonly<Record<string, readonly [string, number, number, number][]>>>
  >;
}

export interface ArticleRef {
  docId: string;
  dieu: number;
}

export interface ArticleStrip extends ArticleRef {
  start: number;
  end: number;
  text: string;
  inForce: boolean;
  cuts: readonly number[];
}

export function articleStrip(
  data: VizData,
  variant: string,
  docId: string,
  dieu: number,
): ArticleStrip | null {
  const cutList = data.strips[variant];
  const articles = data.articles[docId];
  const text = data.corpus[docId];
  if (cutList === undefined || articles === undefined || text === undefined) return null;
  const found = articles.find((a) => a[0] === dieu);
  if (found === undefined) return null;
  const [, start, end] = found;
  const inside = cutList
    .filter((c) => c[0] === docId && start < c[4] && c[4] < end)
    .map((c) => c[4]);
  return {
    docId,
    dieu,
    start,
    end,
    text: text.slice(start, end),
    inForce: data.in_force[docId] ?? true,
    cuts: [...new Set(inside)].sort((a, b) => a - b),
  };
}

const BOUNDARY = /[.!?;:\n]/;

export interface CutSentence {
  text: string;
  at: number;
}

export function cutSentence(text: string, offset: number, at: number): CutSentence | null {
  const index = at - offset;
  if (index <= 0 || index >= text.length) return null;
  const before = text.slice(0, index);
  const after = text.slice(index);
  if (/[.!?;:\n]\s*$/.test(before) || /^\s*[.!?;:\n]/.test(after)) return null;
  let from = index;
  while (from > 0 && !BOUNDARY.test(text[from - 1] ?? "")) from -= 1;
  let to = index;
  while (to < text.length && !BOUNDARY.test(text[to] ?? "")) to += 1;
  if (to < text.length) to += 1;
  return { text: text.slice(from, to).trim(), at };
}

export function variantKey(params: Readonly<Record<string, unknown>>): string | null {
  const { strategy, chunk_size: size, overlap_pct: overlap } = params;
  if (typeof strategy !== "string" || typeof size !== "number" || typeof overlap !== "number") {
    return null;
  }
  return `${strategy}-${size}-${overlap}`;
}

export function focusArticle(data: VizData, variant: string, caseId: string): ArticleRef | null {
  const top = data.ranks[variant]?.[caseId]?.[0];
  if (top === undefined) return null;
  const [docId, start] = top;
  const found = data.articles[docId]?.find((a) => a[1] <= start && start < a[2]);
  return found === undefined ? null : { docId, dieu: found[0] };
}

export const vizUrl = (levelId: string) => `/viz/${encodeURIComponent(levelId)}.json`;

export function parseViz(levelId: string, levelVersion: number, raw: unknown): VizData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const file = raw as Record<string, unknown>;
  if (file.format !== 1 || file.level !== levelId || file.level_version !== levelVersion) {
    return null;
  }
  const { corpus, articles, in_force: inForce, strips, ranks } = file;
  const parts = [corpus, articles, inForce, strips, ranks];
  if (parts.some((part) => typeof part !== "object" || part === null)) return null;
  return { corpus, articles, in_force: inForce, strips, ranks } as VizData;
}
