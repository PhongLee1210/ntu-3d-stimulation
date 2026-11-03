# Spec Delta

## Purpose

Lets a campus theme own its own world layout — site positions, landmark placement, world bounds,
and the routing data derived from them — instead of every theme sharing one hardcoded layout.

## ADDED Requirements

### Requirement: Campus layout is resolved per theme
The system SHALL resolve a campus theme's site positions, landmark placement and footprints,
world/base bounds, and NPC spots from a layout associated with that theme's id, rather than from
a single value shared by every theme.

#### Scenario: Two themes resolve independent layouts
- **WHEN** two different theme ids are each asked for their campus layout
- **THEN** each layout is resolved independently, and a position or bounds value that is correct
  for one theme is not silently applied to the other

### Requirement: Existing themes keep their current layout unchanged
`vinuni` and `town` SHALL resolve to the same site positions, landmark placement, world bounds,
and obstacle list they rendered with before per-theme layouts existed.

#### Scenario: Vinuni scene is unchanged
- **WHEN** the `vinuni` theme's campus layout is resolved after this change
- **THEN** every site position, the landmark's position and footprints, and the world/base bounds
  equal their pre-change values exactly

#### Scenario: Town scene is unchanged
- **WHEN** the `town` theme's campus layout is resolved after this change
- **THEN** every site position, the landmark's position and footprints, and the world/base bounds
  equal their pre-change values exactly

### Requirement: Routing and obstacle data are derived per layout
The obstacle list and the walkability/visibility-graph routing data used by movement and
`routeTo()`-style pathfinding SHALL be derived from the active theme's own layout, and routing data
for one theme's layout SHALL NOT be reused when resolving a route for a different theme's layout.

#### Scenario: Routing graph does not leak between themes
- **WHEN** a route is computed for a theme whose layout differs from another theme already in use
  in the same process
- **THEN** the computed route reflects only the obstacles and bounds of the requested theme's own
  layout
