# CLAUDE.md — carbideui (`@assistanz/carbideui`)

Angular component library built on IBM Carbon (`@carbon/styles`, `@carbon/charts`).
Library source: `projects/carbideui/src/`. Public surface: `projects/carbideui/src/public-api.ts`.

## Stack

- Angular 20/21, standalone components, Signals, `ChangeDetectionStrategy.OnPush`
- TypeScript ~5.9, Vitest (jsdom), Storybook 10
- Carbon CSS is global (`@use '@carbon/styles'`); component SCSS only adds `ngcc--*` rules

## Commands

| Task                   | Command                               |
| ---------------------- | ------------------------------------- |
| Unit tests             | `npm test` (or `npx vitest run <dir>`) |
| Type check (lib)       | `npx tsc -p projects/carbideui/tsconfig.lib.json --noEmit` |
| Lint                   | `npm run lint` (eslint + prettier)    |
| Build library          | `npm run build:lib`                   |
| Storybook              | `npm run storybook`                   |

Run tests, type check, lint and `build:lib` before calling a change done.

## Component conventions

Each component folder contains `ngcc-<name>.ts`, `.html`, `.scss`, `.types.ts`, a spec, a story, and is
re-exported from `public-api.ts`.

- Selector prefix `ngcc-`, class prefix `ngcc--`, exported symbols prefixed `Ngcc` (eslint enforces this,
  including interfaces).
- New code uses signal APIs: `input()`, `output()`, `model()`, `viewChild()`, `computed()`,
  `inject(DestroyRef).onDestroy()`. Older components (accordion, button, …) still use `@Input()` +
  `ngOnChanges`; do not rewrite them as a side effect of unrelated work.
- Per-component styles live in that component's `.scss`; global styles live in `src/styles/`.
- Custom CSS tokens: `--sb--<property>`; Carbon tokens: `--cds-<token>`.
- Explicit return types on functions; no `any` where a type is available.

## Theming architecture

Three independent categories, each an attribute on `<html>`. Any combination must work.

| Category               | Attribute            | Values                                   | Styles                              |
| ---------------------- | -------------------- | ---------------------------------------- | ----------------------------------- |
| Color theme            | `data-carbon-theme`  | `white \| g10 \| g90 \| g100` (Carbon four) | `styles/custom-themes.scss`         |
| Corner style           | `data-corner-style`  | `square \| rounded \| curved`            | `styles/_theme-corners.scss`        |
| Button label alignment | `data-button-align`  | `left \| centered`                        | `styles/_theme-button-align.scss`   |

- **Corner style** is token driven: `--ngcc-radius-button`, `--ngcc-radius-input`, `--ngcc-radius-container`.
  Square 0/0/0 · Rounded 4px/4px/8px · Curved 999px/24px/16px. Square emits **no** component overrides
  (Carbon's own look); Rounded/Curved add global overrides at specificity (0,3,0), no `!important`.
  Controls: button, icon button, text input, search, select, dropdown trigger, content switcher.
  Containers: modal, side panel (`.cds--header-panel`, free corners only), tile, toast, popover,
  overflow menu options, dropdown list, header menu panel, data table. Tag stays as Carbon ships it;
  checkbox stays at Carbon's 2px. Modal-footer buttons stay square (the modal clips them).
  Focus rings must follow the active radius (`border-radius: inherit` on inner focus targets).
- **Button alignment**: Centered applies to `.cds--btn:not(.cds--btn--icon-only)` — label + icon centered,
  8px gap, balanced padding. Left is Carbon's default and emits nothing.
- **`NgccThemeService` is the single owner of all three attributes** and of the persisted choices
  (`theme()`, `cornerStyle()`, `buttonAlign()`, `setTheme/setCornerStyle/setButtonAlign`). Nothing else
  may write them. `setTheme()` only changes color; the old combined names `rounded|curved|centered` are
  still accepted and split into corner style / alignment.
- **Theme color customization** (`NgccColorThemeService.setThemeColor/resetThemeColors`): 13 colors in 5
  categories (`NGCC_THEME_COLOR_CATEGORIES`): surfaces (background, layer-01/02), text, borders, status
  (support-error/warning/success/info), links & focus. Stored per theme. **Static** colors (surfaces, text,
  borders) are emitted as `:root[data-carbon-theme='<theme>'] { --cds-… }` blocks inside
  `<style id="ngcc-dynamic-theme">`; defaults are Carbon's (`themeBaseColors` in `tokens/index.ts`, must match
  Carbon's compiled values). **Derived** colors (status, link, focus) are inputs to the token generator:
  never write them verbatim into the per-theme blocks (it would bypass the WCAG contrast adjustment); their
  default comes from the brand palette. Each token def lists the CSS variables it drives (`cssVars`); the picker
  shows them. Persisted in `ngcc-theme-color` as the optional `themeColors` field (additive, `version` stays 1);
  values are validated per theme/token/hex on read. The WCAG background uses the customized background.
- **Color theme presets** (`ngcc-color-theme.presets.ts`): `NGCC_COLOR_THEME_PRESETS` (ocean, royal, ember),
  each a brand color + overrides for all four base themes. Apps set a default with
  `provideNgccColorTheme({ defaultPreset })` (id or own preset): used only when the user has nothing saved,
  and it is what `resetOverrides()` returns to. `applyPreset()` replaces current customization.
  `auditNgccColorThemePreset(preset, 'AA'|'AAA')` returns failing WCAG pairs; the spec requires the built-in
  presets to pass AAA. Consumer docs: `docs/V1.4.0_USAGE_REFERENCE.md` and the Storybook guide story.
- `NgccColorThemeService` derives brand-color tokens and injects them as CSS custom properties in
  `<style id="ngcc-dynamic-theme">`. Its `baseTheme` is read-only, derived from `NgccThemeService`.
- Components consume theme through CSS tokens (`var(--cds-*)`, `var(--ngcc-radius-*)`), never by reading
  the active theme name.
- `--sb--button-corner-radius`, `--sb--input-corner-radius`, `--ngcc--input-corner-radius` are kept as
  aliases because existing components read them.
- Legacy `[data-carbon-theme='rounded|curved|centered']` CSS in `custom-themes.scss` is kept for apps that
  set the attribute by hand; the service never emits those values.
- App-wide configuration: `provideNgccTheme({...})` (`NGCC_THEME_CONFIG`).
- `styles/theme-styles.spec.ts` compiles the partials and guards this contract.
- **Consumer integration** (verified against the built package): Sass path is
  `@use '@assistanz/carbideui/styles/carbon';` (`.../styles` alone does not resolve; the package has no
  index). `provideNgccTheme()` / `provideNgccColorTheme()` (`ngcc-theme.providers.ts`) return
  `EnvironmentProviders` with an app initializer, so the theme applies at start-up without a switcher.
  Keep new provider helpers in that file (not in `*.types.ts`) to avoid import cycles with the services.
- **Storybook**: toolbar menus are custom `globalTypes` (`theme`, `cornerStyle`, `buttonAlign`) handled by
  `withAppearance` in `.storybook/preview.ts`; do not stack `withThemeByDataAttribute` (they share one key,
  only the last menu survives). A story that has its own theme controls sets
  `parameters.managesAppearance: true`. Args backed by string-literal unions need `type: { name: 'string' }`
  in `argTypes`, otherwise `?args=` links silently drop them. Verify story changes with a real
  `ng run carbideui:build-storybook` build plus a headless-Chrome screenshot, not only `tsc`.

## CONSTRAINTS — theme switcher components

These apply to `ngcc-theme-switcher`, `ngcc-color-theme` and anything else that changes theming.

1. **Do not edit individual feature components. Changes flow through tokens and global overrides.**
   - Theme work must be done in `src/styles/` (token definitions, `custom-themes.scss`, global overrides),
     the theme/color services, and the two switcher components themselves.
   - Do not touch `ngcc-button`, `ngcc-table`, `ngcc-modal`, `ngcc-charts`, etc. (templates, styles or
     logic) to make a theme or color work. If a feature component does not respond to a theme, fix the
     token or the global override so it does, not the component.
   - No `if (theme === …)` branches, theme-name classes, or hard-coded colors inside feature components.
   - Test stubs may be adjusted when a service's shape changes; that is not a component edit.
2. **Do not break existing theme behavior or stored user preferences. Migrate old keys if present.**
   - Existing theme names, the `data-carbon-theme` attribute, `NgccThemeService.setTheme()/getTheme()`,
     and public exports keep working. Add to the API; deprecate before removing (see `warningccolor`).
   - Persisted keys are part of the public contract. Any change to a storage key, location or value
     format must include a migration that reads the old value, writes the new one, and is covered by a test.
   - Current history to preserve:
     - `ngcc-theme` in `sessionStorage` as a bare theme name (legacy) → `ngcc-theme` in `localStorage`
       as JSON `{ theme, followSystem }`. Migrated in `NgccThemeService.migrateLegacy()`; the bare-string
       format is still readable.
     - v1 JSON `{ theme, followSystem }` where `theme` may be `rounded|curved|centered`, and bare
       `rounded|curved|centered` strings → v2 `{ version: 2, theme, followSystem, cornerStyle, buttonAlign }`
       (rounded/curved → white + that corner style; centered → white + centered buttons). Rewritten on load.
     - `ngcc-theme-color` in `localStorage`: `{ version: 1, brandColor, wcagLevel, autoAdjust }`.
       Bump `version` and add a migration if the shape changes.
   - Persisted data is untrusted: validate on read (theme names, hex colors), ignore anything invalid
     and fall back to defaults. Storage access must be wrapped in try/catch and guarded for SSR.
   - A persisted user choice always wins over an app-provided default (`defaultColor`, `defaultTheme`).

## Testing expectations for theme changes

- Cover: default, persist + restore, legacy-key migration, corrupt/unknown stored values, system
  preference changes, cross-tab sync, reset.
- Clear `localStorage` and `sessionStorage` in `beforeEach`; jsdom storage persists between tests in a file.
- Use `provideZonelessChangeDetection()` for component specs and `TestBed.tick()` to flush effects.
