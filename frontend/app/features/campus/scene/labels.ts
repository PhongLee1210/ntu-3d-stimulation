import { speakerSpot, type Speaker } from "../layout";

const badge = (who: Speaker) => [speakerSpot(who).x, 1.85, speakerSpot(who).z] as const;

export const LABEL_ANCHORS = {
  library: [-10.8, 2.9, -3.3],
  watchtower: [10.6, 6.6, -4.8],
  market: [9.0, 2.9, 3.9],
  lan: badge("lan"),
  registrar: badge("registrar"),
  guard: badge("guard"),
  examiner: badge("examiner"),
  operator: badge("operator"),
} as const satisfies Record<string, readonly [number, number, number]>;

export type LabelId = keyof typeof LABEL_ANCHORS;

export const labelElements = new Map<LabelId, HTMLElement>();

export const labelWidths = new Map<LabelId, number>();

export const viewNeedle: { element: SVGGElement | null } = { element: null };
