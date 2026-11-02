const WIDEST = 1024;
const MAX_CUTS = 24;

export function bladeCuts(avgTokens: number): number[] {
  if (avgTokens <= 0) return [];
  const spacing = (Math.min(avgTokens, WIDEST) / WIDEST) * 100;
  const count = Math.min(Math.ceil(100 / spacing) - 1, MAX_CUTS);
  return Array.from({ length: Math.max(count, 0) }, (_, i) => (i + 1) * spacing);
}
