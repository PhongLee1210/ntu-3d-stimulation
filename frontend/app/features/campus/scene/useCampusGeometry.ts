import { useEffect, useMemo } from "react";
import type { BufferGeometry } from "three";

import type { CampusTheme } from "~/features/theme/schema";

import type { CampusLayout } from "../layout";
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
  treeInstancesFor,
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
  roundTreeCount: number;
  cypressCount: number;
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
  layout: CampusLayout,
): CampusGeometry {
  const pal = useMemo(() => palette(campus, phase, bake), [campus, phase, bake]);
  const base = useMemo(() => palette(campus), [campus]);
  const { archetype, colonnades } = campus.landmark;
  const treeCounts = useMemo(() => {
    const trees = treeInstancesFor(layout);
    const roundTreeCount = trees.filter((tree) => tree.kind === "round").length;
    return { roundTreeCount, cypressCount: trees.length - roundTreeCount };
  }, [layout]);
  return {
    palette: pal,
    base,
    terrain: useDisposable(
      useMemo(() => buildTerrain(pal, colonnades, layout), [pal, colonnades, layout]),
    ),
    shadow: useDisposable(
      useMemo(
        () => buildShadows(pal, archetype, colonnades, layout),
        [pal, archetype, colonnades, layout],
      ),
    ),
    ao: useDisposable(useMemo(() => buildAo(pal, colonnades, layout), [pal, colonnades, layout])),
    shadedTrees: useMemo(
      () => treesInShade(pal, archetype, colonnades, layout),
      [pal, archetype, colonnades, layout],
    ),
    landmark: useDisposable(
      useMemo(
        () => buildLandmark(pal, archetype, colonnades, layout),
        [pal, archetype, colonnades, layout],
      ),
    ),
    library: useDisposable(
      useMemo(() => buildLibrary(pal, library, layout), [pal, library, layout]),
    ),
    watchtower: useDisposable(
      useMemo(() => buildWatchtower(pal, watchtower, layout), [pal, watchtower, layout]),
    ),
    market: useDisposable(useMemo(() => buildMarket(pal, market, layout), [pal, market, layout])),
    roundTree: useDisposable(useMemo(() => buildRoundTree(base), [base])),
    cypress: useDisposable(useMemo(() => buildCypress(base), [base])),
    player: useDisposable(useMemo(() => buildPlayer(base), [base])),
    lan: useDisposable(useMemo(() => buildLan(base), [base])),
    npcs: useDisposable(
      useMemo(() => buildNpcs(base, campus.npcs, layout.npcs), [base, campus.npcs, layout.npcs]),
    ),
    ...treeCounts,
  };
}

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
    triangleCount(g.roundTree) * g.roundTreeCount +
    triangleCount(g.cypress) * g.cypressCount +
    people.triangles +
    BLOB_SEGMENTS +
    RING_SEGMENTS * 2;
  return { drawCalls: statics.length + 2 + people.drawCalls + 1 + 1, triangles };
}
