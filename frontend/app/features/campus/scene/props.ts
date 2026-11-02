import { BufferAttribute, BufferGeometry, Color } from "three";

import { isIndices, isNumbers, isObject, isPackedIndex, unpackIndex } from "./cast";

export interface PropData {
  source: string;
  mats: string[];
  base: number[];
  position: number[];
  mat: number[];
  index: number[];
  doubleSided?: true;
}

export interface PropsJson {
  version: 1;
  q: number;
  props: Record<string, PropData>;
}

function isProp(p: unknown): p is PropData {
  if (!isObject(p) || !Array.isArray(p.mat) || !Array.isArray(p.mats)) return false;
  const n = p.mat.length;
  const m = p.mats.length;
  return (
    typeof p.source === "string" &&
    p.mats.every((name) => typeof name === "string") &&
    isNumbers(p.base, m) &&
    isIndices(p.mat, n, m) &&
    isNumbers(p.position, n * 3) &&
    isPackedIndex(p.index, n) &&
    (p.doubleSided === undefined || p.doubleSided === true)
  );
}

export function parseProps(json: unknown): PropsJson | null {
  if (!isObject(json) || json.version !== 1) return null;
  const { q, props } = json;
  const ok =
    typeof q === "number" &&
    Number.isFinite(q) &&
    q > 0 &&
    isObject(props) &&
    Object.values(props).every(isProp);
  return ok ? (json as unknown as PropsJson) : null;
}

export function buildProp(props: PropsJson, data: PropData): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(
      Float32Array.from(data.position, (v) => v / props.q),
      3,
    ),
  );
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(data.mat.length * 3), 3));
  geometry.setIndex(unpackIndex(data.index));
  return geometry;
}

export function baseColors(data: PropData): Color[] {
  return data.base.map((hex) => new Color(hex));
}

export function paintProp(geometry: BufferGeometry, data: PropData, colors: readonly Color[]) {
  const attr = geometry.getAttribute("color");
  data.mat.forEach((m, i) => {
    const color = colors[m];
    if (!color) throw new Error(`prop ${data.source}: no colour for material ${data.mats[m]}`);
    attr.setXYZ(i, color.r, color.g, color.b);
  });
  attr.needsUpdate = true;
}
