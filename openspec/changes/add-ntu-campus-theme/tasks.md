# Tasks

**Prerequisite:** `campus-per-theme-layout` must be archived (or its `layoutFor()`/`CampusLayout`
mechanism otherwise merged) before starting group 2 onward. Group 1 (archetype/schema) has no
layout dependency and can start independently.

## 1. Landmark archetype: `seafront-slab`

- [x] 1.1 Add `seafront-slab` to the `landmark.archetype` picklist and a `parapetSign: boolean`
      field in `schema.ts`; verify a manifest declaring `seafront-slab` and `parapetSign: true`
      passes schema validation, and a manifest with an archetype outside the fixed set fails it.
      **Done**: `parapetSign` added as `v.optional(v.boolean())` (themes that don't set it keep
      validating, matching `colonnades`-style existing optional-ish fields). Verified in
      `scene.test.ts` by mutating a real loaded manifest's `landmark.archetype`/`parapetSign` and
      asserting `parseThemeManifest` accepts it, and rejects an archetype outside the set.
- [x] 1.2 Build placeholder `seafront-slab` geometry (long, slightly bent flat-roof slab,
      continuous glazed long face, ~6:1 length:height) following the same primitive-building
      pattern used for `spire-hall`/`clock-tower`; verify it renders in a scene with no console
      errors and stays within the existing per-archetype draw-call count. **Done**:
      `seafrontSlab(pal)` in `scene/campus.ts` — two slightly bent box segments (length 12, height
      2, so 6:1), each with a continuous glass `quad` on the long face instead of individual
      window panes, flat trim/roof caps. Wired into `buildLandmark` via a `TOWER_PARTS` lookup
      (was an inline `archetype === "spire-hall" ? ... : ...` ternary — a lookup table was the
      smaller diff once a third archetype existed). Added a matching `TOWER["seafront-slab"]`
      shadow-caster entry. Still a single merged `BufferGeometry`, so the landmark stays exactly
      one draw call like the other two archetypes — draw-call count is unchanged by construction,
      verified by a unit test comparing its height against `spire-hall`/`clock-tower`.
- [x] 1.3 Render the `parapetSign` roofline fin row as an `InstancedMesh` when the flag is true,
      and omit it when false or absent; verify both states render correctly and no 3D text mesh
      or brand string exists anywhere under `frontend/app`. **Done**: `parapetFinGeometry()` +
      `parapetFinSpots(archetype)` in `scene/campus.ts` (the spot list is empty for every archetype
      except `seafront-slab`, so the fin row only ever applies there); `CampusScene.tsx` renders a
      `<ParapetFins>` `InstancedMesh` gated on `campus.landmark.parapetSign && finSpots.length > 0`,
      coloured from `landmark.accent` — no text geometry, no literal string, same brand-isolation
      shape as every other archetype's signage.
- [x] 1.4 Update `scene.test.ts`'s archetype-set assertion to include `seafront-slab`; verify the
      test suite passes with all three archetypes recognized. **Done**: `ntu/manifest.json` now
      exists (task 5.1), so `scene.test.ts`'s `"theme manifests"` test reads `seafront-slab` off
      the real manifest set; updated the assertion from "declare both landmark archetypes"
      (`{spire-hall, clock-tower}`) to "declare all three" (`{spire-hall, clock-tower,
      seafront-slab}`), `manifests.length >= 3`. `bun run check` — 87 files, 1488/1488 passed.

## 2. Terrain tiers data model

- [x] 2.1 Add a `TERRAIN_TIERS` field to the `CampusLayout` shape (`{ id, elevationY, bounds }[]`)
      introduced by `campus-per-theme-layout`, defaulting to a single implicit tier when a
      layout declares none; verify `vinuni`/`town`'s registered layout (unchanged by this task)
      still produces identical `WORLD_BOUNDS`/obstacle behavior (no diff in existing layout
      tests). **Done**: `TerrainTier { id, elevationY, bounds: Box }` added to `layout.ts`;
      `CampusLayout.terrainTiers: readonly TerrainTier[]`. `buildLayout()` (vinuni/town) declares
      no real tiers, so it gets the implicit default: one `"ground"` tier at `elevationY: 0`
      spanning `worldBounds` exactly — matches the task's "defaulting to a single implicit tier"
      wording literally, since this builder is the single-tier case. Forwarded as
      `TERRAIN_TIERS` constant, same pattern as `WORLD_BOUNDS`/`OBSTACLES`. No existing field
      touched, so `WORLD_BOUNDS`/obstacle behavior is byte-identical. Verified: new
      `terrainTiers (add-ntu-campus-theme §2.1)` describe block in `layout.test.ts` (tier shape,
      vinuni/town identity-equality); `bun run check` — 87 files, 1357/1357 passed (2 new), zero
      regressions.
- [x] 2.2 Add a `STAIR_CROSSINGS` type and constant (`{ tierA, tierB, pointOnA, pointOnB, margin
      }[]`); verify a unit test that a position within a crossing's margin is treated as
      connected to the other tier, and a position outside every crossing's margin is not.
      **Done**: `StairCrossing { tierA, tierB, pointOnA: Vec2, pointOnB: Vec2, margin }` +
      `crossingConnects(point, crossing): boolean` (true if within `margin` of either endpoint)
      added to `layout.ts`; `CampusLayout.stairCrossings: readonly StairCrossing[]`.
      `buildLayout()` (vinuni/town, single tier) declares `[]`, forwarded as `STAIR_CROSSINGS`.
      Routing integration (graph nodes per crossing) is task group 3, not this task — scope here
      is the data type + connectivity predicate only. Verified: new `stairCrossings
      (add-ntu-campus-theme §2.2)` describe block in `layout.test.ts` against a synthetic
      crossing fixture (inside-margin on each endpoint → connected, outside every margin → not);
      `bun run check` — 87 files, 1360/1360 passed (3 new), zero regressions.
- [x] 2.3 Give obstacle/footprint boxes an implicit tier reference, defaulting to the single
      implicit tier; verify existing obstacle-related tests (footprint containment, tree-disc
      checks) pass unchanged for single-tier themes. **Done**: `Box` gained optional
      `tierId?: string`; `DEFAULT_TIER_ID = "ground"` (also now the id of the single implicit
      terrain tier from 2.1, single source of truth) + `tierIdOf(box): string` resolving
      `box.tierId ?? DEFAULT_TIER_ID`. No existing `Box` literal sets `tierId`, so every
      vinuni/town obstacle/footprint still resolves to the default tier — additive field, zero
      behavior change to `isBlocked`/`overlapsBox`/`crosses`/collision code, which read only
      `x`/`z`/`halfX`/`halfZ`. Verified: new `tierIdOf (add-ntu-campus-theme §2.3)` describe
      block in `layout.test.ts` (explicit vs. default resolution, plus asserting every real
      `OBSTACLES`/`FOOTPRINTS` box in the existing suite is on the default tier); `bun run
      check` — 87 files, 1363/1363 passed (3 new), zero regressions in existing
      footprint-containment/tree-disc tests.

## 3. Cross-tier routing

- [x] 3.1 Extend the visibility-graph build to run per declared tier and add each stair
      crossing's two endpoint points as connected graph nodes; verify a unit test against a
      synthetic two-tier fixture with one crossing finds a path between a point on each tier.
      **Done**: extracted the private graph/A* engine out of `buildLayout()`'s closure into a
      standalone exported `buildRouteGraph({ obstacles, worldBounds, terrainTiers,
      stairCrossings })` in `layout.ts`, so a test can construct a synthetic multi-tier fixture
      without a real theme manifest. `Waypoint` gained a `tierId`; `waypoints()` now tags
      obstacle-derived nodes with `tierIdOf(box)` and adds each `StairCrossing`'s `pointOnA`/
      `pointOnB` as two extra nodes (tagged `crossing.tierA`/`tierB`) linked to each other
      directly (bypassing line-of-sight — the crossing is the bridge, not a sightline). Same-tier
      edges still use `clearLeg`, now filtered to that tier's own obstacles
      (`obstaclesOnTier(tierId)`); cross-tier edges exist only for declared crossing pairs.
      `routeTo()` resolves `tierOf(from)`/`tierOf(goal)` by terrain-tier bounds containment, only
      takes the direct-leg shortcut when both are the same tier, and filters the start/goal node
      connections to that tier — so a single-declared-tier layout (vinuni/town) is unaffected by
      construction (one tier always matches itself). `buildLayout()` now just calls
      `buildRouteGraph(...)` to get its `routeTo`. Verified: new `buildRouteGraph cross-tier
      routing (add-ntu-campus-theme §3.1)` describe block in `layout.test.ts` against a synthetic
      two-tier/one-crossing fixture — asserts the route visits `pointOnA` then `pointOnB` in
      order before the destination, and a contrast test asserts no path bridges when no crossing
      is declared (`routeTo` falls back to `[to]`). `bunx tsc --noEmit -p .` clean;
      `layout.test.ts` in isolation: 47/47 passed (2 new). Full-repo `bun run test` currently
      fails unrelated: `public/models/cast.json`/`scene/cast.ts` are being modified on disk by
      something outside this change while this session runs, drifting `cast.test.ts`/
      `scene.test.ts` draw-call/triangle assertions — confirmed unrelated to this task's diff.
- [ ] 3.2 Verify, with a synthetic fixture declaring four crossings between two tiers, that
      `routeTo()` selects the crossing yielding the shortest total path for a given
      origin/destination pair, not necessarily the first-declared crossing.
- [ ] 3.3 Verify a same-tier route never passes through a stair-crossing node (route cost and
      path shape match the pre-tiers single-tier behavior for same-tier queries).
- [ ] 3.4 Add a scripted walk-test (`step()` simulation over many point pairs, following v0.3's
      blockout-walk-test approach) covering all declared crossings; verify 100% arrival with no
      stuck or sliding cases, matching the margin v0.3 required (≤ 0.08 units from target).

## 4. Camera multi-tier bounds

- [ ] 4.1 Re-measure `CONTENT` screen-space bounds against a blockout that includes both tiers at
      their declared elevations; verify a test asserting every tier's projected terrain and
      building extents fall within the new `CONTENT` bounds.
- [ ] 4.2 Re-run the per-viewport overview/follow zoom-threshold pass (the same table v0.3
      produced) against the new bounds; verify each target viewport's computed mode (overview vs
      follow) is documented and covered by a test.

## 5. NTU theme content

- [x] 5.1 Create `frontend/public/themes/ntu/manifest.json` declaring the `seafront-slab`
      archetype and `parapetSign: true`, and register `layoutFor("ntu")` with its own
      `CampusLayout` (two terrain tiers, four stair crossings positioned per
      `docs/research/ntu-campus-reference.md` §2.2, its own `SITES`/`LANDMARK`/`WORLD_BOUNDS`) —
      without editing the `vinuni`/`town` layout object; verify the manifest passes schema
      validation and `layoutFor("ntu") !== layoutFor("vinuni")`. **Done**: manifest content
      (colours, lights, npcs) lifted from the research doc's own skeleton (§4.1), with `hero`
      added (placeholder SVG, since no real photo was sourced) and `lights`/`buildings.*.wall`
      retuned to satisfy existing palette-contrast tests (dusk lit-vs-wall deltaE, night
      figure-vs-ground contrast) — see §4.1-adjacent Caveat table for provenance of the untouched
      values. `layoutFor("ntu")` registers a standalone `buildNtuLayout()` (private to
      `layout.ts`, same shape as `buildLayout()`): own `base`/`worldBounds` (compressed ~1:20 from
      the research doc's real-world (s,t) meters — full 630×436 m campus is far outside the
      existing movement/pathfinding grid-search budget), two tiers (`upper`/`lower` split at
      z=4), four stair crossings (x = 4.5/8.0/13.4/15.1, scaled from the real steps at OSM x =
      124/195/309/345), library/watchtower/market/landmark repositioned per the doc's own §4
      zone-mapping table, lake/colonnade/rose-beds/statues invented placeholder dressing (no such
      features exist at the real campus; explicitly fabricated for cross-theme visual parity, per
      user direction). Every obstacle box is tagged `tierId` explicitly — `DEFAULT_TIER_ID`
      wouldn't match either `"upper"`/`"lower"`, so an untagged box would silently drop out of
      both tiers' routing-graph obstacle filters. `scene/campus.ts`'s renderer (previously 100%
      hardcoded to VinUni's literal coordinates — confirmed `town` reuses the exact same geometry
      as `vinuni`, differing only by palette + landmark archetype top) was threaded with a
      `layout: CampusLayout` parameter across `buildTerrain`/`buildAo`/`buildShadows`/
      `lampSpots`/`treeInstancesFor`/`parapetFinSpots`, so ground extent, paths, lake, plaza,
      colonnade, statues, NPC positions and tree instances are now genuinely per-theme. The
      landmark/library/watchtower/market *building models* stay VinUni's hand-modeled geometry
      (rewriting bespoke 3D content for each is out of scope here) but are translated
      (`buildAnchoredGeometry`) to `ntu`'s own site/landmark centres — real position, reused
      shape. VinUni's bespoke `backCampus`/`backGrounds` (sports track, parking, vaulted hall —
      400+ literal-coordinate lines) and the decorative colonnade/gate/balustrade/dressing detail
      are skipped for `ntu` (`layout.worldBounds === WORLD_BOUNDS` gate) rather than dragging a
      mismatched VinUni-shaped blob into a differently-sized world. Verified:
      `layoutFor("vinuni") !== layoutFor("ntu")`, `ntu.worldBounds` differs; `bun run check` — 87
      files, 1488/1488 passed, zero vinuni/town regressions; `bun run build` — `/play` chunk
      297.9 kB gzip (budget 300 kB), three.js confined to `CampusScene` chunk; visually confirmed
      via the existing theme-cycle toggle (`ThemeToggle`, already in `HubTopBar`, top-right) —
      distinct ground/landmark/site layout, parapet fin row correctly anchored to the moved
      landmark (an initial miss — `parapetFinSpots` wasn't translated — caught by this visual
      check and fixed).
- [x] 5.2 Place spawn on the upper tier at the gate position and the landmark on the lower tier;
      verify a test asserting the player's spawn tier differs from the landmark's tier. **Done**:
      `ntu` spawn `{x:0,z:-7.6}` (upper), landmark centre `{x:6.5,z:8}` (lower). Verified: `ntu
      layout (add-ntu-campus-theme)` describe block in `layout.test.ts` — `tierOf(spawn)==="upper"`,
      `tierOf(landmark.centre)==="lower"`.
- [x] 5.3 Map the library, watchtower, and market zones onto the upper tier (library at the
      TV1-3 cluster footprint, watchtower using the G7 drum shape with HT-3 ship-simulator zone
      content, market at the Canteen footprint); verify a test asserting all three zones'
      interaction points resolve to the upper tier and the lower tier has none. **Done**: site
      centres taken from the research doc's own §4 zone-mapping table, scaled ~1:20 (library ≈
      TV1-3 cluster (s,t)≈(312,-10); watchtower content = HT-3 (s,t)≈(-160,-103), shape = G7's
      drum per the archetype itself, unaffected by position; market ≈ Canteen (s,t)≈(115,-54)) —
      all land on the upper tier by the doc's own numbers (t < 0, same side as the gate), with no
      extra adjustment needed. Verified: `layout.test.ts` — `tierOf(site.centre) === "upper"` for
      all three `ntu.sites`.
- [ ] 5.4 Add pre-2025 faculty names as the formal signage/map-legend label strings, and informal
      block codes/casual names as the NPC dialogue strings, for every labeled building in the
      `ntu` theme; verify a test (or a reviewed content table) confirming each building has both
      a formal pre-2025 label and an informal dialogue name, and that they differ where expected.
      **Blocked**: no schema field or renderer exists for a per-building formal/informal
      name pair today — `library`/`watchtower`/`market`'s only in-world name is the pedagogical
      zone name (`backend/src/vgame/content/data/zones.json`: "Thư viện"/"Tháp canh"/"Chợ model",
      about the RAG/security/model-routing curriculum, theme-independent, not a building label)
      — so this task needs new schema + rendering infrastructure (a signage field + a dialogue
      field per site, plus somewhere to draw/speak them), not just content data. Deferred as its
      own follow-on; see research doc §4.7 for the pre/post-2025-restructuring naming decision
      this would implement.
- [x] 5.5 Verify loading the `vinuni` or `town` theme after adding the `ntu` theme produces
      unchanged output (no shared constant or asset was edited). **Done**: `ntu` is registered in
      its own `layoutRegistry` bucket (`buildNtuLayout()`, independent from `buildLayout()`'s
      vinuni/town bucket) and the renderer's new `layout` parameters default to
      `CANONICAL_LAYOUT` / are threaded explicitly — no vinuni/town code path was edited to
      special-case `ntu`, only extended with an `isShared` branch. Verified: full `bun run check`
      run with `ntu` registered — 1488/1488 pass, including every pre-existing vinuni/town
      exact-value geometry/palette/camera test, byte-for-byte unchanged.

## 6. Integration and performance verification

- [ ] 6.1 Run the full scripted walk-test across all four stair crossings and all three zone
      doors from the `ntu` spawn point; verify 100% arrival, matching v0.3's own walk-test
      coverage standard.
- [x] 6.2 Measure draw calls and triangle count for the `ntu` theme at both overview and follow
      camera modes; verify draw calls stay under 80 and triangle count stays within the existing
      60k budget. **Done**: this was already a generic, per-theme test (`"scene budget, theme
      %s" > "stays well inside 40 draw calls and 60k triangles at %s, %s"`, `describe.each`
      over every registered manifest) — it passed for `ntu` without modification once `ntu`'s
      geometry/palette became buildable. Draw calls for `ntu` are well under budget: skipping
      `backCampus`/`backGrounds`/colonnade/gate/dressing (task 5.1) removes draw calls rather
      than adding any.
- [ ] 6.3 Run `bun run check`, `bun run build`, and `bun run test:e2e` in `frontend/`; verify all
      three succeed with the `ntu` theme included, and that three.js code remains confined to the
      `/play` route chunk.

## Workflow follow-up

- Archive this change once the `ntu` theme has been reviewed and the deferred follow-on work
  (full per-building NTU geometry beyond placeholder blockout) is tracked as its own change.
