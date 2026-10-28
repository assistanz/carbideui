import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { NgccThemeService } from '../ngcc-theme-switcher/ngcc-theme.service';
import { NgccCarbonThemeName, NGCC_THEME_OPTIONS } from '../ngcc-theme-switcher/ngcc-theme.types';
import { NGCC_COLOR_THEME_PRESETS } from './ngcc-color-theme.presets';
import { getContrastRatio } from './utils/wcag-color-utils';

interface ContrastRow {
  label: string;
  fg: string;
  bg: string;
  ratio: number;
  /** 4.5 for text, 3 for non-text UI parts */
  required: number;
  level: 'AAA' | 'AA' | 'Fail';
}

const CARBON_DEFAULT = 'carbon';

@Component({
  selector: 'ngcc-color-theme-presets-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <section class="panel">
        <h3>Color theme</h3>
        <div class="cards" role="radiogroup" aria-label="Color theme">
          <button
            type="button"
            role="radio"
            class="card"
            [class.card--active]="selected() === carbon"
            [attr.aria-checked]="selected() === carbon"
            (click)="select(carbon)"
          >
            <span class="swatches" aria-hidden="true">
              <span style="background:#0f62fe"></span>
              <span style="background:#f4f4f4"></span>
              <span style="background:#161616"></span>
            </span>
            <strong>Carbon default</strong>
            <small>IBM Carbon, unmodified</small>
          </button>
          @for (p of presets; track p.id) {
            <button
              type="button"
              role="radio"
              class="card"
              [class.card--active]="selected() === p.id"
              [attr.aria-checked]="selected() === p.id"
              (click)="select(p.id)"
            >
              <span class="swatches" aria-hidden="true">
                <span [style.background]="p.brandColor"></span>
                <span [style.background]="p.themeColors.white?.['layer-01']"></span>
                <span [style.background]="p.themeColors.g100?.['background']"></span>
              </span>
              <strong>{{ p.name }}</strong>
              <small>{{ p.description }}</small>
            </button>
          }
        </div>

        <h3>Base theme</h3>
        <div class="cards cards--row" role="radiogroup" aria-label="Base theme">
          @for (t of baseThemes; track t.value) {
            <button
              type="button"
              role="radio"
              class="card card--compact"
              [class.card--active]="baseTheme() === t.value"
              [attr.aria-checked]="baseTheme() === t.value"
              (click)="setBase(t.value)"
            >
              <strong>{{ t.label }}</strong>
            </button>
          }
        </div>

        <h3>WCAG target</h3>
        <div class="cards cards--row" role="radiogroup" aria-label="WCAG target">
          @for (level of levels; track level) {
            <button
              type="button"
              role="radio"
              class="card card--compact"
              [class.card--active]="wcagLevel() === level"
              [attr.aria-checked]="wcagLevel() === level"
              (click)="setLevel(level)"
            >
              <strong>{{ level }}</strong>
            </button>
          }
        </div>
      </section>

      <section class="panel">
        <h3>Preview</h3>
        <div class="preview">
          <h4>Quarterly overview</h4>
          <p>
            Primary text on the page background, with a
            <a href="#" (click)="$event.preventDefault()">link</a>.
          </p>
          <p class="secondary">Secondary text for labels and helper copy.</p>
          <div class="row">
            <button class="cds--btn cds--btn--primary" type="button">Primary</button>
            <button class="cds--btn cds--btn--secondary" type="button">Secondary</button>
            <button class="cds--btn cds--btn--tertiary" type="button">Tertiary</button>
            <button class="cds--btn cds--btn--ghost" type="button">Ghost</button>
            <button class="cds--btn cds--btn--danger" type="button">Danger</button>
          </div>
          <label class="cds--label" for="demo-input">Email address</label>
          <input
            id="demo-input"
            class="cds--text-input"
            type="text"
            placeholder="name@company.com"
          />
          <div class="row">
            <div class="cds--tile tile">Layer 01 tile</div>
            <div class="cds--tile tile tile--nested"><div class="nested">Layer 02 nested</div></div>
          </div>
        </div>
      </section>

      <section class="panel panel--wide">
        <h3>
          Contrast
          <span class="badge" [class.badge--fail]="!allPass()">
            {{ allPass() ? 'All checks pass WCAG ' + wcagLevel() : 'Some checks fail' }}
          </span>
        </h3>
        <table class="contrast">
          <thead>
            <tr>
              <th scope="col">Pair</th>
              <th scope="col">Sample</th>
              <th scope="col">Ratio</th>
              <th scope="col">Needs</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.label) {
              <tr>
                <th scope="row">{{ r.label }}</th>
                <td>
                  <span class="sample" [style.color]="r.fg" [style.background]="r.bg">Aa</span>
                </td>
                <td>{{ r.ratio.toFixed(2) }}:1</td>
                <td>{{ r.required }}:1</td>
                <td>
                  <span class="badge" [class.badge--fail]="r.level === 'Fail'">{{ r.level }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [
    `
      .demo {
        display: grid;
        grid-template-columns: minmax(18rem, 22rem) 1fr;
        gap: 1.5rem;
        padding: 1.5rem;
        color: var(--cds-text-primary);
        background: var(--cds-background);
        min-height: 100vh;
        box-sizing: border-box;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        border: 1px solid var(--cds-border-subtle-01);
        background: var(--cds-layer-01);
      }
      .panel--wide {
        grid-column: 1 / -1;
      }
      h3 {
        margin: 0;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .cards {
        display: grid;
        gap: 0.5rem;
      }
      .cards--row {
        grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        text-align: start;
        cursor: pointer;
        color: var(--cds-text-primary);
        background: var(--cds-layer-02);
        border: 1px solid var(--cds-border-strong-01);
      }
      .card small {
        color: var(--cds-text-secondary);
      }
      .card:focus-visible {
        outline: 2px solid var(--cds-focus);
        outline-offset: 2px;
      }
      .card--active {
        border-color: var(--cds-border-interactive);
        box-shadow: inset 0 0 0 1px var(--cds-border-interactive);
      }
      .card--compact {
        align-items: center;
      }
      .swatches {
        display: flex;
        height: 1.25rem;
      }
      .swatches span {
        flex: 1;
      }
      .preview {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--cds-background);
        border: 1px solid var(--cds-border-subtle-01);
      }
      .preview h4,
      .preview p {
        margin: 0;
      }
      .secondary {
        color: var(--cds-text-secondary);
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .tile {
        min-inline-size: 10rem;
      }
      .nested {
        padding: 0.5rem;
        background: var(--cds-layer-02);
      }
      .tile--nested {
        padding: 0.5rem;
      }
      .contrast {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .contrast th,
      .contrast td {
        padding: 0.5rem;
        text-align: start;
        border-bottom: 1px solid var(--cds-border-subtle-01);
      }
      .sample {
        display: inline-block;
        min-width: 2.5rem;
        padding: 0.125rem 0.5rem;
        text-align: center;
        font-weight: 600;
        border: 1px solid var(--cds-border-subtle-01);
      }
      .badge {
        padding: 0.125rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--cds-text-primary);
        border: 1px solid var(--cds-support-success);
      }
      .badge::before {
        content: '✓ ';
      }
      .badge--fail {
        border-color: var(--cds-support-error);
      }
      .badge--fail::before {
        content: '✕ ';
      }
      @media (max-width: 56rem) {
        .demo {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
class ColorThemePresetsDemo implements OnDestroy {
  private readonly color = inject(NgccColorThemeService);
  private readonly theme = inject(NgccThemeService);

  protected readonly carbon = CARBON_DEFAULT;
  protected readonly presets = NGCC_COLOR_THEME_PRESETS;
  protected readonly baseThemes = NGCC_THEME_OPTIONS;
  protected readonly levels = ['AA', 'AAA'] as const;

  protected readonly selected = signal<string>(CARBON_DEFAULT);
  protected readonly baseTheme = this.theme.theme;
  protected readonly wcagLevel = computed(() => this.color.wcagConfig().level);

  protected readonly rows = computed<ContrastRow[]>(() => {
    const theme = this.theme.theme();
    const level = this.wcagLevel();
    const text = level === 'AAA' ? 7 : 4.5;
    const ui = 3;
    const c = (token: Parameters<NgccColorThemeService['getThemeColor']>[1]): string =>
      this.color.getThemeColor(theme, token);
    const t = this.color.appliedTokens();

    const pairs: [string, string, string, number][] = [
      ['Text on background', c('text-primary'), c('background'), text],
      ['Text on layer 01', c('text-primary'), c('layer-01'), text],
      ['Text on layer 02', c('text-primary'), c('layer-02'), text],
      ['Secondary text on background', c('text-secondary'), c('background'), text],
      ['Secondary text on layer 01', c('text-secondary'), c('layer-01'), text],
      ['Link on background', t['--cds-link-primary'], c('background'), text],
      ['Primary button label', t['--cds-button-primary-text'], t['--cds-button-primary'], text],
      [
        'Danger button label',
        t['--cds-button-danger-text'],
        t['--cds-button-danger-primary'],
        text,
      ],
      ['Control border on background', c('border-strong'), c('background'), ui],
      ['Control border on layer 01', c('border-strong'), c('layer-01'), ui],
      ['Focus ring on background', t['--cds-focus'], c('background'), ui],
    ];

    return pairs
      .filter(([, fg, bg]) => !!fg && !!bg)
      .map(([label, fg, bg, required]) => {
        const ratio = getContrastRatio(fg, bg);
        const level = ratio >= required ? (ratio >= 7 ? 'AAA' : 'AA') : 'Fail';
        return { label, fg, bg, ratio, required, level };
      });
  });

  protected readonly allPass = computed(() => this.rows().every((r) => r.level !== 'Fail'));

  protected select(id: string): void {
    this.selected.set(id);
    if (id === CARBON_DEFAULT) this.color.resetOverrides();
    else this.color.applyPreset(id);
  }

  protected setBase(theme: NgccCarbonThemeName): void {
    this.theme.setTheme(theme);
  }

  protected setLevel(level: 'AA' | 'AAA'): void {
    this.color.setWcagLevel(level);
  }

  /** Don't leak this story's palette (it is persisted) into the next story. */
  ngOnDestroy(): void {
    this.color.resetOverrides();
  }
}

const meta: Meta<ColorThemePresetsDemo> = {
  title: 'Components/Color Theme Presets',
  component: ColorThemePresetsDemo,
  decorators: [applicationConfig({ providers: [provideZonelessChangeDetection()] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Three ready-made color themes, each defined for all four Carbon base themes (White, Gray 10,
Gray 90, Gray 100) so the palette keeps its character when the base theme changes.

| Preset | Brand | Neutrals |
| --- | --- | --- |
| Ocean | teal \`#007d79\` | cool blue-green |
| Royal | purple \`#6929c4\` | violet |
| Ember | burnt orange \`#ba4e00\` | warm earth |

**WCAG:** in every preset and base theme, text and secondary text are at least 7:1 on the background
and on both layers (AAA), and control borders are at least 3:1. The brand color is contrast-adjusted per
base theme by \`NgccColorThemeService\`. The table in the story recomputes every pair live for the AA or
AAA target you pick, and a spec checks every preset × base theme × level.

One known exception at AAA: Carbon's own secondary button on Gray 90 / Gray 100 (white on \`#6f6f6f\`) is
5:1. That comes from the Carbon base theme, not from the presets.

\`\`\`ts
const colorTheme = inject(NgccColorThemeService);
colorTheme.applyPreset('ocean');            // or any NGCC_COLOR_THEME_PRESETS entry
inject(NgccThemeService).setTheme('g90');   // base theme stays independent
\`\`\`

Presets use the same per-theme overrides as the color theme switcher, so users can fine-tune any
value afterwards.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<ColorThemePresetsDemo>;

export const Default: Story = {
  name: 'Presets × base themes',
};
