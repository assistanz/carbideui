import { WCAGLevel, NgccAccessibilityIssue, NgccColorScale } from './utils/wcag-color-utils';
import { NgccThemeColorOverrides } from './tokens/index';

// ─────────────────────────────────────────────────────────────────────────────
// WCAG Compliance Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccWCAGConfig {
  /** Target WCAG compliance level */
  level: WCAGLevel;
  /** Auto-adjust colors that don't meet contrast requirements */
  autoAdjust: boolean;
  /** Report accessibility issues to console */
  reportIssues: boolean;
  /** Minimum contrast ratio for UI elements (non-text) */
  uiContrastRatio: number;
}

export interface NgccThemeAccessibilityReport {
  /** Overall WCAG compliance status */
  compliant: boolean;
  /** Target level checked */
  level: WCAGLevel;
  /** List of accessibility issues found */
  issues: NgccAccessibilityIssue[];
  /** Token validation results */
  tokenValidation: Record<string, NgccTokenValidationResult>;
  /** Timestamp of validation */
  timestamp: Date;
}

export interface NgccTokenValidationResult {
  token: string;
  foreground: string;
  background: string;
  contrastRatio: number;
  passesAA: boolean;
  passesAAA: boolean;
  adjusted?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccColorThemeConfig {
  /** Single brand color input */
  brandColor: string;
  /** Derived primary color (same as brandColor) */
  primary: string;
  /** Derived secondary color (complementary) */
  secondary: string;
  /** Derived danger color */
  danger: string;
  /** Derived success color */
  success: string;
  /** Derived warning color */
  warning: string;
  /** Derived info color */
  info: string;
  /** Generated color scale for primary */
  primaryScale?: NgccColorScale;
  /** Generated color scale for secondary */
  secondaryScale?: NgccColorScale;
}

/** Persisted / exportable color settings */
export interface NgccColorThemeSnapshot {
  version: 1;
  brandColor: string;
  wcagLevel: WCAGLevel;
  autoAdjust: boolean;
  /** Per-theme base color overrides. Omitted when nothing is customized. */
  themeColors?: NgccThemeColorOverrides;
}

export interface NgccBrandPreset {
  name: string;
  color: string;
}

export const NGCC_BRAND_PRESETS: readonly NgccBrandPreset[] = [
  { name: 'Carbon Blue', color: '#0f62fe' },
  { name: 'Teal', color: '#007d79' },
  { name: 'Purple', color: '#8a3ffc' },
  { name: 'Magenta', color: '#d02670' },
  { name: 'Green', color: '#198038' },
  { name: 'Orange', color: '#ba4e00' },
];

/** Returns lowercase #rrggbb for a valid #rgb / #rrggbb string, otherwise null. */
export function normalizeHexColor(value: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((value ?? '').trim());
  if (!m) return null;
  const h = m[1].toLowerCase();
  return '#' + (h.length === 3 ? h.replace(/./g, (c) => c + c) : h);
}
