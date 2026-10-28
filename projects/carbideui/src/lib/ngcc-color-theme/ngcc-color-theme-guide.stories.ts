import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { NgccThemeService } from '../ngcc-theme-switcher/ngcc-theme.service';
import {
  NgccButtonAlign,
  NgccCarbonThemeName,
  NgccCornerStyle,
} from '../ngcc-theme-switcher/ngcc-theme.types';
import {
  NGCC_COLOR_THEME_PRESETS,
  NgccColorThemePreset,
  auditNgccColorThemePreset,
} from './ngcc-color-theme.presets';
import {
  NGCC_BRAND_TOKEN_NAMES,
  NGCC_THEME_COLOR_CATEGORIES,
  NGCC_THEME_COLOR_TOKENS,
  NgccThemeColorToken,
  isDerivedThemeColorToken,
  themeColorCssVars,
} from './tokens/index';

type PresetChoice = 'carbon' | 'ocean' | 'royal' | 'ember';
type Tab = 'styles' | 'config' | 'component' | 'preset' | 'css' | 'tokens';

const TABS: { id: Tab; label: string }[] = [
  { id: 'styles', label: '1 · styles.scss' },
  { id: 'config', label: '2 · app.config.ts' },
  { id: 'component', label: '3 · component' },
  { id: 'preset', label: 'my-theme.ts' },
  { id: 'css', label: 'Plain CSS' },
  { id: 'tokens', label: 'Token names' },
];

/** Controls → token. Each control overrides one color of the selected base theme. */
const OVERRIDE_INPUTS: { arg: string; token: NgccThemeColorToken }[] = [
  { arg: 'background', token: 'background' },
  { arg: 'layer01', token: 'layer-01' },
  { arg: 'layer02', token: 'layer-02' },
  { arg: 'textPrimary', token: 'text-primary' },
  { arg: 'textSecondary', token: 'text-secondary' },
  { arg: 'borderSubtle', token: 'border-subtle' },
  { arg: 'borderStrong', token: 'border-strong' },
  { arg: 'errorColor', token: 'support-error' },
  { arg: 'warningColor', token: 'support-warning' },
  { arg: 'successColor', token: 'support-success' },
  { arg: 'infoColor', token: 'support-info' },
  { arg: 'linkColor', token: 'link' },
  { arg: 'focusColor', token: 'focus' },
];

const STYLES_SCSS = `// src/styles.scss  (register it under "styles" in angular.json)
@use '@carbon/styles/scss/config' with (
  $use-flexbox-grid: true,
  $font-path: '@ibm/plex'
);

@use '@assistanz/carbideui/styles/carbon';`;

/** Renders a value as TypeScript source (single quotes, unquoted keys where legal). */
function toTs(value: unknown, depth = 0): string {
  const pad = '  '.repeat(depth + 1);
  const end = '  '.repeat(depth);
  if (typeof value === 'string') return `'${value}'`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    if (!entries.length) return '{}';
    const lines = entries.map(([k, v]) => {
      const key = /^[a-z_$][\w$]*$/i.test(k) ? k : `'${k}'`;
      return `${pad}${key}: ${toTs(v, depth + 1)},`;
    });
    return `{\n${lines.join('\n')}\n${end}}`;
  }
  return String(value);
}

@Component({
  selector: 'ngcc-theme-integration-guide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="guide">
      <div class="left">
        <section class="panel">
          <h3>Live result</h3>
          <p class="note">
            Change the controls below the story. The preview, the generated code and the audit
            update together.
          </p>
          <div class="preview">
            <h4>Quarterly overview</h4>
            <p>
              Primary text on the page. <a href="#" (click)="$event.preventDefault()">A link</a>.
            </p>
            <p class="secondary">Secondary text for labels and helper copy.</p>
            <div class="row">
              <button class="cds--btn cds--btn--primary" type="button">Primary</button>
              <button class="cds--btn cds--btn--secondary" type="button">Secondary</button>
              <button class="cds--btn cds--btn--ghost" type="button">Ghost</button>
            </div>
            <input
              class="cds--text-input"
              type="text"
              placeholder="Text input"
              aria-label="Text input"
            />
            <div class="cds--tile">Tile on layer 01</div>
          </div>
        </section>

        <section class="panel">
          <h3>WCAG audit of the generated theme</h3>
          @for (level of levels; track level) {
            <h4>
              {{ level }}
              <span class="badge" [class.badge--fail]="audit()[level].length > 0">
                {{ audit()[level].length === 0 ? 'passes' : audit()[level].length + ' to fix' }}
              </span>
            </h4>
            @if (audit()[level].length) {
              <ul>
                @for (i of audit()[level]; track i.theme + i.check) {
                  <li>
                    <strong>{{ i.theme }}</strong> · {{ i.check }}: {{ i.ratio }}:1 (needs
                    {{ i.required }}:1)
                  </li>
                }
              </ul>
            }
          }
        </section>
      </div>

      <section class="panel code-panel">
        <div class="tabs" role="tablist" aria-label="Integration code">
          @for (t of tabs; track t.id) {
            <button
              type="button"
              role="tab"
              class="tab"
              [class.tab--active]="tab() === t.id"
              [attr.aria-selected]="tab() === t.id"
              (click)="tab.set(t.id)"
            >
              {{ t.label }}
            </button>
          }
        </div>
        <p class="note">{{ hint() }}</p>
        <div class="code-wrap">
          <button type="button" class="copy cds--btn cds--btn--ghost cds--btn--sm" (click)="copy()">
            {{ copied() ? 'Copied' : 'Copy' }}
          </button>
          <pre class="code" tabindex="0">{{ code() }}</pre>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .guide {
        display: grid;
        grid-template-columns: minmax(20rem, 28rem) minmax(0, 1fr);
        gap: 1rem;
        padding: 1.5rem;
        color: var(--cds-text-primary);
        background: var(--cds-background);
        box-sizing: border-box;
        align-items: start;
      }
      .left {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        border: 1px solid var(--cds-border-subtle-01);
        background: var(--cds-layer-01);
        min-width: 0;
      }
      h3,
      h4,
      p {
        margin: 0;
      }
      h3 {
        font-size: 0.875rem;
      }
      h4 {
        font-size: 0.8125rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .note {
        font-size: 0.8125rem;
        color: var(--cds-text-secondary);
      }
      .secondary {
        color: var(--cds-text-secondary);
      }
      .preview {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--cds-background);
        border: 1px solid var(--cds-border-subtle-01);
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }
      .tab {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        cursor: pointer;
        color: var(--cds-text-primary);
        background: var(--cds-layer-02);
        border: 1px solid var(--cds-border-subtle-01);
      }
      .tab--active {
        border-color: var(--cds-border-interactive);
        box-shadow: inset 0 -2px 0 var(--cds-border-interactive);
      }
      .tab:focus-visible,
      .code:focus-visible {
        outline: 2px solid var(--cds-focus);
        outline-offset: 2px;
      }
      .code-wrap {
        position: relative;
      }
      .copy {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
      }
      .code {
        margin: 0;
        padding: 0.75rem;
        max-height: 34rem;
        overflow: auto;
        font-size: 0.75rem;
        line-height: 1.5;
        background: var(--cds-layer-02);
        border: 1px solid var(--cds-border-subtle-01);
      }
      ul {
        margin: 0;
        padding-inline-start: 1.25rem;
        font-size: 0.8125rem;
        color: var(--cds-text-secondary);
      }
      .badge {
        padding: 0 0.5rem;
        font-size: 0.75rem;
        border: 1px solid var(--cds-support-success);
      }
      .badge::before {
        content: '✓ ';
      }
      .badge--fail {
        border-color: var(--cds-support-warning);
      }
      .badge--fail::before {
        content: '! ';
      }
      @media (max-width: 64rem) {
        .guide {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
class ThemeIntegrationGuide implements OnDestroy {
  private readonly color = inject(NgccColorThemeService);
  private readonly theme = inject(NgccThemeService);

  // ── Controls (Storybook args map to these inputs) ───────────────────────────
  readonly preset = input<PresetChoice>('ocean');
  readonly baseTheme = input<NgccCarbonThemeName>('white');
  readonly cornerStyle = input<NgccCornerStyle>('rounded');
  readonly buttonAlign = input<NgccButtonAlign>('left');
  readonly brandColor = input('');
  readonly background = input('');
  readonly layer01 = input('');
  readonly layer02 = input('');
  readonly textPrimary = input('');
  readonly textSecondary = input('');
  readonly borderSubtle = input('');
  readonly borderStrong = input('');
  readonly errorColor = input('');
  readonly warningColor = input('');
  readonly successColor = input('');
  readonly infoColor = input('');
  readonly linkColor = input('');
  readonly focusColor = input('');

  protected readonly tabs = TABS;
  protected readonly levels = ['AA', 'AAA'] as const;
  protected readonly tab = signal<Tab>('config');
  protected readonly copied = signal(false);

  /** Overrides the user typed in the controls, for the selected base theme only. */
  private readonly typed = computed(() => {
    const values: Record<string, string> = {
      background: this.background(),
      layer01: this.layer01(),
      layer02: this.layer02(),
      textPrimary: this.textPrimary(),
      textSecondary: this.textSecondary(),
      borderSubtle: this.borderSubtle(),
      borderStrong: this.borderStrong(),
      errorColor: this.errorColor(),
      warningColor: this.warningColor(),
      successColor: this.successColor(),
      infoColor: this.infoColor(),
      linkColor: this.linkColor(),
      focusColor: this.focusColor(),
    };
    return OVERRIDE_INPUTS.filter((o) => values[o.arg]).map((o) => ({
      token: o.token,
      color: values[o.arg],
    }));
  });

  /** True when the controls change anything beyond the named preset. */
  protected readonly isCustom = computed(() => this.typed().length > 0 || !!this.brandColor());

  constructor() {
    effect(() => {
      const preset = this.preset();
      const base = this.baseTheme();
      const corner = this.cornerStyle();
      const align = this.buttonAlign();
      const brand = this.brandColor();
      const typed = this.typed();

      untracked(() => {
        this.theme.setTheme(base);
        this.theme.setCornerStyle(corner);
        this.theme.setButtonAlign(align);
        if (preset === 'carbon') this.color.resetOverrides();
        else this.color.applyPreset(preset);
        if (brand) this.color.updateBrandColor(brand);
        for (const o of typed) this.color.setThemeColor(base, o.token, o.color);
      });
    });
  }

  // ── What the app would contain ──────────────────────────────────────────────

  /** The theme as a preset object: what the controls currently produce. */
  private readonly generated = computed<NgccColorThemePreset>(() => ({
    id: 'my-theme',
    name: 'My theme',
    description: 'Generated from the story controls',
    brandColor: this.color.brandColor(),
    themeColors: this.color.themeColorOverrides(),
  }));

  protected readonly audit = computed(() => ({
    AA: auditNgccColorThemePreset(this.generated(), 'AA'),
    AAA: auditNgccColorThemePreset(this.generated(), 'AAA'),
  }));

  private readonly configCode = computed(() => {
    const preset = this.preset();
    const custom = this.isCustom();
    const imports = ['provideNgccColorTheme', 'provideNgccTheme']
      .filter((n) => n === 'provideNgccTheme' || preset !== 'carbon' || custom)
      .join(', ');
    const lines = [
      `import { ApplicationConfig } from '@angular/core';`,
      `import { ${imports} } from '@assistanz/carbideui';`,
    ];
    if (custom) lines.push(`import { MY_THEME } from './my-theme';`);
    lines.push(
      '',
      'export const appConfig: ApplicationConfig = {',
      '  providers: [',
      '    // base theme, corner style, button alignment',
      '    provideNgccTheme({',
      `      defaultTheme: '${this.baseTheme()}',`,
      `      defaultCornerStyle: '${this.cornerStyle()}',`,
      `      defaultButtonAlign: '${this.buttonAlign()}',`,
      '    }),',
    );
    if (custom) {
      lines.push(
        '    // your color theme',
        '    provideNgccColorTheme({ defaultPreset: MY_THEME }),',
      );
    } else if (preset !== 'carbon') {
      lines.push(
        '    // color theme: built-in preset',
        `    provideNgccColorTheme({ defaultPreset: '${preset}' }),`,
      );
    } else {
      lines.push('    // Carbon colors: no color theme provider needed');
    }
    lines.push('  ],', '};', '', `// main.ts: bootstrapApplication(AppComponent, appConfig);`);
    return lines.join('\n');
  });

  private readonly componentCode = `import { Component } from '@angular/core';
import {
  NgccButton,
  NgccThemeSwitcher,
  NgccColorThemeSwitcher,
} from '@assistanz/carbideui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgccButton, NgccThemeSwitcher, NgccColorThemeSwitcher],
  template: \`
    <!-- optional: let users change base theme, corners, button alignment -->
    <ngcc-theme-switcher />
    <!-- optional: let users change brand color and base-theme colors -->
    <ngcc-color-theme-switcher />

    <ngcc-button label="Save" variant="primary" />
  \`,
})
export class AppComponent {}

// Change the theme from code instead (or as well):
//   const theme = inject(NgccThemeService);
//   theme.setTheme('g90');
//   theme.setCornerStyle('curved');
//   theme.setButtonAlign('centered');
//   inject(NgccColorThemeService).applyPreset('royal');`;

  private readonly presetCode = computed(() => {
    const g = this.generated();
    const body = toTs({
      id: g.id,
      name: g.name,
      description: 'Describe your theme',
      brandColor: g.brandColor,
      themeColors: g.themeColors,
    });
    return `// src/app/my-theme.ts
import { NgccColorThemePreset, auditNgccColorThemePreset } from '@assistanz/carbideui';

export const MY_THEME: NgccColorThemePreset = ${body};

// Optional safety net: log WCAG problems during development.
if (typeof ngDevMode !== 'undefined' && ngDevMode) {
  const issues = auditNgccColorThemePreset(MY_THEME, 'AA');
  if (issues.length) console.warn('MY_THEME fails WCAG AA', issues);
}`;
  });

  private readonly cssCode = computed(() => {
    const blocks: string[] = [];
    for (const [theme, tokens] of Object.entries(this.color.themeColorOverrides())) {
      const vars: Record<string, string> = {};
      for (const [token, value] of Object.entries(tokens ?? {})) {
        // status, link and focus are contrast-adjusted by the service, so they have no verbatim CSS
        if (isDerivedThemeColorToken(token)) continue;
        Object.assign(vars, themeColorCssVars(token as NgccThemeColorToken, value));
      }
      const body = Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
      blocks.push(`:root[data-carbon-theme='${theme}'] {\n${body}\n}`);
    }
    const header = `/* Add to src/styles.scss AFTER the @use lines. No TypeScript needed.
   The selector must stay :root[data-carbon-theme='…'] to beat Carbon's own rules. */`;
    if (!blocks.length) {
      return `${header}\n\n/* No surface, text or border overrides: pick a preset other than "carbon" or type a color in the controls.\n   Status, link and focus colors are contrast-adjusted, so set them through a preset (my-theme.ts). */`;
    }
    const brand = `\n\n/* Brand color tokens (links, buttons, focus, charts) are derived and contrast-adjusted per theme.
   To set them without TypeScript, use the "Copy CSS" button of <ngcc-color-theme-switcher>
   or call NgccColorThemeService.toCss(). */`;
    return `${header}\n\n${blocks.join('\n\n')}${brand}`;
  });

  private readonly tokenCode = computed(() => {
    const rows = NGCC_THEME_COLOR_CATEGORIES.flatMap((cat) => [
      `${cat.label.toUpperCase()}`,
      ...NGCC_THEME_COLOR_TOKENS.filter((t) => t.category === cat.id).map(
        (t) =>
          `  ${t.key.padEnd(15)} → ${t.cssVars.join(', ')}${t.derived ? '  (auto-adjusted)' : ''}`,
      ),
    ]);
    return `Customizable color      → CSS custom properties it drives
${'─'.repeat(78)}
BRAND (brandColor)
  brand           → ${NGCC_BRAND_TOKEN_NAMES.join(', ')}
${rows.join('\n')}

(auto-adjusted) = set through a preset or setThemeColor(); contrast-adjusted for the active base theme.

<html> attributes (owned by NgccThemeService, set at start-up):
  data-carbon-theme   white | g10 | g90 | g100
  data-corner-style   square | rounded | curved
  data-button-align   left | centered

Corner tokens (read by buttons, inputs, containers):
  --ngcc-radius-button      0 | 4px | 999px
  --ngcc-radius-input       0 | 4px | 24px
  --ngcc-radius-container   0 | 8px | 16px

localStorage keys: ngcc-theme (base theme, corners, alignment), ngcc-theme-color (brand + colors)`;
  });

  protected readonly code = computed(() => {
    switch (this.tab()) {
      case 'styles':
        return STYLES_SCSS;
      case 'config':
        return this.configCode();
      case 'component':
        return this.componentCode;
      case 'preset':
        return this.presetCode();
      case 'css':
        return this.cssCode();
      case 'tokens':
        return this.tokenCode();
    }
  });

  protected readonly hint = computed(() => {
    switch (this.tab()) {
      case 'styles':
        return 'Step 1. Load the styles once. Register this file under "styles" in angular.json.';
      case 'config':
        return 'Step 2. Add the providers. They apply the theme at app start-up; no switcher is required.';
      case 'component':
        return 'Step 3. Use the components. Switchers are optional.';
      case 'preset':
        return this.isCustom()
          ? 'Your controls produce this theme. Save it as src/app/my-theme.ts (referenced by app.config.ts).'
          : 'Only needed when you customize colors. Type a color in the controls below to generate it.';
      case 'css':
        return 'Alternative to TypeScript: plain CSS for the neutral colors you changed.';
      case 'tokens':
        return 'Every name you may need: color tokens, attributes, corner tokens, storage keys.';
    }
  });

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  /** Don't leak this story's palette (it is persisted) into the next story. */
  ngOnDestroy(): void {
    this.color.resetOverrides();
  }
}

const colorArg = (
  description: string,
  section = 'Surfaces, text, borders',
): Record<string, unknown> => ({
  control: 'color',
  description: `${description} Applies to the selected base theme. Leave empty to keep the preset's value (use "Reset controls" to clear).`,
  table: { category: `Overrides: ${section}` },
});

const tokenTable = NGCC_THEME_COLOR_TOKENS.map(
  (t) =>
    `| ${NGCC_THEME_COLOR_CATEGORIES.find((c) => c.id === t.category)?.label} | \`${t.key}\` | ${t.cssVars
      .map((v) => `\`${v}\``)
      .join(', ')}${t.derived ? ' (auto-adjusted)' : ''} |`,
).join('\n');

const meta: Meta<ThemeIntegrationGuide> = {
  title: 'Guides/Color themes: use and customize',
  component: ThemeIntegrationGuide,
  decorators: [applicationConfig({ providers: [provideZonelessChangeDetection()] })],
  args: {
    preset: 'ocean',
    baseTheme: 'white',
    cornerStyle: 'rounded',
    buttonAlign: 'left',
    brandColor: '',
    background: '',
    layer01: '',
    layer02: '',
    textPrimary: '',
    textSecondary: '',
    borderSubtle: '',
    borderStrong: '',
    errorColor: '',
    warningColor: '',
    successColor: '',
    infoColor: '',
    linkColor: '',
    focusColor: '',
  },
  argTypes: {
    preset: {
      // explicit so shared story links (?args=preset:…) are honored; unions infer as non-primitive
      type: { name: 'string' },
      control: 'select',
      options: ['carbon', 'ocean', 'royal', 'ember'],
      description: 'Built-in color theme. "carbon" = no color theme.',
      table: { category: 'Theme' },
    },
    baseTheme: {
      // explicit so shared story links (?args=baseTheme:…) are honored; unions infer as non-primitive
      type: { name: 'string' },
      control: 'radio',
      options: ['white', 'g10', 'g90', 'g100'],
      description: 'Carbon base theme. Every preset covers all four.',
      table: { category: 'Theme' },
    },
    cornerStyle: {
      // explicit so shared story links (?args=cornerStyle:…) are honored; unions infer as non-primitive
      type: { name: 'string' },
      control: 'radio',
      options: ['square', 'rounded', 'curved'],
      table: { category: 'Theme' },
    },
    buttonAlign: {
      // explicit so shared story links (?args=buttonAlign:…) are honored; unions infer as non-primitive
      type: { name: 'string' },
      control: 'radio',
      options: ['left', 'centered'],
      table: { category: 'Theme' },
    },
    brandColor: {
      control: 'color',
      description:
        "Brand color (links, primary buttons, focus, charts). Leave empty to keep the preset's.",
      table: { category: 'Your overrides' },
    },
    background: colorArg('Page background.'),
    layer01: colorArg('Cards, tiles and fields on the page.'),
    layer02: colorArg('Content nested inside layer 01.'),
    textPrimary: colorArg('Primary text and icons.'),
    textSecondary: colorArg('Labels, helper text.'),
    borderSubtle: colorArg('Dividers and container edges.'),
    borderStrong: colorArg('Input and control outlines.'),
    errorColor: colorArg(
      'Errors, invalid fields, danger buttons (--cds-support-error, --cds-text-error).',
      'Status',
    ),
    warningColor: colorArg('Warnings (--cds-support-warning).', 'Status'),
    successColor: colorArg('Success (--cds-support-success).', 'Status'),
    infoColor: colorArg('Info messages (--cds-support-info). Contrast-adjusted.', 'Status'),
    linkColor: colorArg(
      'Link text (--cds-link-primary and hover/visited). Contrast-adjusted.',
      'Links & focus',
    ),
    focusColor: colorArg(
      'Keyboard focus ring (--cds-focus). Contrast-adjusted to 3:1.',
      'Links & focus',
    ),
  },
  parameters: {
    layout: 'fullscreen',
    // The controls own the theme here, so the toolbar must not overwrite them.
    managesAppearance: true,
    docs: {
      description: {
        component: `
Use a built-in color theme (**Ocean**, **Royal**, **Ember**) in your own Angular app, or define your own.
The story's controls drive a real app: the **Theme** controls pick a preset, base theme, corner style and
button alignment; **Your overrides** change individual colors. The code tabs show exactly what to paste
into your project for the current settings.

### 1. Install

\`\`\`bash
npm install @assistanz/carbideui @carbon/styles @carbon/charts
\`\`\`

### 2. Styles: \`src/styles.scss\`

\`\`\`scss
@use '@carbon/styles/scss/config' with (
  $use-flexbox-grid: true,
  $font-path: '@ibm/plex'
);

@use '@assistanz/carbideui/styles/carbon';
\`\`\`

Register it in \`angular.json\`: \`"styles": ["src/styles.scss"]\`. Note the path ends in
\`/styles/carbon\`; \`@assistanz/carbideui/styles\` alone does not resolve in Sass.

### 3. Providers: \`src/app/app.config.ts\`

\`\`\`ts
import { ApplicationConfig } from '@angular/core';
import { provideNgccColorTheme, provideNgccTheme } from '@assistanz/carbideui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgccTheme({
      defaultTheme: 'g10',           // 'white' | 'g10' | 'g90' | 'g100'
      defaultCornerStyle: 'rounded', // 'square' | 'rounded' | 'curved'
      defaultButtonAlign: 'left',    // 'left' | 'centered'
    }),
    provideNgccColorTheme({ defaultPreset: 'ocean' }), // 'ocean' | 'royal' | 'ember' | your own
  ],
};
\`\`\`

\`main.ts\`: \`bootstrapApplication(AppComponent, appConfig)\`. The theme is applied at start-up; you do not need a
switcher on the page. A user's saved choice always wins over these defaults, and *Reset to Defaults* returns
to them.

### 4. Optional: let users change it

\`\`\`html
<ngcc-theme-switcher />        <!-- base theme, corner style, button alignment -->
<ngcc-color-theme-switcher />  <!-- brand color, base-theme colors, WCAG report -->
\`\`\`

\`\`\`ts
imports: [NgccThemeSwitcher, NgccColorThemeSwitcher]
\`\`\`

### 5. Your own theme

Type colors in **Your overrides** (they apply to the selected base theme), switch the base theme and repeat,
then copy the \`my-theme.ts\` tab. Pass the result as \`defaultPreset: MY_THEME\`. Check it with
\`auditNgccColorThemePreset(MY_THEME, 'AA' | 'AAA')\`: the panel in the story shows the same result.

### Token names

Customizable color → CSS custom properties it writes:

| Section | Color | Custom properties |
| --- | --- | --- |
${tokenTable}

**Auto-adjusted** colors (status, link, focus) are not written verbatim: the service derives their whole token
family (hover, text-on-color, …) and contrast-adjusts it for the active base theme, so set them with
\`setThemeColor()\` or a preset's \`themeColors\`, not by overriding the CSS variables yourself. The brand color
(\`brandColor\` / \`updateBrandColor()\`) drives ${NGCC_BRAND_TOKEN_NAMES.map((n) => `\`${n}\``).join(', ')}.

Attributes on \`<html>\`: \`data-carbon-theme\`, \`data-corner-style\`, \`data-button-align\`.
Corner tokens: \`--ngcc-radius-button\`, \`--ngcc-radius-input\`, \`--ngcc-radius-container\`.
Storage keys: \`ngcc-theme\`, \`ngcc-theme-color\`.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<ThemeIntegrationGuide>;

export const Integration: Story = {
  name: 'Integrate and customize',
};

/** Starting from Carbon with one change: the quickest "my own theme" path. */
export const OwnBrandOnly: Story = {
  name: 'Own brand color only',
  args: { preset: 'carbon', brandColor: '#d02670' },
};

export const PresetList: Story = {
  name: 'Available presets',
  args: { preset: 'royal' },
  parameters: {
    docs: {
      description: {
        story: `Built-in presets (\`NGCC_COLOR_THEME_PRESETS\`): ${NGCC_COLOR_THEME_PRESETS.map(
          (p) => `**${p.id}** (\`${p.brandColor}\`)`,
        ).join(', ')}.`,
      },
    },
  },
};
