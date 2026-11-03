# Proposal

## Why

`add-ntu-campus-theme` assumed a new theme could declare its own world layout (site positions,
landmark placement, world bounds, terrain tiers) by writing a manifest, the same way `vinuni` and
`town` are added today. Reading `frontend/app/features/campus/layout.ts` shows this is false: `SITES`,
`LANDMARK`, `WORLD_BOUNDS`, `BASE`, `BACK`, `NPCS`, and the derived `OBSTACLES` list are plain
module-level constants — one single world layout shared by every theme. The campus theme manifest
(`ThemeManifestSchema.campus`) only carries colors, `landmark.archetype`, and a `colonnades`
boolean; it carries no position data. `vinuni` and `town` are two skins over the same geometry, not
two layouts. A theme whose campus needs different building positions, a different world size, or
multiple elevation tiers cannot exist until the world layout itself becomes theme-scoped data. This
change makes that true, with zero visual change to `vinuni`/`town`, so `add-ntu-campus-theme` (or
any future theme needing its own geometry) has something real to build on.

## What Changes

- Extract today's single hardcoded layout (`SITES`, `LANDMARK`, `WORLD_BOUNDS`, `BASE`, `BACK`,
  `NPCS`, `PATHS`, tree lists, and the `OBSTACLES`/visibility-graph machinery built from them) out
  of `layout.ts`'s module scope into a `CampusLayout` data shape, addressable per theme id.
- Keep today's constants as the one layout both `vinuni` and `town` resolve to, so their rendered
  scene, movement bounds, routing, and test assertions are byte-identical to before this change —
  this is a behavior-preserving extraction, not a redesign of the geometry itself.
- Update every consumer that currently imports layout constants directly (`movement.ts`,
  `camera.ts`, `scene/campus.ts`, `scene/useHubFrame.ts`, `sites.ts`, `dressing.ts`, `npcs.ts`,
  `store.ts`, the `hud/*` modules, `scene/labels.ts`, `scene/WorldLabels.tsx`,
  `scene/CampusScene.tsx`) to read the active theme's layout instead of a hardcoded module export.
- Memoize per-layout derived state (the obstacle list, the visibility graph used by `routeTo()`) by
  layout id instead of as module-level singletons, since more than one layout can now exist in the
  same process (the existing test suite already instantiates every theme manifest in one run).
- Explicitly out of scope: no new layout content. Terrain tiers, stair crossings, and NTU's actual
  building positions stay in `add-ntu-campus-theme`, which depends on this change landing first.

## Capabilities

### New Capabilities

- `campus-layout-per-theme`: a campus theme's world layout — site positions, landmark placement
  and footprints, world/base bounds, and the obstacle list and routing graph derived from them —
  is theme-scoped data, not a single value shared by every theme.

### Modified Capabilities

(none — no previously specified capability exists for this behavior; `openspec list --specs`
returns no specs prior to this change)

## Impact

- `frontend/app/features/campus/layout.ts` — restructured from module-level constants into a
  `CampusLayout` shape plus a per-theme accessor; `vinuni` and `town` both resolve to today's
  values unchanged.
- `frontend/app/features/campus/movement.ts`, `camera.ts`, `sites.ts`, `dressing.ts`, `npcs.ts`,
  `store.ts`, `scene/campus.ts`, `scene/useHubFrame.ts`, `scene/labels.ts`,
  `scene/WorldLabels.tsx`, `scene/CampusScene.tsx`, and the `hud/*` modules that import layout
  constants directly — updated to read the active theme's layout.
- `frontend/app/features/campus/*.test.ts` and `scene/scene.test.ts` — assertions must keep passing
  unchanged for `vinuni`/`town` (this is the proof the extraction is behavior-preserving); new
  tests cover that two different theme ids can resolve to two independently-correct layouts.
- No change to `frontend/public/themes/*/manifest.json` content for `vinuni`/`town` in this change
  (a `layoutId`-style field, if the design needs one, defaults to preserve current behavior).
- `add-ntu-campus-theme` depends on this change: its terrain-tier/stair-crossing/NTU-content tasks
  assume a theme can own its own layout, which only becomes true once this lands.
