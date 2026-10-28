# Release Notes — v1.4.0

`@assistanz/carbideui` 1.4.0 adds a three-category theming system, color theme presets with WCAG auditing, and a new set of chart capabilities. It is backward compatible: existing theme names, `setTheme()/getTheme()`, the `data-carbon-theme` attribute and stored user preferences keep working.

## Highlights

- Theme switcher split into **Color theme**, **Corner style** and **Button label alignment**.
- Color theme picker redesigned and categorized, showing the CSS token names each color drives.
- Built-in **Ocean, Royal and Ember** presets (WCAG AAA), plus app-level defaults.
- New **`ngcc-sparkline`** and KPI-tile trends.
- New chart types: stacked area, combo, horizontal bar / ranked list, heat map. Threshold and goal lines. Shared loading and empty states.
- Table add-ons: status cells, expandable rows, single-row selection.
- New components: page header, stepper, avatar, popover, page and panel grid layout helpers.

## Theming

### Theme switcher
- Three independent categories, each an attribute on `<html>`; any combination works:
  - Color theme: `data-carbon-theme` = `white | g10 | g90 | g100`
  - Corner style: `data-corner-style` = `square | rounded | curved`
  - Button alignment: `data-button-align` = `left | centered`
- **Corner style** is token driven (`--ngcc-radius-button`, `--ngcc-radius-input`, `--ngcc-radius-container`):
  Square 0/0/0, Rounded 4px/4px/8px, Curved 999px/24px/16px. Square emits no overrides (Carbon's own look). Focus rings follow the active radius.
- **Button alignment**: Centered aligns label and icon with an 8px gap and balanced padding. Icon-only buttons are unaffected. Independent of corner style.
- All styling is applied through global overrides in `styles/_theme-corners.scss` and `styles/_theme-button-align.scss`. No feature component was modified.
- `NgccThemeService` is the single owner of all three attributes: new `cornerStyle()`, `buttonAlign()`, `setCornerStyle()`, `setButtonAlign()`.

### Color theme switcher
- Redesigned picker: tabs for Colors, Brand, Accessibility and Export. The Colors tab is a list (swatch, name, hex) with an editor on the right that shows the selected color's CSS tokens (e.g. info color to `--cds-support-info`), each with Copy, plus a paste-ready CSS override for static colors. Search finds a color by name or token. Arrow keys move between tabs.
- New switcher inputs: `showThemeColors`, `showAccessibility`, `showAdvanced` hide the matching tabs.
- Customize the base themes (white, g10, g90, g100) individually; overrides are stored per theme (13 colors in 5 categories).
- WCAG contrast adjustment still applies to derived colors (status, link, focus) and uses the customized background.
- Presets: `NGCC_COLOR_THEME_PRESETS` (ocean, royal, ember), `NGCC_COLOR_THEME_OPTIONS`, `auditNgccColorThemePreset(preset, 'AA' | 'AAA')`.
- `NgccColorThemeService`: `setThemeColor()`, `resetThemeColors()`, `applyPreset()`.

### App integration
- `provideNgccTheme({...})` and `provideNgccColorTheme({ defaultPreset })` return `EnvironmentProviders` with an app initializer, so the theme applies at start-up without a switcher on screen.
- A saved user choice always wins over an app default; `resetOverrides()` returns to the app default.
- Sass entry point: `@use '@assistanz/carbideui/styles/carbon';`

### Stored preferences and migration
- `ngcc-theme` is now `{ version: 2, theme, followSystem, cornerStyle, buttonAlign }`.
- Migrated automatically: legacy `sessionStorage` bare names; v1 JSON; bare or v1 `rounded | curved | centered` (rounded/curved become white + that corner style, centered becomes white + centered buttons).
- `ngcc-theme-color` gains an optional `themeColors` field (additive, `version` stays 1). All persisted values are validated on read; invalid data falls back to defaults.
- Old combined names (`rounded | curved | centered`) are still accepted by `setTheme()`.

## Charts

| Addition | Details |
|---|---|
| **`ngcc-sparkline`** | SVG line/area/bar, `status` or `sentiment` color, last-point marker, auto aria-label, loading and empty states |
| **KPI tile trend** | `ngcc-stat-tile` gains `[sparkline]`, `sparklineType`, `sparklineLabel`, `sparklineWidth`, `sparklineHeight` |
| **Stacked area, combo** | New `stackedArea` and `combo` types; `ngccComboChartTypes({ bars, lines })` |
| **Thresholds and goals** | `[thresholds]` draws limit (red) and goal (green) lines on bar, line, area and combo charts |
| **Horizontal bar / ranked list** | `horizontalBar` with `sort` and `limit`; top item shown first |
| **Heat map** | New `heatmap` type with `{ x, y, value }` data and color legend |
| **`NgccChartState`** | Shared loading (skeleton) and empty state for `NgccCharts` and the gauge chart |

New exports: `NgccChartType`, `NgccChartThreshold`, `NgccChartSort`, `rankChartData`, `toCarbonThresholds`, `ngccComboChartTypes`, `NgccChartState`, `NgccSparkline`.

## Table

| Addition | Details |
|---|---|
| **Status cell** | `cell: 'status'` with optional `statusMap` renders a tag with a dot and the text, so color is never the only signal. Built-in names (running, success, pending, warning, error, stopped) are colored; unknown values are gray |
| **Expandable rows** | Add `<ng-template ngccTableExpandedRow let-row>` inside `ngcc-table`. Several rows can be open; `(rowExpand)` emits `{ row, expanded }`; `config.expandable: false` hides it |
| **Single selection** | `rowSelection: 'single'` keeps one row and hides the select-all box |

New exports: `NgccTableExpandedRowDirective`.

## New components

| Component | Details |
|---|---|
| **`ngcc-page-header`** | Breadcrumbs, the page's one `<h1>`, description, `[ngccPageActions]`, `[ngccPageMeta]`, `[ngccPageTabs]` slots, loading skeleton |
| **`ngcc-stepper`** | Multi-step progress with complete, current and invalid states, `[(current)]`, linear or free navigation, vertical layout, optional step `id`, `next()` / `previous()` (both emit `stepChange`), empty-state summary |
| **`ngcc-avatar`** | Photo, initials or person icon, stable color per name, five sizes, circle or square, decorative option |
| **`ngcc-popover`** | Non-modal popover, click or hover trigger, 12 placements, closes on Escape and outside click, trigger gets `aria-expanded` and `aria-controls` |
| **`ngcc-page-grid`** | 4 / 8 / 12 column grid on Carbon breakpoints with `ngccGridSpan` (`sm`, `md`, `lg`, `start`) |
| **`ngcc-panel-grid`** | Wrapping panels of equal height per row; `columns`, `min`, `gap` |

## Fixes
- **Table selection followed page position, not the row.** After sorting or paging, the wrong rows were selected and emitted. Selection and expansion now follow the row and survive sorting; replacing `rows` clears them.
- **Clicking a table sort button toggled the sort twice** (ascending went straight to descending). Fixed.
- **Clicking a row's checkbox could toggle selection twice.** Row clicks now ignore clicks on controls inside the row.
- **Charts did not redraw when one non-empty dataset replaced another** (`NgccCharts` and the gauge). Fixed, with regression tests.

## Storybook
- Toolbar now shows all themes, corner styles and button alignments.
- Removed the "Enterprise Dashboard" demo story.
- Added a color theme guide story (exact code and token names, interactive controls) and a presets story (Ocean/Royal/Ember across white, g10, g90, g100).
- New stories for the sparkline, KPI trends and every new chart type, plus the invoice table, page header, stepper, avatar, popover and layout helpers.

## Documentation
- Added `CLAUDE.md` with architecture and the theme-switcher constraints.
- Added `docs/V1.4.0_USAGE_REFERENCE.md` (theming, the switcher layout, and a pointer table for the other additions); chart sections 23a–23d, component sections 23e–23i and a table add-ons subsection added to `docs/COMPONENT_USAGE_REFERENCE.md`.
- Usage references moved into `docs/`; the old `V1.3.1_COMPONENT_USAGE.md` is now `docs/V1.3.0_USAGE_REFERENCE.md`. README Sass path corrected.

## Behavior notes
- `sort` and `limit` apply to any chart type they are set on.
- Existing chart types keep their previous option handling; only `horizontalBar` and `heatmap` merge your `axes` with the defaults.
- Modal-footer buttons stay square in Rounded and Curved, because the modal clips them. Tags and checkboxes keep Carbon's shape.
- The legacy `[data-carbon-theme='rounded|curved|centered']` CSS remains for apps that set the attribute manually; the service no longer writes those values.

## Upgrade
No action needed for existing apps. To adopt the new features, see `docs/V1.4.0_USAGE_REFERENCE.md`.
