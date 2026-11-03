# Design

## Context

**Depends on `campus-per-theme-layout`.** `SITES`/`LANDMARK`/`WORLD_BOUNDS`/`BASE` are, as of
writing, plain module-level constants shared by every theme — there is no per-theme layout
concept at all. `campus-per-theme-layout` introduces `layoutFor(themeId): CampusLayout` and makes
`vinuni`/`town` both resolve to today's values unchanged. Everything below assumes that change has
landed: NTU gets its own `CampusLayout` registered under `layoutFor("ntu")`, with its own tiers,
sites, and landmark position — it does not edit the `vinuni`/`town` layout object in any way.

See `proposal.md` for the motivation. Technical starting point — corrected after reading the
actual source (the original draft of this section extrapolated from `docs/design/campus-scene-v0.2.md`
and `v0.3.md` prose without reading `layout.ts`/`campus.ts`/`scene.test.ts` directly; the real
shape is denser and has no elevation concept at all, not a "constant `y`" one):

- `frontend/app/features/campus/layout.ts` is the single source of world-space coordinates. Its
  `Vec2`/`Box`/`Site` types have **no `y` or elevation field whatsoever** — the whole module is a
  pure x/z plane. `WORLD_BOUNDS`/`BASE` are 2D rects. Adding tiers means introducing a new
  dimension into this module, not generalizing an existing one.
- `movement.ts`'s AABB collision (`isBlocked`, `overlapsBox`, `step()`) is likewise pure x/z; it
  has never had a `y` to be "constant" at. A tier boundary is purely a routing/rendering concern,
  not a collision concern — collision can stay 2D as long as routing knows which tier a point is on.
- v0.3's "front/back campus" extension (`BACK` in `layout.ts`) is more boxes in the same x/z plane
  at the same rendered elevation, joined by one routing link. It is not evidence that the engine
  already handles multiple elevations — it's evidence the engine has never needed to.
- `camera.ts`'s `toScreen(x, y, z, yaw)` does accept a `y` (used today only for tree-crown height
  and a couple of hand-picked `y` samples in `contentAt()`), so the *projection math* is already
  elevation-aware. What is not elevation-aware is `contentAt()` itself: it iterates a hardcoded set
  of world corners (`[-14.8, 14.8] × [-21.5, 12.6]`) and two hand-picked `y` values (`-0.8`, `0`),
  not a general "bounds of every declared tier."
- `schema.ts` validates theme manifests with a `v.picklist(["spire-hall", "clock-tower"])` for
  `landmark.archetype` — this part of the original plan holds.
- `frontend/app/features/campus/scene/campus.ts` (1575 lines) and
  `frontend/app/features/campus/scene/primitives.ts` build every archetype as literal,
  hand-measured `box`/`cyl`/`quad`/`arch` calls in world coordinates — `spireHall()` alone is ~140
  lines of exact vertex math. Three other data structures must stay in lockstep with that geometry
  for every archetype: a `CASTER`/`TOWER` shadow-caster box list (`shadowCasters()`), a `TALL`
  table of named anchor points used by click-routing tests, and the terrain's `AO`/`STRATA`
  constants. `seafront-slab` needs its own entries in all of these, at the same density as the
  existing two archetypes — this is bespoke art/geometry work, not a schema-picklist addition.
- Rendering elevation (`STRATA`, `AO_Y`, `SHADOW_Y`, `KERB_Y`, `MOW_Y`) are all single absolute
  world-`y` constants shared across the entire terrain mesh in `buildTerrain()`/`buildAo()`. A
  second elevation tier means every one of these becomes tier-relative (offset by that tier's
  `elevationY`), not additive new constants alongside the old ones.
- `frontend/app/features/campus/scene/scene.test.ts` (1528 lines) is exact, not representative:
  specific triangle counts per zone-look (`102`/`78`/`72`), specific draw-call counts
  (`15`/`16`/`18`/`19`), per-archetype shadow-caster corner matches, 6-decimal-place baked-lighting
  colour checks, and orbit-frame pixel containment swept across **every integer degree 0-360** for
  every manifest. Any new archetype or tier geometry must satisfy this suite's style of assertion,
  which means writing the equivalent assertions for the new content, not just making existing ones
  pass.

## Goals / Non-Goals

**Goals:**
- Generalize v0.3's proven "two flat areas + visibility-graph routing between them" pattern from
  one lateral link to N links between two *vertically offset* tiers, without introducing a
  heightmap or changing the AABB collision model.
- Keep the change additive at the schema level: a theme with zero declared tiers must behave
  identically to today's `vinuni`/`town` themes, with zero behavior diff.
- Land `seafront-slab` as a real third archetype option with placeholder geometry, not a stub that
  only type-checks.

**Non-Goals:**
- No continuous sloped terrain or heightmap-based movement. Elevation is tier-discrete only.
- No detailed, per-building NTU geometry beyond placeholder blockout — that is explicitly deferred
  follow-on work per the proposal.
- No change to `vinuni` or `town` manifests, geometry, or test expectations beyond the
  shared archetype-enum/test-assertion update (additive: widening a picklist and an assertion set,
  not altering existing theme content).

## Decisions

### Tiers are a list of flat planes with elevation, not a heightmap
**Decision:** `layout.ts` gains a `TERRAIN_TIERS` (or theme-provided equivalent) list, each entry
`{ id, elevationY, bounds }`, plus a `STAIR_CROSSINGS` list, each entry
`{ tierA, tierB, pointOnA, pointOnB, margin }`. Obstacle/footprint boxes gain an implicit tier
reference (default: the single implicit tier, for backward compatibility). Collision (`movement.ts`)
stays pure 2D x/z exactly as it is today — a tier is metadata attached to a position for routing
and rendering, not a new axis the collision system reasons about.

**Why:** matches the real site (two flat shelves joined by stair cuts). **Correction from the
first draft of this decision:** this is *not* a generalization of existing elevation data — reading
`layout.ts`/`movement.ts` directly shows there is no `y` field anywhere in `Vec2`/`Box`/`Site`
today, so "constant ground `y`" was an inaccurate description of the starting point. `elevationY`
is new. Every absolute-world-`y` rendering constant that currently assumes a single ground plane
(`STRATA`, `AO_Y`, `SHADOW_Y`, `KERB_Y`, `MOW_Y` in `campus.ts`) must become tier-relative, which is
new plumbing through `buildTerrain()`/`buildAo()`/`buildShadows()`, not a drop-in list addition.
**Alternative considered:** a full heightmap with slope-aware movement — rejected, since
`movement.ts`'s AABB step function and `camera.ts`'s fixed isometric projection both assume a flat
ground per query point; supporting continuous slope would mean redesigning both, which the
proposal explicitly scopes out.

### Routing crosses tiers through the nearest stair crossing, computed once per query
**Decision:** extend the existing visibility-graph build (`waypoints()`) to run once per tier,
plus treat each stair crossing's two endpoint points as graph nodes with an edge between them.
`routeTo(from, to)` runs Dijkstra across the merged multi-tier graph exactly as it does today
across the single-tier graph; "nearest crossing" falls out of shortest-path cost naturally rather
than needing separate nearest-crossing logic.

**Why:** v0.3's `routeTo()` is already Dijkstra over a visibility graph; treating stair-crossing
endpoints as ordinary extra graph nodes is a few-line extension, and it automatically gets
"shortest path picks the best crossing" for free instead of hand-written nearest-crossing
selection. **Alternative considered:** pick nearest crossing by straight-line distance first, then
route on each tier separately — rejected, since straight-line-nearest can pick a crossing that is
*not* on the shortest real path once obstacles are factored in (the same class of bug v0.3's QA
rounds already found and fixed once for the single-crossing case).

### Camera `CONTENT` bounds are re-derived from measured multi-tier geometry, same process as before
**Decision:** no change to the *projection math* in `camera.ts` (`toScreen`/`cameraOffset` already
take a `y`) — but `contentAt()`'s hardcoded corner/`y`-sample loop is replaced with one that
iterates the theme's actual declared tiers and their bounds, so it is correct for both the
existing single-implicit-tier themes and NTU's two-tier case without hand-editing magic numbers
per theme. Zoom thresholds get a new pass of the same kind v0.3 already ran (threshold table per
viewport).

**Why:** this is exactly the "camera bounds re-derivation, not a camera redesign" the proposal
promises — reusing the existing measurement process keeps the change additive and avoids
reopening `camera.ts`'s projection math. **Alternative considered:** compute `CONTENT`
automatically from tier bounds instead of hand-measuring — deferred; v0.3's existing process is
manual measurement against a blockout script, and automating it is orthogonal to this change's
scope.

### `seafront-slab` ships with placeholder blockout geometry, built like the existing archetypes
**Decision:** add `seafront-slab` to the `schema.ts` picklist and build its primitives the same
way `spire-hall`/`clock-tower` are built in `scene/campus.ts` (boxes/planes from `primitives.ts`,
following the "G-block" proportions in the research doc: ~6:1 length:height, slight bend via 2-3
straight segments, continuous glazed long face, flat roof with a thin parapet band).
`parapetSign: boolean` drives an `InstancedMesh` of irregularly-spaced fin boxes along that parapet
band — one more draw call, consistent with the existing instancing pattern used for trees.

**Correction from the first draft of this decision:** "built like the existing archetypes" is a
larger commitment than it first reads. `spireHall()`/the clock-tower builder in `campus.ts` are
each ~100-140 lines of exact, hand-measured vertex coordinates, and each has a matching entry in
the `TOWER` shadow-caster table, the `TALL` click-anchor table used by `scene.test.ts`'s
click-routing tests, and AO-frame coverage. `seafront-slab` needs the same four matching pieces
(geometry, caster box, anchor point(s), AO frame) and the same density of test coverage
(`scene.test.ts` asserts per-archetype shadow casters, orbit-frame containment at every degree,
and click-to-door routing) — this is a full archetype implementation, not a lightweight third
branch.

**Why:** reuses the exact code shape already used for the two existing archetypes, so review and
testing follow established patterns. **Alternative considered:** a generic "slab" primitive
config-driven by manifest fields instead of a third hardcoded archetype branch — rejected as
premature generalization; two prior archetypes were each hardcoded, a third one following suit is
consistent, and a config-driven system can be extracted later if a fourth archetype ever appears.

### NTU theme data lives entirely under `frontend/public/themes/ntu/`
**Decision:** the NTU-specific tier layout, stair-crossing positions, zone-to-tier assignment, and
all pre-2025 faculty-name strings are manifest-driven theme data, not new code branches in
`frontend/app`. Core code only gains the generic tier/crossing/archetype *mechanism*; which tiers,
where the crossings sit, and what the signs say are `ntu` theme content.

**Why:** matches the existing `vinuni`/`town` separation and the CLAUDE.md hard rule that brand
names live only under `frontend/public/themes/<id>/`. **Alternative considered:** none seriously
considered — this follows the project's existing, enforced pattern.

## Risks / Trade-offs

- **[Risk]** Extending the visibility graph to span two tiers roughly doubles graph size and adds
  crossing edges; `routeTo()`'s per-call cost (currently ~0.3 ms per v0.3's own measurement) could
  grow enough to matter on low-end hardware. → **Mitigation**: build the graph once at scene load
  (as today), not per query; re-measure per-call cost against the same budget v0.3 tracked and
  treat >1 ms per call as a regression to fix before merging.
- **[Risk]** Four real stair crossings (vs. v0.3's one) multiplies the number of QA walk-test
  cases (pairwise routes, edge-of-margin positions near each crossing) that need checking. →
  **Mitigation**: reuse v0.3's scripted blockout-walk-test approach (`step()` simulation over many
  point pairs) rather than hand-testing each crossing manually.
- **[Risk]** A taller multi-tier `CONTENT` bounding box may push the overview zoom threshold down
  further than v0.3's 22, potentially forcing more common viewports into `follow` mode (v0.3 saw
  1024×768 flip). → **Mitigation**: accept this as a known, already-precedented trade-off (v0.3
  made the same call for 1024×768); do not treat a mode flip as a blocking regression unless it
  hits a materially more common viewport.
- **[Trade-off]** Tiers are flat, not sloped — the sports pitch's dug-in pocket and other
  sub-grade nuances the research doc notes are represented as retaining-wall dressing on a single
  tier, not as additional tiers. This under-represents fine terrain texture in exchange for
  keeping the tier count and routing graph small; acceptable per the proposal's explicit 2-tier
  decision.
- **[Risk]** `scene.test.ts` (1528 lines) and `campus.ts` (1575 lines) are far denser than the
  proposal/tasks were scoped against: exact triangle counts per zone-look state, exact draw-call
  counts, per-archetype shadow-caster box tables, click-anchor tables, and orbit-frame pixel
  containment swept across every integer degree for every manifest. `seafront-slab` and the
  tier-relative rendering constants (`STRATA`/`AO_Y`/`SHADOW_Y`/`KERB_Y`/`MOW_Y`) must each get a
  matching, equally precise set of test assertions, not just pass the existing ones. →
  **Mitigation**: treat `tasks.md` task 1.2-1.3 and the tier-rendering tasks in group 2 as
  "build the geometry and write the matching precision assertions together," the same way the
  existing archetypes were built, rather than attempting the geometry first and testing after.

## Migration Plan

Purely additive at the schema and engine level (new optional tier/crossing manifest fields,
widened archetype enum); no existing manifest needs to change and no data migration applies.
Rollout is "merge the schema/engine extension, then add the `ntu` manifest and assets" — either
half can land and be reverted independently since `vinuni`/`town` do not opt into tiers.
