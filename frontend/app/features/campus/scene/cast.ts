import {
  AnimationClip,
  AnimationMixer,
  Bone,
  BufferAttribute,
  BufferGeometry,
  Color,
  LoopRepeat,
  MathUtils,
  NormalAnimationBlendMode,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  type AnimationAction,
  type AnimationClipJSON,
  type Material,
} from "three";

export const CAST_ROLES = ["player", "lan", "guard", "registrar", "operator", "examiner"] as const;

export const RESERVE_CAST_ROLES = [
  "femaleB",
  "femaleC",
  "femaleE",
  "maleB",
  "maleE",
  "maleF",
] as const;
export type CastRole = (typeof CAST_ROLES)[number];

export const CAST_JOINTS = [
  "root",
  "leg-left",
  "leg-right",
  "torso",
  "arm-left",
  "arm-right",
  "head",
];
export const CAST_PARENTS = [-1, 0, 0, 0, 3, 3, 3];

export const CAST_SCALE = 1.7;

export const CAST_SLOTS = ["keep", "top", "bottom", "accent"] as const;

export interface CastRoleData {
  source: string;
  rest: [number, number, number][];
  position: number[];
  joint: number[];
  slot: number[];
  color: number[];
  index: number[];
}

export type CastClipJson = Omit<AnimationClipJSON, "blendMode">;

export interface CastJson {
  version: 1;
  q: number;
  joints: string[];
  parents: number[];
  roles: Record<CastRole, CastRoleData>;
  clips: CastClipJson[];
}

export interface CastLooks {
  top: Color;
  bottom: Color;
  accent?: Color;
}

export function unpackIndex(packed: readonly number[]): number[] {
  let next = 0;
  return packed.map((e) => {
    const v = next - e;
    if (e === 0) next += 1;
    return v;
  });
}

export const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

export const isNumbers = (a: unknown, length: number): a is number[] =>
  Array.isArray(a) && a.length === length && a.every((x) => Number.isFinite(x));

export const isIndices = (a: unknown, length: number, below: number): a is number[] =>
  isNumbers(a, length) && a.every((x) => Number.isInteger(x) && x >= 0 && x < below);

export function isPackedIndex(packed: unknown, vertices: number): packed is number[] {
  return (
    Array.isArray(packed) &&
    packed.length % 3 === 0 &&
    isIndices(packed, packed.length, Infinity) &&
    isIndices(unpackIndex(packed), packed.length, vertices)
  );
}

function isRole(d: unknown): d is CastRoleData {
  if (!isObject(d) || !Array.isArray(d.joint)) return false;
  const n = d.joint.length;
  return (
    Array.isArray(d.rest) &&
    d.rest.length === CAST_JOINTS.length &&
    d.rest.every((r) => isNumbers(r, 3)) &&
    isNumbers(d.position, n * 3) &&
    isIndices(d.joint, n, CAST_JOINTS.length) &&
    isIndices(d.slot, n, CAST_SLOTS.length) &&
    isNumbers(d.color, n) &&
    isPackedIndex(d.index, n)
  );
}

const isClip = (c: unknown) =>
  isObject(c) &&
  typeof c.name === "string" &&
  typeof c.uuid === "string" &&
  Array.isArray(c.tracks);

export function parseCast(json: unknown): CastJson | null {
  if (!isObject(json) || json.version !== 1) return null;
  const { q, joints, parents, roles, clips } = json;
  const ok =
    typeof q === "number" &&
    Number.isFinite(q) &&
    q > 0 &&
    JSON.stringify(joints) === JSON.stringify(CAST_JOINTS) &&
    JSON.stringify(parents) === JSON.stringify(CAST_PARENTS) &&
    isObject(roles) &&
    CAST_ROLES.every((r) => isRole(roles[r])) &&
    Array.isArray(clips) &&
    clips.every(isClip);
  return ok ? (json as unknown as CastJson) : null;
}

let request: Promise<CastJson | null> | null = null;

export function loadCast(): Promise<CastJson | null> {
  request ??= fetch("/models/cast.json")
    .then((response) => (response.ok ? (response.json() as Promise<unknown>) : null))
    .then(parseCast)
    .catch(() => null)
    .then((cast) => {
      if (!cast) console.warn("cast.json is unavailable; the hub keeps its statues.");
      return cast;
    });
  return request;
}

export function buildFigure(cast: CastJson, role: CastRole, material: Material): SkinnedMesh {
  const d = cast.roles[role];
  const n = d.joint.length;
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(
      Float32Array.from(d.position, (v) => v / cast.q),
      3,
    ),
  );
  const skinIndex = new Uint16Array(n * 4);
  const skinWeight = new Float32Array(n * 4);
  d.joint.forEach((j, i) => {
    skinIndex[i * 4] = j;
    skinWeight[i * 4] = 1;
  });
  geometry.setAttribute("skinIndex", new BufferAttribute(skinIndex, 4));
  geometry.setAttribute("skinWeight", new BufferAttribute(skinWeight, 4));
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(n * 3), 3));
  geometry.setIndex(unpackIndex(d.index));
  geometry.computeVertexNormals();

  const bones = cast.joints.map((name, i) => {
    const bone = new Bone();
    bone.name = name;
    bone.position.fromArray(d.rest[i] ?? [0, 0, 0]);
    return bone;
  });
  cast.parents.forEach((p, i) => {
    const child = bones[i];
    if (p >= 0 && child) bones[p]?.add(child);
  });
  const mesh = new SkinnedMesh(geometry, material);
  const root = bones[0];
  if (root) mesh.add(root);
  mesh.bind(new Skeleton(bones));
  mesh.frustumCulled = false;
  return mesh;
}

export function disposeFigure(mesh: SkinnedMesh): void {
  mesh.geometry.dispose();
  mesh.skeleton.dispose();
}

const hsl = { h: 0, s: 0, l: 0 };
const c = new Color();

export function paintFigure(mesh: SkinnedMesh, data: CastRoleData, looks: CastLooks): void {
  const attr = mesh.geometry.getAttribute("color");
  data.slot.forEach((s, i) => {
    const v = data.color[i] ?? 0;
    if (s === 0) c.setHex(v);
    else {
      const look = s === 1 ? looks.top : s === 2 ? looks.bottom : (looks.accent ?? looks.top);
      look.getHSL(hsl, SRGBColorSpace);
      c.setHSL(hsl.h, hsl.s, MathUtils.clamp(hsl.l + v / 100, 0.04, 0.97), SRGBColorSpace);
    }
    attr.setXYZ(i, c.r, c.g, c.b);
  });
  attr.needsUpdate = true;
}

export function castClips(cast: CastJson): AnimationClip[] {
  return cast.clips.map((clip) =>
    AnimationClip.parse({ ...clip, blendMode: NormalAnimationBlendMode }),
  );
}

export const CAST_CLIPS = ["rest", "walk", "run", "talk", "nod"] as const;
export type CastClip = (typeof CAST_CLIPS)[number];

const FADE = 0.15;
const WALK_STRIDE = 1.56;
const RUN_STRIDE = 2.39;
const RUN_FROM = 2.0;

export interface CastAnim {
  mixer: AnimationMixer;
  actions: Record<CastClip, AnimationAction>;
  current: CastClip;
  left: number;
  fade: number;
}

export function createAnim(mesh: SkinnedMesh, clips: readonly AnimationClip[]): CastAnim {
  const mixer = new AnimationMixer(mesh);
  const action = (name: CastClip) => {
    const clip = clips.find((c) => c.name === name);
    if (!clip) throw new Error(`cast.json has no ${name} clip`);
    return mixer.clipAction(clip);
  };
  const actions = {
    rest: action("rest"),
    walk: action("walk"),
    run: action("run"),
    talk: action("talk"),
    nod: action("nod"),
  };
  actions.rest.play();
  mixer.update(0);
  return { mixer, actions, current: "rest", left: 0, fade: 0 };
}

export function setState(
  a: CastAnim,
  name: CastClip,
  { fade = FADE, times = 1 }: { fade?: number; times?: number } = {},
): void {
  const gesture = name === "talk" || name === "nod";
  if (a.current === name && !gesture) return;
  const next = a.actions[name].reset();
  next.setLoop(LoopRepeat, gesture ? times : Infinity);
  next.play();
  if (a.current !== name) {
    if (fade > 0) a.actions[a.current].crossFadeTo(next, fade, false);
    else a.actions[a.current].stop();
    a.current = name;
    a.fade = fade;
  }
  a.left = gesture ? next.getClip().duration * times - fade : 0;
}

export function updateAnim(a: CastAnim, dt: number, speed: number, reduced: boolean): boolean {
  const fade = reduced ? 0 : FADE;
  if (speed > 0.05) {
    setState(a, speed < RUN_FROM ? "walk" : "run", { fade });
    a.actions[a.current].timeScale = MathUtils.clamp(
      speed / (a.current === "run" ? RUN_STRIDE : WALK_STRIDE),
      0.6,
      1.8,
    );
  } else if (a.current === "walk" || a.current === "run") {
    setState(a, "rest", { fade });
  }
  if (a.left > 0) {
    a.left -= dt;
    if (a.left <= 0) setState(a, "rest", { fade });
  }
  a.mixer.update(dt);
  a.fade = Math.max(0, a.fade - dt);
  return a.current !== "rest" || a.fade > 0;
}
