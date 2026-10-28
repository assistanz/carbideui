import { TestBed } from '@angular/core/testing';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { NgccThemeService } from '../ngcc-theme-switcher/ngcc-theme.service';
import { getContrastRatio } from './utils/wcag-color-utils';
import { normalizeHexColor } from './ngcc-color-theme.types';

describe('NgccColorThemeService', () => {
  let service: NgccColorThemeService;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.documentElement.removeAttribute('style');
    document.documentElement.removeAttribute('data-carbon-theme');
    document.getElementById('ngcc-dynamic-theme')?.remove();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgccColorThemeService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('normalizes and validates hex colors', () => {
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
    expect(normalizeHexColor('0F62FE')).toBe('#0f62fe');
    expect(normalizeHexColor('#12345')).toBeNull();
    expect(normalizeHexColor('red')).toBeNull();
  });

  it('rejects an invalid brand color without changing state', () => {
    expect(service.updateBrandColor('nope')).toBe(false);
    expect(service.brandColor()).toBe('#0f62fe');
    expect(service.updateBrandColor('#F00')).toBe(true);
    expect(service.brandColor()).toBe('#ff0000');
  });

  it('writes dynamic tokens to a style tag in real time', () => {
    service.updateBrandColor('#8a3ffc');
    TestBed.tick();
    const css = document.getElementById('ngcc-dynamic-theme')!.textContent!;
    expect(css).toContain('--cds-button-primary');
    expect(service.toCss()).toContain(':root {');
  });

  it('delegates the base theme to NgccThemeService and maps shape variants to white', () => {
    const themeService = TestBed.inject(NgccThemeService);
    service.setBaseTheme('g90');
    expect(themeService.theme()).toBe('g90');
    expect(service.baseTheme()).toBe('g90');
    expect(service.isDarkMode()).toBe(true);

    themeService.setTheme('rounded');
    expect(service.baseTheme()).toBe('white');
  });

  it('keeps the theme attribute set by NgccThemeService', () => {
    TestBed.inject(NgccThemeService).setTheme('g100');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-carbon-theme')).toBe('g100');
  });

  it('persists settings (debounced) and restores them', () => {
    service.updateBrandColor('#d02670');
    service.setWcagLevel('AAA');
    TestBed.tick();
    vi.advanceTimersByTime(250);

    expect(JSON.parse(localStorage.getItem('ngcc-theme-color')!)).toMatchObject({
      brandColor: '#d02670',
      wcagLevel: 'AAA',
    });

    TestBed.resetTestingModule();
    const restored = TestBed.inject(NgccColorThemeService);
    expect(restored.brandColor()).toBe('#d02670');
    expect(restored.wcagConfig().level).toBe('AAA');
  });

  it('a persisted brand color wins over the app default color', () => {
    localStorage.setItem(
      'ngcc-theme-color',
      JSON.stringify({ version: 1, brandColor: '#d02670', wcagLevel: 'AA', autoAdjust: true }),
    );
    TestBed.resetTestingModule();
    const restored = TestBed.inject(NgccColorThemeService);
    restored.setDefaultBrandColor('#1e70cd');
    expect(restored.brandColor()).toBe('#d02670');
    restored.resetOverrides();
    expect(restored.brandColor()).toBe('#1e70cd');
  });

  it('reset restores defaults, clears persistence and still re-applies tokens', () => {
    service.updateBrandColor('#d02670');
    TestBed.tick();
    vi.advanceTimersByTime(250);
    service.resetOverrides();
    TestBed.tick();

    expect(service.brandColor()).toBe('#0f62fe');
    expect(localStorage.getItem('ngcc-theme-color')).toBeNull();
    expect(document.getElementById('ngcc-dynamic-theme')!.textContent).toContain(
      '--cds-button-primary',
    );

    // resetting when already at defaults must not leave the page without tokens
    service.resetOverrides();
    expect(document.getElementById('ngcc-dynamic-theme')!.textContent).toContain(
      '--cds-button-primary',
    );
  });

  it('exports and imports settings, rejecting bad payloads', () => {
    service.updateBrandColor('#198038');
    const json = JSON.stringify(service.exportConfig());
    service.updateBrandColor('#ff0000');

    expect(service.importConfig(json)).toBe(true);
    expect(service.brandColor()).toBe('#198038');
    expect(service.importConfig('{broken')).toBe(false);
    expect(service.importConfig({ brandColor: 'zzz' })).toBe(false);
    expect(service.brandColor()).toBe('#198038');
  });

  describe('base theme color customization', () => {
    const css = (): string => document.getElementById('ngcc-dynamic-theme')!.textContent!;

    it('returns Carbon values until customized', () => {
      expect(service.getThemeColor('white', 'background')).toBe('#ffffff');
      expect(service.getThemeColor('g100', 'layer-01')).toBe('#262626');
      expect(service.isThemeColorOverridden('white', 'background')).toBe(false);
    });

    it('applies a customization in real time as a theme-scoped token block', () => {
      expect(service.setThemeColor('g10', 'background', '#EEF')).toBe(true);
      TestBed.tick();

      expect(service.getThemeColor('g10', 'background')).toBe('#eeeeff');
      expect(css()).toContain(":root[data-carbon-theme='g10']");
      expect(css()).toContain('--cds-background: #eeeeff;');
      expect(css()).toContain('--cds-background-hover:');
    });

    it('keeps customizations per theme', () => {
      service.setThemeColor('white', 'layer-01', '#ddeeff');
      service.setThemeColor('g100', 'layer-01', '#112233');
      TestBed.tick();

      expect(css()).toContain(":root[data-carbon-theme='white']");
      expect(css()).toContain(":root[data-carbon-theme='g100']");
      expect(service.getThemeColor('g90', 'layer-01')).toBe('#393939');
    });

    it('moves related tokens together', () => {
      service.setThemeColor('white', 'layer-01', '#ddeeff');
      TestBed.tick();
      for (const v of [
        '--cds-layer:',
        '--cds-layer-01:',
        '--cds-field-01:',
        '--cds-layer-hover-01:',
      ]) {
        expect(css()).toContain(v);
      }
    });

    it('rejects invalid colors and unknown themes/tokens', () => {
      expect(service.setThemeColor('white', 'background', 'blue')).toBe(false);
      expect(service.setThemeColor('neon' as never, 'background', '#fff')).toBe(false);
      expect(service.setThemeColor('white', 'shadow' as never, '#fff')).toBe(false);
      expect(service.themeColorOverrides()).toEqual({});
    });

    it('setting a token back to the Carbon value removes the override', () => {
      service.setThemeColor('white', 'background', '#fafafa');
      service.setThemeColor('white', 'background', '#ffffff');
      expect(service.themeColorOverrides()).toEqual({});
    });

    it('resets one token or a whole theme', () => {
      service.setThemeColor('white', 'background', '#fafafa');
      service.setThemeColor('white', 'text-primary', '#222222');
      service.setThemeColor('g90', 'background', '#202020');

      service.resetThemeColors('white', 'background');
      expect(service.isThemeColorOverridden('white', 'background')).toBe(false);
      expect(service.isThemeColorOverridden('white', 'text-primary')).toBe(true);

      service.resetThemeColors('white');
      expect(service.themeColorOverrides().white).toBeUndefined();
      expect(service.isThemeColorOverridden('g90', 'background')).toBe(true);
    });

    it('uses the customized background for WCAG calculations', () => {
      service.setThemeColor('white', 'background', '#101010');
      expect(service.backgroundColor()).toBe('#101010');
    });

    it('reports unreadable customized text', () => {
      service.setThemeColor('white', 'text-primary', '#fefefe');
      TestBed.tick();
      const issues = service.accessibilityReport()!.issues;
      expect(issues.some((i) => i.token.startsWith('--cds-text-primary'))).toBe(true);
      expect(service.accessibilityReport()!.compliant).toBe(false);
    });

    it('does not add text checks when nothing is customized', () => {
      TestBed.tick();
      const tokens = Object.keys(service.accessibilityReport()!.tokenValidation);
      expect(tokens.some((t) => t.startsWith('--cds-text-primary'))).toBe(false);
    });

    it('persists and restores customizations', () => {
      service.setThemeColor('g90', 'background', '#202020');
      TestBed.tick();
      vi.advanceTimersByTime(250);
      expect(JSON.parse(localStorage.getItem('ngcc-theme-color')!).themeColors).toEqual({
        g90: { background: '#202020' },
      });

      TestBed.resetTestingModule();
      expect(TestBed.inject(NgccColorThemeService).getThemeColor('g90', 'background')).toBe(
        '#202020',
      );
    });

    it('sanitizes untrusted stored overrides', () => {
      localStorage.setItem(
        'ngcc-theme-color',
        JSON.stringify({
          version: 1,
          brandColor: '#0f62fe',
          wcagLevel: 'AA',
          autoAdjust: true,
          themeColors: {
            white: { background: '#fafafa', text: 'red', 'layer-01': 'url(x)' },
            neon: { background: '#000000' },
            g10: 'nope',
          },
        }),
      );
      TestBed.resetTestingModule();
      const restored = TestBed.inject(NgccColorThemeService);
      expect(restored.themeColorOverrides()).toEqual({ white: { background: '#fafafa' } });
    });

    it('an old snapshot without themeColors does not wipe customizations', () => {
      service.setThemeColor('white', 'background', '#fafafa');
      service.importConfig({ brandColor: '#198038' });
      expect(service.isThemeColorOverridden('white', 'background')).toBe(true);
    });

    it('exports and imports customizations; reset clears them', () => {
      service.setThemeColor('g100', 'background', '#0a0a0a');
      const json = JSON.stringify(service.exportConfig());
      service.resetOverrides();
      expect(service.themeColorOverrides()).toEqual({});
      expect(service.importConfig(json)).toBe(true);
      expect(service.getThemeColor('g100', 'background')).toBe('#0a0a0a');
      expect(service.toCss()).toContain(":root[data-carbon-theme='g100']");
    });
  });

  describe('status, link and focus colors', () => {
    const tokens = (): Record<string, string> => service.appliedTokens();
    const ratio = (a: string, b: string): number => getContrastRatio(a, b);

    it('defaults to colors derived from the brand and is not an override', () => {
      expect(service.isThemeColorOverridden('white', 'support-info')).toBe(false);
      expect(service.getThemeColor('white', 'support-info')).toBe(service.derivedPalette().info);
      expect(service.getThemeColor('white', 'link')).toBe(service.derivedPalette().primary);
    });

    it('applies a custom info color to every related token, contrast-adjusted', () => {
      expect(service.setThemeColor('white', 'support-info', '#ff00ff')).toBe(true);
      TestBed.tick();

      expect(tokens()['--cds-support-info']).toBe(tokens()['--cds-support-04']);
      expect(tokens()['--cds-support-info']).not.toBe('#ff00ff'); // adjusted for AA on white
      expect(ratio(tokens()['--cds-support-info'], '#ffffff')).toBeGreaterThanOrEqual(4.5);
      expect(service.infoColor()).toBe('#ff00ff'); // the picker shows what the user chose
    });

    it('uses the exact color when auto-adjust is off', () => {
      service.setAutoAdjust(false);
      service.setThemeColor('white', 'support-info', '#ff00ff');
      TestBed.tick();
      expect(tokens()['--cds-support-info']).toBe('#ff00ff');
    });

    it('error also drives text-error and the danger button', () => {
      service.setThemeColor('white', 'support-error', '#990000');
      TestBed.tick();
      expect(tokens()['--cds-support-error']).toBe('#990000');
      expect(tokens()['--cds-text-error']).toBe('#990000');
      expect(tokens()['--cds-button-danger-primary']).toBeDefined();
    });

    it('warning and success have their own tokens', () => {
      service.setAutoAdjust(false);
      service.setThemeColor('white', 'support-warning', '#aa6600');
      service.setThemeColor('white', 'support-success', '#117733');
      TestBed.tick();
      expect(tokens()['--cds-support-warning']).toBe('#aa6600');
      expect(tokens()['--cds-support-03']).toBe('#aa6600');
      expect(tokens()['--cds-support-success']).toBe('#117733');
      expect(tokens()['--cds-support-02']).toBe('#117733');
    });

    it('custom link and focus colors apply and are contrast-adjusted', () => {
      service.setThemeColor('white', 'link', '#ffcc00');
      service.setThemeColor('white', 'focus', '#ffee00');
      TestBed.tick();
      expect(ratio(tokens()['--cds-link-primary'], '#ffffff')).toBeGreaterThanOrEqual(4.5);
      expect(tokens()['--cds-link-01']).toBe(tokens()['--cds-link-primary']);
      expect(ratio(tokens()['--cds-focus'], '#ffffff')).toBeGreaterThanOrEqual(3);
    });

    it('applies per base theme: the other themes keep their derived colors', () => {
      service.setAutoAdjust(false);
      service.setThemeColor('g90', 'support-info', '#33aaff');
      TestBed.tick();
      expect(tokens()['--cds-support-info']).not.toBe('#33aaff'); // active theme is white

      TestBed.inject(NgccThemeService).setTheme('g90');
      TestBed.tick();
      expect(tokens()['--cds-support-info']).toBe('#33aaff');
    });

    it('is never written verbatim into the per-theme CSS (that would skip the WCAG adjustment)', () => {
      service.setThemeColor('white', 'support-info', '#ff00ff');
      service.setThemeColor('white', 'link', '#ffcc00');
      TestBed.tick();
      expect(service.toCss()).not.toContain(":root[data-carbon-theme='white']");
      expect(service.toCss()).not.toContain('#ff00ff');
    });

    it('setting a color back to the derived default removes the override', () => {
      service.setThemeColor('white', 'support-info', '#ff00ff');
      service.setThemeColor('white', 'support-info', service.derivedPalette().info);
      expect(service.isThemeColorOverridden('white', 'support-info')).toBe(false);
    });

    it('the derived default follows the brand color', () => {
      const before = service.getThemeColor('white', 'support-info');
      service.updateBrandColor('#d02670');
      expect(service.getThemeColor('white', 'support-info')).not.toBe(before);
    });

    it('persists, restores, exports and resets them', () => {
      service.setThemeColor('g10', 'support-warning', '#aa6600');
      TestBed.tick();
      vi.advanceTimersByTime(250);
      expect(JSON.parse(localStorage.getItem('ngcc-theme-color')!).themeColors).toEqual({
        g10: { 'support-warning': '#aa6600' },
      });

      const json = JSON.stringify(service.exportConfig());
      service.resetOverrides();
      expect(service.isThemeColorOverridden('g10', 'support-warning')).toBe(false);
      expect(service.importConfig(json)).toBe(true);
      expect(service.getThemeColor('g10', 'support-warning')).toBe('#aa6600');
    });

    it('rejects an invalid hex for a derived color', () => {
      expect(service.setThemeColor('white', 'support-info', 'blue')).toBe(false);
      expect(service.themeColorOverrides()).toEqual({});
    });
  });
});
