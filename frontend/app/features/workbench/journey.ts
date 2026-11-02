export type Move = "start" | "up" | "down" | "same" | "rescaled";

export type Scale = { kind: "corpus" } | { kind: "kept"; size: number | null };

export interface JourneyStep {
  node: string;
  rank: number | null;
  move: Move;
}

const place = (rank: number | null) => rank ?? Number.POSITIVE_INFINITY;

const comparable = (a: Scale | undefined, b: Scale | undefined): boolean => {
  if (a === undefined || b === undefined) return false;
  if (a.kind === "corpus" || b.kind === "corpus") return a.kind === b.kind;
  return a.size !== null && a.size === b.size;
};

export function rankJourney(
  ranks: Readonly<Record<string, number | null>>,
  order: readonly string[],
  scales: Readonly<Record<string, Scale>> = {},
): JourneyStep[] {
  const steps: JourneyStep[] = [];
  for (const node of order) {
    if (!(node in ranks)) continue;
    const rank = ranks[node] ?? null;
    const previous = steps.at(-1);
    const move: Move =
      previous === undefined
        ? "start"
        : !comparable(scales[previous.node], scales[node])
          ? "rescaled"
          : place(rank) < place(previous.rank)
            ? "up"
            : place(rank) > place(previous.rank)
              ? "down"
              : "same";
    steps.push({ node, rank, move });
  }
  return steps;
}
