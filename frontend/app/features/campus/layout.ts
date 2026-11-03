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
  tierId?: string;
}

export const DEFAULT_TIER_ID = "ground";

export function tierIdOf(box: Box): string {
  return box.tierId ?? DEFAULT_TIER_ID;
}

export interface Site {
  id: ZoneLocation;
  centre: Vec2;
  footprint: Box;
  door: Vec2;
  facing: number;
}

export interface TerrainTier {
  id: string;
  elevationY: number;
  bounds: Box;
}

export interface StairCrossing {
  tierA: string;
  tierB: string;
  pointOnA: Vec2;
  pointOnB: Vec2;
  margin: number;
}

export type NpcId = "registrar" | "guard" | "examiner" | "operator";
export type Speaker = "lan" | NpcId;
export interface Npc {
  id: NpcId;
  spot: Vec2;
  talk: Vec2;
  yaw: number;
}

const span = (x0: number, x1: number, z0: number, z1: number): Box => ({
  x: (x0 + x1) / 2,
  z: (z0 + z1) / 2,
  halfX: (x1 - x0) / 2,
  halfZ: (z1 - z0) / 2,
});

const v = (x: number, z: number): Vec2 => ({ x, z });
const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.z - b.z);

export function crossingConnects(point: Vec2, crossing: StairCrossing): boolean {
  return (
    distance(point, crossing.pointOnA) <= crossing.margin ||
    distance(point, crossing.pointOnB) <= crossing.margin
  );
}

export const HOME_TOWARD: Vec2 = { x: 1, z: 1 };

export function towardFor(yaw: number): Vec2 {
  const x = Math.sin(yaw);
  const z = Math.cos(yaw);
  const m = Math.max(Math.abs(x), Math.abs(z));
  const round = (n: number) => Math.round((n / m) * 1e9) / 1e9 || 0;
  return { x: round(x), z: round(z) };
}

type Rect = readonly [x0: number, x1: number, z0: number, z1: number];

export interface CampusLayout {
  base: { minX: number; maxX: number; minZ: number; maxZ: number };
  worldBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  terrainTiers: readonly TerrainTier[];
  stairCrossings: readonly StairCrossing[];
  lake: { x: number; z: number; rx: number; rz: number };
  gate: { face: number; back: number; halfWidth: number };
  spawn: Vec2;
  plaza: Vec2;
  fountainRadius: number;
  plazaRadius: number;
  fountainWater: number;
  paths: { front: readonly Rect[]; low: readonly Rect[]; back: readonly Rect[] };
  roseBeds: readonly (readonly [number, number])[];
  interactRadius: number;
  landmark: { centre: Vec2; footprints: readonly Box[] };
  sites: readonly Site[];
  colonnade: { inner: number; outer: number; mid: number };
  colonnadeColumns: readonly Vec2[];
  colonnadePiers: readonly Vec2[];
  statues: readonly Vec2[];
  roundTrees: readonly Vec2[];
  cypressTrees: readonly Vec2[];
  parkTrees: readonly Vec2[];
  trees: readonly Vec2[];
  lakeBlocks: readonly Box[];
  back: {
    annex: Box;
    solarHall: Box;
    westHall: Box;
    hall: Box;
    chiller: Box;
    carports: Box;
    stand: Box;
  };
  npcSpot: Vec2;
  npcTalkSpot: Vec2;
  npcs: readonly Npc[];
  speakers: readonly { id: Speaker; spot: Vec2; talk: Vec2 }[];
  obstacles: readonly Box[];
  backZ: number;
  backSpot: Vec2;
  spawnHeading: number;
  arcPoint: (angle: number, radius: number) => Vec2;
  routeTo: (from: Vec2, to: Vec2, toward?: Vec2) => Vec2[];
  siteFor: (location: ZoneLocation) => Site;
  arrivalPose: (site: Site) => { position: Vec2; heading: number };
  parseArrival: (value: string | null) => Site | null;
  speakerSpot: (who: Speaker) => Vec2;
  talkSpot: (who: Speaker) => Vec2;
}

interface RouteGraphInput {
  obstacles: readonly Box[];
  worldBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  terrainTiers: readonly TerrainTier[];
  stairCrossings: readonly StairCrossing[];
}

export function buildRouteGraph({
  obstacles,
  worldBounds,
  terrainTiers,
  stairCrossings,
}: RouteGraphInput): { routeTo: (from: Vec2, to: Vec2, toward?: Vec2) => Vec2[] } {
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

  const clearLeg = (a: Vec2, b: Vec2, margin: number, blockers: readonly Box[] = obstacles) =>
    !blockers.some((box) => crosses(a, b, box, PLAYER_RADIUS + margin));

  const roomy = (p: Vec2, blockers: readonly Box[] = obstacles) =>
    !isBlocked(p, [], worldBounds) &&
    !blockers.some((box) => overlapsBox(p, box, PLAYER_RADIUS + LEG_MARGIN));

  const obstaclesByTier = new Map<string, readonly Box[]>();
  function obstaclesOnTier(tierId: string): readonly Box[] {
    let onTier = obstaclesByTier.get(tierId);
    if (!onTier) {
      onTier = obstacles.filter((box) => tierIdOf(box) === tierId);
      obstaclesByTier.set(tierId, onTier);
    }
    return onTier;
  }

  function containsPoint(p: Vec2, box: Box): boolean {
    return Math.abs(p.x - box.x) <= box.halfX && Math.abs(p.z - box.z) <= box.halfZ;
  }

  function tierOf(p: Vec2): string {
    const tier = terrainTiers.find((candidate) => containsPoint(p, candidate.bounds));
    return tier?.id ?? terrainTiers[0]?.id ?? DEFAULT_TIER_ID;
  }

  function crossingLinks(a: Waypoint, b: Waypoint): boolean {
    return stairCrossings.some(
      (crossing) =>
        (a.at === crossing.pointOnA && b.at === crossing.pointOnB) ||
        (a.at === crossing.pointOnB && b.at === crossing.pointOnA),
    );
  }

  interface Waypoint {
    at: Vec2;
    tierId: string;
    links: Waypoint[];
  }
  let graph: Waypoint[] | null = null;

  function waypoints(): Waypoint[] {
    if (graph) return graph;
    const grow = PLAYER_RADIUS + LEG_MARGIN + 0.01;
    const obstacleCandidates = obstacles.flatMap((box) => {
      const tierId = tierIdOf(box);
      return [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => ({
          at: { x: box.x + sx * (box.halfX + grow), z: box.z + sz * (box.halfZ + grow) },
          tierId,
        })),
      );
    });
    const crossingCandidates = stairCrossings.flatMap((crossing) => [
      { at: crossing.pointOnA, tierId: crossing.tierA },
      { at: crossing.pointOnB, tierId: crossing.tierB },
    ]);
    const nodes = [...obstacleCandidates, ...crossingCandidates]
      .filter(({ at, tierId }) => roomy(at, obstaclesOnTier(tierId)))
      .map(({ at, tierId }): Waypoint => ({ at, tierId, links: [] }));
    for (const a of nodes) {
      a.links = nodes.filter((b) => {
        if (b === a) return false;
        if (a.tierId === b.tierId)
          return clearLeg(a.at, b.at, LEG_MARGIN, obstaclesOnTier(a.tierId));
        return crossingLinks(a, b);
      });
    }
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

  const pastBounds = (p: Vec2, toward: Vec2) =>
    (toward.x > 0 && p.x > worldBounds.maxX) ||
    (toward.x < 0 && p.x < worldBounds.minX) ||
    (toward.z > 0 && p.z > worldBounds.maxZ) ||
    (toward.z < 0 && p.z < worldBounds.minZ);

  function standFor(p: Vec2, toward: Vec2): Vec2 {
    if (!obstacles.some((box) => overlapsBox(p, box, 0))) {
      const near = nearestRoomy(p, 0.05, p.x - 1, p.x + 1, p.z - 1, p.z + 1);
      if (near) return near;
    }
    for (let t = 0; ; t += 0.05) {
      const q = { x: p.x + t * toward.x, z: p.z + t * toward.z };
      if (pastBounds(q, toward)) break;
      if (roomy(q)) return q;
    }
    const { minX, maxX, minZ, maxZ } = worldBounds;
    return nearestRoomy(p, 0.25, minX + 0.125, maxX, minZ + 0.125, maxZ) ?? p;
  }

  function routeTo(from: Vec2, to: Vec2, toward: Vec2 = HOME_TOWARD): Vec2[] {
    const goal = isBlocked(to, obstacles, worldBounds) ? standFor(to, toward) : to;
    const route = goal === to ? [to] : [goal, to];
    const fromTier = tierOf(from);
    const goalTier = tierOf(goal);
    if (fromTier === goalTier && clearLeg(from, goal, 0, obstaclesOnTier(fromTier))) return route;
    const nodes = waypoints();
    const start: Waypoint = {
      at: from,
      tierId: fromTier,
      links: nodes.filter(
        (w) => w.tierId === fromTier && clearLeg(from, w.at, 0, obstaclesOnTier(fromTier)),
      ),
    };
    const last = new Set(
      nodes.filter(
        (w) => w.tierId === goalTier && clearLeg(w.at, goal, 0, obstaclesOnTier(goalTier)),
      ),
    );
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

  return { routeTo };
}

function buildLayout(): CampusLayout {
  const base = { minX: -14.8, maxX: 14.8, minZ: -21.5, maxZ: 12.6 } as const;
  const worldBounds = { minX: -14, maxX: 14, minZ: -20.7, maxZ: 11 } as const;
  const lake = { x: 14.8, z: 12.6, rx: 8.2, rz: 6.8 } as const;
  const terrainTiers: readonly TerrainTier[] = [
    {
      id: DEFAULT_TIER_ID,
      elevationY: 0,
      bounds: span(worldBounds.minX, worldBounds.maxX, worldBounds.minZ, worldBounds.maxZ),
    },
  ];
  const stairCrossings: readonly StairCrossing[] = [];
  const gate = { face: 12.42, back: 11.44, halfWidth: 2.8 } as const;
  const spawn: Vec2 = { x: 0, z: -0.8 };
  const plaza: Vec2 = { x: 0, z: 5.6 };
  const fountainRadius = 1.88;
  const plazaRadius = 4.2;
  const fountainWater = 1.3;

  const arcPoint = (angle: number, radius: number): Vec2 => ({
    x: plaza.x + Math.sin(angle) * radius,
    z: plaza.z - Math.cos(angle) * radius,
  });

  const paths = {
    front: [
      [-3.4, 3.4, -6.0, -1.8],
      [-3.1, -2.0, -1.8, 1.7],
      [2.0, 3.1, -1.8, 1.7],
      [-8.8, -3.4, -3.1, -2.5],
      [3.4, 8.8, -3.1, -2.5],
      [3.6, 7.0, 3.6, 4.2],
    ],
    low: [
      [base.minX, 6.6, 10.5, 11.2],
      [-12.8, -6.2, 3.6, 9.4],
    ],
    back: [
      [3.1, 13.1, -0.55, 0.05],
      [12.3, 13.1, -10.25, -0.55],
      [4.1, 13.1, -11.25, -10.25],
      [-9.6, 4.6, -12.95, -12.0],
    ],
  } as const satisfies Record<string, readonly Rect[]>;

  const roseBeds = [0, 1].flatMap((c) =>
    [0, 1, 2].map((r) => [-12.6 + 3.2 * c, 3.85 + 1.85 * r] as const),
  );
  const interactRadius = 1.7;

  const landmark = {
    centre: { x: 0, z: -7.6 },
    footprints: [
      span(-9.75, 9.75, -9.9, -6.0),
      span(-3.15, 3.15, -6.0, -5.15),
      span(-1.7, 1.7, -5.15, -3.55),
    ],
  } as const;

  const sites: readonly Site[] = [
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

  const colonnade = { inner: 3.05, outer: 3.75, mid: 3.4 } as const;

  const colonnadeColumns: readonly Vec2[] = [-1, 1].flatMap((s) =>
    [0, 1, 2, 3, 4, 5].flatMap((i) => {
      const angle = s * (0.37 + 0.05 * i) * Math.PI;
      return [arcPoint(angle, colonnade.inner), arcPoint(angle, colonnade.outer)];
    }),
  );

  const colonnadePiers: readonly Vec2[] = [-1, 1].map((s) =>
    arcPoint(s * 0.68 * Math.PI, colonnade.mid),
  );

  const statues: readonly Vec2[] = [
    ...[-3.05, 3.05].flatMap((x) => [-1.35, -0.45, 0.45, 1.35].map((z) => v(x, z))),
    ...[-3.3, 3.3].flatMap((x) => [-2.05, -5.5].map((z) => v(x, z))),
  ];

  const roundTrees: readonly Vec2[] = [
    ...[v(-11.4, -9.0), v(-13.3, -7.4), v(11.4, -9.0), v(13.75, -7.4)],
    ...[v(-13.75, -4.4), v(-13.4, -1.8), v(-13.3, 1.2)],
    ...[v(13.75, -4.4), v(13.75, -1.6), v(12.8, 1.3), v(13.4, 3.7)],
    ...[v(-5.4, 2.4), v(5.6, 1.8), v(-4.9, 0.6), v(5.0, 0.6)],
    ...[v(-4.9, 6.4), v(4.9, 6.4), v(-4.3, 8.9), v(4.3, 8.9)],
    ...[v(-13.4, 4.3), v(-13.4, 7.3), v(-12.8, 9.6), v(-5.6, 9.6)],
  ];

  const cypressTrees: readonly Vec2[] = [
    ...[-3.75, 3.75].flatMap((x) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => v(x, -5.6 + 0.8 * k))),
  ];

  const parkTrees: readonly Vec2[] = [
    ...[v(-14.0, -17.3), v(-14.0, -18.8), v(-12.8, -17.3), v(-10.4, -20.3), v(-9.2, -20.3)],
    ...[v(-8.0, -18.8), v(-8.0, -20.3), v(-6.8, -20.3), v(-5.6, -20.3), v(-4.4, -20.3)],
    ...[v(-3.2, -17.3), v(-3.2, -18.8), v(-3.2, -20.3), v(-2.0, -17.3), v(-2.0, -18.8)],
    v(-2.0, -20.3),
  ];

  const trees: readonly Vec2[] = [...roundTrees, ...cypressTrees, ...parkTrees];

  const shoreZ = (x: number) => lake.z - lake.rz * Math.sqrt(1 - ((x - lake.x) / lake.rx) ** 2);
  const lakeBlocks: readonly Box[] = [7.0, 7.8, 8.6, 9.6, 10.6, 11.6, 12.8].map((x) =>
    span(x, lake.x, shoreZ(x), lake.z),
  );

  const back = {
    annex: span(-3.8, 3.8, -11.8, -10.15),
    solarHall: span(-2.6, 2.6, -16.6, -13.1),
    westHall: span(-14.5, -10.3, -16.0, -13.3),
    hall: span(4.2, 9.0, -17.6, -13.1),
    chiller: span(-6.9, -4.0, -18.6, -17.0),
    carports: span(-14.6, -11.6, -12.95, -11.65),
    stand: span(14.2, 14.75, -18.0, -14.2),
  };

  const npcSpot: Vec2 = { x: -6.6, z: -2.0 };
  const npcTalkSpot: Vec2 = { x: -6.6, z: -2.8 };
  const npcBox: Box = { ...npcSpot, halfX: 0.3, halfZ: 0.3 };

  const npcs: readonly Npc[] = [
    { id: "registrar", spot: v(1.25, -3.0), talk: v(1.25, -2.2), yaw: Math.PI / 4 },
    { id: "guard", spot: v(3.4, 10.85), talk: v(2.6, 10.85), yaw: 0 },
    { id: "examiner", spot: v(8.0, -12.4), talk: v(8.0, -11.6), yaw: Math.PI / 4 },
    { id: "operator", spot: v(-5.45, -15.95), talk: v(-5.45, -15.15), yaw: Math.PI / 4 },
  ];

  const lan = { id: "lan" as const, spot: npcSpot, talk: npcTalkSpot };
  const speakers: readonly { id: Speaker; spot: Vec2; talk: Vec2 }[] = [lan, ...npcs];
  const speaker = (who: Speaker) => speakers.find((s) => s.id === who) ?? lan;
  const speakerSpot = (who: Speaker): Vec2 => speaker(who).spot;
  const talkSpot = (who: Speaker): Vec2 => speaker(who).talk;

  const obstacles: readonly Box[] = [
    ...landmark.footprints,
    ...sites.map((site) => site.footprint),
    ...[15, 30, 45, 60, 75].map((degrees) => ({
      ...plaza,
      halfX: fountainRadius * Math.cos((degrees * Math.PI) / 180),
      halfZ: fountainRadius * Math.sin((degrees * Math.PI) / 180),
    })),
    ...roundTrees.map((tree) => ({ x: tree.x, z: tree.z, halfX: 0.35, halfZ: 0.35 })),
    ...lakeBlocks,
    ...Object.values(back),
    npcBox,
    ...npcs.map(({ spot }) => ({ ...spot, halfX: 0.3, halfZ: 0.3 })),
    ...DRESSING_BLOCKS,
  ];

  const backZ = -10.2;
  const backSpot: Vec2 = { x: 12.0, z: -12.3 };

  const { routeTo } = buildRouteGraph({ obstacles, worldBounds, terrainTiers, stairCrossings });

  function siteFor(location: ZoneLocation): Site {
    const site = sites.find((candidate) => candidate.id === location);
    if (!site) throw new Error(`No campus site for location "${location}".`);
    return site;
  }

  function arrivalPose(site: Site): { position: Vec2; heading: number } {
    return {
      position: {
        x: site.door.x + 0.8 * Math.sin(site.facing),
        z: site.door.z + 0.8 * Math.cos(site.facing),
      },
      heading: site.facing,
    };
  }

  function parseArrival(value: string | null): Site | null {
    return sites.find((site) => site.id === value) ?? null;
  }

  const spawnHeading = Math.atan2(npcSpot.x - spawn.x, npcSpot.z - spawn.z);

  return {
    base,
    worldBounds,
    terrainTiers,
    stairCrossings,
    lake,
    gate,
    spawn,
    plaza,
    fountainRadius,
    plazaRadius,
    fountainWater,
    paths,
    roseBeds,
    interactRadius,
    landmark,
    sites,
    colonnade,
    colonnadeColumns,
    colonnadePiers,
    statues,
    roundTrees,
    cypressTrees,
    parkTrees,
    trees,
    lakeBlocks,
    back,
    npcSpot,
    npcTalkSpot,
    npcs,
    speakers,
    obstacles,
    backZ,
    backSpot,
    spawnHeading,
    arcPoint,
    routeTo,
    siteFor,
    arrivalPose,
    parseArrival,
    speakerSpot,
    talkSpot,
  };
}

const NTU_UPPER = "upper";
const NTU_LOWER = "lower";

function buildNtuLayout(): CampusLayout {
  const base = { minX: -12.8, maxX: 18.8, minZ: -9.8, maxZ: 13.8 } as const;
  const worldBounds = { minX: -12, maxX: 18, minZ: -9, maxZ: 13 } as const;
  const terrainTiers: readonly TerrainTier[] = [
    { id: NTU_UPPER, elevationY: 0, bounds: span(-12, 18, -9, 4) },
    { id: NTU_LOWER, elevationY: -1.2, bounds: span(-12, 18, 4, 13) },
  ];
  const stairCrossings: readonly StairCrossing[] = [4.5, 8.0, 13.4, 15.1].map((x) => ({
    tierA: NTU_UPPER,
    tierB: NTU_LOWER,
    pointOnA: { x, z: 3.7 },
    pointOnB: { x, z: 4.3 },
    margin: 0.6,
  }));
  const lake = { x: 18.5, z: 12.6, rx: 5, rz: 3.2 } as const;
  const gate = { face: -9.8, back: -8.9, halfWidth: 2.8 } as const;
  const spawn: Vec2 = { x: 0, z: -7.6 };
  const plaza: Vec2 = { x: -3.0, z: -5.0 };
  const fountainRadius = 1.4;
  const plazaRadius = 3.0;
  const fountainWater = 0.95;

  const arcPoint = (angle: number, radius: number): Vec2 => ({
    x: plaza.x + Math.sin(angle) * radius,
    z: plaza.z - Math.cos(angle) * radius,
  });

  const paths = {
    front: [
      [-2.8, 2.8, -9.4, -6.6],
      [-1.2, 5.6, -6.6, -3.4],
    ],
    low: [[-10.4, 16.0, 3.4, 4.0]],
    back: [[-0.5, 16.0, 7.6, 8.4]],
  } as const satisfies Record<string, readonly Rect[]>;

  const roseBeds: readonly (readonly [number, number])[] = [
    [plaza.x - 2, plaza.z - 2],
    [plaza.x + 2, plaza.z - 2],
  ];
  const interactRadius = 1.7;

  const landmark = {
    centre: { x: 6.5, z: 8.0 },
    footprints: [span(0.5, 12.5, 7.0, 9.0)].map((box) => ({ ...box, tierId: NTU_LOWER })),
  } as const;

  const sites: readonly Site[] = [
    {
      id: "library",
      centre: { x: 15.6, z: -2.5 },
      footprint: { ...span(14.0, 17.2, -4.0, -1.0), tierId: NTU_UPPER },
      door: { x: 13.8, z: -2.5 },
      facing: -Math.PI / 2,
    },
    {
      id: "watchtower",
      centre: { x: -8.0, z: -7.15 },
      footprint: { ...span(-9.6, -6.4, -8.65, -5.65), tierId: NTU_UPPER },
      door: { x: -6.2, z: -7.15 },
      facing: Math.PI / 2,
    },
    {
      id: "market",
      centre: { x: 5.75, z: -4.7 },
      footprint: { ...span(3.75, 7.75, -6.2, -3.2), tierId: NTU_UPPER },
      door: { x: 3.5, z: -4.7 },
      facing: -Math.PI / 2,
    },
  ];

  const colonnade = { inner: 3.05, outer: 3.75, mid: 3.4 } as const;

  const colonnadeColumns: readonly Vec2[] = [-1, 1].flatMap((s) =>
    [0, 1, 2, 3, 4, 5].flatMap((i) => {
      const angle = s * (0.37 + 0.05 * i) * Math.PI;
      return [arcPoint(angle, colonnade.inner), arcPoint(angle, colonnade.outer)];
    }),
  );

  const colonnadePiers: readonly Vec2[] = [-1, 1].map((s) =>
    arcPoint(s * 0.68 * Math.PI, colonnade.mid),
  );

  const statues: readonly Vec2[] = [];

  const roundTrees: readonly Vec2[] = [
    v(-1.5, -8.5),
    v(4.0, -9.0),
    v(-6.0, -4.0),
    v(2.5, -2.0),
    v(12.5, -4.0),
    v(9.5, 0.5),
    v(-10.0, -2.0),
    v(3.0, -6.0),
  ];
  const cypressTrees: readonly Vec2[] = [];
  const parkTrees: readonly Vec2[] = [v(-9, 3.9), v(-3, 3.9), v(3, 3.9), v(9, 3.9), v(14, 3.9)];
  const trees: readonly Vec2[] = [...roundTrees, ...cypressTrees, ...parkTrees];

  const shoreZ = (x: number) => lake.z - lake.rz * Math.sqrt(1 - ((x - lake.x) / lake.rx) ** 2);
  const lakeBlocks: readonly Box[] = [14.0, 15.1, 16.2, 17.3, 18.0].map((x) => ({
    ...span(x, lake.x, shoreZ(x), lake.z),
    tierId: NTU_LOWER,
  }));

  const back = {
    annex: { x: -11.5, z: 10.2, halfX: 0.8, halfZ: 0.8, tierId: NTU_LOWER },
    solarHall: { x: -9.3, z: 10.2, halfX: 0.8, halfZ: 0.8, tierId: NTU_LOWER },
    westHall: { x: 16, z: 8.0, halfX: 2.1, halfZ: 1.35, tierId: NTU_LOWER },
    hall: { x: -7.1, z: 10.2, halfX: 0.8, halfZ: 0.8, tierId: NTU_LOWER },
    chiller: { x: -4.9, z: 10.2, halfX: 0.8, halfZ: 0.8, tierId: NTU_LOWER },
    carports: { x: -2.7, z: 10.2, halfX: 0.8, halfZ: 0.8, tierId: NTU_LOWER },
    stand: { x: -0.5, z: 10.2, halfX: 0.8, halfZ: 0.8, tierId: NTU_LOWER },
  };

  const npcSpot: Vec2 = { x: -4.0, z: -7.0 };
  const npcTalkSpot: Vec2 = { x: -4.0, z: -7.8 };
  const npcBox: Box = { ...npcSpot, halfX: 0.3, halfZ: 0.3, tierId: NTU_UPPER };

  const npcs: readonly Npc[] = [
    { id: "registrar", spot: v(1.0, -5.5), talk: v(1.0, -4.7), yaw: Math.PI / 4 },
    { id: "guard", spot: v(2.5, -8.5), talk: v(2.5, -7.7), yaw: 0 },
    { id: "examiner", spot: v(11.0, -1.5), talk: v(11.0, -0.7), yaw: Math.PI / 4 },
    { id: "operator", spot: v(9.0, 10.0), talk: v(9.0, 10.8), yaw: Math.PI / 4 },
  ];
  const npcTiers: Record<Npc["id"], string> = {
    registrar: NTU_UPPER,
    guard: NTU_UPPER,
    examiner: NTU_UPPER,
    operator: NTU_LOWER,
  };

  const lan = { id: "lan" as const, spot: npcSpot, talk: npcTalkSpot };
  const speakers: readonly { id: Speaker; spot: Vec2; talk: Vec2 }[] = [lan, ...npcs];
  const speaker = (who: Speaker) => speakers.find((s) => s.id === who) ?? lan;
  const speakerSpot = (who: Speaker): Vec2 => speaker(who).spot;
  const talkSpot = (who: Speaker): Vec2 => speaker(who).talk;

  const obstacles: readonly Box[] = [
    ...landmark.footprints,
    ...sites.map((site) => site.footprint),
    ...[15, 30, 45, 60, 75].map((degrees) => ({
      ...plaza,
      halfX: fountainRadius * Math.cos((degrees * Math.PI) / 180),
      halfZ: fountainRadius * Math.sin((degrees * Math.PI) / 180),
      tierId: NTU_UPPER,
    })),
    ...roundTrees.map((tree) => ({
      x: tree.x,
      z: tree.z,
      halfX: 0.35,
      halfZ: 0.35,
      tierId: NTU_UPPER,
    })),
    ...parkTrees.map((tree) => ({
      x: tree.x,
      z: tree.z,
      halfX: 0.35,
      halfZ: 0.35,
      tierId: NTU_UPPER,
    })),
    ...lakeBlocks,
    ...Object.values(back),
    npcBox,
    ...npcs.map(({ id, spot }) => ({ ...spot, halfX: 0.3, halfZ: 0.3, tierId: npcTiers[id] })),
  ];

  const backZ = 5.0;
  const backSpot: Vec2 = { x: 6.5, z: 11.0 };

  const { routeTo } = buildRouteGraph({ obstacles, worldBounds, terrainTiers, stairCrossings });

  function siteFor(location: ZoneLocation): Site {
    const site = sites.find((candidate) => candidate.id === location);
    if (!site) throw new Error(`No campus site for location "${location}".`);
    return site;
  }

  function arrivalPose(site: Site): { position: Vec2; heading: number } {
    return {
      position: {
        x: site.door.x + 0.8 * Math.sin(site.facing),
        z: site.door.z + 0.8 * Math.cos(site.facing),
      },
      heading: site.facing,
    };
  }

  function parseArrival(value: string | null): Site | null {
    return sites.find((site) => site.id === value) ?? null;
  }

  const spawnHeading = Math.atan2(npcSpot.x - spawn.x, npcSpot.z - spawn.z);

  return {
    base,
    worldBounds,
    terrainTiers,
    stairCrossings,
    lake,
    gate,
    spawn,
    plaza,
    fountainRadius,
    plazaRadius,
    fountainWater,
    paths,
    roseBeds,
    interactRadius,
    landmark,
    sites,
    colonnade,
    colonnadeColumns,
    colonnadePiers,
    statues,
    roundTrees,
    cypressTrees,
    parkTrees,
    trees,
    lakeBlocks,
    back,
    npcSpot,
    npcTalkSpot,
    npcs,
    speakers,
    obstacles,
    backZ,
    backSpot,
    spawnHeading,
    arcPoint,
    routeTo,
    siteFor,
    arrivalPose,
    parseArrival,
    speakerSpot,
    talkSpot,
  };
}

const layoutRegistry = new Map<string, CampusLayout>();

export function layoutFor(themeId: string): CampusLayout {
  if (themeId === "vinuni" || themeId === "town") {
    let shared = layoutRegistry.get("vinuni");
    if (!shared) {
      shared = buildLayout();
      layoutRegistry.set("vinuni", shared);
      layoutRegistry.set("town", shared);
    }
    return shared;
  }
  if (themeId === "ntu") {
    let ntu = layoutRegistry.get("ntu");
    if (!ntu) {
      ntu = buildNtuLayout();
      layoutRegistry.set("ntu", ntu);
    }
    return ntu;
  }
  throw new Error(`No campus layout registered for theme "${themeId}".`);
}

const DEFAULT_LAYOUT = layoutFor("vinuni");

export const BASE = DEFAULT_LAYOUT.base;
export const WORLD_BOUNDS = DEFAULT_LAYOUT.worldBounds;
export const TERRAIN_TIERS = DEFAULT_LAYOUT.terrainTiers;
export const STAIR_CROSSINGS = DEFAULT_LAYOUT.stairCrossings;
export const LAKE = DEFAULT_LAYOUT.lake;
export const GATE = DEFAULT_LAYOUT.gate;
export const SPAWN = DEFAULT_LAYOUT.spawn;
export const PLAZA = DEFAULT_LAYOUT.plaza;
export const FOUNTAIN_RADIUS = DEFAULT_LAYOUT.fountainRadius;
export const PLAZA_RADIUS = DEFAULT_LAYOUT.plazaRadius;
export const FOUNTAIN_WATER = DEFAULT_LAYOUT.fountainWater;
export const PATHS = DEFAULT_LAYOUT.paths;
export const ROSE_BEDS = DEFAULT_LAYOUT.roseBeds;
export const INTERACT_RADIUS = DEFAULT_LAYOUT.interactRadius;
export const LANDMARK = DEFAULT_LAYOUT.landmark;
export const SITES = DEFAULT_LAYOUT.sites;
export const COLONNADE = DEFAULT_LAYOUT.colonnade;
export const COLONNADE_COLUMNS = DEFAULT_LAYOUT.colonnadeColumns;
export const COLONNADE_PIERS = DEFAULT_LAYOUT.colonnadePiers;
export const ROUND_TREES = DEFAULT_LAYOUT.roundTrees;
export const CYPRESS_TREES = DEFAULT_LAYOUT.cypressTrees;
export const PARK_TREES = DEFAULT_LAYOUT.parkTrees;
export const TREES = DEFAULT_LAYOUT.trees;
export const LAKE_BLOCKS = DEFAULT_LAYOUT.lakeBlocks;
export const BACK = DEFAULT_LAYOUT.back;
export const NPC_SPOT = DEFAULT_LAYOUT.npcSpot;
export const NPC_TALK_SPOT = DEFAULT_LAYOUT.npcTalkSpot;
export const NPCS = DEFAULT_LAYOUT.npcs;
export const SPEAKERS = DEFAULT_LAYOUT.speakers;
export const OBSTACLES = DEFAULT_LAYOUT.obstacles;
export const BACK_Z = DEFAULT_LAYOUT.backZ;
export const BACK_SPOT = DEFAULT_LAYOUT.backSpot;
export const SPAWN_HEADING = DEFAULT_LAYOUT.spawnHeading;

export const arcPoint = DEFAULT_LAYOUT.arcPoint;
export const routeTo = DEFAULT_LAYOUT.routeTo;
export const siteFor = DEFAULT_LAYOUT.siteFor;
export const arrivalPose = DEFAULT_LAYOUT.arrivalPose;
export const parseArrival = DEFAULT_LAYOUT.parseArrival;
export const speakerSpot = DEFAULT_LAYOUT.speakerSpot;
export const talkSpot = DEFAULT_LAYOUT.talkSpot;
