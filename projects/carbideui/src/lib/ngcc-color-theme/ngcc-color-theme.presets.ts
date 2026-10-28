import { InjectionToken } from '@angular/core';
import {
  CarbonThemeName,
  NGCC_STATIC_THEME_COLOR_TOKENS,
  NgccStaticThemeColorToken,
  NgccThemeColorOverrides,
  themeBaseColors,
} from './tokens/index';
import { getContrastRatio, WCAGLevel } from './utils/wcag-color-utils';
import { normalizeHexColor } from './ngcc-color-theme.types';

/**
 * Ready-made color themes. Each defines a brand color plus tinted neutrals for all four
 * Carbon base themes, so switching white / g10 / g90 / g100 keeps the palette's character.
 *
 * Contrast (checked in the spec for every preset × theme):
 *  - text and secondary text on background and on layers: at least 7:1 (WCAG AAA)
 *  - strong (control) border on background and layer 01: at least 3:1 (AA non-text)
 * The brand color itself is contrast-adjusted per theme by NgccColorThemeService.
 */
export interface NgccColorThemePreset {
  id: string;
  name: string;
  description: string;
  brandColor: string;
  themeColors: NgccThemeColorOverrides;
}

export const NGCC_COLOR_THEME_PRESETS: readonly NgccColorThemePreset[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm teal with cool blue-green neutrals',
    brandColor: '#007d79',
    themeColors: {
      white: {
        background: '#f8fbfb',
        'layer-01': '#ebf4f4',
        'layer-02': '#f8fbfb',
        'text-primary': '#0e2525',
        'text-secondary': '#2b5050',
        'border-subtle': '#c8dada',
        'border-strong': '#587e7e',
      },
      g10: {
        background: '#eff6f6',
        'layer-01': '#fcfdfd',
        'layer-02': '#eff6f6',
        'text-primary': '#0e2525',
        'text-secondary': '#2b5050',
        'border-subtle': '#c2d6d6',
        'border-strong': '#587e7e',
      },
      g90: {
        background: '#1a2e2e',
        'layer-01': '#243d3d',
        'layer-02': '#304f4f',
        'text-primary': '#eef6f6',
        'text-secondary': '#e0ebeb',
        'border-subtle': '#456363',
        'border-strong': '#8faeae',
      },
      g100: {
        background: '#0e1b1b',
        'layer-01': '#152828',
        'layer-02': '#1f3737',
        'text-primary': '#eef6f6',
        'text-secondary': '#cddfdf',
        'border-subtle': '#324848',
        'border-strong': '#80a3a3',
      },
    },
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Deep purple with violet-tinted neutrals',
    brandColor: '#6929c4',
    themeColors: {
      white: {
        background: '#f9f8fb',
        'layer-01': '#efebf4',
        'layer-02': '#f9f8fb',
        'text-primary': '#160e25',
        'text-secondary': '#382b50',
        'border-subtle': '#cfc8da',
        'border-strong': '#66587e',
      },
      g10: {
        background: '#f1eff6',
        'layer-01': '#fcfcfd',
        'layer-02': '#f1eff6',
        'text-primary': '#160e25',
        'text-secondary': '#382b50',
        'border-subtle': '#c9c2d6',
        'border-strong': '#66587e',
      },
      g90: {
        background: '#211a2e',
        'layer-01': '#2d243d',
        'layer-02': '#3c304f',
        'text-primary': '#f1eef6',
        'text-secondary': '#e4e0eb',
        'border-subtle': '#504563',
        'border-strong': '#9a8fae',
      },
      g100: {
        background: '#130e1b',
        'layer-01': '#1c1528',
        'layer-02': '#281f37',
        'text-primary': '#f1eef6',
        'text-secondary': '#d4cddf',
        'border-subtle': '#3a3248',
        'border-strong': '#8d80a3',
      },
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm burnt orange with earthy neutrals',
    brandColor: '#ba4e00',
    themeColors: {
      white: {
        background: '#fbfaf8',
        'layer-01': '#f4efeb',
        'layer-02': '#fbfaf8',
        'text-primary': '#25170e',
        'text-secondary': '#503a2b',
        'border-subtle': '#dacfc8',
        'border-strong': '#7e6758',
      },
      g10: {
        background: '#f6f2ef',
        'layer-01': '#fdfcfc',
        'layer-02': '#f6f2ef',
        'text-primary': '#25170e',
        'text-secondary': '#503a2b',
        'border-subtle': '#d6cac2',
        'border-strong': '#7e6758',
      },
      g90: {
        background: '#2e221a',
        'layer-01': '#3d2e24',
        'layer-02': '#4f3d30',
        'text-primary': '#f6f1ee',
        'text-secondary': '#ebe4e0',
        'border-subtle': '#635145',
        'border-strong': '#ae9b8f',
      },
      g100: {
        background: '#1b130e',
        'layer-01': '#281d15',
        'layer-02': '#37291f',
        'text-primary': '#f6f1ee',
        'text-secondary': '#dfd4cd',
        'border-subtle': '#483b32',
        'border-strong': '#a38e80',
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// App default preset
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccColorThemeOptions {
  /**
   * Color theme the app starts with: a built-in preset id ('ocean' | 'royal' | 'ember') or your
   * own preset object. It is used only when the user has no saved customization, and it is what
   * "Reset to Defaults" returns to.
   */
  defaultPreset?: string | NgccColorThemePreset;
}

export const NGCC_COLOR_THEME_OPTIONS = new InjectionToken<NgccColorThemeOptions>(
  'NGCC_COLOR_THEME_OPTIONS',
  { providedIn: 'root', factory: () => ({}) },
);

// ─────────────────────────────────────────────────────────────────────────────
// WCAG audit for your own presets
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccPresetAuditIssue {
  theme: CarbonThemeName;
  check: string;
  foreground: string;
  background: string;
  /** Measured contrast ratio (0 when a color is not valid hex). */
  ratio: number;
  required: number;
}

const BASE_THEMES: readonly CarbonThemeName[] = ['white', 'g10', 'g90', 'g100'];

/**
 * Checks a preset's neutrals against WCAG for every base theme. Tokens you leave out fall back
 * to Carbon's value, so partial presets are audited as they will render.
 *
 *  - text and secondary text on the background and on layer 01 / 02: 4.5:1 (AA) or 7:1 (AAA)
 *  - control (strong) border on the background and on layer 01: 3:1 (non-text)
 *
 * Returns the failures; an empty array means the preset passes. The brand color and the status,
 * link and focus colors are not audited here: NgccColorThemeService contrast-adjusts them for
 * each base theme.
 */
export function auditNgccColorThemePreset(
  preset: NgccColorThemePreset,
  level: WCAGLevel = 'AA',
): NgccPresetAuditIssue[] {
  const text = level === 'AAA' ? 7 : 4.5;
  const ui = 3;
  const checks: [string, NgccStaticThemeColorToken, NgccStaticThemeColorToken, number][] = [
    ['Text on background', 'text-primary', 'background', text],
    ['Text on layer 01', 'text-primary', 'layer-01', text],
    ['Text on layer 02', 'text-primary', 'layer-02', text],
    ['Secondary text on background', 'text-secondary', 'background', text],
    ['Secondary text on layer 01', 'text-secondary', 'layer-01', text],
    ['Secondary text on layer 02', 'text-secondary', 'layer-02', text],
    ['Control border on background', 'border-strong', 'background', ui],
    ['Control border on layer 01', 'border-strong', 'layer-01', ui],
  ];

  const issues: NgccPresetAuditIssue[] = [];
  for (const theme of BASE_THEMES) {
    const colors: Record<string, string> = { ...themeBaseColors[theme] };
    for (const token of NGCC_STATIC_THEME_COLOR_TOKENS) {
      const custom = preset.themeColors[theme]?.[token.key];
      if (custom !== undefined) colors[token.key] = custom;
    }
    for (const [check, fgToken, bgToken, required] of checks) {
      const fg = normalizeHexColor(colors[fgToken]);
      const bg = normalizeHexColor(colors[bgToken]);
      const ratio = fg && bg ? getContrastRatio(fg, bg) : 0;
      if (ratio < required) {
        issues.push({
          theme,
          check,
          foreground: colors[fgToken],
          background: colors[bgToken],
          ratio: Math.round(ratio * 100) / 100,
          required,
        });
      }
    }
  }
  return issues;
}
