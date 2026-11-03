# Design

## Context

`frontend/app/features/campus/layout.ts` currently exports `SITES`, `LANDMARK`, `WORLD_BOUNDS`,
`BASE`, `BACK`, `NPCS`, `PATHS`, the tree-position lists, and a derived `OBSTACLES` array as plain
module-level constants, plus a module-scope-cached visibility graph (`let graph: Waypoint[] | null`)
used by `routeTo()`. 18 files import these directly (`movement.ts`, `camera.ts`, `sites.ts`,
`dressing.ts`, `npcs.ts`, `store.ts`, `scene/campus.ts`, `scene/useHubFrame.ts`, `scene/labels.ts`,
`scene/WorldLabels.tsx`, `scene/CampusScene.tsx`, the `hud/*` modules, and their test files). None
of them take a layout as a parameter today — they all assume there is exactly one. The theme
manifest (`ThemeManifestSchema.campus`) has no position fields at all; `vinuni` and `town` render
the same geometry with different colors and `landmark.archetype`.

## Goals / Non-Goals

**Goals:**
- Make a campus theme's layout (site positions, landmark placement/footprints, world/base bounds,
  NPC spots, obstacle list, routing graph) resolvable per theme id.
- Zero rendered or behavioral change for `vinuni`/`town` — proven by the existing test suite
  (`layout.test.ts`, `movement.test.ts`, `scene/scene.test.ts`, etc.) passing unchanged.
- Leave every consumer able to get "the active theme's layout" without each one re-deriving how to
  look it up.

**Non-Goals:**
- No new layout content (no tiers, no stair crossings, no NTU positions) — that is
  `add-ntu-campus-theme`'s job, once this lands.
- No manifest schema change. Layout stays keyed by theme id in code, not by a new
  `campus.layoutId` manifest field — avoids widening the public manifest contract for an internal
  wiring concern, and keeps `vinuni`/`town`'s manifest.json files untouched.
- No change to the visual geometry itself (box/quad coordinates, colors, archetypes).

## Decisions

### Layout becomes a `CampusLayout` value, resolved by theme id through a small registry
**Decision:** introduce a `CampusLayout` type bundling what `layout.ts` exports today (bounds,
sites, landmark, back-campus boxes, NPCs, paths, tree lists, obstacles, and the `routeTo`/graph
machinery closed over that specific layout's data). Add a `layoutFor(themeId: string):
CampusLayout` function backed by a small `Record<string, CampusLayout>`-style registry. `vinuni`
and `town` both register to the one `CampusLayout` value equal to today's constants (literally the
same object), not two copies of 350 lines of boxes.

**Why:** keeps the migration mechanical and provably behavior-preserving (same object, same
values, just reached through a lookup instead of a module-level export), and avoids duplicating
VinUni's geometry under `town`'s name. **Alternative considered:** a manifest `layoutId` field
driving the lookup — rejected for now since it would widen `schema.ts` for a value every existing
theme would just set to `"vinuni"`; theme id already uniquely identifies which layout to use, and a
manifest field can be added later if a theme ever needs to share a layout with a *different* theme
id than its own.

### Per-layout obstacle list and routing graph, not module-level singletons
**Decision:** `OBSTACLES` and the visibility graph cache inside `routeTo()`'s module (today a
single `let graph: Waypoint[] | null`) become memoized per `CampusLayout` instance (e.g. a
`WeakMap<CampusLayout, Waypoint[]>` or a field computed once when a `CampusLayout` is built),
instead of one shared mutable module variable.

**Why:** `scene/scene.test.ts` already instantiates every registered theme manifest in a single
test run (`describe.each(manifests...)`), so a single shared `graph` variable would leak one
theme's visibility graph into another theme's routing once a second, differently-laid-out theme
exists — today this is invisible only because every theme happens to share the same layout.
**Alternative considered:** recompute the graph on every `routeTo()` call instead of caching per
layout — rejected, this is the performance regression the original NTU `design.md` already flagged
as a risk to avoid; caching per layout keeps the existing "build once" behavior intact per layout.

### Pure functions take a `CampusLayout` parameter; components read it from theme context
**Decision:** `movement.ts`/`camera.ts`-style pure functions that need layout data (bounds,
obstacles) take a `CampusLayout` as an explicit parameter instead of importing a constant.
Components and hooks (`scene/useHubFrame.ts`, `scene/CampusScene.tsx`, the `hud/*` modules) read
the active theme's layout via the existing theme context (`features/theme/context.tsx`) plus
`layoutFor(theme.id)`, the same place they already read the active theme's manifest/colors from.

**Why:** matches how these modules already receive theme-dependent data (`palette(campus, ...)`
takes the manifest's `campus` object as a parameter rather than importing a global); extending the
same pattern to layout is consistent rather than introducing a second, different wiring mechanism.
**Alternative considered:** a React context specifically for `CampusLayout` — rejected as
unnecessary; the existing theme context already identifies the active theme, and `layoutFor()` is a
synchronous, cheap lookup from that id.

## Risks / Trade-offs

- **[Risk]** 18 files touch layout constants today; this change edits all of their import sites.
  Each edit is mechanical (swap a module import for a parameter/lookup) but the sheer file count
  raises the chance of missing one. → **Mitigation**: grep for every `from "../layout"` /
  `from "./layout"` import before starting, track each file as its own task, and rely on
  `layout.test.ts`, `movement.test.ts`, `scene/scene.test.ts` and `bun run check` (TypeScript) to
  catch anything missed — a forgotten import becomes a type error, not a silent bug, since
  `layoutFor()` has a different shape than the old named constants.
- **[Risk]** If `vinuni` and `town` are not kept as literally the same `CampusLayout` object (for
  example, if someone copies the constants into two separate files during migration), a future edit
  to one could silently drift from the other without any test catching it, since nothing currently
  asserts they're equal. → **Mitigation**: register both ids to the same imported value; add a
  test asserting `layoutFor("vinuni") === layoutFor("town")` until/unless a future change
  deliberately gives `town` its own layout.
- **[Trade-off]** Keeping layout keyed by theme id in a code registry (not a manifest field) means
  adding a brand-new theme that wants to reuse an existing layout requires a one-line code change
  (a new registry entry) rather than a manifest-only change. Acceptable per this change's Non-Goals
  — manifest-only theme scaffolding was never true for layout even before this change (there was
  no way to vary layout at all), so this does not regress anything.
