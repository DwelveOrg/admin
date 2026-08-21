---
name: Dwelve Operations
description: A ward handover board for platform operators — enamel field, steel rail, one magnetic tile per case.
colors:
  room: "#e4e8e7"
  board: "#f4f6f5"
  tile: "#ffffff"
  rail: "#1d2321"
  rail-ink: "#ffffff"
  rail-soft: "#a9b3b1"
  rail-rule: "#333b39"
  ink: "#1a1d1f"
  ink-soft: "#4c5457"
  ink-faint: "#646c6f"
  rule: "#c6ccca"
  rule-soft: "#dde2e0"
  wash: "#e7eae9"
  violet: "#4c25e5"
  violet-hover: "#3d18ce"
  violet-ink: "#ffffff"
  violet-wash: "#eae6fe"
  ring: "#6e4bff"
  open: "#b04713"
  open-wash: "#f7e9df"
  review: "#0b6d79"
  review-wash: "#ddeff2"
  resolved: "#2c7a45"
  resolved-wash: "#e5f2e9"
  dismissed: "#5e6a6b"
  dismissed-wash: "#e7eae9"
  danger: "#b3271e"
  danger-wash: "#f9e4e2"
typography:
  count:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 2rem
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.5rem
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.25rem
    letterSpacing: "normal"
  note:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.125rem
    letterSpacing: "normal"
  board-label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.125rem
    letterSpacing: "0.055em"
  machine:
    fontFamily: "Azeret Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  testimony:
    fontFamily: "Petrona, ui-serif, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.002em"
rounded:
  sm: "2px"
  md: "3px"
  lg: "4px"
  xl: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-solid:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.violet-ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
    typography: "{typography.body}"
  button-solid-hover:
    backgroundColor: "{colors.violet-hover}"
    textColor: "{colors.violet-ink}"
  button-outline:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    height: "36px"
  input:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "36px"
    typography: "{typography.body}"
  tile:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  chip-open:
    backgroundColor: "{colors.open-wash}"
    textColor: "{colors.open}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  chip-review:
    backgroundColor: "{colors.review-wash}"
    textColor: "{colors.review}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  chip-resolved:
    backgroundColor: "{colors.resolved-wash}"
    textColor: "{colors.resolved}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  chip-dismissed:
    backgroundColor: "{colors.dismissed-wash}"
    textColor: "{colors.dismissed}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  nav-tab-active:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "32px"
---

# Design System: Dwelve Operations

## Overview

The model is the enamel handover board on a hospital ward wall at shift change:
ruled into columns, one magnetic tile per case, acuity colour doing the triage
before a word is read. An operator should be able to answer "how much is
waiting, and who needs a person now" from across the room. That is this
console's first question, so the board answers it the same way.

Light-first, which is unusual for an operator tool and follows from the content:
the evidence on screen is screenshots of a light product, and a near-black
chrome makes every one of them glare. Dark is a genuine second character for
evening triage — the enamel goes to slate, surfaces still step *up* toward the
tile, and every acuity colour brightens rather than desaturating.

## Colors

Strategy: **restrained in deployment, semantic in vocabulary.** The board is
enamel, graphite and rule. Colour appears only where it carries meaning, and
every colour on screen has a legend somewhere.

### Primary

`violet` `#4c25e5` is the operator's pen: primary actions, the current
selection, the drag-selection band on a chart. Never decoration. It is the
product's own action colour and keeps that meaning across both apps.

### Secondary — acuity

The four dispositions, carrying the product's semantics unchanged: `open`
`#b04713` (work not started), `review` `#0b6d79` (work in hand), `resolved`
`#2c7a45` (a fix), `dismissed` `#5e6a6b` (a conclusion, deliberately
colourless — a dismissal is not an achievement and a colour would let it read
as one down the column).

Each pairs with a `-wash` for chip grounds. Every value clears 4.5:1 on both
the tile and the enamel, in both characters.

### Neutral

`room` → `board` → `tile` is wall → vitreous enamel → magnetic tile. The enamel
is cool and very slightly green, which is what stops it reading as paper. `rail`
`#1d2321` is the board's steel frame. Text ramps `ink` → `ink-soft` →
`ink-faint`; `rule` and `rule-soft` are the ruled lines, `wash` the hover ground.

### Named Rules

- **No state is carried by colour alone.** Every disposition owns a drawn mark
  as well as a hue. See Signature Component below.
- **Chart series take the plate's own pen set**, declared in that plate's
  legend: graphite for the raw count, plus the acuity colour whose meaning
  actually matches the series (green for a completed attempt, amber for a filed
  report). Roles are not dispositions, so the membership ring uses graphite,
  teal and green with its own legend.
- **Violet never tints a surface** except `violet-wash` for a current selection.
- **A delta is graphite with a drawn caret**, never green-up/red-down; that
  would borrow a disposition's meaning to say "went up".

## Typography

Three faces, one per kind of text, because three kinds share a case file and
telling them apart is a reading aid rather than decoration.

- **Archivo** — the board speaking. One family carrying two widths: the `wdth`
  axis at 84% supplies the condensed setting a ruled board uses for column heads
  and field names, so there is no second sans to keep in sync.
- **Azeret Mono** — the machine reporting: idents, UUIDs, user agents, viewports,
  locales, builds. Read character by character.
- **Petrona** — the reporter's own words, and nothing else.

### Hierarchy

Fixed rem scale at roughly a 1.2 ratio, never fluid: an operator reads this at a
consistent DPI all day and a heading that shrinks inside a narrow pane looks
worse rather than better.

`count` 40px → `figure` 30px → `h1` 24px → `h2` 15px → `body` 13px → `note` 12px.

### Named Rules

- **12px is the floor.** Nothing functional is set smaller.
- **No eyebrows.** A heading carries its own weight; `.board-label` labels a
  column, a table head or a `<dt>`, never a heading.
- **Figures are tabular** board-wide, so counts do not jitter down a column.
- **Prose measure is capped** (`.testimony` at 68ch, page intros at ~62ch);
  tables and machine data run denser.

## Layout

Fixed-height app shell: `h-dvh` with a steel rail on top and internal scroll
regions below, so the docket and the tables both keep the full viewport. Content
is capped at 1440px. Responsive behaviour is structural — the docket becomes the
whole page under `lg` and the case file becomes its own route; the totals band
goes 4-up → 2-up; nav labels drop to icons under `md`.

## Elevation & Depth

A tile is a physical object resting on a board, so depth is a real shadow with
an offset and a soft blur, never a flat halo.

### Shadow Vocabulary

- `lift-1` — a tile resting on the enamel: `0 1px 1px rgb(26 29 31 / .06), 0 2px 5px -2px rgb(26 29 31 / .10)`
- `lift-2` — a tile picked up: a chart readout, a popover, the login sheet.

### Named Rules

- **Rules do the dividing, not shadows.** Hard 1px `rule` lines separate cells
  in a band, rows in a table, and a plate's header from its body.
- **Pressed controls move.** `active:translate-y-px` with the shadow removed.

## Shapes

3px corners throughout (`rounded.md`), 2px for chips and small controls. These
are magnetic tiles, not stickers; a 12px radius would break the material.

## Components

### Buttons

`solid` (violet pen), `outline` (a tile with a rule), `ghost`, `danger`. One
shape and one height across the whole board — the search button on `/schools`
and the save button on a case file are the same object.

### Chips

Disposition chips pair a wash ground with its ink and always carry the mark.

### Cards / Containers

`.tile` is the only container: white, 1px `rule`, 3px radius, `lift-1`. Plates
add a ruled header strip and an optional ruled footer. **Never nest tiles.**

### Inputs / Fields

36px tall, `rule` border, violet border plus a `ring/35` halo on focus. The
shared control is `w-full`; constrain it at the call site inside a flex row.

### Navigation

The rail is the frame. The current section is an **enamel tab** — the same
material as the board below it — so the tab reads as the surface you are
standing on rather than as a highlighted link. Material, not colour, does this.

### Signature Component — the acuity mark

Four silhouettes, not four colours: a solid block for work not started, a
half-filled block for work in hand, a check for a fix, a strike for a dismissal.
Drawn SVG at 12px, because no icon library has a glyph meaning "half done" that
does not also mean something else. This is what makes the board readable in
greyscale, on a projector, and to an operator who cannot separate amber from
green.

### Signature Component — the case tile

A carrier strip of acuity colour down the leading edge, as a real element rather
than a coloured border, because that is what it is: part of the object. Three
lines in triage order — ident and age, what the person said, who said it.

## Do's and Don'ts

### Do:

- Give every colour a legend and every state a shape.
- Set counts to be read from across the room.
- Use `cn()` from `src/lib/utils.ts` — it is tailwind-merge taught this board's
  font-size names.
- Read chart colours through `useBoardPalette`; `var()` does not resolve in SVG
  presentation attributes.
- Confirm a destructive action inline, in the console's own words.

### Don't:

- Put an eyebrow above a heading.
- Ship functional text below 12px.
- Nest a tile inside a tile, or reach for a soft rounded card.
- Raise `window.confirm` — it is the one surface here nobody designed.
- Let violet mean anything but "action" or "selected".
- Write `var(--font-sans|mono|serif)` in hand-authored CSS; use `var(--stack-*)`.
