/**
 * Carbon Theme Metadata
 *
 * Minimal metadata for each Carbon theme. All actual base token values
 * are applied by Carbon's SCSS via the [data-carbon-theme] attribute selector
 * in custom-themes.scss. This metadata provides only what the service
 * needs for WCAG contrast calculations.
 */

export type CarbonThemeName = 'white' | 'g10' | 'g90' | 'g100';

export interface NgccThemeMetadata {
  name: CarbonThemeName;
  isDark: boolean;
  background: string;
  /** Secondary button background color (needed for text-on-button WCAG check) */
  secondaryButtonBg: string;
}

export const themeMetadata: Record<CarbonThemeName, NgccThemeMetadata> = {
  white: { name: 'white', isDark: false, background: '#ffffff', secondaryButtonBg: '#393939' },
  g10: { name: 'g10', isDark: false, background: '#f4f4f4', secondaryButtonBg: '#393939' },
  g90: { name: 'g90', isDark: true, background: '#262626', secondaryButtonBg: '#6f6f6f' },
  g100: { name: 'g100', isDark: true, background: '#161616', secondaryButtonBg: '#6f6f6f' },
};

export function isThemeDark(theme: CarbonThemeName): boolean {
  return themeMetadata[theme].isDark;
}

export function getThemeBackground(theme: CarbonThemeName): string {
  return themeMetadata[theme].background;
}

export function getThemeSecondaryButtonBg(theme: CarbonThemeName): string {
  return themeMetadata[theme].secondaryButtonBg;
}

export function getAvailableThemes(): CarbonThemeName[] {
  return ['white', 'g10', 'g90', 'g100'];
}

// ─────────────────────────────────────────────────────────────────────────────
// Customizable theme colors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Colors written straight to CSS per base theme (Carbon has a fixed value for each, so
 * "reset" has a known target).
 */
export type NgccStaticThemeColorToken =
  | 'background'
  | 'layer-01'
  | 'layer-02'
  | 'text-primary'
  | 'text-secondary'
  | 'border-subtle'
  | 'border-strong';

/**
 * Colors the service turns into a whole family of tokens (hover states, text-on-color, …) and
 * contrast-adjusts for the active base theme. Their default is derived from the brand color.
 */
export type NgccDerivedThemeColorToken =
  | 'support-error'
  | 'support-warning'
  | 'support-success'
  | 'support-info'
  | 'link'
  | 'focus';

/** Every color a user may adjust. */
export type NgccThemeColorToken = NgccStaticThemeColorToken | NgccDerivedThemeColorToken;

export type NgccThemeColorCategoryId = 'surface' | 'text' | 'border' | 'status' | 'interactive';

export interface NgccThemeColorCategory {
  id: NgccThemeColorCategoryId;
  label: string;
  description: string;
}

export interface NgccThemeColorTokenDef {
  key: NgccThemeColorToken;
  label: string;
  description: string;
  category: NgccThemeColorCategoryId;
  /** Derived tokens are contrast-adjusted by the service instead of written verbatim. */
  derived: boolean;
  /** CSS custom properties this color drives. */
  cssVars: readonly string[];
}

export const NGCC_THEME_COLOR_CATEGORIES: readonly NgccThemeColorCategory[] = [
  { id: 'surface', label: 'Surfaces', description: 'Page background and the layers stacked on it' },
  { id: 'text', label: 'Text & icons', description: 'Primary and secondary text, icons' },
  { id: 'border', label: 'Borders', description: 'Dividers, container edges, control outlines' },
  {
    id: 'status',
    label: 'Status colors',
    description: 'Error, warning, success and info. Contrast-adjusted for each base theme',
  },
  {
    id: 'interactive',
    label: 'Links & focus',
    description: 'Link text and the keyboard focus ring. Contrast-adjusted for each base theme',
  },
];

/** Brand color: the single input that derives buttons, interactive tokens and charts. */
export const NGCC_BRAND_TOKEN_NAMES: readonly string[] = [
  '--cds-interactive',
  '--cds-border-interactive',
  '--cds-button-primary',
  '--cds-button-primary-hover',
  '--cds-button-primary-active',
  '--cds-button-tertiary',
  '--cds-icon-interactive',
  '--cds-highlight',
  '--cds-chart-color-1 … 12',
];

/** Overrides, kept per theme so switching theme switches to that theme's customizations. */
export type NgccThemeColorOverrides = Partial<
  Record<CarbonThemeName, Partial<Record<NgccThemeColorToken, string>>>
>;

/** Carbon's own values for each theme (what "Reset" returns to). Static tokens only. */
export const themeBaseColors: Record<CarbonThemeName, Record<NgccStaticThemeColorToken, string>> = {
  white: {
    background: '#ffffff',
    'layer-01': '#f4f4f4',
    'layer-02': '#ffffff',
    'text-primary': '#161616',
    'text-secondary': '#525252',
    'border-subtle': '#c6c6c6',
    'border-strong': '#8d8d8d',
  },
  g10: {
    background: '#f4f4f4',
    'layer-01': '#ffffff',
    'layer-02': '#f4f4f4',
    'text-primary': '#161616',
    'text-secondary': '#525252',
    'border-subtle': '#e0e0e0',
    'border-strong': '#8d8d8d',
  },
  g90: {
    background: '#262626',
    'layer-01': '#393939',
    'layer-02': '#525252',
    'text-primary': '#f4f4f4',
    'text-secondary': '#c6c6c6',
    'border-subtle': '#6f6f6f',
    'border-strong': '#8d8d8d',
  },
  g100: {
    background: '#161616',
    'layer-01': '#262626',
    'layer-02': '#393939',
    'text-primary': '#f4f4f4',
    'text-secondary': '#c6c6c6',
    'border-subtle': '#525252',
    'border-strong': '#6f6f6f',
  },
};

export function getThemeBaseColor(
  theme: CarbonThemeName,
  token: NgccStaticThemeColorToken,
): string {
  return themeBaseColors[theme][token];
}

const DERIVED_TOKENS: readonly NgccDerivedThemeColorToken[] = [
  'support-error',
  'support-warning',
  'support-success',
  'support-info',
  'link',
  'focus',
];

export function isDerivedThemeColorToken(value: unknown): value is NgccDerivedThemeColorToken {
  return (DERIVED_TOKENS as readonly unknown[]).includes(value);
}

export function isThemeColorToken(value: unknown): value is NgccThemeColorToken {
  return (
    typeof value === 'string' && (value in themeBaseColors.white || isDerivedThemeColorToken(value))
  );
}

export function isCarbonThemeName(value: unknown): value is CarbonThemeName {
  return typeof value === 'string' && value in themeMetadata;
}

// Carbon's hover layers are a translucent gray over the surface.
const hover = (color: string): string => `color-mix(in srgb, #8d8d8d 12%, ${color})`;

/**
 * CSS custom properties a *static* color writes verbatim; related tokens move together.
 * Derived colors return `{}`: the service generates (and contrast-adjusts) their tokens.
 */
export function themeColorCssVars(
  token: NgccThemeColorToken,
  color: string,
): Record<string, string> {
  switch (token) {
    case 'background':
      return { '--cds-background': color, '--cds-background-hover': hover(color) };
    case 'layer-01':
      return {
        '--cds-layer': color,
        '--cds-layer-01': color,
        '--cds-field': color,
        '--cds-field-01': color,
        '--cds-layer-hover': hover(color),
        '--cds-layer-hover-01': hover(color),
      };
    case 'layer-02':
      return {
        '--cds-layer-02': color,
        '--cds-field-02': color,
        '--cds-layer-hover-02': hover(color),
      };
    case 'text-primary':
      return { '--cds-text-primary': color, '--cds-icon-primary': color };
    case 'text-secondary':
      return { '--cds-text-secondary': color, '--cds-icon-secondary': color };
    case 'border-subtle':
      return {
        '--cds-border-subtle': color,
        '--cds-border-subtle-00': color,
        '--cds-border-subtle-01': color,
        '--cds-border-subtle-02': color,
        '--cds-border-subtle-03': color,
      };
    case 'border-strong':
      return {
        '--cds-border-strong': color,
        '--cds-border-strong-01': color,
        '--cds-border-strong-02': color,
        '--cds-border-strong-03': color,
      };
    default:
      return {};
  }
}

/** Tokens a derived color drives (as generated by NgccColorThemeService). */
const DERIVED_CSS_VARS: Record<NgccDerivedThemeColorToken, readonly string[]> = {
  'support-error': [
    '--cds-support-error',
    '--cds-support-01',
    '--cds-text-error',
    '--cds-button-danger-primary',
    '--cds-button-danger-hover',
    '--cds-button-danger-active',
  ],
  'support-warning': ['--cds-support-warning', '--cds-support-03'],
  'support-success': ['--cds-support-success', '--cds-support-02'],
  'support-info': ['--cds-support-info', '--cds-support-04'],
  link: ['--cds-link-primary', '--cds-link-primary-hover', '--cds-link-visited', '--cds-link-01'],
  focus: ['--cds-focus'],
};

const def = (
  key: NgccThemeColorToken,
  label: string,
  description: string,
  category: NgccThemeColorCategoryId,
): NgccThemeColorTokenDef => {
  const derived = isDerivedThemeColorToken(key);
  return {
    key,
    label,
    description,
    category,
    derived,
    cssVars: isDerivedThemeColorToken(key)
      ? DERIVED_CSS_VARS[key]
      : Object.keys(themeColorCssVars(key, '#000000')),
  };
};

export const NGCC_THEME_COLOR_TOKENS: readonly NgccThemeColorTokenDef[] = [
  def('background', 'Background', 'Page background', 'surface'),
  def('layer-01', 'Layer 01', 'Cards, tiles and fields on the page', 'surface'),
  def('layer-02', 'Layer 02', 'Content nested inside layer 01', 'surface'),
  def('text-primary', 'Text', 'Primary text and icons', 'text'),
  def('text-secondary', 'Secondary text', 'Labels, helper text, secondary icons', 'text'),
  def('border-subtle', 'Subtle border', 'Dividers and container edges', 'border'),
  def('border-strong', 'Strong border', 'Input and control outlines', 'border'),
  def('support-error', 'Error', 'Errors, invalid fields, danger buttons', 'status'),
  def('support-warning', 'Warning', 'Warnings and cautions', 'status'),
  def('support-success', 'Success', 'Success and completion', 'status'),
  def('support-info', 'Info', 'Informational messages and notices', 'status'),
  def('link', 'Link', 'Link text and its hover and visited states', 'interactive'),
  def('focus', 'Focus ring', 'Keyboard focus outline', 'interactive'),
];

/** Colors written verbatim per base theme (what presets and the audit cover). */
export const NGCC_STATIC_THEME_COLOR_TOKENS: readonly NgccThemeColorTokenDef[] =
  NGCC_THEME_COLOR_TOKENS.filter((t) => !t.derived);
