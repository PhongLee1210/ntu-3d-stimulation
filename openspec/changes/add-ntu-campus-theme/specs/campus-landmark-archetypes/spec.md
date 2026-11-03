# Spec Delta

## Purpose

Defines the set of landmark shapes a campus theme may select, including the convention for
suggesting roof lettering without placing brand text or 3D text geometry in core scene code.

## ADDED Requirements

### Requirement: Theme selects a landmark archetype
A campus theme SHALL declare exactly one landmark archetype from a fixed set: a stepped tower
(`spire-hall`), a clock tower (`clock-tower`), or a long flat-roof seafront slab
(`seafront-slab`). The scene SHALL render the geometry corresponding to the declared archetype and
reject a manifest that declares an archetype outside this set.

#### Scenario: Seafront-slab archetype renders as a horizontal landmark
- **WHEN** a theme's manifest declares `landmark.archetype: "seafront-slab"`
- **THEN** the scene renders a long, low, flat-roof landmark rather than a vertical tower

#### Scenario: Unknown archetype is rejected
- **WHEN** a theme's manifest declares a `landmark.archetype` value outside the fixed set
- **THEN** the theme fails validation and does not render

### Requirement: Parapet sign suggests lettering without text
A theme MAY declare a `parapetSign` flag on its landmark. When true, the scene SHALL render an
instanced, irregularly-spaced row of fin shapes along the landmark's roofline, suggesting signage
at a distance, without rendering any text geometry or literal brand string anywhere under
`frontend/app`.

#### Scenario: Parapet sign enabled
- **WHEN** a theme declares `parapetSign: true` on its landmark
- **THEN** the rendered landmark shows an instanced row of roofline fins and no 3D text mesh
  exists anywhere in the scene

#### Scenario: Parapet sign disabled
- **WHEN** a theme declares `parapetSign: false` or omits the flag
- **THEN** the landmark's roofline renders without the fin row

### Requirement: Brand strings stay isolated to theme assets
Any literal brand name or institution name associated with a landmark's signage SHALL exist only
under that theme's directory in `frontend/public/themes/<id>/`, never in `frontend/app` or
`backend/src`, for every landmark archetype.

#### Scenario: Core code contains no brand string
- **WHEN** any landmark archetype, including `seafront-slab`, is rendered
- **THEN** no brand or institution name literal appears in `frontend/app` or `backend/src` source
