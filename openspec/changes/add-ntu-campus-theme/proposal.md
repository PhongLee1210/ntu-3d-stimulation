# Proposal

## Why

The `/play` campus scene has one spatial shape — VinUni's flat, single-plinth, symmetric-axis
diorama — reused by every theme (`vinuni`, `town`). `docs/research/ntu-campus-reference.md`
documents the real Nha Trang University campus as the opposite of that shape: a hill-crown site
with ~22 m of elevation change, no symmetry axis, and a horizontal seafront landmark instead of a
tower. The engine has no way to represent a second elevation tier or a non-tower landmark, so NTU
cannot be added as a theme today without either faking a flat hill (visually wrong) or a full
heightmap rewrite (far beyond the existing AABB-movement, fixed-isometric-camera architecture).
This change adds the minimum theme-system support — tiered terrain with stair crossings, and a
new landmark archetype — needed to add NTU as a real theme now.

**Depends on `campus-per-theme-layout`.** That change was split out after discovering
`layout.ts`'s `SITES`/`LANDMARK`/`WORLD_BOUNDS` are a single hardcoded layout shared by every
theme today (manifests only recolor it) — NTU's own site positions, landmark placement, and
terrain tiers have nowhere to live until a theme can own its own layout. This proposal's tier/
stair-crossing/content tasks assume `layoutFor(themeId)` already exists; do not start them before
`campus-per-theme-layout` lands.

## What Changes

- Add a tier/stair-crossing data model to `layout.ts`: a theme may declare 2+ flat terrain
  plateaus at different world-Y, connected by named stair crossings (position + which tiers they
  join).
- Extend `routeTo()`'s visibility-graph routing to cross tiers via the nearest available stair
  crossing, instead of the single fixed waypoint v0.3 used for its one lateral back-campus link.
- Re-derive `camera.ts` `CONTENT` bounds and overview zoom thresholds for a taller, wider
  multi-tier world footprint (same kind of pass v0.3 already did once; not a camera redesign).
- Add a third landmark archetype, `seafront-slab`, to the `schema.ts` picklist (alongside
  `spire-hall`, `clock-tower`) with placeholder blockout geometry: a long, slightly curved,
  flat-roof slab. Add a `parapetSign: boolean` manifest flag that renders an instanced row of
  irregularly-spaced parapet fins to suggest roof lettering without any 3D text or brand string in
  `frontend/app`. Update `scene.test.ts`'s archetype-set assertion.
- Scaffold a new `ntu` theme: `frontend/public/themes/ntu/manifest.json` and assets, independent
  of and non-modifying to `vinuni`/`town`. Spawn at the gate on the upper tier; landmark sits on
  the lower tier, not visible from spawn. Library, watchtower, and market zones all stay on the
  upper tier (mapped to the TV1-3 library cluster, G7's drum shape with HT-3's ship-simulator
  content, and the Canteen); the lower tier (admin, labs, landmark) has no interactive zone.
  Signage and formal labels use pre-2025 faculty names; NPC dialogue uses informal block codes
  regardless.
- Deferred, explicitly out of scope for this change: full detailed 3D primitives for every
  individual NTU building footprint beyond a placeholder blockout — that is follow-on work once
  the tier/archetype system lands.

## Capabilities

### New Capabilities

- `campus-terrain-tiers`: a campus theme can declare multiple flat elevation tiers connected by
  stair crossings, and player movement/routing can cross between tiers via the nearest crossing.
- `campus-landmark-archetypes`: the set of landmark shapes a campus theme may select (existing
  `spire-hall`, `clock-tower`, and new `seafront-slab`), including the `parapetSign` roof-lettering
  convention and the brand-isolation rule that applies to all of them.
- `ntu-theme-content`: the NTU theme's own content contract — spawn/tier placement, zone-to-tier
  mapping, and the pre-2025-signage/informal-NPC-speech naming convention — kept independent of
  `vinuni` and `town`.

### Modified Capabilities

(none — no existing specs cover campus theming yet)

## Impact

- Depends on `campus-per-theme-layout` landing first (makes `layout.ts` theme-scoped instead of
  one shared global layout).
- `frontend/app/features/campus/layout.ts` — new tier/stair-crossing types added to the
  `CampusLayout` shape `campus-per-theme-layout` introduces; NTU registers its own layout under
  that mechanism rather than editing `vinuni`/`town`'s.
- `frontend/app/features/campus/movement.ts`, the `routeTo()` routing module — multi-crossing
  tier-aware pathfinding.
- `frontend/app/features/campus/camera.ts` — `CONTENT` bounds and zoom-threshold re-derivation.
- `frontend/app/features/theme/schema.ts` — new `seafront-slab` archetype entry,
  `parapetSign` field.
- `frontend/app/features/campus/scene.test.ts` (or equivalent) — archetype-set assertion update,
  new tier/routing tests.
- `frontend/public/themes/ntu/` — new theme directory: manifest, assets. No edits to
  `frontend/public/themes/vinuni/` or `frontend/public/themes/town/`.
- No backend impact.
