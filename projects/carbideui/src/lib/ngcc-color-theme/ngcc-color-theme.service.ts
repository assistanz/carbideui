import {
  Injectable,
  signal,
  effect,
  computed,
  inject,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NgccThemeService } from '../ngcc-theme-switcher/ngcc-theme.service';
import { NGCC_THEME_CONFIG } from '../ngcc-theme-switcher/ngcc-theme.types';
import {
  NGCC_COLOR_THEME_OPTIONS,
  NGCC_COLOR_THEME_PRESETS,
  NgccColorThemePreset,
} from './ngcc-color-theme.presets';
import {
  NgccWCAGConfig,
  NgccThemeAccessibilityReport,
  NgccTokenValidationResult,
  NgccColorThemeConfig,
  NgccColorThemeSnapshot,
  normalizeHexColor,
} from './ngcc-color-theme.types';
import {
  WCAGLevel,
  NgccAccessibilityIssue,
  checkContrast,
  adjustColorForContrast,
  getAccessibleTextColor,
  generateInteractiveStates,
  generateColorScale,
  getFocusIndicatorColor,
  validateColorToken,
  WCAG_CONTRAST,
  hexToHsl,
  hslToHex,
  derivePaletteFromBrand,
  NgccDerivedColorPalette,
} from './utils/wcag-color-utils';
import {
  CarbonThemeName,
  isThemeDark,
  getThemeSecondaryButtonBg,
  NgccThemeColorOverrides,
  NgccThemeColorToken,
  getThemeBaseColor,
  isCarbonThemeName,
  isDerivedThemeColorToken,
  isThemeColorToken,
  themeColorCssVars,
} from './tokens/index';

/**
 * Color Theme Service with WCAG 2.1 Compliance
 *
 * Accepts a single brand color and auto-generates all derived colors.
 * Base theme tokens are applied by Carbon's SCSS via [data-carbon-theme].
 * Dynamic tokens (interactive, button, link, etc.) are applied as inline CSS overrides.
 */
@Injectable({ providedIn: 'root' })
export class NgccColorThemeService {
  // ─────────────────────────────────────────────────────────────────────────────
  // Signals (Reactive State)
  // ─────────────────────────────────────────────────────────────────────────────

  private static readonly DEFAULT_WCAG: NgccWCAGConfig = {
    level: 'AA',
    autoAdjust: true,
    reportIssues: true,
    uiContrastRatio: 3.0,
  };

  private static readonly FALLBACK_BRAND_COLOR = '#0f62fe';

  private readonly themeService = inject(NgccThemeService);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly themeConfig = inject(NGCC_THEME_CONFIG);
  private readonly colorOptions = inject(NGCC_COLOR_THEME_OPTIONS);
  /** Customizations of the app's default preset (empty without one); what reset returns to. */
  private defaultThemeColors: NgccThemeColorOverrides = {};

  /**
   * Carbon base theme. Owned by NgccThemeService (single source of truth for
   * `data-carbon-theme`). Corner style and button alignment don't affect color tokens.
   */
  readonly baseTheme = computed<CarbonThemeName>(() => this.themeService.theme());
  readonly brandColor = signal<string>(NgccColorThemeService.FALLBACK_BRAND_COLOR);
  private readonly defaultBrandColor = signal<string>(NgccColorThemeService.FALLBACK_BRAND_COLOR);

  /** WCAG configuration */
  readonly wcagConfig = signal<NgccWCAGConfig>({ ...NgccColorThemeService.DEFAULT_WCAG });

  /** Current accessibility report */
  readonly accessibilityReport = signal<NgccThemeAccessibilityReport | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed (Derived State)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Full palette derived from the single brand color */
  readonly derivedPalette = computed<NgccDerivedColorPalette>(() =>
    derivePaletteFromBrand(this.brandColor()),
  );

  /** Convenience accessors derived from palette */
  readonly primaryColor = computed(() => this.derivedPalette().primary);
  readonly secondaryColor = computed(() => this.derivedPalette().secondary);
  /** Status colors: the user's override for the active theme, else derived from the brand. */
  readonly dangerColor = computed(() => this.getThemeColor(this.baseTheme(), 'support-error'));
  readonly successColor = computed(() => this.getThemeColor(this.baseTheme(), 'support-success'));
  readonly warningColor = computed(() => this.getThemeColor(this.baseTheme(), 'support-warning'));
  /** @deprecated Misspelled; use warningColor. */
  readonly warningccolor = this.warningColor;
  readonly infoColor = computed(() => this.getThemeColor(this.baseTheme(), 'support-info'));

  readonly isDarkMode = computed(() => isThemeDark(this.baseTheme()));
  /** Effective page background of the active theme, including user customization. */
  readonly backgroundColor = computed(() => this.getThemeColor(this.baseTheme(), 'background'));

  readonly primaryScale = computed(() => generateColorScale(this.primaryColor()));
  readonly secondaryScale = computed(() => generateColorScale(this.secondaryColor()));

  readonly availableThemes = signal<CarbonThemeName[]>(['white', 'g10', 'g90', 'g100']);

  /**
   * User adjustments to the base themes (white, g10, g90, g100), kept per theme.
   * Emitted as `:root[data-carbon-theme='…']` token blocks: global CSS, no component edits.
   */
  readonly themeColorOverrides = signal<NgccThemeColorOverrides>({});

  /** CSS custom properties currently applied to :root (for inspection / copy). */
  readonly appliedTokens = signal<Record<string, string>>({});

  /**
   * Chart color configuration for Carbon Charts integration
   */
  readonly chartColorConfig = computed(() => {
    const theme = this.baseTheme();
    const isDark = isThemeDark(theme);
    const palette = this.derivedPalette();

    return {
      theme,
      colorScale: this.generateChartColorScale(
        palette.primary,
        palette.secondary,
        palette.danger,
        palette.warning,
        palette.info,
        isDark,
      ),
    };
  });

  constructor() {
    this.initDefaultPreset();
    this.restore();
    effect(() => this.applyTheme());
    effect(() => this.schedulePersist(this.snapshot()));
    inject(DestroyRef).onDestroy(() => {
      if (this.persistTimer) clearTimeout(this.persistTimer);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Chart Color Scale Generation
  // ─────────────────────────────────────────────────────────────────────────────

  private generateChartColorScale(
    primary: string,
    secondary: string,
    danger: string,
    warning: string,
    info: string,
    isDark: boolean,
  ): Record<string, string> {
    const primaryHsl = hexToHsl(primary);
    const secondaryHsl = hexToHsl(secondary);
    const infoHsl = hexToHsl(info);

    const generateShade = (hsl: { h: number; s: number; l: number }, delta: number): string => {
      return hslToHex({
        h: hsl.h,
        s: hsl.s,
        l: Math.max(0.15, Math.min(0.85, hsl.l + delta)),
      });
    };

    return {
      '1-1-1': primary,
      '1-1-2': generateShade(primaryHsl, isDark ? 0.12 : -0.12),
      '1-1-3': generateShade(primaryHsl, isDark ? 0.24 : -0.24),
      '1-1-4': generateShade(primaryHsl, isDark ? -0.12 : 0.12),
      '2-1-1': secondary,
      '2-1-2': generateShade(secondaryHsl, isDark ? 0.12 : -0.12),
      '2-1-3': generateShade(secondaryHsl, isDark ? 0.24 : -0.24),
      '2-1-4': generateShade(secondaryHsl, isDark ? -0.12 : 0.12),
      '3-1-1': info,
      '3-1-2': generateShade(infoHsl, isDark ? 0.15 : -0.15),
      danger,
      warning,
      Primary: primary,
      Secondary: secondary,
      Tertiary: info,
      Quaternary: generateShade(primaryHsl, isDark ? 0.2 : -0.2),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────────

  setBaseTheme(theme: CarbonThemeName): void {
    this.themeService.setTheme(theme);
  }

  /** Effective color of a base-theme token: the user's override, else Carbon's value. */
  getThemeColor(theme: CarbonThemeName, token: NgccThemeColorToken): string {
    return this.themeColorOverrides()[theme]?.[token] ?? this.defaultThemeColor(theme, token);
  }

  /**
   * What a token is without an override: Carbon's value for surfaces, text and borders; derived
   * from the brand color for status, link and focus (those are contrast-adjusted when applied).
   */
  defaultThemeColor(theme: CarbonThemeName, token: NgccThemeColorToken): string {
    if (!isDerivedThemeColorToken(token)) return getThemeBaseColor(theme, token);
    const palette = this.derivedPalette();
    switch (token) {
      case 'support-error':
        return palette.danger;
      case 'support-warning':
        return palette.warning;
      case 'support-success':
        return palette.success;
      case 'support-info':
        return palette.info;
      default:
        return palette.primary; // link, focus
    }
  }

  isThemeColorOverridden(theme: CarbonThemeName, token: NgccThemeColorToken): boolean {
    return this.themeColorOverrides()[theme]?.[token] !== undefined;
  }

  /**
   * Customize one color of one base theme. Accepts #rgb / #rrggbb; returns false for anything
   * else. Setting a token back to Carbon's own value removes the override.
   */
  setThemeColor(theme: CarbonThemeName, token: NgccThemeColorToken, color: string): boolean {
    const hex = normalizeHexColor(color);
    if (!hex || !isCarbonThemeName(theme) || !isThemeColorToken(token)) return false;
    this.themeColorOverrides.update((all) => {
      const forTheme = { ...all[theme] };
      if (hex === this.defaultThemeColor(theme, token)) delete forTheme[token];
      else forTheme[token] = hex;
      return this.withTheme(all, theme, forTheme);
    });
    return true;
  }

  /**
   * Apply a ready-made color theme (brand color + tinted neutrals for all four base themes).
   * Replaces current customizations. Accepts a preset or its id; returns false if unknown/invalid.
   */
  applyPreset(preset: NgccColorThemePreset | string): boolean {
    const found =
      typeof preset === 'string' ? NGCC_COLOR_THEME_PRESETS.find((p) => p.id === preset) : preset;
    const hex = found ? normalizeHexColor(found.brandColor) : null;
    if (!found || !hex) return false;
    this.brandColor.set(hex);
    this.themeColorOverrides.set(this.sanitizeOverrides(found.themeColors));
    return true;
  }

  /** Remove one override (token given) or every override of a theme. */
  resetThemeColors(theme: CarbonThemeName, token?: NgccThemeColorToken): void {
    this.themeColorOverrides.update((all) => {
      const forTheme = { ...all[theme] };
      if (token) delete forTheme[token];
      return this.withTheme(all, theme, token ? forTheme : {});
    });
  }

  private withTheme(
    all: NgccThemeColorOverrides,
    theme: CarbonThemeName,
    forTheme: Partial<Record<NgccThemeColorToken, string>>,
  ): NgccThemeColorOverrides {
    const next = { ...all, [theme]: forTheme };
    if (Object.keys(forTheme).length === 0) delete next[theme];
    return next;
  }

  /**
   * Set the brand color. All other colors are derived automatically.
   * Accepts #rgb or #rrggbb; returns false (and changes nothing) for anything else.
   */
  updateBrandColor(color: string): boolean {
    const hex = normalizeHexColor(color);
    if (!hex) return false;
    this.brandColor.set(hex);
    return true;
  }

  /** Set the default brand color used on initialization and reset. */
  setDefaultBrandColor(color: string): void {
    const hex = normalizeHexColor(color);
    if (!hex) return;
    this.defaultBrandColor.set(hex);
    // A color the user already chose (persisted) wins over the app default.
    if (!this.hasPersisted) this.brandColor.set(hex);
  }

  /** @deprecated Use updateBrandColor() instead. */
  updatePrimary(color: string): void {
    this.updateBrandColor(color);
  }

  setWcagLevel(level: WCAGLevel): void {
    this.wcagConfig.update((config) => ({ ...config, level }));
  }

  setAutoAdjust(enabled: boolean): void {
    this.wcagConfig.update((config) => ({ ...config, autoAdjust: enabled }));
  }

  getThemeConfig(): NgccColorThemeConfig {
    const palette = this.derivedPalette();
    return {
      brandColor: this.brandColor(),
      primary: palette.primary,
      secondary: palette.secondary,
      danger: palette.danger,
      success: palette.success,
      warning: palette.warning,
      info: palette.info,
      primaryScale: this.primaryScale(),
      secondaryScale: this.secondaryScale(),
    };
  }

  validateColor(color: string, isLargeText: boolean = false): NgccTokenValidationResult {
    const bg = this.backgroundColor();
    const contrast = checkContrast(color, bg);

    return {
      token: 'custom',
      foreground: color,
      background: bg,
      contrastRatio: contrast.ratio,
      passesAA: isLargeText ? contrast.passesAALarge : contrast.passesAA,
      passesAAA: isLargeText ? contrast.passesAAALarge : contrast.passesAAA,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Theme Application
  // ─────────────────────────────────────────────────────────────────────────────

  private styleElement: HTMLStyleElement | null = null;

  private applyTheme(): void {
    const palette = this.derivedPalette();
    const config = this.wcagConfig();
    this.baseTheme(); // track theme changes so tokens are regenerated against the new background

    // `data-carbon-theme` is owned by NgccThemeService (read via baseTheme above).

    // 1. Generate dynamic color tokens
    const dynamicTokens = this.generateWcagCompliantTokens(palette, config);
    this.appliedTokens.set(dynamicTokens);

    // 2. Inject into <style> tag instead of inline styles
    this.updateThemeStyleTag(dynamicTokens);

    // 3. Generate report
    const report = this.generateAccessibilityReport(dynamicTokens, config);
    this.accessibilityReport.set(report);

    if (config.reportIssues && report.issues.length > 0) {
      console.warn('[NgccColorThemeService] Accessibility issues detected:', report.issues);
    }
  }

  private updateThemeStyleTag(tokens: Record<string, string>): void {
    if (!this.doc?.head) return;
    if (!this.styleElement) {
      this.styleElement = this.doc.getElementById('ngcc-dynamic-theme') as HTMLStyleElement;
      if (!this.styleElement) {
        this.styleElement = this.doc.createElement('style');
        this.styleElement.id = 'ngcc-dynamic-theme';
        this.doc.head.appendChild(this.styleElement);
      }
    }

    this.styleElement.textContent = this.renderCss(tokens);
  }

  /** Brand tokens on :root, then one block per customized base theme. */
  private renderCss(tokens: Record<string, string>): string {
    const block = (selector: string, vars: Record<string, string>): string =>
      `${selector} {\n${Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')}\n}`;

    const blocks = [block(':root', tokens)];
    for (const [theme, overrides] of Object.entries(this.themeColorOverrides())) {
      const vars: Record<string, string> = {};
      for (const [token, color] of Object.entries(overrides ?? {})) {
        // Derived colors (status, link, focus) are applied through the generated, contrast-adjusted
        // :root tokens; writing them verbatim here would bypass the WCAG adjustment.
        if (isDerivedThemeColorToken(token)) continue;
        Object.assign(vars, themeColorCssVars(token as NgccThemeColorToken, color));
      }
      if (Object.keys(vars).length) {
        // :root[attr] (0,2,0) beats Carbon's [data-carbon-theme] (0,1,0) without !important
        blocks.push(block(`:root[data-carbon-theme='${theme}']`, vars));
      }
    }
    return blocks.join('\n\n');
  }

  /** Restore the default brand color and WCAG settings. Base theme is left alone. */
  resetOverrides(): void {
    this.brandColor.set(this.defaultBrandColor());
    this.wcagConfig.set({ ...NgccColorThemeService.DEFAULT_WCAG });
    this.themeColorOverrides.set(this.sanitizeOverrides(this.defaultThemeColors));
    this.clearPersisted();
    // The effect only re-runs when a signal changed; re-apply for the already-default case.
    this.applyTheme();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export / Import / Persistence
  // ─────────────────────────────────────────────────────────────────────────────

  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  private hasPersisted = false;

  private get storageKey(): string {
    return `${this.themeConfig.storageKey}-color`;
  }

  private snapshot(): NgccColorThemeSnapshot {
    const { level, autoAdjust } = this.wcagConfig();
    const themeColors = this.themeColorOverrides();
    return {
      version: 1,
      brandColor: this.brandColor(),
      wcagLevel: level,
      autoAdjust,
      // Kept (even empty) when the app has a default preset, so "no customization" survives a reload.
      ...(Object.keys(themeColors).length || Object.keys(this.defaultThemeColors).length
        ? { themeColors }
        : {}),
    };
  }

  /** Serializable settings, e.g. to save to a user profile on your backend. */
  exportConfig(): NgccColorThemeSnapshot {
    return this.snapshot();
  }

  /** Apply settings from exportConfig(). Returns false if the payload is invalid. */
  importConfig(input: string | Partial<NgccColorThemeSnapshot>): boolean {
    let data: Partial<NgccColorThemeSnapshot>;
    try {
      data = typeof input === 'string' ? JSON.parse(input) : input;
    } catch {
      return false;
    }
    const hex = normalizeHexColor(data?.brandColor ?? '');
    if (!hex) return false;
    this.brandColor.set(hex);
    this.wcagConfig.update((c) => ({
      ...c,
      level: data.wcagLevel === 'AAA' ? 'AAA' : 'AA',
      autoAdjust: data.autoAdjust !== false,
    }));
    // Older snapshots have no themeColors: leave the current customizations alone.
    if (data.themeColors !== undefined) {
      this.themeColorOverrides.set(this.sanitizeOverrides(data.themeColors));
    }
    return true;
  }

  /** Start from the app's default preset (provideNgccColorTheme). Saved user choices load after. */
  private initDefaultPreset(): void {
    const wanted = this.colorOptions.defaultPreset;
    const preset =
      typeof wanted === 'string' ? NGCC_COLOR_THEME_PRESETS.find((p) => p.id === wanted) : wanted;
    const hex = preset ? normalizeHexColor(preset.brandColor) : null;
    if (!preset || !hex) return;
    this.defaultBrandColor.set(hex);
    this.defaultThemeColors = this.sanitizeOverrides(preset.themeColors);
    this.brandColor.set(hex);
    this.themeColorOverrides.set(this.sanitizeOverrides(this.defaultThemeColors));
  }

  private sameOverrides(a: NgccThemeColorOverrides, b: NgccThemeColorOverrides): boolean {
    const themes = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<CarbonThemeName>;
    for (const theme of themes) {
      const x = a[theme] ?? {};
      const y = b[theme] ?? {};
      const tokens = new Set([...Object.keys(x), ...Object.keys(y)]) as Set<NgccThemeColorToken>;
      for (const token of tokens) if (x[token] !== y[token]) return false;
    }
    return true;
  }

  /** Persisted/imported data is untrusted: keep only known themes, tokens and valid hex colors. */
  private sanitizeOverrides(input: unknown): NgccThemeColorOverrides {
    const result: NgccThemeColorOverrides = {};
    if (!input || typeof input !== 'object') return result;
    for (const [theme, tokens] of Object.entries(input as Record<string, unknown>)) {
      if (!isCarbonThemeName(theme) || !tokens || typeof tokens !== 'object') continue;
      for (const [token, value] of Object.entries(tokens as Record<string, unknown>)) {
        const hex = typeof value === 'string' ? normalizeHexColor(value) : null;
        if (!isThemeColorToken(token) || !hex) continue;
        if (!isDerivedThemeColorToken(token) && hex === getThemeBaseColor(theme, token)) continue;
        result[theme] = { ...result[theme], [token]: hex };
      }
    }
    return result;
  }

  /** Applied tokens as a ready-to-paste CSS block. */
  toCss(): string {
    return this.renderCss(this.appliedTokens());
  }

  private restore(): void {
    if (!this.isBrowser || this.themeConfig.storage === 'none') return;
    try {
      const store = this.themeConfig.storage === 'session' ? sessionStorage : localStorage;
      const raw = store.getItem(this.storageKey);
      if (raw && this.importConfig(raw)) this.hasPersisted = true;
    } catch {
      /* storage blocked — run without persistence */
    }
  }

  /** Debounced so dragging the color picker doesn't write storage on every frame. */
  private schedulePersist(snapshot: NgccColorThemeSnapshot): void {
    if (!this.isBrowser || this.themeConfig.storage === 'none') return;
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      try {
        const store = this.themeConfig.storage === 'session' ? sessionStorage : localStorage;
        const isDefault =
          snapshot.brandColor === this.defaultBrandColor() &&
          snapshot.wcagLevel === NgccColorThemeService.DEFAULT_WCAG.level &&
          snapshot.autoAdjust === NgccColorThemeService.DEFAULT_WCAG.autoAdjust &&
          this.sameOverrides(snapshot.themeColors ?? {}, this.defaultThemeColors);
        if (isDefault && !this.hasPersisted) return;
        store.setItem(this.storageKey, JSON.stringify(snapshot));
        this.hasPersisted = true;
      } catch {
        /* quota exceeded or blocked */
      }
    }, 200);
  }

  private clearPersisted(): void {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.hasPersisted = false;
    if (!this.isBrowser) return;
    try {
      const store = this.themeConfig.storage === 'session' ? sessionStorage : localStorage;
      store.removeItem(this.storageKey);
    } catch {
      /* ignore */
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WCAG-Compliant Token Generation
  // ─────────────────────────────────────────────────────────────────────────────

  private generateWcagCompliantTokens(
    palette: NgccDerivedColorPalette,
    config: NgccWCAGConfig,
  ): Record<string, string> {
    const bg = this.backgroundColor();
    const isDark = this.isDarkMode();
    const targetRatio = config.level === 'AAA' ? WCAG_CONTRAST.AAA_NORMAL : WCAG_CONTRAST.AA_NORMAL;

    const adjustedPrimary = config.autoAdjust
      ? adjustColorForContrast(palette.primary, bg, targetRatio)
      : palette.primary;

    const adjustedSecondary = config.autoAdjust
      ? adjustColorForContrast(palette.secondary, bg, targetRatio)
      : palette.secondary;

    // The user's per-theme choices replace the brand-derived values; the same contrast
    // adjustment still applies to them.
    const custom = this.themeColorOverrides()[this.baseTheme()] ?? {};
    const baseDanger = custom['support-error'] ?? palette.danger;
    const baseSuccess = custom['support-success'] ?? palette.success;
    const baseWarning = custom['support-warning'] ?? palette.warning;
    const baseInfo = custom['support-info'] ?? palette.info;

    const adjustedDanger = config.autoAdjust
      ? adjustColorForContrast(baseDanger, bg, targetRatio)
      : baseDanger;

    const adjustedSuccess = config.autoAdjust
      ? adjustColorForContrast(baseSuccess, bg, targetRatio)
      : baseSuccess;

    const adjustedWarning = config.autoAdjust
      ? adjustColorForContrast(baseWarning, bg, WCAG_CONTRAST.AA_LARGE)
      : baseWarning;

    const adjustedInfo = config.autoAdjust
      ? adjustColorForContrast(baseInfo, bg, targetRatio)
      : baseInfo;

    const primaryStates = generateInteractiveStates(adjustedPrimary, bg);
    const secondaryStates = generateInteractiveStates(adjustedSecondary, bg);
    const dangerStates = generateInteractiveStates(adjustedDanger, bg);

    const textOnPrimary = getAccessibleTextColor(primaryStates.base, undefined, config.level);
    const textOnDanger = getAccessibleTextColor(dangerStates.base, undefined, config.level);

    const secondaryButtonBg = getThemeSecondaryButtonBg(this.baseTheme());
    const textOnSecondary = getAccessibleTextColor(secondaryButtonBg, undefined, config.level);

    // The focus ring is a UI component: 3:1 against the page, as WCAG 1.4.11 requires.
    const focusColor = custom['focus']
      ? config.autoAdjust
        ? adjustColorForContrast(custom['focus'], bg, WCAG_CONTRAST.AA_LARGE)
        : custom['focus']
      : getFocusIndicatorColor(bg, adjustedPrimary);

    const linkBase = custom['link'] ?? adjustedPrimary;
    const linkColor = config.autoAdjust
      ? adjustColorForContrast(linkBase, bg, targetRatio)
      : linkBase;

    const linkHoverHsl = hexToHsl(linkColor);
    const linkHover = hslToHex({
      ...linkHoverHsl,
      l: isDark ? Math.min(1, linkHoverHsl.l + 0.15) : Math.max(0, linkHoverHsl.l - 0.15),
    });

    return {
      '--cds-interactive': primaryStates.base,
      '--cds-border-interactive': primaryStates.base,
      '--cds-interactive-01': primaryStates.base,
      '--cds-interactive-02': primaryStates.hover,
      '--cds-interactive-03': primaryStates.active,
      '--cds-interactive-04': adjustedPrimary,

      '--cds-support-error': adjustedDanger,
      '--cds-support-success': adjustedSuccess,
      '--cds-support-warning': adjustedWarning,
      '--cds-support-info': adjustedInfo,
      '--cds-support-01': adjustedDanger,
      '--cds-support-02': adjustedSuccess,
      '--cds-support-03': adjustedWarning,
      '--cds-support-04': adjustedInfo,

      '--cds-button-primary': primaryStates.base,
      '--cds-button-primary-hover': primaryStates.hover,
      '--cds-button-primary-active': primaryStates.active,
      '--cds-button-tertiary': primaryStates.base,
      '--cds-button-tertiary-hover': primaryStates.hover,
      '--cds-button-tertiary-active': primaryStates.active,
      '--cds-button-danger-primary': dangerStates.base,
      '--cds-button-danger-secondary': isDark ? '#ff8389' : adjustedDanger,
      '--cds-button-danger-hover': dangerStates.hover,
      '--cds-button-danger-active': dangerStates.active,
      '--cds-button-primary-text': textOnPrimary,
      '--cds-button-secondary-text': textOnSecondary,
      '--cds-button-tertiary-text': primaryStates.base,
      '--cds-button-danger-text': textOnDanger,
      '--cds-button-disabled-text': '#8d8d8d',

      '--cds-button-danger': dangerStates.base,

      '--cds-link-primary': linkColor,
      '--cds-link-primary-hover': linkHover,
      '--cds-link-secondary': secondaryStates.base,
      '--cds-link-visited': this.getVisitedLinkColor(linkColor, isDark),
      '--cds-link-01': linkColor,

      '--cds-focus': focusColor,

      '--cds-icon-interactive': primaryStates.base,
      '--cds-icon-on-color': textOnPrimary,

      '--cds-text-on-color': textOnPrimary,
      '--cds-text-error': adjustedDanger,

      '--cds-highlight': this.getHighlightColor(adjustedPrimary, isDark),

      ...this.chartPalette(adjustedPrimary, adjustedSecondary, isDark),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility Report Generation
  // ─────────────────────────────────────────────────────────────────────────────

  private generateAccessibilityReport(
    tokens: Record<string, string>,
    config: NgccWCAGConfig,
  ): NgccThemeAccessibilityReport {
    const bg = this.backgroundColor();
    const issues: NgccAccessibilityIssue[] = [];
    const tokenValidation: Record<string, NgccTokenValidationResult> = {};

    const bgContrastTokens = [
      '--cds-link-01',
      '--cds-link-primary',
      '--cds-interactive-01',
      '--cds-support-error',
      '--cds-support-success',
    ];

    bgContrastTokens.forEach((name) => {
      const value = tokens[name];
      if (!value) return;

      const issue = validateColorToken(name, value, bg, config.level);
      if (issue) {
        issues.push(issue);
      }

      const contrast = checkContrast(value, bg);
      tokenValidation[name] = {
        token: name,
        foreground: value,
        background: bg,
        contrastRatio: contrast.ratio,
        passesAA: contrast.passesAA,
        passesAAA: contrast.passesAAA,
      };
    });

    // Only when the user customized this theme: text must stay readable on the surfaces it sits on.
    const theme = this.baseTheme();
    if (this.themeColorOverrides()[theme]) {
      const layer = this.getThemeColor(theme, 'layer-01');
      const textChecks: [string, string, string][] = [
        ['--cds-text-primary', this.getThemeColor(theme, 'text-primary'), bg],
        ['--cds-text-primary (on layer 01)', this.getThemeColor(theme, 'text-primary'), layer],
        ['--cds-text-secondary', this.getThemeColor(theme, 'text-secondary'), bg],
        ['--cds-text-secondary (on layer 01)', this.getThemeColor(theme, 'text-secondary'), layer],
      ];
      for (const [name, fg, surface] of textChecks) {
        const issue = validateColorToken(name, fg, surface, config.level);
        if (issue) issues.push(issue);
        const contrast = checkContrast(fg, surface);
        tokenValidation[name] = {
          token: name,
          foreground: fg,
          background: surface,
          contrastRatio: contrast.ratio,
          passesAA: contrast.passesAA,
          passesAAA: contrast.passesAAA,
        };
      }
    }

    const secondaryBtnBg = getThemeSecondaryButtonBg(this.baseTheme());

    const buttonTextPairs = [
      { fg: '--cds-button-primary-text', bg: '--cds-button-primary' },
      { fg: '--cds-button-secondary-text', bgValue: secondaryBtnBg },
      { fg: '--cds-button-danger-text', bg: '--cds-button-danger-primary' },
    ];

    buttonTextPairs.forEach(({ fg, bg: bgToken, bgValue: staticBg }) => {
      const fgValue = tokens[fg];
      const bgValue = staticBg || (bgToken ? tokens[bgToken] : undefined);
      if (!fgValue || !bgValue) return;

      const issue = validateColorToken(fg, fgValue, bgValue, config.level);
      if (issue) {
        issues.push(issue);
      }

      const contrast = checkContrast(fgValue, bgValue);
      tokenValidation[fg] = {
        token: fg,
        foreground: fgValue,
        background: bgValue,
        contrastRatio: contrast.ratio,
        passesAA: contrast.passesAA,
        passesAAA: contrast.passesAAA,
      };
    });

    return {
      compliant: issues.filter((i) => i.severity === 'error').length === 0,
      level: config.level,
      issues,
      tokenValidation,
      timestamp: new Date(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private getVisitedLinkColor(linkColor: string, isDark: boolean): string {
    const hsl = hexToHsl(linkColor);
    const visitedHue = (hsl.h + 270) % 360;
    return hslToHex({
      h: visitedHue,
      s: hsl.s * 0.8,
      l: isDark ? Math.min(0.7, hsl.l + 0.1) : hsl.l,
    });
  }

  private getHighlightColor(primary: string, isDark: boolean): string {
    const hsl = hexToHsl(primary);
    return hslToHex({
      h: hsl.h,
      s: isDark ? 0.4 : 0.8,
      l: isDark ? 0.25 : 0.9,
    });
  }

  private chartPalette(
    primary: string,
    secondary: string,
    isDark: boolean,
  ): Record<string, string> {
    const primaryHsl = hexToHsl(primary);
    const secondaryHsl = hexToHsl(secondary);

    const generateShade = (hsl: typeof primaryHsl, lightnessDelta: number): string => {
      return hslToHex({
        h: hsl.h,
        s: hsl.s,
        l: Math.max(0.1, Math.min(0.9, hsl.l + lightnessDelta)),
      });
    };

    const palette = [
      primary,
      generateShade(primaryHsl, isDark ? 0.15 : -0.15),
      generateShade(primaryHsl, isDark ? 0.3 : -0.3),
      secondary,
      generateShade(secondaryHsl, isDark ? 0.15 : -0.15),
      generateShade(secondaryHsl, isDark ? 0.3 : -0.3),
      '#da1e28',
      '#ff832b',
      '#f1c21b',
      '#9f1853',
      '#6929c4',
      '#005d5d',
    ];

    const colors: Record<string, string> = {};
    palette.forEach((c, i) => {
      colors[`--cds-chart-color-${i + 1}`] = c;
    });

    return colors;
  }
}
