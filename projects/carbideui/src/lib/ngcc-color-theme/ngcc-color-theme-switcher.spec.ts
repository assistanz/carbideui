import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { NgccColorThemeSwitcher } from './ngcc-color-theme-switcher';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { runAxe } from '../../test-utils/a11y';

@Component({
  standalone: true,
  imports: [NgccColorThemeSwitcher],
  template: `<ngcc-color-theme-switcher [defaultColor]="defaultColor" />`,
})
class TestHostComponent {
  defaultColor: string | undefined;
}

describe('NgccColorThemeSwitcher', () => {
  let fixture: ComponentFixture<NgccColorThemeSwitcher>;
  let component: NgccColorThemeSwitcher;
  let colorService: NgccColorThemeService;

  const el = (): HTMLElement => fixture.nativeElement;
  const q = (css: string): HTMLElement | null => el().querySelector(css);
  const flush = (): void => fixture.detectChanges();
  const tabLabels = (): string[] =>
    Array.from(el().querySelectorAll('[role=tab]')).map((t) =>
      t.textContent!.replace(/\s+/g, ' ').trim(),
    );
  const openTab = (id: string): void => {
    q(`#ngcc-cts-tab-${id}`)!.click();
    flush();
  };
  const listRows = (): HTMLElement[] =>
    Array.from(el().querySelectorAll('.ngcc--theme-colors__row'));
  const rowFor = (label: string): HTMLElement =>
    listRows().find(
      (r) => r.querySelector('.ngcc--theme-colors__name')!.textContent!.trim() === label,
    )!;
  /** Selects a color in the list so its editor and tokens show on the right. */
  const select = (label: string): HTMLElement => {
    rowFor(label).click();
    flush();
    return q('.ngcc-detail')!;
  };
  const filterBy = (value: string): void => {
    const input = q('#ngcc-token-filter') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    flush();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NgccColorThemeSwitcher],
      providers: [provideZonelessChangeDetection(), NgccColorThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccColorThemeSwitcher);
    component = fixture.componentInstance;
    colorService = TestBed.inject(NgccColorThemeService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reset theme overrides when Reset button clicked', () => {
    const resetSpy = vi.spyOn(colorService, 'resetOverrides');
    fixture.debugElement.query(By.css('button.cds--btn.cds--btn--ghost')).nativeElement.click();
    flush();
    expect(resetSpy).toHaveBeenCalled();
  });

  describe('tabs', () => {
    it('shows one section at a time: Colors, Brand, Accessibility, Export', () => {
      expect(tabLabels().map((t) => t.split(' ')[0])).toEqual([
        'Colors',
        'Brand',
        'Accessibility',
        'Export',
      ]);
      expect(q('#ngcc-cts-panel-colors')).not.toBeNull();
      expect(q('#ngcc-cts-panel-brand')).toBeNull();
    });

    it('marks the active tab and links it to its panel', () => {
      const tab = q('#ngcc-cts-tab-colors')!;
      expect(tab.getAttribute('aria-selected')).toBe('true');
      expect(tab.getAttribute('aria-controls')).toBe('ngcc-cts-panel-colors');
      expect(q('#ngcc-cts-panel-colors')!.getAttribute('aria-labelledby')).toBe(
        'ngcc-cts-tab-colors',
      );
      openTab('brand');
      expect(q('#ngcc-cts-tab-brand')!.getAttribute('aria-selected')).toBe('true');
      expect(q('#ngcc-cts-tab-colors')!.getAttribute('aria-selected')).toBe('false');
    });

    it('moves between tabs with the arrow keys, wrapping at the ends', () => {
      const press = (id: string, key: string): void => {
        q(`#ngcc-cts-tab-${id}`)!.dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true }),
        );
        flush();
      };
      press('colors', 'ArrowRight');
      expect(q('#ngcc-cts-panel-brand')).not.toBeNull();
      press('brand', 'End');
      expect(q('#ngcc-cts-panel-output')).not.toBeNull();
      press('output', 'ArrowRight');
      expect(q('#ngcc-cts-panel-colors')).not.toBeNull();
      press('colors', 'ArrowLeft');
      expect(q('#ngcc-cts-panel-output')).not.toBeNull();
    });

    it('only the active tab is in the tab order', () => {
      const tabindex = Array.from(el().querySelectorAll<HTMLElement>('[role=tab]')).map(
        (t) => t.tabIndex,
      );
      expect(tabindex).toEqual([0, -1, -1, -1]);
    });

    it('drops tabs that are switched off, and falls back to the first one left', () => {
      fixture.componentRef.setInput('showThemeColors', false);
      fixture.componentRef.setInput('showAccessibility', false);
      fixture.componentRef.setInput('showAdvanced', false);
      flush();
      expect(tabLabels()).toEqual(['Brand']);
      expect(q('#ngcc-cts-panel-brand')).not.toBeNull();
    });

    it('counts changed colors on the Colors tab', () => {
      colorService.setThemeColor('white', 'background', '#fafafa');
      flush();
      expect(tabLabels()[0]).toBe('Colors 1');
    });
  });

  describe('brand', () => {
    beforeEach(() => openTab('brand'));

    it('should update primary color signal when user selects a color', () => {
      const input = q('input[type=color]') as HTMLInputElement;
      input.value = '#ff0000';
      input.dispatchEvent(new Event('input'));
      flush();
      expect(colorService.primaryColor()).toBe('#ff0000');
    });

    it('applies a typed hex value and flags an invalid one', () => {
      const hex = q('#brand-color-hex') as HTMLInputElement;
      hex.value = '#00ff00';
      hex.dispatchEvent(new Event('input'));
      flush();
      expect(colorService.brandColor()).toBe('#00ff00');
      expect(q('.ngcc--field-error')).toBeNull();

      hex.value = '#12';
      hex.dispatchEvent(new Event('input'));
      flush();
      expect(colorService.brandColor()).toBe('#00ff00');
      expect(q('.ngcc--field-error')).not.toBeNull();
    });

    it('applies a preset and marks it pressed', () => {
      const preset = fixture.debugElement.queryAll(By.css('.ngcc--preset'))[2];
      preset.nativeElement.click();
      flush();
      expect(colorService.brandColor()).toBe('#8a3ffc');
      expect(preset.nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('lists the tokens the brand color drives, each copyable', () => {
      const text = q('[aria-label="Tokens driven by the brand color"]')!.textContent!;
      expect(text).toContain('--cds-button-primary');
      expect(text).toContain('--cds-interactive');
      expect(
        el().querySelectorAll('[aria-label="Tokens driven by the brand color"] button').length,
      ).toBeGreaterThan(3);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => openTab('a11y'));

    it('changes the WCAG level', () => {
      const select = q('#wcag-level') as HTMLSelectElement;
      select.value = 'AAA';
      select.dispatchEvent(new Event('change'));
      expect(colorService.wcagConfig().level).toBe('AAA');
    });

    it('shows an accessibility status', () => {
      expect(q('.ngcc--report-status')).not.toBeNull();
    });
  });

  describe('colors', () => {
    it('lists every customizable color, grouped under five headings', () => {
      expect(
        Array.from(el().querySelectorAll('.ngcc-list__heading .ngcc--category__title')).map((t) =>
          t.textContent!.trim(),
        ),
      ).toEqual(['Surfaces', 'Text & icons', 'Borders', 'Status colors', 'Links & focus']);
      expect(listRows().length).toBe(13);
    });

    it('shows a swatch and the hex value in each row, not the tokens', () => {
      const row = rowFor('Background');
      expect(row.textContent).toContain('#ffffff');
      expect(row.querySelector('.ngcc-swatch')).not.toBeNull();
      expect(row.textContent).not.toContain('--cds-');
    });

    it('selects the first color by default and moves the detail on click', () => {
      expect(q('.ngcc-detail__title')!.textContent).toContain('Background');
      expect(rowFor('Background').getAttribute('aria-current')).toBe('true');
      select('Info');
      expect(q('.ngcc-detail__title')!.textContent).toContain('Info');
      expect(rowFor('Info').getAttribute('aria-current')).toBe('true');
      expect(rowFor('Background').getAttribute('aria-current')).toBeNull();
    });

    it("lists the selected color's token names, including info", () => {
      const detail = select('Info');
      const tokens = Array.from(detail.querySelectorAll('.ngcc--token-name')).map((t) =>
        t.textContent!.trim(),
      );
      expect(tokens).toEqual(['--cds-support-info', '--cds-support-04']);
      expect(select('Error').textContent).toContain('--cds-text-error');
      expect(select('Link').textContent).toContain('--cds-link-primary');
      expect(select('Focus ring').textContent).toContain('--cds-focus');
      expect(select('Layer 01').textContent).toContain('--cds-field-01');
    });

    it('flags status, link and focus as auto-adjusted and explains why', () => {
      expect(select('Info').textContent).toContain('auto-adjusted');
      expect(q('.ngcc--category__note')).not.toBeNull();
      expect(select('Background').textContent).not.toContain('auto-adjusted');
      expect(q('.ngcc--category__note')).toBeNull();
    });

    it('offers a paste-ready CSS override for a static color', () => {
      select('Layer 02');
      const css = q('.ngcc-snippet__code')!.textContent!;
      expect(css).toContain(":root[data-carbon-theme='white']");
      expect(css).toContain('--cds-layer-02: #ffffff;');
    });

    it('does not offer a verbatim override for an auto-adjusted color', () => {
      select('Info');
      expect(q('.ngcc-snippet')).toBeNull();
    });

    it('copies the CSS override', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      select('Background');
      q('.ngcc-snippet__copy')!.click();
      await fixture.whenStable();
      expect(writeText.mock.calls[0][0]).toContain('--cds-background: #ffffff;');
    });

    it('copies a token name to the clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      select('Info');
      (q('.ngcc-detail .ngcc--token') as HTMLElement).click();
      await fixture.whenStable();
      expect(writeText).toHaveBeenCalledWith('--cds-support-info');
    });

    it('lists the active base theme colors', () => {
      expect(rowFor('Background').textContent).toContain('#ffffff');
      colorService.setBaseTheme('g100');
      flush();
      expect(rowFor('Background').textContent).toContain('#161616');
    });

    it('applies a picked color live to the active theme only', () => {
      select('Background');
      const picker = q('.ngcc-detail input[type=color]') as HTMLInputElement;
      picker.value = '#fafafa';
      picker.dispatchEvent(new Event('input'));
      flush();
      expect(colorService.getThemeColor('white', 'background')).toBe('#fafafa');
      expect(colorService.getThemeColor('g10', 'background')).toBe('#f4f4f4');
      expect(q('.ngcc-detail')!.textContent).toContain('modified');
      expect(rowFor('Background').querySelector('.ngcc-item__dot')).not.toBeNull();
    });

    it('customizes the info color through the picker', () => {
      select('Info');
      const picker = q('.ngcc-detail input[type=color]') as HTMLInputElement;
      picker.value = '#6600cc';
      picker.dispatchEvent(new Event('input'));
      flush();
      expect(colorService.isThemeColorOverridden('white', 'support-info')).toBe(true);
      expect(colorService.infoColor()).toBe('#6600cc');
    });

    it('commits a typed hex and reverts an invalid one', () => {
      select('Layer 01');
      const hex = q('.ngcc-detail input[type=text]') as HTMLInputElement;
      hex.value = '#e8e8e8';
      hex.dispatchEvent(new Event('change'));
      expect(colorService.getThemeColor('white', 'layer-01')).toBe('#e8e8e8');

      hex.value = 'nope';
      hex.dispatchEvent(new Event('change'));
      expect(hex.value).toBe('#e8e8e8');
      expect(colorService.getThemeColor('white', 'layer-01')).toBe('#e8e8e8');
    });

    it('resets a single color and the whole theme', () => {
      colorService.setThemeColor('white', 'background', '#fafafa');
      colorService.setThemeColor('white', 'support-info', '#6600cc');
      flush();

      select('Background');
      q('.ngcc--theme-colors__reset')!.click();
      flush();
      expect(colorService.isThemeColorOverridden('white', 'background')).toBe(false);
      expect(colorService.isThemeColorOverridden('white', 'support-info')).toBe(true);

      (q('.ngcc--theme-colors__header button') as HTMLElement).click();
      expect(colorService.isThemeColorOverridden('white', 'support-info')).toBe(false);
    });

    it('disables Reset for an unchanged color', () => {
      select('Background');
      expect((q('.ngcc--theme-colors__reset') as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows how many colors changed per category and overall', () => {
      colorService.setThemeColor('white', 'support-info', '#6600cc');
      colorService.setThemeColor('white', 'support-error', '#990000');
      colorService.setThemeColor('white', 'background', '#fafafa');
      flush();
      const badges = Array.from(el().querySelectorAll('.ngcc--category__badge')).map((b) =>
        b.textContent!.trim(),
      );
      expect(badges).toContain('2 changed'); // status
      expect(badges).toContain('1 changed'); // surfaces
      expect(el().textContent).toContain('3 changed');
    });

    describe('search', () => {
      it('finds a color by its token name and hides the other groups', () => {
        filterBy('--cds-support-info');
        expect(listRows().length).toBe(1);
        expect(q('.ngcc-detail__title')!.textContent).toContain('Info');
        expect(el().querySelectorAll('.ngcc-list__heading').length).toBe(1);
      });

      it('finds a color by name', () => {
        filterBy('focus');
        expect(
          listRows()
            .map((r) => r.textContent)
            .join(),
        ).toContain('Focus ring');
      });

      it('finds colors by a brand-style token too', () => {
        filterBy('--cds-link-primary');
        expect(listRows().length).toBe(1);
      });

      it('says when nothing matches', () => {
        filterBy('zzzz-nothing');
        expect(listRows().length).toBe(0);
        expect(el().textContent).toContain('No colors or tokens match');
        expect(q('.ngcc-detail')).toBeNull();
      });

      it('restores everything when cleared', () => {
        filterBy('info');
        filterBy('');
        expect(listRows().length).toBe(13);
      });
    });

    it('has no axe violations', async () => {
      select('Info');
      expect((await runAxe(el())).violations).toEqual([]);
    });
  });

  describe('color theme chips', () => {
    const chips = () => fixture.debugElement.queryAll(By.css('.ngcc--chip'));

    it('offers Carbon plus the built-in color themes', () => {
      expect(chips().map((c) => c.nativeElement.textContent.trim())).toEqual([
        'Carbon',
        'Ocean',
        'Royal',
        'Ember',
      ]);
      expect(chips()[0].nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('applies a color theme and marks it pressed', () => {
      chips()[1].nativeElement.click();
      flush();
      expect(colorService.brandColor()).toBe('#007d79');
      expect(colorService.getThemeColor('white', 'background')).toBe('#f8fbfb');
      expect(chips()[1].nativeElement.getAttribute('aria-pressed')).toBe('true');
      expect(chips()[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
    });

    it('Carbon returns to the defaults', () => {
      chips()[2].nativeElement.click();
      chips()[0].nativeElement.click();
      flush();
      expect(colorService.themeColorOverrides()).toEqual({});
      expect(colorService.brandColor()).toBe('#0f62fe');
      expect(chips()[0].nativeElement.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('base theme', () => {
    it('switches the theme being edited', () => {
      const buttons = Array.from(
        el().querySelectorAll<HTMLElement>('[aria-labelledby=theme-label] button'),
      );
      expect(buttons.map((b) => b.textContent!.trim())).toEqual(['white', 'g10', 'g90', 'g100']);
      buttons[2].click();
      flush();
      expect(colorService.baseTheme()).toBe('g90');
      expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
      expect(el().querySelector('.ngcc-cts__sub')!.textContent).toContain('g90');
    });
  });

  describe('export', () => {
    it('shows the effective palette and copy / import tools', () => {
      openTab('output');
      expect(el().querySelectorAll('.ngcc--palette-item').length).toBe(6);
      expect(q('#ngcc-transfer')).not.toBeNull();
    });
  });

  describe('defaultColor input', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let service: NgccColorThemeService;

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      service = TestBed.inject(NgccColorThemeService);
    });

    it('should set the brand color to the provided defaultColor', async () => {
      hostComponent.defaultColor = '#1e70cd';
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(service.brandColor()).toBe('#1e70cd');
    });

    it('should reset to the custom default color instead of hardcoded fallback', async () => {
      hostComponent.defaultColor = '#1e70cd';
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      // Change to a different color
      service.updateBrandColor('#ff0000');
      expect(service.brandColor()).toBe('#ff0000');

      // Reset should go back to the custom default
      service.resetOverrides();
      expect(service.brandColor()).toBe('#1e70cd');
    });
  });
});
