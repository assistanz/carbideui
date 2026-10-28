import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  BaseThemeNamesType,
  NGCC_THEME_CONFIG,
  NGCC_THEME_NAMES,
  NgccButtonAlign,
  NgccCarbonThemeName,
  NgccCornerStyle,
  isNgccButtonAlign,
  isNgccCornerStyle,
  isNgccThemeDark,
  isNgccThemeName,
  resolveNgccThemeName,
} from './ngcc-theme.types';

/** Persisted shape (version 2). */
interface NgccPersistedTheme {
  version: 2;
  theme: NgccCarbonThemeName;
  followSystem: boolean;
  cornerStyle: NgccCornerStyle;
  buttonAlign: NgccButtonAlign;
}

interface NgccReadResult {
  value: NgccPersistedTheme;
  /** True when the stored value was in an older format and should be rewritten. */
  upgraded: boolean;
}

/**
 * Single owner of the global theme attributes on `<html>`:
 *
 * | Setting        | Attribute            | Values                          |
 * | -------------- | -------------------- | ------------------------------- |
 * | Color theme    | `data-carbon-theme`  | white · g10 · g90 · g100        |
 * | Corner style   | `data-corner-style`  | square · rounded · curved       |
 * | Button align   | `data-button-align`  | left · centered                 |
 *
 * The three settings are independent; any combination is valid. Components are never
 * touched: global CSS reads these attributes (see `styles/_theme-corners.scss`).
 *
 * - Signal based: bind to `theme()`, `cornerStyle()`, `buttonAlign()`, `isDark()`.
 * - Persists choices (local/session storage, configurable) and migrates older formats.
 * - Optionally follows the OS light/dark preference in real time.
 * - Keeps other browser tabs in sync. SSR safe.
 */
@Injectable({ providedIn: 'root' })
export class NgccThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly config = inject(NGCC_THEME_CONFIG);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly selectedTheme = signal<NgccCarbonThemeName>(this.config.defaultTheme);
  private readonly _followSystem = signal(this.config.followSystem);
  private readonly _cornerStyle = signal<NgccCornerStyle>(this.config.defaultCornerStyle);
  private readonly _buttonAlign = signal<NgccButtonAlign>(this.config.defaultButtonAlign);
  private readonly systemDark = signal(false);

  /** True while the color theme is driven by the OS preference */
  readonly followSystem = this._followSystem.asReadonly();
  readonly cornerStyle = this._cornerStyle.asReadonly();
  readonly buttonAlign = this._buttonAlign.asReadonly();

  /** The Carbon color theme currently applied to the document */
  readonly theme = computed<NgccCarbonThemeName>(() =>
    this._followSystem()
      ? this.systemDark()
        ? this.config.systemDarkTheme
        : this.config.systemLightTheme
      : this.selectedTheme(),
  );

  readonly isDark = computed(() => isNgccThemeDark(this.theme()));

  constructor() {
    this.restore();
    this.watchSystemPreference();
    this.watchOtherTabs();
    this.apply(); // apply immediately, no flash before the first effect flush
    effect(() => this.apply());
  }

  /**
   * Pick an explicit color theme. This turns off "follow system".
   *
   * For backwards compatibility the old combined names still work and are split into the
   * independent settings: `'rounded'`/`'curved'` also set the corner style,
   * `'centered'` also sets button alignment (the color theme becomes `'white'`).
   */
  setTheme(theme: BaseThemeNamesType): void {
    if (!isNgccThemeName(theme)) return;
    const resolved = resolveNgccThemeName(theme);
    this.selectedTheme.set(resolved.theme);
    if (resolved.cornerStyle) this._cornerStyle.set(resolved.cornerStyle);
    if (resolved.buttonAlign) this._buttonAlign.set(resolved.buttonAlign);
    this._followSystem.set(false);
    this.persist();
  }

  getTheme(): NgccCarbonThemeName {
    return this.theme();
  }

  setCornerStyle(style: NgccCornerStyle): void {
    if (!isNgccCornerStyle(style)) return;
    this._cornerStyle.set(style);
    this.persist();
  }

  setButtonAlign(align: NgccButtonAlign): void {
    if (!isNgccButtonAlign(align)) return;
    this._buttonAlign.set(align);
    this.persist();
  }

  /** Follow (or stop following) the OS light/dark preference. */
  setFollowSystem(enabled: boolean): void {
    if (!enabled && this._followSystem()) {
      // keep what the user currently sees instead of snapping back to the stored theme
      this.selectedTheme.set(this.theme());
    }
    this._followSystem.set(enabled);
    this.persist();
  }

  /** Flip between the configured light and dark color themes. */
  toggleDarkMode(): void {
    this.setTheme(this.isDark() ? this.config.systemLightTheme : this.config.systemDarkTheme);
  }

  /** Forget the persisted choices and return to configured defaults. */
  reset(): void {
    this.applyDefaults();
    this.store()?.removeItem(this.config.storageKey);
  }

  private applyDefaults(): void {
    this.selectedTheme.set(this.config.defaultTheme);
    this._followSystem.set(this.config.followSystem);
    this._cornerStyle.set(this.config.defaultCornerStyle);
    this._buttonAlign.set(this.config.defaultButtonAlign);
  }

  private apply(): void {
    const root = this.doc?.documentElement;
    if (!root) return;
    const theme = this.theme();
    root.setAttribute('data-carbon-theme', theme);
    root.setAttribute('data-corner-style', this._cornerStyle());
    root.setAttribute('data-button-align', this._buttonAlign());
    root.style.colorScheme = isNgccThemeDark(theme) ? 'dark' : 'light';
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  private store(): Storage | null {
    if (!this.isBrowser || this.config.storage === 'none') return null;
    try {
      return this.config.storage === 'session' ? sessionStorage : localStorage;
    } catch {
      return null; // blocked by browser privacy settings
    }
  }

  private persist(): void {
    try {
      const value: NgccPersistedTheme = {
        version: 2,
        theme: this.selectedTheme(),
        followSystem: this._followSystem(),
        cornerStyle: this._cornerStyle(),
        buttonAlign: this._buttonAlign(),
      };
      this.store()?.setItem(this.config.storageKey, JSON.stringify(value));
    } catch {
      /* quota exceeded or storage unavailable — settings still work for this session */
    }
  }

  /**
   * Understands every format ever written under the storage key:
   *  - v2 JSON `{ version: 2, theme, followSystem, cornerStyle, buttonAlign }`
   *  - v1 JSON `{ theme, followSystem }` where theme may be rounded|curved|centered
   *  - a bare theme name (original format)
   * Anything invalid is ignored (returns null) so a bad value can never break theming.
   */
  private read(raw: string | null | undefined): NgccReadResult | null {
    if (!raw) return null;
    let parsed: Record<string, unknown> | null = null;
    try {
      const json = JSON.parse(raw);
      if (json && typeof json === 'object') parsed = json;
    } catch {
      parsed = isNgccThemeName(raw) ? { theme: raw } : null;
    }
    if (!parsed || !isNgccThemeName(parsed['theme'])) return null;

    const resolved = resolveNgccThemeName(parsed['theme']);
    const cornerStyle = isNgccCornerStyle(parsed['cornerStyle'])
      ? parsed['cornerStyle']
      : (resolved.cornerStyle ?? this.config.defaultCornerStyle);
    const buttonAlign = isNgccButtonAlign(parsed['buttonAlign'])
      ? parsed['buttonAlign']
      : (resolved.buttonAlign ?? this.config.defaultButtonAlign);

    return {
      value: {
        version: 2,
        theme: resolved.theme,
        followSystem: parsed['followSystem'] === true,
        cornerStyle,
        buttonAlign,
      },
      upgraded:
        parsed['version'] !== 2 ||
        !(NGCC_THEME_NAMES as readonly string[]).includes(parsed['theme']),
    };
  }

  private adopt(value: NgccPersistedTheme): void {
    this.selectedTheme.set(value.theme);
    this._followSystem.set(value.followSystem);
    this._cornerStyle.set(value.cornerStyle);
    this._buttonAlign.set(value.buttonAlign);
  }

  private restore(): void {
    let raw: string | null = null;
    try {
      raw = this.store()?.getItem(this.config.storageKey) ?? null;
    } catch {
      /* ignore */
    }
    const saved = this.read(raw);
    if (saved) {
      this.adopt(saved.value);
      if (saved.upgraded) this.persist(); // rewrite old formats once
      return;
    }
    this.migrateLegacy();
  }

  /**
   * Pre-v1.3 builds stored a bare theme name in sessionStorage under the same key.
   * Adopt it once into the configured store so existing users keep their theme.
   */
  private migrateLegacy(): void {
    if (!this.isBrowser || this.config.storage === 'none') return;
    try {
      const legacy = this.read(sessionStorage.getItem(this.config.storageKey));
      if (!legacy) return;
      this.adopt(legacy.value);
      this.persist();
      if (this.config.storage !== 'session') sessionStorage.removeItem(this.config.storageKey);
    } catch {
      /* ignore */
    }
  }

  // ── Live sources ───────────────────────────────────────────────────────────

  private watchSystemPreference(): void {
    const win = this.doc?.defaultView;
    if (!this.isBrowser || !win?.matchMedia) return;

    const query = win.matchMedia('(prefers-color-scheme: dark)');
    this.systemDark.set(query.matches);
    const listener = (e: MediaQueryListEvent): void => this.systemDark.set(e.matches);
    query.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', listener));
  }

  private watchOtherTabs(): void {
    const win = this.doc?.defaultView;
    if (!this.isBrowser || !win || !this.config.syncAcrossTabs || this.config.storage !== 'local') {
      return;
    }

    const listener = (e: StorageEvent): void => {
      if (e.key !== this.config.storageKey) return;
      const saved = this.read(e.newValue);
      if (saved) this.adopt(saved.value);
      else this.applyDefaults();
    };
    win.addEventListener('storage', listener);
    inject(DestroyRef).onDestroy(() => win.removeEventListener('storage', listener));
  }
}
