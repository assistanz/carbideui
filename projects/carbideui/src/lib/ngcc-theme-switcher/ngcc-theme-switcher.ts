import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgccThemeService } from './ngcc-theme.service';
import {
  NGCC_BUTTON_ALIGN_OPTIONS,
  NGCC_CORNER_STYLE_OPTIONS,
  NGCC_THEME_OPTIONS,
  NgccButtonAlign,
  NgccCarbonThemeName,
  NgccCornerStyle,
  NgccThemeOption,
} from './ngcc-theme.types';

let nextId = 0;

@Component({
  selector: 'ngcc-theme-switcher',
  templateUrl: './ngcc-theme-switcher.html',
  styleUrls: ['./ngcc-theme-switcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccThemeSwitcher {
  private readonly themeService = inject(NgccThemeService);
  protected readonly uid = `ngcc-theme-switcher-${nextId++}`;

  /** Heading text. Set to an empty string to hide it. */
  readonly heading = input('Appearance');
  /** Restrict the color themes offered, e.g. `['white', 'g100']`. Defaults to all four. */
  readonly themes = input<readonly NgccCarbonThemeName[]>(NGCC_THEME_OPTIONS.map((o) => o.value));
  /** Show the "Match system" toggle */
  readonly showFollowSystem = input(true);
  /** Show the Corner style category */
  readonly showCornerStyle = input(true);
  /** Show the Button label alignment category */
  readonly showButtonAlign = input(true);
  /** Compact layout (swatch only, name as tooltip) */
  readonly compact = input(false);

  /** Emits the resolved color theme whenever it changes through this control */
  readonly themeChange = output<NgccCarbonThemeName>();
  readonly cornerStyleChange = output<NgccCornerStyle>();
  readonly buttonAlignChange = output<NgccButtonAlign>();

  protected readonly currentTheme = this.themeService.theme;
  protected readonly followSystem = this.themeService.followSystem;
  protected readonly currentCorner = this.themeService.cornerStyle;
  protected readonly currentAlign = this.themeService.buttonAlign;

  protected readonly cornerOptions = NGCC_CORNER_STYLE_OPTIONS;
  protected readonly alignOptions = NGCC_BUTTON_ALIGN_OPTIONS;
  protected readonly cornerValues = NGCC_CORNER_STYLE_OPTIONS.map((o) => o.value);
  protected readonly alignValues = NGCC_BUTTON_ALIGN_OPTIONS.map((o) => o.value);

  protected readonly options = computed<NgccThemeOption[]>(() => {
    const allowed = this.themes();
    return NGCC_THEME_OPTIONS.filter((o) => allowed.includes(o.value));
  });
  private readonly themeValues = computed(() => this.options().map((o) => o.value));

  protected readonly currentLabel = computed(
    () => NGCC_THEME_OPTIONS.find((o) => o.value === this.currentTheme())?.label ?? '',
  );

  protected readonly statusMessage = computed(() => {
    const theme = this.followSystem()
      ? `Matching system preference: ${this.currentLabel()} theme`
      : `${this.currentLabel()} theme`;
    return `${theme}, ${this.currentCorner()} corners, ${this.currentAlign()}-aligned buttons`;
  });

  protected selectTheme(theme: NgccCarbonThemeName): void {
    if (theme === this.currentTheme() && !this.followSystem()) return;
    this.themeService.setTheme(theme);
    this.themeChange.emit(theme);
  }

  protected selectCorner(style: NgccCornerStyle): void {
    if (style === this.currentCorner()) return;
    this.themeService.setCornerStyle(style);
    this.cornerStyleChange.emit(style);
  }

  protected selectAlign(align: NgccButtonAlign): void {
    if (align === this.currentAlign()) return;
    this.themeService.setButtonAlign(align);
    this.buttonAlignChange.emit(align);
  }

  protected onFollowSystemChange(enabled: boolean): void {
    this.themeService.setFollowSystem(enabled);
    this.themeChange.emit(this.themeService.theme());
  }

  protected onThemeKeydown(event: KeyboardEvent): void {
    this.navigate(event, this.themeValues(), this.currentTheme(), (v) => this.selectTheme(v));
  }

  protected onCornerKeydown(event: KeyboardEvent): void {
    this.navigate(event, this.cornerValues, this.currentCorner(), (v) => this.selectCorner(v));
  }

  protected onAlignKeydown(event: KeyboardEvent): void {
    this.navigate(event, this.alignValues, this.currentAlign(), (v) => this.selectAlign(v));
  }

  /** Roving tabindex: only the checked radio (or the first, if none) is tabbable. */
  protected tabIndex<T>(values: readonly T[], current: T, value: T): number {
    const active = values.includes(current) ? current : values[0];
    return value === active ? 0 : -1;
  }

  protected themeValuesList(): readonly NgccCarbonThemeName[] {
    return this.themeValues();
  }

  /** Arrow/Home/End navigation across a radio group. */
  private navigate<T>(
    event: KeyboardEvent,
    values: readonly T[],
    current: T,
    select: (value: T) => void,
  ): void {
    const index = Math.max(0, values.indexOf(current));
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % values.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + values.length) % values.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = values.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(values[next]);
    const group = (event.currentTarget as HTMLElement).closest('[role="radiogroup"]');
    queueMicrotask(() =>
      group?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus(),
    );
  }
}
