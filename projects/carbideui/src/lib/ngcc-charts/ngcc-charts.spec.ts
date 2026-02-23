import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccCharts } from './ngcc-charts';
import { NgccThemeService } from '../ngcc-theme-switcher/ngcc-theme.service';
import { NgccChartType } from './ngcc-charts.types';
import { axe } from 'vitest-axe';

describe('NgccCharts', () => {
  let fixture: ComponentFixture<NgccCharts<NgccChartType>>;
  let component: NgccCharts<NgccChartType>;
  let themeService: { getTheme: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    themeService = {
      getTheme: vi.fn().mockReturnValue('g10'),
    };

    await TestBed.configureTestingModule({
      imports: [NgccCharts],
      providers: [
        provideZonelessChangeDetection(),
        { provide: NgccThemeService, useValue: themeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccCharts);
    component = fixture.componentInstance;

    // Mock getBoundingClientRect for all elements in this test
    Element.prototype.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 500,
          height: 300,
          top: 0,
          left: 0,
          bottom: 300,
          right: 500,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect,
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show skeleton when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const skeleton = fixture.debugElement.query(By.css('ngcc-skeleton'));
    expect(skeleton).toBeTruthy();
  });

  it('should render "no data" message when dataset is empty', () => {
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const emptyMsg = fixture.debugElement.query(By.css('.ngcc--charts__empty p')).nativeElement;
    expect(emptyMsg.textContent).toContain('No data available');
  });

  it('should render a bar chart when data and options are provided', () => {
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', [
      { group: 'Used', value: 40 },
      { group: 'Available', value: 60 },
    ]);
    fixture.componentRef.setInput('options', {
      axes: {
        left: { mapsTo: 'value' },
        bottom: { mapsTo: 'group' },
      },
      height: '300px',
    });
    fixture.detectChanges();

    const chartEl = fixture.debugElement.query(By.css('.ngcc--charts'));
    expect(chartEl).toBeTruthy();
  });

  it('should render a line chart correctly', () => {
    fixture.componentRef.setInput('type', 'line');
    fixture.componentRef.setInput('data', [
      { group: 'CPU', key: 'Jan', value: 30 },
      { group: 'CPU', key: 'Feb', value: 45 },
      { group: 'CPU', key: 'Mar', value: 55 },
    ]);
    fixture.componentRef.setInput('options', {
      axes: {
        left: { mapsTo: 'value', includeZero: true },
        bottom: { mapsTo: 'key' },
      },
      height: '300px',
    });
    fixture.detectChanges();

    const svgEl = fixture.debugElement.nativeElement.querySelector('svg');
    expect(svgEl).toBeTruthy();
  });

  it('should update chart when data changes', async () => {
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', [{ group: 'Used', value: 40 }]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.querySelector('svg')).toBeTruthy();

    fixture.componentRef.setInput('data', [
      { group: 'Used', value: 40 },
      { group: 'Free', value: 60 },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.data).toHaveLength(2);
    expect(component.data[1].group).toBe('Free');
  });

  it('should support theme switching dynamically', () => {
    themeService.getTheme.mockReturnValue('white');

    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', [{ group: 'A', value: 10 }]);
    fixture.componentRef.setInput('options', { theme: 'g100' });
    fixture.detectChanges();

    const chartEl = fixture.debugElement.query(By.css('.ngcc--charts'));
    expect(chartEl).toBeTruthy();
  });

  it('should destroy chart safely on teardown', () => {
    const spyDestroy = vi.spyOn(component as any, 'destroyChart');
    fixture.destroy();
    expect(spyDestroy).toHaveBeenCalled();
  });

  it('should render pie chart without axes', () => {
    fixture.componentRef.setInput('type', 'pie');
    fixture.componentRef.setInput('data', [
      { group: 'Chrome', value: 40 },
      { group: 'Firefox', value: 30 },
      { group: 'Edge', value: 20 },
    ]);
    fixture.componentRef.setInput('options', {
      legend: { enabled: true },
      height: '280px',
    });
    fixture.detectChanges();

    const chartEl = fixture.debugElement.nativeElement.querySelector('svg');
    expect(chartEl).toBeTruthy();
  });

  it('should handle stacked bar chart configuration', () => {
    fixture.componentRef.setInput('type', 'stackedBar');
    fixture.componentRef.setInput('data', [
      { group: 'Team A', key: 'Q1', value: 30 },
      { group: 'Team A', key: 'Q2', value: 50 },
      { group: 'Team B', key: 'Q1', value: 40 },
      { group: 'Team B', key: 'Q2', value: 60 },
    ]);
    fixture.componentRef.setInput('options', {
      axes: {
        left: { mapsTo: 'value', stacked: true },
        bottom: { mapsTo: 'key' },
      },
      height: '300px',
    });
    fixture.detectChanges();

    const svgEl = fixture.debugElement.nativeElement.querySelector('svg');
    expect(svgEl).toBeTruthy();
  });
  describe('NgccCharts – WCAG / Accessibility', () => {
    /* -------------------------------------------------------------
     * WCAG 1.1.1 — Text Alternatives
     * ------------------------------------------------------------- */
    describe('Text alternatives & labeling', () => {
      it('exposes an accessible name via aria-label (positive)', () => {
        fixture.componentRef.setInput('ariaLabel', 'CPU usage chart');
        fixture.componentRef.setInput('data', [
          { group: 'Used', value: 40 },
          { group: 'Free', value: 60 },
        ]);
        fixture.detectChanges();

        const container = fixture.debugElement.query(By.css('.ngcc--charts'))
          .nativeElement as HTMLElement;

        expect(container.getAttribute('aria-label')).toBe('CPU usage chart');
      });

      it('show default aria-label when none is provided (negative)', () => {
        fixture.componentRef.setInput('data', [{ group: 'Used', value: 40 }]);
        fixture.detectChanges();

        const container = fixture.debugElement.query(By.css('.ngcc--charts'))
          .nativeElement as HTMLElement;

        expect(container.getAttribute('aria-label')).toBe('Chart placeholder');
      });
    });

    /* -------------------------------------------------------------
     * WCAG 1.3.1 — Info & Relationships
     * ------------------------------------------------------------- */
    describe('Meaning & structure', () => {
      it('renders textual "no data" message when dataset is empty', () => {
        fixture.componentRef.setInput('data', []);
        fixture.componentRef.setInput('loading', false);
        fixture.detectChanges();

        const msg = fixture.debugElement.query(By.css('.ngcc--charts__empty p'))
          .nativeElement as HTMLElement;

        expect(msg.textContent).toContain('No data');
      });

      it('does not rely on SVG alone when no data exists', () => {
        fixture.componentRef.setInput('data', []);
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('svg')).toBeNull();
      });
    });

    /* -------------------------------------------------------------
     * WCAG 1.3.2 — Meaningful Sequence (loading / skeleton)
     * ------------------------------------------------------------- */
    describe('Loading & skeleton state', () => {
      it('does not render chart content while loading', () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('svg')).toBeNull();
      });

      it('does not expose empty or misleading data during skeleton state', () => {
        fixture.componentRef.setInput('loading', true);
        fixture.componentRef.setInput('data', [{ group: 'A', value: 10 }]);
        fixture.detectChanges();

        const emptyState = fixture.debugElement.query(By.css('.ngcc--charts__empty'));

        expect(emptyState).toBeNull();
      });
    });

    /* -------------------------------------------------------------
     * WCAG 2.1.1 — Keyboard Accessibility
     * ------------------------------------------------------------- */
    describe('Keyboard behavior', () => {
      it('does not trap keyboard focus', () => {
        fixture.componentRef.setInput('data', [{ group: 'A', value: 10 }]);
        fixture.detectChanges();

        const container = fixture.debugElement.query(By.css('.ngcc--charts'))
          .nativeElement as HTMLElement;

        container.focus?.();
        expect(document.activeElement).not.toBe(container);
      });

      it('does not create unintended tabbable elements', () => {
        const tabbables = fixture.debugElement.nativeElement.querySelectorAll(
          'button, [tabindex]:not([tabindex="-1"])',
        );

        expect(tabbables.length).toBe(0);
      });
    });

    /* -------------------------------------------------------------
     * WCAG 2.4.6 — Headings & Labels
     * ------------------------------------------------------------- */
    describe('Descriptive labeling', () => {
      it('allows consumers to provide a descriptive label', () => {
        fixture.componentRef.setInput('ariaLabel', 'Monthly revenue by product');
        fixture.componentRef.setInput('data', [{ group: 'A', value: 100 }]);
        fixture.detectChanges();

        const container = fixture.debugElement.query(By.css('.ngcc--charts'))
          .nativeElement as HTMLElement;

        expect(container.getAttribute('aria-label')).toContain('Monthly revenue');
      });
    });

    /* -------------------------------------------------------------
     * WCAG 4.1.2 — Name, Role, Value
     * ------------------------------------------------------------- */
    describe('ARIA robustness', () => {
      it('exposes a stable container element for assistive technology', () => {
        const container = fixture.debugElement.query(By.css('.ngcc--charts')).nativeElement;

        expect(container).toBeTruthy();
      });

      it('does not expose invalid ARIA roles', () => {
        const container = fixture.debugElement.query(By.css('.ngcc--charts'))
          .nativeElement as HTMLElement;

        expect(container.hasAttribute('role')).toBe(false);
      });
    });

    /* -------------------------------------------------------------
     * Automated WCAG audit (axe)
     * ------------------------------------------------------------- */
    describe('Automated WCAG audit', () => {
      it('has no WCAG violations (axe)', async () => {
        fixture.componentRef.setInput('ariaLabel', 'CPU usage chart');
        fixture.componentRef.setInput('data', [
          { group: 'Used', value: 40 },
          { group: 'Free', value: 60 },
        ]);
        fixture.detectChanges();

        const results = await axe(fixture.nativeElement, {
          rules: {
            'aria-tooltip-name': { enabled: false },
            'nested-interactive': { enabled: false },
            'empty-heading': { enabled: false },
            // 'svg-img-alt': { enabled: false }
          },
        });
        expect(results).toHaveNoViolations();
      });
    });
  });
});
