import { useEffect, useMemo } from "react";
import type { BufferGeometry } from "three";

import type { CampusTheme } from "~/features/theme/schema";

import type { SiteLook } from "../sites";
import type { Bake, Phase } from "../sky";
import {
  BLOB_SEGMENTS,
  buildAo,
  buildCypress,
  buildLan,
  buildLandmark,
  buildLibrary,
  buildMarket,
  buildNpcs,
  buildPlayer,
  buildRoundTree,
  buildShadows,
  buildTerrain,
  buildWatchtower,
  RING_SEGMENTS,
  TREE_INSTANCES,
  treesInShade,
  type TreeInstance,
} from "./campus";
import { CAST_ROLES, type CastJson } from "./cast";
import { palette, type Palette } from "./palette";
import { triangleCount } from "./primitives";

export interface CampusGeometry {
  palette: Palette;
  base: Palette;
  terrain: BufferGeometry;
  landmark: BufferGeometry;
  library: BufferGeometry;
  watchtower: BufferGeometry;
  market: BufferGeometry;
  shadow: BufferGeometry;
  ao: BufferGeometry;
  shadedTrees: ReadonlySet<TreeInstance>;
  roundTree: BufferGeometry;
  cypress: BufferGeometry;
  player: BufferGeometry;
  lan: BufferGeometry;
  npcs: BufferGeometry;
}

function useDisposable(geometry: BufferGeometry): BufferGeometry {
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

export function useCampusGeometry(
  campus: CampusTheme,
  phase: Phase,
  bake: Bake,
  library: SiteLook,
  watchtower: SiteLook,
  market: SiteLook,
): CampusGeometry {
  const pal = useMemo(() => palette(campus, phase, bake), [campus, phase, bake]);
  const base = useMemo(() => palette(campus), [campus]);
  const { archetype, colonnades } = campus.landmark;
  return {
    palette: pal,
    base,
    terrain: useDisposable(useMemo(() => buildTerrain(pal, colonnades), [pal, colonnades])),
    shadow: useDisposable(
      useMemo(() => buildShadows(pal, archetype, colonnades), [pal, archetype, colonnades]),
    ),
    ao: useDisposable(useMemo(() => buildAo(pal, colonnades), [pal, colonnades])),
    shadedTrees: useMemo(
      () => treesInShade(pal, archetype, colonnades),
      [pal, archetype, colonnades],
    ),
    landmark: useDisposable(
      useMemo(() => buildLandmark(pal, archetype, colonnades), [pal, archetype, colonnades]),
    ),
    library: useDisposable(useMemo(() => buildLibrary(pal, library), [pal, library])),
    watchtower: useDisposable(useMemo(() => buildWatchtower(pal, watchtower), [pal, watchtower])),
    market: useDisposable(useMemo(() => buildMarket(pal, market), [pal, market])),
    roundTree: useDisposable(useMemo(() => buildRoundTree(base), [base])),
    cypress: useDisposable(useMemo(() => buildCypress(base), [base])),
    player: useDisposable(useMemo(() => buildPlayer(base), [base])),
    lan: useDisposable(useMemo(() => buildLan(base), [base])),
    npcs: useDisposable(useMemo(() => buildNpcs(base, campus.npcs), [base, campus.npcs])),
  };
}

const ROUND_TREES = TREE_INSTANCES.filter((tree) => tree.kind === "round").length;
const CYPRESSES = TREE_INSTANCES.length - ROUND_TREES;

export const castTriangles = (cast: CastJson) =>
  CAST_ROLES.reduce(
    (sum, role) => sum + (cast.roles[role].index.length / 3) * (role === "player" ? 2 : 1),
    0,
  );

export function sceneBudget(
  g: CampusGeometry,
  cast: CastJson | null = null,
  dressing: BufferGeometry | null = null,
): { drawCalls: number; triangles: number } {
  const statics = [g.terrain, g.landmark, g.library, g.watchtower, g.market, g.shadow, g.ao];
  if (dressing) statics.push(dressing);
  const people = cast
    ? { drawCalls: CAST_ROLES.length + 1, triangles: castTriangles(cast) }
    : {
        drawCalls: 4,
        triangles: triangleCount(g.player) * 2 + triangleCount(g.lan) + triangleCount(g.npcs),
      };
  const triangles =
    statics.reduce((sum, geometry) => sum + triangleCount(geometry), 0) +
    triangleCount(g.roundTree) * ROUND_TREES +
    triangleCount(g.cypress) * CYPRESSES +
    people.triangles +
    BLOB_SEGMENTS +
    RING_SEGMENTS * 2;
  return { drawCalls: statics.length + 2 + people.drawCalls + 1 + 1, triangles };
}
