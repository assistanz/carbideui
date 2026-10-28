import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { NgccButton } from '../ngcc-button/ngcc-button';
import { NGCC_BRAND_PRESETS, NgccBrandPreset, normalizeHexColor } from './ngcc-color-theme.types';
import {
  CarbonThemeName,
  NGCC_BRAND_TOKEN_NAMES,
  NGCC_THEME_COLOR_CATEGORIES,
  NGCC_THEME_COLOR_TOKENS,
  NgccThemeColorToken,
} from './tokens/index';
import { NGCC_COLOR_THEME_PRESETS, NgccColorThemePreset } from './ngcc-color-theme.presets';

type NgccColorThemeTab = 'colors' | 'brand' | 'a11y' | 'output';

@Component({
  selector: 'ngcc-color-theme-switcher',
  standalone: true,
  imports: [NgccButton],
  templateUrl: './ngcc-color-theme-switcher.html',
  styleUrls: ['./ngcc-color-theme-switcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccColorThemeSwitcher {
  private readonly colorService = inject(NgccColorThemeService);

  /** Optional default brand color provided by the consumer */
  readonly defaultColor = input<string>();
  /** Quick-pick brand colors. Pass an empty array to hide. */
  readonly presets = input<readonly NgccBrandPreset[]>(NGCC_BRAND_PRESETS);
  /** Show the WCAG compliance panel */
  readonly showAccessibility = input(true);
  /** Show the applied-token preview and copy/import/export tools */
  readonly showAdvanced = input(true);
  /** Show the editor for the active base theme's colors (background, layers, text, borders) */
  readonly showThemeColors = input(true);

  constructor() {
    effect(() => {
      const color = this.defaultColor();
      if (color) {
        this.colorService.setDefaultBrandColor(color);
      }
    });
  }

  protected readonly brandColor = this.colorService.brandColor;
  protected readonly baseTheme = this.colorService.baseTheme;
  protected readonly wcag = this.colorService.wcagConfig;
  protected readonly report = this.colorService.accessibilityReport;

  protected readonly primaryColor = this.colorService.primaryColor;
  protected readonly secondaryColor = this.colorService.secondaryColor;
  protected readonly dangerColor = this.colorService.dangerColor;
  protected readonly successColor = this.colorService.successColor;
  protected readonly warningColor = this.colorService.warningColor;
  protected readonly infoColor = this.colorService.infoColor;

  protected readonly themes: readonly CarbonThemeName[] = ['white', 'g10', 'g90', 'g100'];

  /** Built-in color themes offered as one-click starting points. */
  protected readonly colorPresets = NGCC_COLOR_THEME_PRESETS;
  protected readonly activePreset = signal('');
  protected readonly brandTokens = NGCC_BRAND_TOKEN_NAMES;

  /** Search over color names, descriptions and CSS token names. */
  protected readonly filter = signal('');

  protected readonly tab = signal<NgccColorThemeTab>('colors');
  protected readonly tabs = computed(() => {
    const all: { id: NgccColorThemeTab; label: string; show: boolean }[] = [
      { id: 'colors', label: 'Colors', show: this.showThemeColors() },
      { id: 'brand', label: 'Brand', show: true },
      { id: 'a11y', label: 'Accessibility', show: this.showAccessibility() },
      { id: 'output', label: 'Export', show: this.showAdvanced() },
    ];
    return all.filter((t) => t.show);
  });
  /** The chosen tab, or the first one still shown if it was switched off. */
  protected readonly activeTab = computed(() => {
    const tabs = this.tabs();
    return tabs.find((t) => t.id === this.tab())?.id ?? tabs[0].id;
  });

  /** Every customizable color of the active base theme, with whether it has been changed. */
  private readonly allRows = computed(() => {
    const theme = this.baseTheme();
    return NGCC_THEME_COLOR_TOKENS.map((t) => ({
      ...t,
      value: this.colorService.getThemeColor(theme, t.key),
      overridden: this.colorService.isThemeColorOverridden(theme, t.key),
    }));
  });

  /** Categories with their rows, narrowed by the search box. Empty categories are dropped. */
  protected readonly categories = computed(() => {
    const q = this.filter().trim().toLowerCase();
    const rows = this.allRows();
    return NGCC_THEME_COLOR_CATEGORIES.map((category) => {
      const inCategory = rows
        .filter((r) => r.category === category.id)
        .filter(
          (r) =>
            !q ||
            [r.label, r.description, r.key, ...r.cssVars].some((text) =>
              text.toLowerCase().includes(q),
            ),
        );
      return {
        ...category,
        rows: inCategory,
        modified: inCategory.filter((r) => r.overridden).length,
      };
    }).filter((c) => c.rows.length > 0);
  });

  protected readonly nothingMatches = computed(
    () => !!this.filter().trim() && this.categories().length === 0,
  );

  protected readonly modifiedCount = computed(
    () => this.allRows().filter((r) => r.overridden).length,
  );
  protected readonly themeHasOverrides = computed(() => this.modifiedCount() > 0);

  /** The color being edited on the right. Falls back to the first listed color. */
  protected readonly selectedKey = signal<NgccThemeColorToken | null>(null);
  protected readonly selectedRow = computed(() => {
    const visible = this.categories().flatMap((c) => c.rows);
    return visible.find((r) => r.key === this.selectedKey()) ?? visible[0] ?? null;
  });

  /** A paste-ready override for the selected color (static colors only). */
  protected readonly selectedSnippet = computed(() => {
    const row = this.selectedRow();
    if (!row) return '';
    const lines = row.cssVars.map((v) => `  ${v}: ${row.value};`).join('\n');
    return `:root[data-carbon-theme='${this.baseTheme()}'] {\n${lines}\n}`;
  });

  /** Arrow keys move between tabs (roving tabindex). */
  protected onTabKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const tabs = this.tabs();
    const at = tabs.findIndex((t) => t.id === this.activeTab());
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (at + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    this.tab.set(tabs[next].id);
    queueMicrotask(() =>
      (
        (event.currentTarget as HTMLElement).parentElement?.querySelector(
          `#ngcc-cts-tab-${tabs[next].id}`,
        ) as HTMLElement | null
      )?.focus(),
    );
  }

  /** Text field draft; follows the real brand color whenever it changes elsewhere. */
  protected readonly hexDraft = linkedSignal(() => this.brandColor());
  protected readonly hexInvalid = computed(() => normalizeHexColor(this.hexDraft()) === null);

  protected readonly errorCount = computed(
    () => this.report()?.issues.filter((i) => i.severity === 'error').length ?? 0,
  );
  protected readonly warningCount = computed(
    () => this.report()?.issues.filter((i) => i.severity === 'warning').length ?? 0,
  );

  /** Screen-reader announcement for the last action */
  protected readonly announcement = signal('');

  protected readonly transferText = linkedSignal(() =>
    JSON.stringify(this.colorService.exportConfig(), null, 2),
  );
  protected readonly transferError = signal(false);

  protected onPickerInput(value: string): void {
    this.colorService.updateBrandColor(value);
  }

  protected onHexInput(value: string): void {
    this.hexDraft.set(value);
    this.colorService.updateBrandColor(value); // ignored while invalid
  }

  protected selectPreset(preset: NgccBrandPreset): void {
    this.colorService.updateBrandColor(preset.color);
    this.announce(`Brand color set to ${preset.name}`);
  }

  protected isActivePreset(preset: NgccBrandPreset): boolean {
    return normalizeHexColor(preset.color) === this.brandColor();
  }

  protected onBaseThemeChange(theme: CarbonThemeName): void {
    this.colorService.setBaseTheme(theme);
  }

  /** Live while dragging the picker. */
  protected onThemeColorInput(token: NgccThemeColorToken, value: string): void {
    this.colorService.setThemeColor(this.baseTheme(), token, value);
  }

  /** Typed hex applies on commit (blur/Enter); an invalid value is reverted. */
  protected onThemeColorCommit(token: NgccThemeColorToken, event: Event): void {
    const field = event.target as HTMLInputElement;
    if (!this.colorService.setThemeColor(this.baseTheme(), token, field.value)) {
      field.value = this.colorService.getThemeColor(this.baseTheme(), token);
      this.announce('Invalid color. Enter a hex value like #f4f4f4.');
    }
  }

  protected resetThemeColor(token: NgccThemeColorToken): void {
    this.colorService.resetThemeColors(this.baseTheme(), token);
    this.announce('Color reset to the Carbon value');
  }

  protected resetThemeColors(): void {
    this.colorService.resetThemeColors(this.baseTheme());
    this.announce(`${this.baseTheme()} theme colors reset to Carbon defaults`);
  }

  protected onWcagLevelChange(level: string): void {
    this.colorService.setWcagLevel(level === 'AAA' ? 'AAA' : 'AA');
  }

  protected onAutoAdjustChange(enabled: boolean): void {
    this.colorService.setAutoAdjust(enabled);
  }

  protected resetOverrides(): void {
    this.colorService.resetOverrides();
    this.activePreset.set('');
    this.announce('Color theme reset to defaults');
  }

  protected applyColorPreset(preset: NgccColorThemePreset): void {
    if (!this.colorService.applyPreset(preset)) return;
    this.activePreset.set(preset.id);
    this.announce(`${preset.name} color theme applied`);
  }

  protected async copyToken(name: string): Promise<void> {
    await this.copy(name, `${name} copied`);
  }

  protected async copySnippet(): Promise<void> {
    await this.copy(this.selectedSnippet(), 'CSS copied');
  }

  protected async copyCss(): Promise<void> {
    await this.copy(this.colorService.toCss(), 'Theme CSS copied to clipboard');
  }

  protected async copyConfig(): Promise<void> {
    await this.copy(this.transferText(), 'Theme settings copied to clipboard');
  }

  protected applyConfig(): void {
    const ok = this.colorService.importConfig(this.transferText());
    this.transferError.set(!ok);
    this.announce(ok ? 'Theme settings applied' : 'Could not apply settings: invalid JSON');
  }

  private async copy(text: string, success: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.announce(success);
    } catch {
      this.announce('Copy failed. Clipboard access was denied.');
    }
  }

  private announce(message: string): void {
    // clear first so repeating the same message is re-announced
    this.announcement.set('');
    queueMicrotask(() => this.announcement.set(message));
  }
}
