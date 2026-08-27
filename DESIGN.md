---
name: Dwelve Operations
description: A quiet platform topology—solid operational records connected by one precise violet route.
colors:
  canvas: "#f3f5f8"
  canvas-deep: "#e9edf2"
  surface: "#ffffff"
  surface-recessed: "#f0f3f7"
  ink: "#121722"
  ink-secondary: "#4d586a"
  ink-tertiary: "#667185"
  edge: "#dce1e8"
  edge-strong: "#c7ced8"
  action: "#6947dc"
  action-hover: "#5835c7"
  action-ink: "#ffffff"
  action-wash: "rgb(105 71 220 / 0.09)"
  open: "#a94c0a"
  review: "#087184"
  resolved: "#087047"
  dismissed: "#5b6576"
  danger: "#b32828"
  dark-canvas: "#0d1016"
  dark-surface: "#151922"
  dark-surface-raised: "#1a1f2a"
  dark-surface-recessed: "#0f131b"
  dark-ink: "#f0f2f6"
  dark-ink-secondary: "#b0b8c6"
  dark-ink-tertiary: "#929cad"
  dark-edge: "#2a303c"
  dark-action: "#9a83f4"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  figure:
    fontFamily: "Bricolage Grotesque, Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1.125rem"
    letterSpacing: "0.045em"
  machine:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.55
  testimony:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  xs: "4px"
  sm: "7px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  pill: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "38px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.action-ink}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "38px"
  input:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "38px"
    typography: "{typography.body}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  nav-active:
    backgroundColor: "{colors.action-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
---

# Design System: Dwelve Operations

## Overview

**Creative North Star: "The Platform Topology"**

Dwelve Operations is a quiet operating desk for a small, expert audience. Its visual world comes
from network maps and operations routing diagrams: stable nodes, hairline connections, fixed data
positions, and a persistent labeled route map. It deliberately avoids both a glowing sci-fi control
room and a generic card dashboard. Most of the interface is solid, neutral, and still.

Violet is the live route through the system. It marks navigation state, focus, and primary action;
it does not tint broad areas for atmosphere. The open-report count still changes a narrow edge
signal, preserving the product requirement that the queue has an ambient channel, but the same
count is always stated in text and navigation.

**Key Characteristics:**

- Solid surfaces over a plain, cool-neutral application field.
- Persistent, labeled desktop navigation; compact top and bottom navigation on narrow screens.
- Dense, aligned records with large interaction targets.
- Semantic report colors paired with distinct drawn marks.
- One restrained live signal, never room-filling glow.

## Colors

The palette is cool neutral slate with a deliberately scarce violet action route and four fixed
report dispositions.

### Primary

- **Route Violet** (`action`): primary actions, active navigation, selected route filters, and focus.
- **Route Violet Hover** (`action-hover`): the pressed or hovered step of an actionable violet control.

### Secondary

- **Open Amber** (`open`): untouched report work.
- **Review Cyan** (`review`): report work currently in hand.
- **Resolved Green** (`resolved`): completed report work and healthy state.
- **Dismissed Slate** (`dismissed`): a terminal conclusion without celebratory emphasis.
- **Lifecycle Red** (`danger`): destructive or blocked account/school state, never report disposition.

### Neutral

- **Topology Canvas** (`canvas`): the light theme page field.
- **Record White** (`surface`): panels, navigation, and controls at rest.
- **Recessed Slate** (`surface-recessed`): inputs, wells, selected-row context, and quiet groups.
- **Primary Ink** (`ink`), **Secondary Ink** (`ink-secondary`), and **Tertiary Ink**
  (`ink-tertiary`): the functional text ramp. Tertiary ink still clears the body-text contrast floor.
- Dark mode uses `dark-canvas`, `dark-surface`, the dark ink ramp, and brighter semantic equivalents.

### Named Rules

**The Route Rule.** Violet means the operator can act or is currently here. It is not decoration.

**The Two-Channel Rule.** A disposition always has a drawn mark and a written label or count in
addition to color.

**The Quiet Field Rule.** The ambient queue trace may warm or strengthen with live load, but never
competes with the solid record surfaces placed above it.

## Typography

**Display Font:** Bricolage Grotesque with Instrument Sans fallback

**Body Font:** Instrument Sans with system sans fallback

**Machine Font:** JetBrains Mono with system mono fallback
**Testimony Font:** Newsreader with Georgia fallback

**Character:** Display type gives the small number of page titles and readings a distinct operator
voice. Body type stays compact and neutral. Machine identifiers and a reporter's testimony each use
their own face because they require different reading behaviors.

### Hierarchy

- **Display** (600, up to 44px, 0.95): login thesis and rare large platform readings.
- **Figure** (600, 28px or 44px, tabular): operational counts.
- **Title** (600, 15–17px): panel and section titles.
- **Body** (400, 13px/20px): interface copy and list content, with prose capped near 68 characters.
- **Label** (600, 12px, 0.045em, uppercase): actual field, column, and group labels only.
- **Machine** (400, 12px): UUIDs, case idents, user agents, builds, and issued credentials.
- **Testimony** (400, 19px/1.65): only a reporter's words inside a case file.

### Named Rules

**The Voice Rule.** Display announces, sans operates, mono identifies, and serif testifies. Do not
use a font role as decoration outside its content type.

**The Twelve-Pixel Floor.** No functional text is smaller than 12px.

## Layout

At 1024px and wider, a 248px fixed sidebar owns global navigation and the route content scrolls in
the remaining page. Content caps at 1520px with 24–32px responsive gutters. The overview uses one
continuous platform map surface followed by two-column analysis panels; directories use full-width
record surfaces and entire rows as links.

Below 1024px the sidebar becomes a 56px top bar and a four-destination bottom dock. Long labels and
secondary columns progressively collapse, but every primary action stays at least 36px high and every
route remains available. The report docket becomes its own page beside a case file only when both
panes have enough width.

Spacing follows a 4px base rhythm. Tight control groups use 8–12px; panel content uses 16–20px; page
sections use 24–36px. Page headings have more space above their first major surface than panel
headings have below their description.

## Elevation & Depth

Depth is structural: a neutral field, solid panels, and recessed wells. Resting panels use a border
and a nearly imperceptible ambient lift. Raised surfaces are limited to command search, login, and
transient readouts. Primary actions may carry a small, offset violet pool; there are no zero-offset
halos or blurred glass panels.

### Shadow Vocabulary

- **Resting surface:** a 1px ambient contact shadow plus a soft 24px falloff used on ordinary panels.
- **Raised surface:** a small 2px contact shadow plus a soft 44px falloff used on transient layers.
- **Action lift:** a restrained violet shadow offset below primary controls and one-time credentials.

### Named Rules

**The Solid-by-Default Rule.** Tonal layering and borders establish hierarchy first. Blur is not a
container material.

## Shapes

Corners are disciplined and compact: 4px for tiny marks, 7px for controls, 10px for wells, and 12px
for full surfaces. Pills are reserved for tiny numeric badges or status chips whose content can vary
in width. Status traces are one pixel; broad colored side stripes are not part of the system.

## Components

### Buttons

- **Shape:** compact 7px corners with 32–44px height depending on importance.
- **Primary:** solid Route Violet with high-contrast action ink and a restrained offset lift.
- **Secondary:** solid record surface with a neutral border; ghost actions use a tonal hover only.
- **Danger:** neutral surface with red text until confirmation makes the consequence explicit.
- **States:** controls move down one pixel when pressed; disabled controls lose interaction and lift.

### Chips

- **Style:** low-opacity semantic wash, matching text, and a drawn mark where the chip carries state.
- **Selection:** route and filter selections use violet plus `aria-current` or `aria-pressed` semantics.

### Cards / Containers

- **Corner Style:** compact 12px surface corners and 10px recessed wells.
- **Background:** opaque surface tokens in both themes.
- **Shadow Strategy:** resting lift only; nested panels are prohibited.
- **Border:** one-pixel neutral edge; internal record rows use dividers or tonal hover, not new cards.
- **Internal Padding:** normally 16–20px.

### Inputs / Fields

- **Style:** recessed neutral ground, one-pixel border, 10px corners, 38px standard height.
- **Focus:** violet border plus a 3px transparent wash ring.
- **Error / Disabled:** red border/wash for error; reduced opacity and no pointer interaction when disabled.

### Navigation

Desktop navigation is a persistent labeled route map with a two-pixel violet active trace, icon,
label, and report count. Mobile uses a compact top utility bar and a bottom destination dock. All
destinations are actual links rather than client-only visual tabs.

### Platform Map

The overview's signature surface places accounts, schools, test activity, and the report queue in a
single aligned record. Each node is a full link, keeps its figures in fixed positions, and exposes
its supporting context without sparklines or decorative glow.

### One-Time Credential

The issued credential is the strongest violet wash in the console because it cannot be recovered
after navigation. It is masked by default, copyable, and explicitly says that it is shown once.

## Do's and Don'ts

### Do:

- **Do** use a single continuous surface when several values describe one operational object.
- **Do** make the whole directory or docket row the link and show a distinct focus state.
- **Do** preserve semantic report colors and their drawn marks in every new representation.
- **Do** state destructive consequences and reporter notification behavior beside the action.
- **Do** maintain dark and light themes, keyboard access, and reduced motion together.

### Don't:

- **Don't** reintroduce translucent glass, room-filling gradients, neon halos, or glow on status rows.
- **Don't** turn each metric or field into an independent rounded card.
- **Don't** use case idents as lookup keys or UUID shape to guess a record's domain.
- **Don't** use violet for decoration, or green/red to mean a trend direction.
- **Don't** nest a panel inside another panel; use a recessed well or an internal rule.
