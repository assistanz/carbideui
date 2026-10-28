import { InjectionToken } from '@angular/core';

/** The four Carbon color themes. */
export type NgccCarbonThemeName = 'white' | 'g10' | 'g90' | 'g100';

/** Pre-v1.3 "themes" that were really shape/alignment variants. Still accepted, then migrated. */
export type NgccLegacyThemeName = 'rounded' | 'curved' | 'centered';

/** Everything `setTheme()` accepts. Only the Carbon four are ever applied as the color theme. */
export type BaseThemeNamesType = NgccCarbonThemeName | NgccLegacyThemeName;

/** Shape of controls and containers. Applied as `data-corner-style`. */
export type NgccCornerStyle = 'square' | 'rounded' | 'curved';

/** Button label alignment. Applied as `data-button-align`. */
export type NgccButtonAlign = 'left' | 'centered';

export type NgccThemeStorage = 'local' | 'session' | 'none';

export interface NgccThemeOption {
  value: NgccCarbonThemeName;
  label: string;
  description: string;
  isDark: boolean;
  /** Preview colors: page background, surface, text */
  preview: { background: string; surface: string; text: string };
}

export interface NgccCornerStyleOption {
  value: NgccCornerStyle;
  label: string;
  description: string;
  /** Preview radii in px: [control, container] */
  preview: { control: string; container: string };
}

export interface NgccButtonAlignOption {
  value: NgccButtonAlign;
  label: string;
  description: string;
}

export interface NgccThemeConfig {
  /** Color theme used when nothing is persisted. Default: 'white' */
  defaultTheme: NgccCarbonThemeName;
  /** Corner style used when nothing is persisted. Default: 'square' (Carbon) */
  defaultCornerStyle: NgccCornerStyle;
  /** Button label alignment used when nothing is persisted. Default: 'left' (Carbon) */
  defaultButtonAlign: NgccButtonAlign;
  /** Where the user's choices are persisted. Default: 'local' */
  storage: NgccThemeStorage;
  /** Storage key. Default: 'ngcc-theme' */
  storageKey: string;
  /** Follow the OS light/dark preference until the user picks a color theme. Default: false */
  followSystem: boolean;
  /** Color theme applied when the OS is in light mode and followSystem is on. Default: 'white' */
  systemLightTheme: NgccCarbonThemeName;
  /** Color theme applied when the OS is in dark mode and followSystem is on. Default: 'g100' */
  systemDarkTheme: NgccCarbonThemeName;
  /** Keep multiple browser tabs in sync. Default: true */
  syncAcrossTabs: boolean;
}

export const NGCC_THEME_DEFAULTS: NgccThemeConfig = {
  defaultTheme: 'white',
  defaultCornerStyle: 'square',
  defaultButtonAlign: 'left',
  storage: 'local',
  storageKey: 'ngcc-theme',
  followSystem: false,
  systemLightTheme: 'white',
  systemDarkTheme: 'g100',
  syncAcrossTabs: true,
};

export const NGCC_THEME_CONFIG = new InjectionToken<NgccThemeConfig>('NGCC_THEME_CONFIG', {
  providedIn: 'root',
  factory: () => NGCC_THEME_DEFAULTS,
});

export const NGCC_THEME_OPTIONS: readonly NgccThemeOption[] = [
  {
    value: 'white',
    label: 'White',
    description: 'Default light theme',
    isDark: false,
    preview: { background: '#ffffff', surface: '#f4f4f4', text: '#161616' },
  },
  {
    value: 'g10',
    label: 'Gray 10',
    description: 'Soft light theme',
    isDark: false,
    preview: { background: '#f4f4f4', surface: '#ffffff', text: '#161616' },
  },
  {
    value: 'g90',
    label: 'Gray 90',
    description: 'Dark theme',
    isDark: true,
    preview: { background: '#262626', surface: '#393939', text: '#f4f4f4' },
  },
  {
    value: 'g100',
    label: 'Gray 100',
    description: 'Darkest theme',
    isDark: true,
    preview: { background: '#161616', surface: '#262626', text: '#f4f4f4' },
  },
];

export const NGCC_CORNER_STYLE_OPTIONS: readonly NgccCornerStyleOption[] = [
  {
    value: 'square',
    label: 'Square',
    description: 'Carbon default, no rounding',
    preview: { control: '0', container: '0' },
  },
  {
    value: 'rounded',
    label: 'Rounded',
    description: 'Controls 4px, containers 8px',
    preview: { control: '4px', container: '8px' },
  },
  {
    value: 'curved',
    label: 'Curved',
    description: 'Pill buttons, containers 16px',
    preview: { control: '999px', container: '16px' },
  },
];

export const NGCC_BUTTON_ALIGN_OPTIONS: readonly NgccButtonAlignOption[] = [
  { value: 'left', label: 'Left', description: 'Carbon default, label at the start' },
  { value: 'centered', label: 'Centered', description: 'Label and icon centered' },
];

export const NGCC_THEME_NAMES: readonly NgccCarbonThemeName[] = NGCC_THEME_OPTIONS.map(
  (o) => o.value,
);
export const NGCC_CORNER_STYLES: readonly NgccCornerStyle[] = NGCC_CORNER_STYLE_OPTIONS.map(
  (o) => o.value,
);
export const NGCC_BUTTON_ALIGNS: readonly NgccButtonAlign[] = NGCC_BUTTON_ALIGN_OPTIONS.map(
  (o) => o.value,
);

/** Valid for `setTheme()`: the Carbon four plus the legacy shape names. */
export function isNgccThemeName(value: unknown): value is BaseThemeNamesType {
  return (
    typeof value === 'string' &&
    ((NGCC_THEME_NAMES as readonly string[]).includes(value) ||
      value === 'rounded' ||
      value === 'curved' ||
      value === 'centered')
  );
}

export function isNgccCornerStyle(value: unknown): value is NgccCornerStyle {
  return typeof value === 'string' && (NGCC_CORNER_STYLES as readonly string[]).includes(value);
}

export function isNgccButtonAlign(value: unknown): value is NgccButtonAlign {
  return typeof value === 'string' && (NGCC_BUTTON_ALIGNS as readonly string[]).includes(value);
}

export function isNgccThemeDark(theme: BaseThemeNamesType): boolean {
  return theme === 'g90' || theme === 'g100';
}

export interface NgccResolvedLegacyTheme {
  theme: NgccCarbonThemeName;
  cornerStyle?: NgccCornerStyle;
  buttonAlign?: NgccButtonAlign;
}

/**
 * Splits an old combined theme name into the new independent settings:
 * rounded → white + rounded corners, curved → white + curved corners,
 * centered → white + centered button labels. Carbon names pass through.
 */
export function resolveNgccThemeName(name: BaseThemeNamesType): NgccResolvedLegacyTheme {
  switch (name) {
    case 'rounded':
      return { theme: 'white', cornerStyle: 'rounded' };
    case 'curved':
      return { theme: 'white', cornerStyle: 'curved' };
    case 'centered':
      return { theme: 'white', buttonAlign: 'centered' };
    default:
      return { theme: name };
  }
}
