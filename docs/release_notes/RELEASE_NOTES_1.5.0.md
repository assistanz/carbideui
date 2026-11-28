# Release Notes — v1.5.0

Minor release: the notification panel can now be translated, fits narrow containers, shows severity
without relying on color, and the header panel can be resized and dismissed from the keyboard.
Existing apps keep working; one accessibility role changed (see Behavior change). The content-switcher fix could also ship as a 1.4.2 patch.

## Notification list (`ngcc-notification-list`)

| Addition                   | Details                                                                                                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Translatable text**      | New `labels` input covering every fixed string: Mark all read, Clear all, the unread prefix, `{count} unread`, `Dismiss {title}` and the four severity names. Missing keys keep their English default. Exports `NgccNotificationListLabels` and `NGCC_NOTIFICATION_LIST_LABELS` |
| **Narrow containers**      | The header actions are icon plus text and collapse to icon only when the list is narrower than 22rem (a container query, so it follows the list, not the viewport). The text stays available to screen readers and as a tooltip. The header row can wrap                        |
| **Severity without color** | Every item, read or unread, shows a severity icon (information, success, warning, error) and a visually hidden text label. Color is no longer the only signal (WCAG 1.4.1)                                                                                                      |

```html
<ngcc-notification-list
  [items]="items()"
  [labels]="{ markAllRead: 'Tout marquer comme lu', unreadCount: '{count} non lues', dismiss: 'Ignorer {title}' }"
/>
```

### States, structure and content (new)

| Addition              | Details                                                                                                                                                                                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**           | `loading` shows skeleton rows (`aria-label` from `labels.loading`) while there are no items                                                                                                                                                                                                                            |
| **Error and stale**   | `error` (boolean or message) with a `retry` output. With no items it shows an error state; with items it keeps the last list and shows a "could not refresh" notice with Retry                                                                                                                                         |
| **Empty state**       | Uses `ngcc-empty-state` with `emptyTitle`, `emptyDescription` (falls back to `emptyText`), `emptyIcon` and an `[ngccNotificationEmptyAction]` slot                                                                                                                                                                     |
| **Time and grouping** | New item field `time` (Date, ISO string or epoch ms) renders `<time datetime>` with relative text via `Intl.RelativeTimeFormat` (follows `locale` or the page language). `groupBy="day"` adds Today / Yesterday / date headings (`labels.groupToday`, `groupYesterday`). `timestamp` still works as pre-formatted text |
| **Unread vs read**    | Unread items get a dot and a bold title; read items are calmer (regular weight, secondary color). Screen-reader text is kept                                                                                                                                                                                           |
| **Item content**      | `messageLines` clamps messages (full text in a tooltip); items accept `href` or `routerLink` (rendered as links, `itemClicked` still fires); a `ng-template[ngccNotificationLeading]` renders an icon or avatar per item; a per-item "mark as read" button and the new `markRead` output                               |
| **Item actions**      | Mark read and dismiss are 32px, revealed on hover and keyboard focus, always visible on touch devices                                                                                                                                                                                                                  |
| **Footer and paging** | `[ngccNotificationFooter]` slot; `hasMore` shows "Load more" and emits `loadMore`                                                                                                                                                                                                                                      |
| **Live announcement** | `announceNew` announces new unread arrivals politely (`labels.newNotifications`)                                                                                                                                                                                                                                       |
| **Count badge**       | `countVariant="neutral"` for a non-red badge; colors come from tokens                                                                                                                                                                                                                                                  |

## Header action (`ngcc-header-action`)

New `badge` input: `'dot'` or a count (hidden at 0, shown as `99+` above `badgeMax`). The count is added to the
button's accessible name (`badgeLabel`, default `{count} unread`) and the badge has a ring so it separates from
the icon on any theme. Style the ring with `--ngcc-header-action-ring`.

## Header panel (`ngcc-header-panel`)

| Addition            | Details                                                                                                                                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Width**           | `width` input (any CSS length) or the `--ngcc-header-panel-width` custom property. Never wider than the viewport. Default stays 16rem                                                                                                                                                        |
| **Dismissal**       | Escape and a click outside emit the new `closed` output; set `expanded` to false in response. `closeOnOutsideClick` turns the click off. A click on a `ngcc-header-action` or on any element with `aria-expanded` is not an outside click, so the opening control can still toggle the panel |
| **Focus**           | Focus returns to the element that had it when the panel opened, if focus was inside the panel or lost                                                                                                                                                                                        |
| **Size**            | `size="content"` fits the panel to its content (up to the viewport height); the default fills the height. `[ngccPanelFooter]` stays pinned at the bottom                                                                                                                                     |
| **Surface**         | Background is `--ngcc-header-panel-background` (default `--cds-layer-01`); set it to match your header under tinted color themes                                                                                                                                                             |
| **Motion**          | The slide transition is disabled under `prefers-reduced-motion`                                                                                                                                                                                                                              |
| **Collapsed state** | A collapsed panel is `inert`, so its content can no longer be reached with the keyboard                                                                                                                                                                                                      |

```html
<ngcc-header-panel
  [expanded]="open"
  ariaLabel="Notifications"
  width="24rem"
  (closed)="open = false"
>
  <ngcc-notification-list [items]="items()" />
</ngcc-header-panel>
```

## Form building blocks

### New: `ngcc-form-field`

Wraps one control with a label above, an optional marker, helper text, error text and an optional tooltip.
It links the first control inside (input, select, textarea or combobox) automatically: the label's `for`,
`aria-describedby` (helper or error, merged with ids you already set), `aria-invalid` and `aria-required`.
Required fields get an asterisk, optional ones get "(optional)" (`optionalLabel` translates it).

```html
<ngcc-form-field
  label="Hostname"
  [optional]="true"
  helperText="Letters and digits"
  [error]="error()"
>
  <input class="cds--text-input" formControlName="host" />
</ngcc-form-field>
```

### Consistent labels: `optional` and `tooltip` on every form component

`ngcc-input`, `ngcc-input-number`, `ngcc-text-area`, `ngcc-dropdown` and `ngcc-multi-select` take `optional`,
`optionalLabel` and `tooltip`, like `ngcc-form-field` (`ngcc-radio-tile-group` takes `optional`). Required shows
an asterisk and optional shows "(optional)". They share one internal label component, so the markup and
accessibility behavior are identical. Keep using each component's own `label`, `helperText` and error:
`ngcc-form-field` is for native and third-party controls, and in development it warns when it wraps a
component that already has its own label.

Fix: the `ngcc-dropdown` label pointed (`for`) at an id nothing carried. The trigger now has that id, so
clicking the label focuses the dropdown.

### `ngcc-accordion-item`: `[(expanded)]`

A two-way open state, so a form can open a section that holds an error or start one open. Leave it unset to
keep `defaultOpen`. Toggles by the user and by the accordion (single-open mode) are written back to the model.

### New: `ngcc-multi-select`

Searchable multi-select: chips with remove, group headings, "Select all" (acts on the matches), creating new
values (`creatable`, which with no options is a tag input), loading and error states with Retry, a keyboard
model and polite result announcements. Works with `[(value)]` and Angular forms. Texts go through `labels`.

### New: `ngcc-radio-tile-group`

One-of-many tiles with a selected state and a description line, built on native radio inputs inside Carbon's
selectable tile (arrow keys and screen reader semantics come from the browser). Works with Angular forms.

### New: `ngcc-section-nav`

Sticky "on this page" list: follows scrolling, jumps to a section (and moves focus there), and can flag
sections with `error`, `warning` or `complete` (written out for screen readers, not colour alone).

### New: `ngcc-action-bar`

Bottom bar for form actions with a status area (polite live region). Sticks to its scroll container, or
`fixed` to the viewport with a spacer so the last content is never covered.

### New: `ngcc-summary-tile`

Description-list tile for a live summary: empty values show an em dash read as "Not set", a header slot takes a
status tag.

### `ngcc-input-number`: units and stepping

`prefix` and `suffix` show a unit inside the field and are added to the accessible name. ArrowUp/ArrowDown now
step by `step` within `min`/`max` (the `step` input previously only set an attribute).

### `ngcc-table`: editable cells

Columns take `editor: 'text' | 'number' | 'select'` (with `options`, `min`, `max`, `step`), per-column
`validate`, a table-level `rowValidator`, and a `<ng-template ngccTableCell="key">` for custom cells. Edits are
written into the row object and reported by `cellEdit`, so the rows array is not replaced and selection,
sorting and paging are kept. `validate()` checks every row on every page; `validityChange` reports when the
table flips between valid and invalid.

## Icons: 175 cloud infrastructure icons

The `ICONS` registry (`ngcc-icon`) gains 177 names (175 distinct glyphs, 2 aliases: `volume` and
`persistent_volume` map to `block_storage`) in 10 categories: cloud infrastructure, compute, networking,
storage, Kubernetes, security, monitoring, billing, operations and common UI. They are Carbon-style filled
glyphs (32x32 viewBox, `currentColor`, snake_case names) with no new dependency. Existing icon names and the
`ngcc-icon` component are unchanged, and `NgccIconNameType` now covers the new names, so typos fail to compile.

Each category set (`computeIcons`, `storageIcons`, …) is also exported for direct import. The Storybook icon
story is now a searchable gallery with a category filter. Bundle impact is about +87 KB raw / +28 KB gzip
(see `docs/ICON_INVENTORY.md`).

```html
<ngcc-icon name="virtual_machine" size="lg" ariaLabel="Virtual machine" />
```

## Color theme: derived surface tokens

Customizing surfaces (for example the Ocean preset) used to override only a few Carbon tokens, so tokens
derived from them kept Carbon's neutral grays: table headers, selected rows and skeletons looked off-palette.
The token mapping now also drives:

- **Background:** `background-active`, `background-selected`, `background-selected-hover`,
  `skeleton-background`, `skeleton-element`.
- **Layer 01 / 02:** `layer-accent` (+ hover/active), `layer-active`, `layer-selected` (+ hover) and
  `field-hover`, for the base and `-01`/`-02` variants.
- **Text primary / secondary:** `text-disabled`, `icon-disabled`, `text-helper`, `text-placeholder`, as
  translucent mixes that follow the surface they sit on.

The change is in the token mapping only; no feature components were edited. Apps with no color customization
are unaffected.

## Fixes

- **`ngcc-dropdown` used fixed ids** (`dropdown-label`, `dropdown-error`, `dropdown-listbox`), so two or more
  dropdowns on a page repeated them and assistive technology read the wrong label or error. Ids now come from
  the component's own `inputId`. `aria-labelledby` now points at the label element (it previously held the
  label's text) and is left off when `ariaLabel` is set.
- **Content switcher: equal-width options truncated labels** when the switcher was only as wide as its
  content (for example in a title row, where "Executive Overview" showed as "Executi…"). The options are now
  equal columns of a grid (`1fr`), so they are equal whenever there is room and never narrower than the
  longest label. The sizing is no longer an inline style on the option, so an app can override it without
  `!important`. Checked in headless Chrome: 272px per segment in an auto-width switcher with no clipping,
  300px per segment at full width.
- **Content switcher: dividers, borders, corners and focus.** The 1.4.1 position rules were out-ranked by
  Carbon's `:first-child`/`:last-child` rules, so every tab kept dark lines on both sides. They now win
  (doubled container class, no `!important`), leaving the container outline plus one short divider between
  neighbours. Segments no longer draw their own top/bottom border, so `rounded` and `curved` no longer wrap
  each tab in a pill. The container and end segments follow `--ngcc-radius-button` for every corner style,
  so `square` is square. The focus ring shows for keyboard focus only (`:focus-visible`), and hovering a
  keyboard-focused tab no longer adds extra borders. Checked in headless Chrome for square, rounded, curved.

## Behavior change

The header panel's role is now `dialog` (non-modal, named by `ariaLabel`) instead of `complementary`, which
better describes a transient overlay. Update tests or selectors that look for `role="complementary"`.

## Not in this release

The form-kit request is covered. Tag input is the multi-select with `creatable` (no separate component).

The panel does not read the header's own theme automatically (you set `--ngcc-header-panel-background`),
and `NgccI18nService` is not wired in; pass translated strings through `labels`.

## Upgrade

No action needed. To translate the list, pass `labels`. To let the panel close itself, bind `(closed)`.
