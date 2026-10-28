import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccSparkline } from './ngcc-sparkline';
import { runAxe } from '../../test-utils/a11y';

describe('NgccSparkline', () => {
  let fixture: ComponentFixture<NgccSparkline>;

  const set = async (inputs: Record<string, unknown>): Promise<void> => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
  };
  const svg = (): SVGElement => fixture.nativeElement.querySelector('svg');
  const q = (css: string): Element | null => fixture.nativeElement.querySelector(css);
  const all = (css: string): Element[] => Array.from(fixture.nativeElement.querySelectorAll(css));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccSparkline],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(NgccSparkline);
    await set({ data: [1, 3, 2, 5, 4, 8] });
  });

  describe('line', () => {
    it('draws one path through every point, scaled into the box', () => {
      const d = q('.ngcc-sparkline__line')!.getAttribute('d')!;
      expect(d.startsWith('M')).toBe(true);
      expect(d.match(/L/g)!.length).toBe(5);
      const ys = (d.match(/ (\d+\.?\d*)/g) ?? []).map((s) => parseFloat(s));
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(2);
      expect(Math.max(...ys)).toBeLessThanOrEqual(30);
    });

    it('puts the highest value at the top and the lowest at the bottom', () => {
      const d = q('.ngcc-sparkline__line')!.getAttribute('d')!;
      const pts = d
        .split(/[ML]/)
        .filter(Boolean)
        .map((p) => p.trim().split(' ').map(Number));
      const first = pts[0];
      const last = pts[pts.length - 1];
      expect(first[1]).toBeGreaterThan(last[1]); // 1 is low (large y), 8 is high (small y)
    });

    it('marks the latest value and can hide the marker', async () => {
      expect(q('.ngcc-sparkline__point')).not.toBeNull();
      await set({ showLastPoint: false });
      expect(q('.ngcc-sparkline__point')).toBeNull();
    });

    it('does not divide by zero for a flat series', async () => {
      await set({ data: [4, 4, 4, 4] });
      const d = q('.ngcc-sparkline__line')!.getAttribute('d')!;
      expect(d).not.toContain('NaN');
      expect(
        new Set(
          d
            .split(/[ML]/)
            .filter(Boolean)
            .map((p) => p.trim().split(' ')[1]),
        ).size,
      ).toBe(1);
    });

    it('ignores non-finite values', async () => {
      await set({ data: [1, NaN, 2, Infinity, 3] });
      expect(q('.ngcc-sparkline__line')!.getAttribute('d')!.match(/L/g)!.length).toBe(2);
    });

    it('honours a fixed scale', async () => {
      await set({ data: [50, 50], min: 0, max: 100 });
      const d = q('.ngcc-sparkline__line')!.getAttribute('d')!;
      expect(d).toContain(' 16'); // half-way up a 32px box
    });
  });

  describe('area', () => {
    it('adds a closed fill under the line', async () => {
      await set({ type: 'area' });
      expect(q('.ngcc-sparkline__area')!.getAttribute('d')!.endsWith('Z')).toBe(true);
      expect(q('.ngcc-sparkline__line')).not.toBeNull();
    });
  });

  describe('bar', () => {
    beforeEach(async () => set({ type: 'bar' }));

    it('draws one bar per value', () => {
      expect(all('.ngcc-sparkline__bar').length).toBe(6);
    });

    it('scales bars against zero: the largest value is the tallest', () => {
      const heights = all('.ngcc-sparkline__bar').map((r) => parseFloat(r.getAttribute('height')!));
      expect(heights.indexOf(Math.max(...heights))).toBe(5);
      expect(heights[0]).toBeLessThan(heights[5]);
    });

    it('keeps a zero value visible as a hairline', async () => {
      await set({ data: [0, 5] });
      expect(
        parseFloat(all('.ngcc-sparkline__bar')[0].getAttribute('height')!),
      ).toBeGreaterThanOrEqual(1);
    });

    it('draws negative values below the zero line', async () => {
      await set({ data: [-5, 5] });
      const [neg, pos] = all('.ngcc-sparkline__bar');
      expect(parseFloat(neg.getAttribute('y')!)).toBeGreaterThanOrEqual(
        parseFloat(pos.getAttribute('y')!) + parseFloat(pos.getAttribute('height')!) - 0.2,
      );
    });

    it('needs only one value', async () => {
      await set({ data: [3] });
      expect(all('.ngcc-sparkline__bar').length).toBe(1);
    });
  });

  describe('empty and loading', () => {
    it('shows a dashed baseline instead of a graphic when there is not enough data', async () => {
      await set({ data: [1] });
      expect(q('.ngcc-sparkline__empty')).not.toBeNull();
      expect(q('.ngcc-sparkline__line')).toBeNull();
      expect(svg().getAttribute('aria-label')).toBe('No trend data');
    });

    it('treats no data and all-invalid data as empty, with a custom label', async () => {
      await set({ data: [], emptyLabel: 'Not enough history' });
      expect(svg().getAttribute('aria-label')).toBe('Not enough history');
      await set({ data: [NaN, NaN] });
      expect(q('.ngcc-sparkline__empty')).not.toBeNull();
    });

    it('shows the shared skeleton while loading, with a matching size', async () => {
      await set({ loading: true, width: 200, height: 40 });
      expect(fixture.debugElement.query(By.css('ngcc-skeleton'))).not.toBeNull();
      expect(svg()).toBeNull();
      const skeleton = q('ngcc-skeleton p') as HTMLElement;
      expect(skeleton.style.width).toBe('200px');
      expect(skeleton.style.height).toBe('40px');
    });
  });

  describe('color', () => {
    it('defaults to the theme interactive color', () => {
      expect(svg().style.color).toContain('--cds-interactive');
    });

    it('follows status tokens', async () => {
      await set({ status: 'warning' });
      expect(svg().style.color).toContain('--cds-support-warning');
    });

    it('colors by trend and sentiment: rising revenue good, rising cost bad', async () => {
      await set({ sentiment: 'positive-up' });
      expect(svg().style.color).toContain('--cds-support-success');
      await set({ sentiment: 'positive-down' });
      expect(svg().style.color).toContain('--cds-support-error');
      await set({ data: [8, 3, 1], sentiment: 'positive-down' });
      expect(svg().style.color).toContain('--cds-support-success');
    });

    it('stays neutral for a flat series even with a sentiment', async () => {
      await set({ data: [3, 3, 3], sentiment: 'positive-up' });
      expect(svg().style.color).toContain('--cds-interactive');
    });

    it('lets an explicit color or status win over sentiment', async () => {
      await set({ sentiment: 'positive-up', status: 'error' });
      expect(svg().style.color).toContain('--cds-support-error');
      await set({ color: '#8a3ffc' });
      expect(svg().style.color).toBe('rgb(138, 63, 252)');
    });
  });

  describe('accessibility', () => {
    it('has an image role and a generated summary', () => {
      expect(svg().getAttribute('role')).toBe('img');
      expect(svg().getAttribute('aria-label')).toBe('Trend over 6 points: from 1 to 8, up (+700%)');
    });

    it('describes a falling and an unchanged series', async () => {
      await set({ data: [10, 5] });
      expect(svg().getAttribute('aria-label')).toBe(
        'Trend over 2 points: from 10 to 5, down (−50%)',
      );
      await set({ data: [3, 3] });
      expect(svg().getAttribute('aria-label')).toBe('Trend over 2 points: from 3 to 3, unchanged');
    });

    it('omits the percentage when the series starts at zero', async () => {
      await set({ data: [0, 4] });
      expect(svg().getAttribute('aria-label')).toBe('Trend over 2 points: from 0 to 4, up');
    });

    it('uses a custom label when given', async () => {
      await set({ label: 'Revenue, last 6 months' });
      expect(svg().getAttribute('aria-label')).toBe('Revenue, last 6 months');
    });

    it('can be decorative', async () => {
      await set({ decorative: true });
      expect(svg().getAttribute('aria-hidden')).toBe('true');
      expect(svg().getAttribute('role')).toBeNull();
      expect(svg().getAttribute('aria-label')).toBeNull();
    });

    it('exposes the trend direction for styling and tests', () => {
      expect(svg().getAttribute('data-trend')).toBe('up');
    });

    it('has no axe violations', async () => {
      const results = await runAxe(fixture.nativeElement);
      expect(results.violations).toEqual([]);
    });
  });
});
