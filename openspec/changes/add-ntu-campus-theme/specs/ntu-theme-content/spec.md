# Spec Delta

## Purpose

Defines the NTU theme's own content contract — spawn and tier placement, zone-to-tier mapping,
and its signage/dialogue naming convention — kept independent of the `vinuni` and `town` themes.

## ADDED Requirements

### Requirement: NTU theme is independent of existing themes
The `ntu` theme SHALL exist as its own manifest and asset directory under
`frontend/public/themes/ntu/`. Adding or changing the `ntu` theme SHALL NOT change the rendered
output, manifest, or behavior of the `vinuni` or `town` themes.

#### Scenario: Existing themes unaffected
- **WHEN** the `ntu` theme is added to the project
- **THEN** loading the `vinuni` or `town` theme produces the same scene as before the `ntu` theme
  existed

### Requirement: Player spawns on the upper tier at the gate
In the `ntu` theme, the player SHALL spawn on the upper terrain tier, at a position representing
the campus's main gate. The theme's landmark SHALL be placed on the lower terrain tier.

#### Scenario: Landmark not visible at spawn
- **WHEN** the player spawns in the `ntu` theme
- **THEN** the player's tier is the upper tier and the landmark's tier is the lower tier

### Requirement: Interactive zones stay on the upper tier
In the `ntu` theme, all interactive zones (library, watchtower, market) SHALL be placed on the
upper terrain tier. The lower tier SHALL contain only non-interactive scenery (administrative
building, labs, landmark).

#### Scenario: Lower tier has no zone entry point
- **WHEN** the player crosses to the lower tier in the `ntu` theme
- **THEN** no interactive zone's door or interaction point exists on the lower tier

### Requirement: Signage uses pre-2025 naming, dialogue uses informal naming
In the `ntu` theme, formal visual labels (signage, map legend, zone title text) SHALL use the
campus's pre-2025 faculty names. NPC dialogue SHALL use informal building block codes and casual
names regardless of the signage naming convention.

#### Scenario: Formal label uses pre-2025 name
- **WHEN** a formal label or map legend entry is rendered for a faculty building in the `ntu`
  theme
- **THEN** the label text is the pre-2025 faculty name, not the post-2025 member-school name

#### Scenario: NPC dialogue uses informal name
- **WHEN** an NPC refers to a building in dialogue in the `ntu` theme
- **THEN** the dialogue uses the informal block code or casual name, independent of which naming
  convention the formal signage uses
