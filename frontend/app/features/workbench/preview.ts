import type { BenchRun } from "./run";

export const shouldPreview = (bench: BenchRun): boolean => bench === "none" || bench === "stale";

export function previewableCase(
  followed: string | null,
  cases: readonly { id: string; role: string }[],
  level: { visible_cases: readonly { id: string }[] },
): string | null {
  const sample = cases.find((c) => c.id === followed && c.role === "visible");
  return sample?.id ?? level.visible_cases[0]?.id ?? null;
}
