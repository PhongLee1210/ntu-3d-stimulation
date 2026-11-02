export type StampKind = "brick" | "fake" | "bubble";

export interface StampedPart {
  text: string;
  kind: StampKind;
  ids: string[];
}

const CITE = /\[([A-Za-z0-9_]+)\]/g;
const END = /(?<=[.!?])(?=\s)|\n+/;
const MARKER = /^(?:\d{1,3}[.)]|[-*•])$/;

function sentences(answer: string): string[] {
  const out: string[] = [];
  let marker = "";
  for (const raw of answer.split(END)) {
    const part = raw.trim();
    if (part === "") continue;
    if (MARKER.test(part)) {
      marker = part;
      continue;
    }
    out.push(marker === "" ? part : `${marker} ${part}`);
    marker = "";
  }
  if (marker !== "") out.push(marker);
  return out;
}

export function stampAnswer(answer: string, included: readonly string[]): StampedPart[] {
  const inBin = new Set(included);
  const parts: StampedPart[] = [];
  for (const text of sentences(answer)) {
    const ids = [...text.matchAll(CITE)].map((m) => m[1] ?? "");
    const kind: StampKind =
      ids.length === 0 ? "bubble" : ids.every((id) => inBin.has(id)) ? "brick" : "fake";
    parts.push({ text, kind, ids });
  }
  return parts;
}
