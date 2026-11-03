# Spec Delta

## Purpose

Lets a campus theme represent a site with real elevation change as two or more flat terrain
tiers connected by stair crossings, so player movement and the camera can handle a hill-crown
campus without a continuous heightmap.

## ADDED Requirements

### Requirement: Theme declares terrain tiers
A campus theme MAY declare its terrain as two or more named tiers, each a flat plane at its own
world elevation with its own walkable bounds. A theme that declares no tiers SHALL behave as a
single implicit tier, preserving existing single-plinth themes unchanged.

#### Scenario: Single-tier theme is unaffected
- **WHEN** a theme's manifest declares no terrain tiers
- **THEN** the scene renders and the player moves exactly as it did before tiers existed

#### Scenario: Multi-tier theme declares two tiers
- **WHEN** a theme's manifest declares an "upper" tier and a "lower" tier, each with its own
  elevation and walkable bounds
- **THEN** the scene renders both tiers at their declared elevations and the player's walkable
  bounds are the union of each tier's bounds

### Requirement: Stair crossings connect tiers
A theme with multiple tiers SHALL declare one or more stair crossings, each identifying a pair of
adjacent tiers and a position on each tier where the crossing meets it. A position on one tier
that is not within a configured margin of any stair crossing SHALL be treated as not connected to
the other tier.

#### Scenario: Crossing position is reachable from both tiers
- **WHEN** a stair crossing is declared between the upper and lower tier at a given position pair
- **THEN** a walkable path exists from that position on the upper tier to the matching position
  on the lower tier

#### Scenario: No crossing exists far from any stair
- **WHEN** a player's position is not within the connecting margin of any declared stair crossing
- **THEN** that position does not provide a route to the other tier

### Requirement: Routing selects the nearest usable crossing
When the player's destination requires moving between tiers, the routing system SHALL select the
stair crossing that yields the shortest total path among all crossings connecting the player's
current tier to the destination's tier.

#### Scenario: Multiple crossings exist, nearest is chosen
- **WHEN** a theme declares four stair crossings between the upper and lower tier, and the player
  requests a destination on the lower tier
- **THEN** the computed route uses the crossing that produces the shortest path from the player's
  current position, not necessarily the first-declared crossing

#### Scenario: Destination and player share a tier
- **WHEN** the player's current tier and the destination's tier are the same
- **THEN** the route does not pass through any stair crossing

### Requirement: Camera frames the full multi-tier world
The camera's content bounds and overview zoom thresholds SHALL account for the combined
screen-space footprint of all declared tiers at their respective elevations, so that an overview
camera view includes every tier's content.

#### Scenario: Overview includes both tiers
- **WHEN** a theme declares an upper and a lower tier at different elevations
- **THEN** the overview camera's computed content bounds enclose the projected extents of both
  tiers' terrain and buildings
