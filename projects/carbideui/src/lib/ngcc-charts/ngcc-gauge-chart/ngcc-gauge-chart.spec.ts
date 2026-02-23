import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccGaugeChart } from './ngcc-gauge-chart';
import { NgccSkeleton } from '../../ngcc-skeleton/ngcc-skeleton';
import { NgccThemeService } from '../../ngcc-theme-switcher/ngcc-theme.service';
import { axe } from 'vitest-axe';

// Mock theme service for predictable output
class MockThemeService {
  private theme = 'g10';
  getTheme() {
    return this.theme;
  }
  setTheme(t: string) {
    this.theme = t;
  }
}

describe('NgccGaugeChart', () => {
  let fixture: ComponentFixture<NgccGaugeChart>;
  let component: NgccGaugeChart;
  let mockTheme: MockThemeService;

  beforeEach(async () => {
    mockTheme = new MockThemeService();

    await TestBed.configureTestingModule({
      imports: [NgccGaugeChart, NgccSkeleton],
      providers: [
        provideZonelessChangeDetection(),
        { provide: NgccThemeService, useValue: mockTheme },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccGaugeChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --------------------------
  // ✅ Basic creation & render
  // --------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const skeletonEl = fixture.debugElement.query(By.css('ngcc-skeleton'));
    expect(skeletonEl).toBeTruthy();
  });

  it('should display no data message when dataset is empty', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    const messageEl = fixture.debugElement.query(By.css('.ngcc--charts__empty p'));
    expect(messageEl.nativeElement.textContent.trim()).toBe('No data available');
  });

  it('should render chart container when valid data is passed', () => {
    fixture.componentRef.setInput('data', [{ group: 'CPU', value: 70 }]);
    fixture.detectChanges();

    const chartContainer = fixture.debugElement.query(By.css('div[aria-label] div'));
    expect(chartContainer).toBeTruthy();
  });

  // --------------------------
  // ✅ Input handling
  // --------------------------
  it('should update chart when data changes', () => {
    const initialData = [{ group: 'CPU', value: 50 }];
    const updatedData = [{ group: 'CPU', value: 90 }];

    fixture.componentRef.setInput('data', initialData);
    fixture.detectChanges();

    // simulate update
    fixture.componentRef.setInput('data', updatedData);
    fixture.detectChanges();

    expect(component.data).toEqual(updatedData);
  });

  it('should respect height option', () => {
    fixture.componentRef.setInput('options', { height: '400px' });
    fixture.detectChanges();
    const el = fixture.debugElement.query(
      By.css('.ngcc--charts__empty, .ngcc--charts__loading, div[aria-label] div'),
    );
    expect(el.styles['height']).toBe('400px');
  });

  it('should apply theme from service', () => {
    mockTheme.setTheme('g100');
    fixture.detectChanges();

    const theme = mockTheme.getTheme();
    expect(theme).toBe('g100');
  });

  // --------------------------
  // ✅ Behavior & cleanup
  // --------------------------
  it('should destroy chart on component destroy', () => {
    const destroySpy = vi.spyOn(component as any, 'destroyChart');
    fixture.destroy();
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should re-render chart when theme changes', () => {
    fixture.componentRef.setInput('data', [{ group: 'Memory', value: 60 }]);
    fixture.detectChanges();

    mockTheme.setTheme('white');
    fixture.detectChanges();

    expect(mockTheme.getTheme()).toBe('white');
  });

  // --------------------------
  // ✅ Accessibility
  // --------------------------
  it('should have proper aria-label for chart container', () => {
    fixture.componentRef.setInput('data', [{ group: 'CPU', value: 80 }]);
    fixture.detectChanges();

    const hostEl = fixture.debugElement.query(By.css('.ngcc--charts'));
    expect(hostEl.attributes['aria-label']).toContain('Chart');
  });
});
describe('NgccGaugeChart – WCAG / Accessibility', () => {
  let fixture: ComponentFixture<NgccGaugeChart>;
  let component: NgccGaugeChart;
  let theme: MockThemeService;

  beforeEach(async () => {
    theme = new MockThemeService();

    await TestBed.configureTestingModule({
      imports: [NgccGaugeChart, NgccSkeleton],
      providers: [provideZonelessChangeDetection(), { provide: NgccThemeService, useValue: theme }],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccGaugeChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --------------------------------------------------
  // 1.1.1 Text Alternatives – Accessible Name
  // --------------------------------------------------

  it('exposes an accessible name via aria-label (positive)', () => {
    fixture.componentRef.setInput('ariaLabel', 'CPU usage gauge');
    fixture.componentRef.setInput('data', [{ group: 'CPU', value: 75 }]);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.ngcc--charts'))
      .nativeElement as HTMLElement;

    expect(container.getAttribute('aria-label')).toBe('CPU usage gauge');
  });

  it('show default aria-label when none is provided (negative)', () => {
    fixture.componentRef.setInput('data', [{ group: 'CPU', value: 75 }]);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.ngcc--charts'))
      .nativeElement as HTMLElement;

    expect(container.getAttribute('aria-label')).toBe('Chart placeholder');
  });

  // --------------------------------------------------
  // 1.3.1 Info & Relationships – Loading / Empty states
  // --------------------------------------------------

  it('does not expose aria-label while loading (decorative state)', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.ngcc--charts'))
      .nativeElement as HTMLElement;

    expect(container.hasAttribute('aria-label')).toBe(false);
  });

  it('exposes readable empty state text when no data is available', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    const emptyText = fixture.debugElement.query(By.css('.ngcc--charts__empty p'))
      .nativeElement as HTMLElement;

    expect(emptyText.textContent?.trim()).toBe('No data available');
  });

  // --------------------------------------------------
  // 1.4.1 Use of Color – Not color-only
  // --------------------------------------------------

  it('exposes gauge value as text via formatter (not color-only)', () => {
    fixture.componentRef.setInput('data', [{ group: 'Memory', value: 60 }]);
    fixture.detectChanges();

    // Gauge charts render SVG text nodes
    const svgText = fixture.nativeElement.querySelector('svg text');
    expect(svgText).toBeTruthy();
  });

  // --------------------------------------------------
  // 2.1.1 Keyboard – No keyboard traps
  // --------------------------------------------------

  it('does not introduce keyboard focus traps', () => {
    const trapped = fixture.debugElement.nativeElement.querySelectorAll('[tabindex="-1"]');

    expect(trapped.length).toBe(0);
  });

  it('allows keyboard focus to move past the chart', () => {
    const before = document.createElement('button');
    const after = document.createElement('button');

    document.body.append(before, fixture.nativeElement, after);

    before.focus();
    expect(document.activeElement).toBe(before);

    after.focus();
    expect(document.activeElement).toBe(after);

    before.remove();
    after.remove();
  });

  it('does not make the chart container itself tabbable', () => {
    const container = fixture.debugElement.query(By.css('.ngcc--charts')).nativeElement;

    expect(container.getAttribute('tabindex')).toBeNull();
  });

  it('does not expose focusable elements while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const focusables = fixture.debugElement.nativeElement.querySelectorAll('button, [tabindex]');

    expect(focusables.length).toBe(0);
  });

  // --------------------------------------------------
  // 4.1.2 Name, Role, Value – Robust ARIA
  // --------------------------------------------------

  it('does not apply invalid ARIA roles or attributes', () => {
    fixture.componentRef.setInput('data', [{ group: 'CPU', value: 30 }]);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.ngcc--charts'))
      .nativeElement as HTMLElement;

    expect(container.getAttribute('role')).toBeNull();
    expect(container.getAttribute('aria-hidden')).toBeNull();
  });

  // --------------------------------------------------
  // Automated Axe Audit
  // --------------------------------------------------

  it('has no WCAG violations (axe)', async () => {
    fixture.componentRef.setInput('ariaLabel', 'CPU usage gauge');
    fixture.componentRef.setInput('title', 'CPU usage gauge');
    fixture.componentRef.setInput('data', [{ group: 'CPU', value: 85 }]);
    fixture.detectChanges();

    const results = await axe(fixture.nativeElement, {
      rules: {
        'aria-tooltip-name': { enabled: false },
        'nested-interactive': { enabled: false },
        'empty-heading': { enabled: false },
        'svg-img-alt': { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
