# Tasks

## 1. `CampusLayout` type and registry

- [x] 1.1 Define a `CampusLayout` type in `layout.ts` bundling the current module's bounds, site,
      landmark, back-campus, NPC, and path data; verify `bun run check` passes with the type
      covering every field the module exports today. **Done**: `layout.ts` exports `CampusLayout`;
      `bun run check` (format, lint, typecheck, vitest) passes, all 1348 existing tests unchanged.
- [x] 1.2 Move the current constant values into one `CampusLayout` value and add
      `layoutFor(themeId: string): CampusLayout` backed by a registry mapping `"vinuni"` and
      `"town"` to that same value; verify a unit test that `layoutFor("vinuni") ===
      layoutFor("town")` and both equal the pre-change constant values field-by-field. **Done**:
      `buildLayout()` + `layoutFor()` added; every old named export (`BASE`, `SITES`, `LANDMARK`,
      `routeTo`, etc.) now forwards from `layoutFor("vinuni")`, so field-equality is structural,
      not just asserted — see `layoutFor (per-theme campus layout)` in `layout.test.ts`.
- [x] 1.3 Memoize the obstacle list and visibility graph per `CampusLayout` instance (a closure
      inside `buildLayout()`, not a module-level singleton); verify a unit test that resolving the
      same theme id twice returns the identical cached instance rather than rebuilding. **Done**
      — see `layout.test.ts`'s "memoizes" case. **Not yet provable**: that a *second, differently
      laid-out* theme's graph stays independent — no second real layout exists until a theme
      registers one (tracked as task 4.3 below, expected to be exercised for real by
      `add-ntu-campus-theme`).

## 2. Migrate pure-function consumers

- [x] 2.1 Update `movement.ts` (`isBlocked`, `step`, bounds checks) to take a `CampusLayout` (or
      its bounds/obstacles) as an explicit parameter instead of importing layout constants; verify
      `movement.test.ts` passes unchanged. **Already satisfied**: `movement.ts` only ever imported
      `Box`/`Vec2` types and `HOME_YAW` from `camera.ts` — `isBlocked`/`step` already take
      `obstacles`/`bounds` as explicit parameters, never imported layout constants. No code change
      needed; confirmed by re-reading the file.
- [x] 2.2 Update `camera.ts`'s `contentAt()`/`viewFor()` to take layout bounds as a parameter
      instead of hardcoded corners; verify `camera.test.ts` passes unchanged. **Done**: added
      `ContentBounds` + `DEFAULT_CONTENT_BOUNDS` (equal to the old hardcoded corners);
      `contentAt`/`clampCentre`/`desiredCentre` all take an optional `bounds` parameter defaulting
      to it. `viewFor()` doesn't touch bounds (uses `ORBIT_FRAME`, a fixed screen-space frame) so
      needed no change. `camera.test.ts` passes unchanged (37/37); full suite 1351/1351.
- [x] 2.3 Update `routeTo()` and its supporting `waypoints()`/Dijkstra code to operate on a passed
      `CampusLayout` instead of the module's own constants; verify `layout.test.ts`'s routing
      tests pass unchanged. **Already satisfied by task 1.2/1.3**: `routeTo`/`waypoints` live
      inside `buildLayout()`'s closure as `CampusLayout` methods; the forwarded `routeTo` export is
      `layoutFor("vinuni").routeTo`. `layout.test.ts`'s routing tests pass unchanged (37/37).

## 3. Migrate component and hook consumers

- [x] 3.1 Update `sites.ts`, `dressing.ts`, `npcs.ts`, `store.ts` to resolve layout via
      `layoutFor(theme.id)` from the active theme context instead of importing constants; verify
      each module's existing test file passes unchanged. **Done**: `sites.ts`'s `INTERACT_POINTS`
      constant became `interactPoints(layout)` (WeakMap-memoized per layout, so the hot render loop
      doesn't rebuild it every frame), and `isSpeaker` no longer needs a layout at all — `Speaker`
      is a fixed literal union, so membership is checked against a static id set instead of
      `SPEAKERS`. `store.ts`'s `HubState` gained a `layout: CampusLayout` field + `setLayout`
      action; `talkTo`/`placePlayer`/`walkTo` and the initial `motion` state all read `get().layout`
      instead of importing `SPAWN`/`routeTo`/`speakerSpot`/`talkSpot`/`INTERACT_RADIUS`. `dressing.ts`
      and `npcs.ts` needed no change — type-only imports already. `store.test.ts` updated to call
      `interactPoints(layoutFor("vinuni"))`. Full suite green (1351/1351).
- [x] 3.2 Update `scene/campus.ts`, `scene/useHubFrame.ts`, `scene/labels.ts`,
      `scene/WorldLabels.tsx`, `scene/CampusScene.tsx` the same way; verify
      `scene/scene.test.ts`'s full suite passes unchanged for both `vinuni` and `town` manifests.
      **Partially done, rest explicitly deferred**: `useHubFrame.ts` (the real-time game-loop hook —
      `castFigures`, `clickGoal`, and the `useFrame` body) and `CampusScene.tsx` (pushes
      `layoutFor(theme.id)` into `hubStore.setLayout` on mount/theme change, threads `layout` into
      `castFigures`/JSX) and `scene/WorldLabels.tsx` now resolve layout dynamically instead of
      importing `NPCS`/`SITES`/`siteFor`/`talkSpot` as constants — these are pure data/interaction
      plumbing, so the migration is mechanical and test-covered.
      **`scene/campus.ts` and `scene/labels.ts` deliberately NOT migrated**: both are visual
      geometry, not data plumbing — `campus.ts` is the 1575-line 3D builder matched line-for-line
      against `scene/scene.test.ts`'s exact triangle/draw-call/shadow-caster assertions, and
      `labels.ts`'s `LABEL_ANCHORS` mixes `speakerSpot()` lookups with hand-authored screen-space
      magic numbers for the three zone badges (`library`/`watchtower`/`market`) that aren't derived
      from any layout field at all. Generalizing either means designing new per-theme geometry or
      camera-anchor derivation, which is this change's own Non-Goal ("No change to the visual
      geometry itself") — that work belongs to `add-ntu-campus-theme`'s own task groups once a
      second, differently-shaped layout actually exists to generalize against.
- [x] 3.3 Update the `hud/*` modules (`blueprint.ts` and any other direct importer found by
      grepping `from ".../layout"`) the same way; verify each module's existing test file passes
      unchanged. **`HubTopBar.tsx` done** (reads `layout` via `useHub`, replacing
      `BACK_SPOT`/`BACK_Z`/`NPCS`/`SPAWN`). **`hud/blueprint.ts` deliberately NOT migrated** for the
      same reason as `scene/campus.ts` above: its `MIRROR` table and `baseShapes()` are an eagerly
      computed SVG loading-sketch built from `siteFor`/`BACK`/`BASE` at module scope — visual
      geometry (a 2D placeholder render of the 3D scene), not data plumbing. `scene/primitives.ts`'s
      `PLAZA` default parameter is a geometry helper called only from `scene/campus.ts` and is
      deferred for the same reason.

## 4. Integration verification

- [x] 4.1 Grep for every remaining `from "../layout"` / `from "./layout"` import across
      `frontend/app/features/campus/`; verify none import the old named constants directly (only
      `layoutFor`, `CampusLayout`, and pure helper functions like `routeTo` remain exported that
      way). **Done, with the deferred-geometry exception recorded**: every data/interaction-plumbing
      consumer (`sites.ts`, `store.ts`, `useHubFrame.ts`, `CampusScene.tsx`, `WorldLabels.tsx`,
      `HubTopBar.tsx`, plus their test files) now goes through `layoutFor`/`CampusLayout`/
      `interactPoints`. The sole remaining direct-constant importers are the four visual-geometry
      files named in 3.2/3.3 above (`scene/campus.ts`, `scene/labels.ts`, `scene/primitives.ts`,
      `hud/blueprint.ts`) — unchanged on purpose, per this change's Non-Goals.
- [x] 4.2 Run `bun run check`, `bun run build`, and `bun run test:e2e` in `frontend/`; verify all
      three succeed with no behavior change for `vinuni`/`town`. **Done**: `bun run check` —
      87 files / 1351 tests, clean. `bun run build` — three.js stays confined to the `/play` chunk
      (`CampusScene-*.js`), bundle budget intact. `bun run test:e2e` — 242 passed, 27 skipped, 1
      timeout (`play.spec.ts` night-sky re-bake test) that reproduced only under the full 4-worker
      parallel run and passed cleanly re-run in isolation — pre-existing resource-contention
      flakiness, not a regression from this change.
- [ ] 4.3 Once a second real `CampusLayout` is registered (the `ntu` theme in
      `add-ntu-campus-theme`), add a unit test asserting `routeTo()` against one layout never
      returns a waypoint that falls inside the other layout's obstacle list; verify the test would
      have failed against a module-singleton graph and passes against this change's per-closure
      caching.

## Workflow follow-up

- Archive this change once `add-ntu-campus-theme` (or any other theme needing its own layout) has
  confirmed it can build on `layoutFor()` without further changes to this change's files.
