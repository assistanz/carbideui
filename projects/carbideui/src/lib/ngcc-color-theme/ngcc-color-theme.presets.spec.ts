import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { NgccThemeService } from '../ngcc-theme-switcher/ngcc-theme.service';
import {
  NGCC_COLOR_THEME_PRESETS,
  NgccColorThemePreset,
  auditNgccColorThemePreset,
} from './ngcc-color-theme.presets';
import { provideNgccColorTheme } from './ngcc-theme.providers';
import { getContrastRatio } from './utils/wcag-color-utils';
import {
  CarbonThemeName,
  NGCC_STATIC_THEME_COLOR_TOKENS,
  isCarbonThemeName,
  isThemeColorToken,
} from './tokens/index';
import { normalizeHexColor } from './ngcc-color-theme.types';

const THEMES: CarbonThemeName[] = ['white', 'g10', 'g90', 'g100'];

describe('NGCC_COLOR_THEME_PRESETS', () => {
  it('offers three presets with unique ids', () => {
    expect(NGCC_COLOR_THEME_PRESETS.length).toBe(3);
    expect(new Set(NGCC_COLOR_THEME_PRESETS.map((p) => p.id)).size).toBe(3);
  });

  describe.each(NGCC_COLOR_THEME_PRESETS)('$name', (preset) => {
    it('is well formed: valid brand, all four themes, every token a valid hex', () => {
      expect(normalizeHexColor(preset.brandColor)).toBe(preset.brandColor);
      expect(Object.keys(preset.themeColors).sort()).toEqual([...THEMES].sort());
      for (const theme of THEMES) {
        const colors = preset.themeColors[theme]!;
        expect(isCarbonThemeName(theme)).toBe(true);
        expect(Object.keys(colors).sort()).toEqual(
          NGCC_STATIC_THEME_COLOR_TOKENS.map((t) => t.key).sort(),
        );
        for (const [token, value] of Object.entries(colors)) {
          expect(isThemeColorToken(token)).toBe(true);
          expect(normalizeHexColor(value)).toBe(value);
        }
      }
    });

    it.each(THEMES)('meets WCAG for static colors on %s', (theme) => {
      const c = preset.themeColors[theme]!;
      const bg = c['background']!;
      const l1 = c['layer-01']!;
      const l2 = c['layer-02']!;
      // text: AAA
      expect(getContrastRatio(c['text-primary']!, bg)).toBeGreaterThanOrEqual(7);
      expect(getContrastRatio(c['text-primary']!, l1)).toBeGreaterThanOrEqual(7);
      expect(getContrastRatio(c['text-primary']!, l2)).toBeGreaterThanOrEqual(7);
      // secondary text: also AAA on every surface
      expect(getContrastRatio(c['text-secondary']!, bg)).toBeGreaterThanOrEqual(7);
      expect(getContrastRatio(c['text-secondary']!, l1)).toBeGreaterThanOrEqual(7);
      expect(getContrastRatio(c['text-secondary']!, l2)).toBeGreaterThanOrEqual(7);
      // control borders: AA non-text
      expect(getContrastRatio(c['border-strong']!, bg)).toBeGreaterThanOrEqual(3);
      expect(getContrastRatio(c['border-strong']!, l1)).toBeGreaterThanOrEqual(3);
    });

    describe.each(['AA', 'AAA'] as const)('applied through the service at %s', (level) => {
      let color: NgccColorThemeService;
      let theme: NgccThemeService;

      beforeEach(() => {
        localStorage.clear();
        TestBed.resetTestingModule();
        color = TestBed.inject(NgccColorThemeService);
        theme = TestBed.inject(NgccThemeService);
        color.setWcagLevel(level);
        expect(color.applyPreset(preset.id)).toBe(true);
      });

      it.each(THEMES)('has no accessibility errors on %s', (t) => {
        theme.setTheme(t);
        TestBed.tick();
        const report = color.accessibilityReport()!;
        expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
        expect(report.compliant).toBe(true);
      });

      it.each(THEMES)('has no accessibility issues on %s', (t) => {
        theme.setTheme(t);
        TestBed.tick();
        // Carbon's own secondary button on Gray 90/100 is white on #6f6f6f (5:1): AA, not AAA.
        // It comes from the base theme, not from the preset, so it is the one known exception.
        const issues = color
          .accessibilityReport()!
          .issues.filter((i) => !(level === 'AAA' && i.token === '--cds-button-secondary-text'));
        expect(issues).toEqual([]);
      });

      it.each(THEMES)('emits a theme-scoped block for %s', (t) => {
        TestBed.tick();
        expect(color.toCss()).toContain(`:root[data-carbon-theme='${t}']`);
      });
    });
  });

  describe('applyPreset', () => {
    let color: NgccColorThemeService;
    beforeEach(() => {
      localStorage.clear();
      TestBed.resetTestingModule();
      color = TestBed.inject(NgccColorThemeService);
    });

    it('sets the brand color and replaces earlier customizations', () => {
      color.setThemeColor('white', 'background', '#fafafa');
      expect(color.applyPreset('royal')).toBe(true);
      expect(color.brandColor()).toBe('#6929c4');
      expect(color.getThemeColor('white', 'background')).toBe('#f9f8fb');
    });

    it('rejects unknown ids and leaves state untouched', () => {
      expect(color.applyPreset('nope')).toBe(false);
      expect(color.brandColor()).toBe('#0f62fe');
      expect(color.themeColorOverrides()).toEqual({});
    });

    it('can be fine-tuned and then reset', () => {
      color.applyPreset('ember');
      color.setThemeColor('g90', 'background', '#222222');
      expect(color.getThemeColor('g90', 'background')).toBe('#222222');
      color.resetOverrides();
      expect(color.themeColorOverrides()).toEqual({});
    });
  });

  describe('provideNgccColorTheme (app default preset)', () => {
    const create = (
      options: Parameters<typeof provideNgccColorTheme>[0],
    ): NgccColorThemeService => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideNgccColorTheme(options)] });
      return TestBed.inject(NgccColorThemeService);
    };
    const custom: NgccColorThemePreset = {
      id: 'forest',
      name: 'Forest',
      description: 'Custom',
      brandColor: '#198038',
      themeColors: { white: { background: '#f6faf6' } },
    };

    beforeEach(() => {
      localStorage.clear();
      vi.useFakeTimers();
    });
    afterEach(() => vi.useRealTimers());

    it('applies at start-up without anything injecting the service', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideNgccColorTheme({ defaultPreset: 'royal' })],
      });
      await TestBed.inject(ApplicationInitStatus).donePromise;
      TestBed.tick();

      const css = document.getElementById('ngcc-dynamic-theme')?.textContent ?? '';
      expect(css).toContain(":root[data-carbon-theme='g100']");
      expect(css).toContain('--cds-background: #130e1b;');
    });

    it('starts with a built-in preset by id', () => {
      const color = create({ defaultPreset: 'ocean' });
      expect(color.brandColor()).toBe('#007d79');
      expect(color.getThemeColor('g100', 'background')).toBe('#0e1b1b');
    });

    it('starts with a custom preset object', () => {
      const color = create({ defaultPreset: custom });
      expect(color.brandColor()).toBe('#198038');
      expect(color.getThemeColor('white', 'background')).toBe('#f6faf6');
      expect(color.getThemeColor('g10', 'background')).toBe('#f4f4f4'); // untouched → Carbon
    });

    it('ignores an unknown id (stays on Carbon defaults)', () => {
      const color = create({ defaultPreset: 'nope' });
      expect(color.brandColor()).toBe('#0f62fe');
      expect(color.themeColorOverrides()).toEqual({});
    });

    it('does not persist the untouched default', () => {
      create({ defaultPreset: 'royal' });
      TestBed.tick();
      vi.advanceTimersByTime(300);
      expect(localStorage.getItem('ngcc-theme-color')).toBeNull();
    });

    it("a user's saved customization wins over the default preset", () => {
      const first = create({ defaultPreset: 'ocean' });
      first.setThemeColor('white', 'background', '#fafafa');
      first.updateBrandColor('#d02670');
      TestBed.tick();
      vi.advanceTimersByTime(300);

      const second = create({ defaultPreset: 'ocean' });
      expect(second.brandColor()).toBe('#d02670');
      expect(second.getThemeColor('white', 'background')).toBe('#fafafa');
    });

    it('a user who removed every customization stays at Carbon after reload', () => {
      const first = create({ defaultPreset: 'ocean' });
      first.themeColorOverrides.set({});
      first.updateBrandColor('#0f62fe');
      TestBed.tick();
      vi.advanceTimersByTime(300);

      const second = create({ defaultPreset: 'ocean' });
      expect(second.themeColorOverrides()).toEqual({});
      expect(second.brandColor()).toBe('#0f62fe');
    });

    it('reset returns to the default preset, not to Carbon', () => {
      const color = create({ defaultPreset: 'ember' });
      color.setThemeColor('g90', 'background', '#222222');
      color.updateBrandColor('#d02670');
      color.resetOverrides();
      expect(color.brandColor()).toBe('#ba4e00');
      expect(color.getThemeColor('g90', 'background')).toBe('#2e221a');
      expect(localStorage.getItem('ngcc-theme-color')).toBeNull();
    });
  });

  describe('auditNgccColorThemePreset', () => {
    it.each(NGCC_COLOR_THEME_PRESETS)('passes AA and AAA for $name', (preset) => {
      expect(auditNgccColorThemePreset(preset, 'AA')).toEqual([]);
      expect(auditNgccColorThemePreset(preset, 'AAA')).toEqual([]);
    });

    it('treats an empty preset as Carbon defaults, which pass AA', () => {
      const carbon: NgccColorThemePreset = {
        id: 'c',
        name: 'c',
        description: '',
        brandColor: '#0f62fe',
        themeColors: {},
      };
      expect(auditNgccColorThemePreset(carbon, 'AA')).toEqual([]);
    });

    it('reports low-contrast pairs with theme, check and ratios', () => {
      const bad: NgccColorThemePreset = {
        id: 'bad',
        name: 'Bad',
        description: '',
        brandColor: '#0f62fe',
        themeColors: { white: { 'text-primary': '#eeeeee', 'border-strong': '#fafafa' } },
      };
      const issues = auditNgccColorThemePreset(bad, 'AA');
      expect(issues.every((i) => i.theme === 'white')).toBe(true);
      expect(issues.some((i) => i.check === 'Text on background')).toBe(true);
      expect(issues.some((i) => i.check === 'Control border on background')).toBe(true);
      const text = issues.find((i) => i.check === 'Text on background')!;
      expect(text.required).toBe(4.5);
      expect(text.ratio).toBeLessThan(4.5);
    });

    it('uses a stricter threshold at AAA', () => {
      const mid: NgccColorThemePreset = {
        id: 'mid',
        name: 'Mid',
        description: '',
        brandColor: '#0f62fe',
        themeColors: { white: { 'text-secondary': '#6f6f6f' } }, // ~4.9:1 on #fff
      };
      expect(auditNgccColorThemePreset(mid, 'AA').length).toBe(0);
      expect(auditNgccColorThemePreset(mid, 'AAA').length).toBeGreaterThan(0);
    });

    it('flags invalid colors instead of throwing', () => {
      const broken: NgccColorThemePreset = {
        id: 'b',
        name: 'b',
        description: '',
        brandColor: '#0f62fe',
        themeColors: { g10: { background: 'blue' } },
      };
      const issues = auditNgccColorThemePreset(broken);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.every((i) => i.ratio === 0)).toBe(true);
    });
  });
});
