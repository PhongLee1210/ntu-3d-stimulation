import type { ZoneLocation } from "~/features/zones/schema";

import { DRESSING_BLOCKS } from "./dressing";
import { isBlocked, overlapsBox, PLAYER_RADIUS } from "./movement";

export interface Vec2 {
  x: number;
  z: number;
}

export interface Box {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
}

export interface Site {
  id: ZoneLocation;
  centre: Vec2;
  footprint: Box;
  door: Vec2;
  facing: number;
}

export const BASE = { minX: -14.8, maxX: 14.8, minZ: -21.5, maxZ: 12.6 } as const;
export const WORLD_BOUNDS = { minX: -14, maxX: 14, minZ: -20.7, maxZ: 11 } as const;
export const LAKE = { x: 14.8, z: 12.6, rx: 8.2, rz: 6.8 } as const;
export const GATE = { face: 12.42, back: 11.44, halfWidth: 2.8 } as const;
export const SPAWN: Vec2 = { x: 0, z: -0.8 };
export const PLAZA: Vec2 = { x: 0, z: 5.6 };
export const FOUNTAIN_RADIUS = 1.88;
export const PLAZA_RADIUS = 4.2;
export const FOUNTAIN_WATER = 1.3;

type Rect = readonly [x0: number, x1: number, z0: number, z1: number];
export const PATHS = {
  front: [
    [-3.4, 3.4, -6.0, -1.8],
    [-3.1, -2.0, -1.8, 1.7],
    [2.0, 3.1, -1.8, 1.7],
    [-8.8, -3.4, -3.1, -2.5],
    [3.4, 8.8, -3.1, -2.5],
    [3.6, 7.0, 3.6, 4.2],
  ],
  low: [
    [BASE.minX, 6.6, 10.5, 11.2],
    [-12.8, -6.2, 3.6, 9.4],
  ],
  back: [
    [3.1, 13.1, -0.55, 0.05],
    [12.3, 13.1, -10.25, -0.55],
    [4.1, 13.1, -11.25, -10.25],
    [-9.6, 4.6, -12.95, -12.0],
  ],
} as const satisfies Record<string, readonly Rect[]>;
export const ROSE_BEDS = [0, 1].flatMap((c) =>
  [0, 1, 2].map((r) => [-12.6 + 3.2 * c, 3.85 + 1.85 * r] as const),
);
export const INTERACT_RADIUS = 1.7;

const span = (x0: number, x1: number, z0: number, z1: number): Box => ({
  x: (x0 + x1) / 2,
  z: (z0 + z1) / 2,
  halfX: (x1 - x0) / 2,
  halfZ: (z1 - z0) / 2,
});

export function arcPoint(angle: number, radius: number): Vec2 {
  return { x: PLAZA.x + Math.sin(angle) * radius, z: PLAZA.z - Math.cos(angle) * radius };
}

export const LANDMARK = {
  centre: { x: 0, z: -7.6 },
  footprints: [
    span(-9.75, 9.75, -9.9, -6.0),
    span(-3.15, 3.15, -6.0, -5.15),
    span(-1.7, 1.7, -5.15, -3.55),
  ],
} as const;

export const SITES: readonly Site[] = [
  {
    id: "library",
    centre: { x: -10.6, z: -3.3 },
    footprint: span(-12.4, -8.8, -6.0, -0.6),
    door: { x: -8.2, z: -2.8 },
    facing: Math.PI / 2,
  },
  {
    id: "watchtower",
    centre: { x: 10.4, z: -3.5 },
    footprint: span(8.8, 12.0, -6.0, -1.0),
    door: { x: 8.2, z: -2.8 },
    facing: -Math.PI / 2,
  },
  {
    id: "market",
    centre: { x: 9.0, z: 3.9 },
    footprint: span(7.0, 11.0, 2.6, 5.2),
    door: { x: 6.4, z: 3.9 },
    facing: -Math.PI / 2,
  },
];

export const COLONNADE = { inner: 3.05, outer: 3.75, mid: 3.4 } as const;

export const COLONNADE_COLUMNS: readonly Vec2[] = [-1, 1].flatMap((s) =>
  [0, 1, 2, 3, 4, 5].flatMap((i) => {
    const angle = s * (0.37 + 0.05 * i) * Math.PI;
    return [arcPoint(angle, COLONNADE.inner), arcPoint(angle, COLONNADE.outer)];
  }),
);

export const COLONNADE_PIERS: readonly Vec2[] = [-1, 1].map((s) =>
  arcPoint(s * 0.68 * Math.PI, COLONNADE.mid),
);

const v = (x: number, z: number): Vec2 => ({ x, z });

export const ROUND_TREES: readonly Vec2[] = [
  ...[v(-11.4, -9.0), v(-13.3, -7.4), v(11.4, -9.0), v(13.75, -7.4)],
  ...[v(-13.75, -4.4), v(-13.4, -1.8), v(-13.3, 1.2)],
  ...[v(13.75, -4.4), v(13.75, -1.6), v(12.8, 1.3), v(13.4, 3.7)],
  ...[v(-5.4, 2.4), v(5.6, 1.8), v(-4.9, 0.6), v(5.0, 0.6)],
  ...[v(-4.9, 6.4), v(4.9, 6.4), v(-4.3, 8.9), v(4.3, 8.9)],
  ...[v(-13.4, 4.3), v(-13.4, 7.3), v(-12.8, 9.6), v(-5.6, 9.6)],
];

export const CYPRESS_TREES: readonly Vec2[] = [
  ...[-3.75, 3.75].flatMap((x) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => v(x, -5.6 + 0.8 * k))),
];

export const PARK_TREES: readonly Vec2[] = [
  ...[v(-14.0, -17.3), v(-14.0, -18.8), v(-12.8, -17.3), v(-10.4, -20.3), v(-9.2, -20.3)],
  ...[v(-8.0, -18.8), v(-8.0, -20.3), v(-6.8, -20.3), v(-5.6, -20.3), v(-4.4, -20.3)],
  ...[v(-3.2, -17.3), v(-3.2, -18.8), v(-3.2, -20.3), v(-2.0, -17.3), v(-2.0, -18.8)],
  v(-2.0, -20.3),
];

export const TREES: readonly Vec2[] = [...ROUND_TREES, ...CYPRESS_TREES, ...PARK_TREES];

const shoreZ = (x: number) => LAKE.z - LAKE.rz * Math.sqrt(1 - ((x - LAKE.x) / LAKE.rx) ** 2);
export const LAKE_BLOCKS: readonly Box[] = [7.0, 7.8, 8.6, 9.6, 10.6, 11.6, 12.8].map((x) =>
  span(x, LAKE.x, shoreZ(x), LAKE.z),
);

export const BACK = {
  annex: span(-3.8, 3.8, -11.8, -10.15),
  solarHall: span(-2.6, 2.6, -16.6, -13.1),
  westHall: span(-14.5, -10.3, -16.0, -13.3),
  hall: span(4.2, 9.0, -17.6, -13.1),
  chiller: span(-6.9, -4.0, -18.6, -17.0),
  carports: span(-14.6, -11.6, -12.95, -11.65),
  stand: span(14.2, 14.75, -18.0, -14.2),
} as const satisfies Record<string, Box>;

export const NPC_SPOT: Vec2 = { x: -6.6, z: -2.0 };
export const NPC_TALK_SPOT: Vec2 = { x: -6.6, z: -2.8 };
const NPC_BOX: Box = { ...NPC_SPOT, halfX: 0.3, halfZ: 0.3 };

export type NpcId = "registrar" | "guard" | "examiner" | "operator";
export type Speaker = "lan" | NpcId;
export interface Npc {
  id: NpcId;
  spot: Vec2;
  talk: Vec2;
  yaw: number;
}

export const NPCS: readonly Npc[] = [
  { id: "registrar", spot: v(1.25, -3.0), talk: v(1.25, -2.2), yaw: Math.PI / 4 },
  { id: "guard", spot: v(3.4, 10.85), talk: v(2.6, 10.85), yaw: 0 },
  { id: "examiner", spot: v(8.0, -12.4), talk: v(8.0, -11.6), yaw: Math.PI / 4 },
  { id: "operator", spot: v(-5.45, -15.95), talk: v(-5.45, -15.15), yaw: Math.PI / 4 },
];

const LAN = { id: "lan", spot: NPC_SPOT, talk: NPC_TALK_SPOT } as const;
export const SPEAKERS: readonly { id: Speaker; spot: Vec2; talk: Vec2 }[] = [LAN, ...NPCS];
const speaker = (who: Speaker) => SPEAKERS.find((s) => s.id === who) ?? LAN;
export const speakerSpot = (who: Speaker): Vec2 => speaker(who).spot;
export const talkSpot = (who: Speaker): Vec2 => speaker(who).talk;

export const OBSTACLES: readonly Box[] = [
  ...LANDMARK.footprints,
  ...SITES.map((site) => site.footprint),
  ...[15, 30, 45, 60, 75].map((degrees) => ({
    ...PLAZA,
    halfX: FOUNTAIN_RADIUS * Math.cos((degrees * Math.PI) / 180),
    halfZ: FOUNTAIN_RADIUS * Math.sin((degrees * Math.PI) / 180),
  })),
  ...ROUND_TREES.map((tree) => ({ x: tree.x, z: tree.z, halfX: 0.35, halfZ: 0.35 })),
  ...LAKE_BLOCKS,
  ...Object.values(BACK),
  NPC_BOX,
  ...NPCS.map(({ spot }) => ({ ...spot, halfX: 0.3, halfZ: 0.3 })),
  ...DRESSING_BLOCKS,
];

export const BACK_Z = -10.2;
export const BACK_SPOT: Vec2 = { x: 12.0, z: -12.3 };

const LEG_MARGIN = 0.05;

function crosses(a: Vec2, b: Vec2, box: Box, grow: number): boolean {
  let enter = 0;
  let exit = 1;
  for (const axis of ["x", "z"] as const) {
    const half = (axis === "x" ? box.halfX : box.halfZ) + grow;
    const lo = box[axis] - half - a[axis];
    const hi = box[axis] + half - a[axis];
    const d = b[axis] - a[axis];
    if (d === 0) {
      if (lo >= 0 || hi <= 0) return false;
    } else {
      enter = Math.max(enter, Math.min(lo / d, hi / d));
      exit = Math.min(exit, Math.max(lo / d, hi / d));
    }
  }
  return enter < exit;
}

const clearLeg = (a: Vec2, b: Vec2, margin: number) =>
  !OBSTACLES.some((box) => crosses(a, b, box, PLAYER_RADIUS + margin));

const roomy = (p: Vec2) =>
  !isBlocked(p, [], WORLD_BOUNDS) &&
  !OBSTACLES.some((box) => overlapsBox(p, box, PLAYER_RADIUS + LEG_MARGIN));

const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.z - b.z);

interface Waypoint {
  at: Vec2;
  links: Waypoint[];
}
let graph: Waypoint[] | null = null;

function waypoints(): Waypoint[] {
  if (graph) return graph;
  const grow = PLAYER_RADIUS + LEG_MARGIN + 0.01;
  const nodes = OBSTACLES.flatMap((box) =>
    [-1, 1].flatMap((sx) =>
      [-1, 1].map((sz) => ({
        x: box.x + sx * (box.halfX + grow),
        z: box.z + sz * (box.halfZ + grow),
      })),
    ),
  )
    .filter(roomy)
    .map((at): Waypoint => ({ at, links: [] }));
  for (const a of nodes) a.links = nodes.filter((b) => b !== a && clearLeg(a.at, b.at, LEG_MARGIN));
  graph = nodes;
  return nodes;
}

function nearestRoomy(p: Vec2, h: number, x0: number, x1: number, z0: number, z1: number) {
  let best: Vec2 | null = null;
  let bestDistance = Infinity;
  for (let x = x0; x <= x1; x += h) {
    for (let z = z0; z <= z1; z += h) {
      const q = { x, z };
      if (distance(p, q) < bestDistance && roomy(q)) [best, bestDistance] = [q, distance(p, q)];
    }
  }
  return best;
}

export const HOME_TOWARD: Vec2 = { x: 1, z: 1 };

export function towardFor(yaw: number): Vec2 {
  const x = Math.sin(yaw);
  const z = Math.cos(yaw);
  const m = Math.max(Math.abs(x), Math.abs(z));
  const round = (n: number) => Math.round((n / m) * 1e9) / 1e9 || 0;
  return { x: round(x), z: round(z) };
}

const pastBounds = (p: Vec2, toward: Vec2) =>
  (toward.x > 0 && p.x > WORLD_BOUNDS.maxX) ||
  (toward.x < 0 && p.x < WORLD_BOUNDS.minX) ||
  (toward.z > 0 && p.z > WORLD_BOUNDS.maxZ) ||
  (toward.z < 0 && p.z < WORLD_BOUNDS.minZ);

function standFor(p: Vec2, toward: Vec2): Vec2 {
  if (!OBSTACLES.some((box) => overlapsBox(p, box, 0))) {
    const near = nearestRoomy(p, 0.05, p.x - 1, p.x + 1, p.z - 1, p.z + 1);
    if (near) return near;
  }
  for (let t = 0; ; t += 0.05) {
    const q = { x: p.x + t * toward.x, z: p.z + t * toward.z };
    if (pastBounds(q, toward)) break;
    if (roomy(q)) return q;
  }
  const { minX, maxX, minZ, maxZ } = WORLD_BOUNDS;
  return nearestRoomy(p, 0.25, minX + 0.125, maxX, minZ + 0.125, maxZ) ?? p;
}

export function routeTo(from: Vec2, to: Vec2, toward: Vec2 = HOME_TOWARD): Vec2[] {
  const goal = isBlocked(to, OBSTACLES, WORLD_BOUNDS) ? standFor(to, toward) : to;
  const route = goal === to ? [to] : [goal, to];
  if (clearLeg(from, goal, 0)) return route;
  const nodes = waypoints();
  const start: Waypoint = { at: from, links: nodes.filter((w) => clearLeg(from, w.at, 0)) };
  const last = new Set(nodes.filter((w) => clearLeg(w.at, goal, 0)));
  const cost = new Map<Waypoint, number>([[start, 0]]);
  const back = new Map<Waypoint, Waypoint>();
  const open = new Set([start]);
  let best: Waypoint | null = null;
  let bestCost = Infinity;
  while (open.size > 0) {
    let w = start;
    let c = Infinity;
    for (const o of open) {
      const oc = cost.get(o) ?? Infinity;
      if (oc < c) [w, c] = [o, oc];
    }
    open.delete(w);
    if (c >= bestCost) break;
    if (last.has(w) && c + distance(w.at, goal) < bestCost) {
      best = w;
      bestCost = c + distance(w.at, goal);
    }
    for (const n of w.links) {
      if (c + distance(w.at, n.at) < (cost.get(n) ?? Infinity)) {
        cost.set(n, c + distance(w.at, n.at));
        back.set(n, w);
        open.add(n);
      }
    }
  }
  if (!best) return [to];
  for (let w: Waypoint | undefined = best; w && w !== start; w = back.get(w)) route.unshift(w.at);
  return route;
}

export function siteFor(location: ZoneLocation): Site {
  const site = SITES.find((candidate) => candidate.id === location);
  if (!site) throw new Error(`No campus site for location "${location}".`);
  return site;
}

export function arrivalPose(site: Site): { position: Vec2; heading: number } {
  return {
    position: {
      x: site.door.x + 0.8 * Math.sin(site.facing),
      z: site.door.z + 0.8 * Math.cos(site.facing),
    },
    heading: site.facing,
  };
}

export function parseArrival(value: string | null): Site | null {
  return SITES.find((site) => site.id === value) ?? null;
}

export const SPAWN_HEADING = Math.atan2(NPC_SPOT.x - SPAWN.x, NPC_SPOT.z - SPAWN.z);
