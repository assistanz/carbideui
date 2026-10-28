import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComboChart, HeatmapChart, SimpleBarChart, StackedAreaChart } from '@carbon/charts';
import { NgccCharts } from './ngcc-charts';
import { NgccChartState } from './ngcc-chart-state';
import { NgccGaugeChart } from './ngcc-gauge-chart/ngcc-gauge-chart';
import {
  NgccChartThreshold,
  NgccChartType,
  ngccComboChartTypes,
  rankChartData,
  toCarbonThresholds,
} from './ngcc-charts.types';

type Opts = Record<string, any>;

describe('chart helpers', () => {
  describe('toCarbonThresholds', () => {
    it('maps kind to the default color: limit red, goal green', () => {
      expect(
        toCarbonThresholds([
          { value: 90, label: 'Capacity', kind: 'limit' },
          { value: 70, label: 'Target', kind: 'goal' },
        ]),
      ).toEqual([
        { value: 90, label: 'Capacity', fillColor: '#da1e28' },
        { value: 70, label: 'Target', fillColor: '#198038' },
      ]);
    });

    it('defaults to a limit and lets color win', () => {
      const [a, b] = toCarbonThresholds([
        { value: 1, label: 'a' },
        { value: 2, label: 'b', kind: 'goal', color: '#8a3ffc' },
      ]);
      expect(a.fillColor).toBe('#da1e28');
      expect(b.fillColor).toBe('#8a3ffc');
    });

    it('drops non-finite values', () => {
      expect(
        toCarbonThresholds([
          { value: NaN, label: 'x' },
          { value: 5, label: 'y' },
        ]).length,
      ).toBe(1);
    });
  });

  describe('rankChartData', () => {
    const rows = [
      { group: 'B', value: 20 },
      { group: 'A', value: 50 },
      { group: 'C', value: 5 },
      { group: 'D', value: 35 },
    ];

    it('keeps order by default and never mutates the input', () => {
      const copy = JSON.stringify(rows);
      expect(rankChartData(rows, 'none')).toEqual(rows);
      rankChartData(rows, 'desc');
      expect(JSON.stringify(rows)).toBe(copy);
    });

    it('sorts descending and ascending by value', () => {
      expect(rankChartData(rows, 'desc').map((r) => r['group'])).toEqual(['A', 'D', 'B', 'C']);
      expect(rankChartData(rows, 'asc').map((r) => r['group'])).toEqual(['C', 'B', 'D', 'A']);
    });

    it('keeps the top N after sorting', () => {
      expect(rankChartData(rows, 'desc', 2).map((r) => r['group'])).toEqual(['A', 'D']);
      expect(rankChartData(rows, 'none', 2).map((r) => r['group'])).toEqual(['B', 'A']);
    });

    it('ignores a missing or non-positive limit', () => {
      expect(rankChartData(rows, 'none', null).length).toBe(4);
      expect(rankChartData(rows, 'none', 0).length).toBe(4);
    });

    it('sorts rows without a numeric value last', () => {
      const out = rankChartData([{ group: 'x' }, { group: 'y', value: 1 }], 'desc');
      expect(out.map((r) => r['group'])).toEqual(['y', 'x']);
    });
  });

  describe('ngccComboChartTypes', () => {
    it('builds a bar group and a line group', () => {
      expect(ngccComboChartTypes({ bars: ['Revenue'], lines: ['Capacity'] })).toEqual([
        { type: 'simple-bar', correspondingDatasets: ['Revenue'] },
        {
          type: 'line',
          options: { points: { enabled: true } },
          correspondingDatasets: ['Capacity'],
        },
      ]);
    });

    it('omits an empty group', () => {
      expect(ngccComboChartTypes({ bars: ['A'], lines: [] }).length).toBe(1);
      expect(ngccComboChartTypes({ bars: [], lines: ['B'] })[0].type).toBe('line');
    });
  });
});

describe('NgccCharts: more chart types', () => {
  let fixture: ComponentFixture<NgccCharts<NgccChartType>>;

  const set = async (inputs: Record<string, unknown>): Promise<void> => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
  };
  const merged = (): Opts => (fixture.componentInstance as any).getMergedOptions();
  const chart = (): unknown => (fixture.componentInstance as any).chart;
  const modelOptions = (): Opts => (fixture.componentInstance as any).chart.model.getOptions();

  const monthly = [
    { group: 'Revenue', date: new Date('2026-01-01'), value: 40 },
    { group: 'Revenue', date: new Date('2026-02-01'), value: 55 },
    { group: 'Capacity', date: new Date('2026-01-01'), value: 80 },
    { group: 'Capacity', date: new Date('2026-02-01'), value: 80 },
  ];
  const ranked = [
    { group: 'Acme', value: 120 },
    { group: 'Globex', value: 340 },
    { group: 'Initech', value: 90 },
    { group: 'Umbrella', value: 210 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccCharts],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
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
    // jsdom has no SVG transform list; d3 transitions read it when a chart redraws.
    if (!('transform' in SVGElement.prototype)) {
      Object.defineProperty(SVGElement.prototype, 'transform', {
        configurable: true,
        get: () => ({ baseVal: { consolidate: () => null } }),
      });
    }
    fixture = TestBed.createComponent(NgccCharts);
  });

  describe('stacked area', () => {
    it('stacks the value axis and draws a stacked area chart', async () => {
      await set({ type: 'stackedArea', data: monthly });
      expect(merged()['axes'].left.stacked).toBe(true);
      expect(chart()).toBeInstanceOf(StackedAreaChart);
    });
  });

  describe('combo', () => {
    it('draws the first series as bars and the rest as lines when not told otherwise', async () => {
      await set({ type: 'combo', data: monthly });
      expect(merged()['comboChartTypes']).toEqual(
        ngccComboChartTypes({ bars: ['Revenue'], lines: ['Capacity'] }),
      );
      expect(chart()).toBeInstanceOf(ComboChart);
    });

    it('uses the series you specify', async () => {
      const comboChartTypes = ngccComboChartTypes({ bars: ['Capacity'], lines: ['Revenue'] });
      await set({ type: 'combo', data: monthly, options: { comboChartTypes } });
      expect(merged()['comboChartTypes']).toBe(comboChartTypes);
    });
  });

  describe('horizontal bar (ranked list)', () => {
    beforeEach(async () => set({ type: 'horizontalBar', data: ranked }));

    it('puts categories on the left and values along the bottom', () => {
      const axes = merged()['axes'];
      expect(axes.left).toMatchObject({ scaleType: 'labels', mapsTo: 'group' });
      expect(axes.bottom).toMatchObject({
        scaleType: 'linear',
        mapsTo: 'value',
        includeZero: true,
      });
      expect(chart()).toBeInstanceOf(SimpleBarChart);
    });

    it('lists the first row at the top (Carbon would draw it at the bottom)', async () => {
      await set({ sort: 'desc', limit: 3 });
      // axis domain runs bottom-up, so the ranked order reversed puts the largest on top
      expect(merged()['axes'].left.domain).toEqual(['Acme', 'Umbrella', 'Globex']);
    });

    it('keeps your own category order if you set a domain', async () => {
      await set({ options: { axes: { left: { domain: ['Initech', 'Acme'] } } } });
      expect(merged()['axes'].left.domain).toEqual(['Initech', 'Acme']);
    });

    it('hides the redundant legend', () => {
      expect(merged()['legend']).toEqual({ enabled: false });
    });

    it('merges your axis options instead of replacing ours', async () => {
      await set({ options: { axes: { bottom: { title: 'Spend ($)' } } } });
      const axes = merged()['axes'];
      expect(axes.bottom).toMatchObject({ title: 'Spend ($)', mapsTo: 'value' });
      expect(axes.left.mapsTo).toBe('group');
    });

    it('ranks and limits: top 3 by value, largest first', async () => {
      await set({ sort: 'desc', limit: 3 });
      const drawn = (fixture.componentInstance as any).chart.model.getData();
      expect(drawn.map((r: Opts) => r['group'])).toEqual(['Globex', 'Umbrella', 'Acme']);
    });

    it('re-ranks when the data changes', async () => {
      await set({ sort: 'desc' });
      await set({ data: [...ranked, { group: 'Hooli', value: 999 }] });
      const drawn = (fixture.componentInstance as any).chart.model.getData();
      expect(drawn[0]['group']).toBe('Hooli');
    });
  });

  describe('heat map', () => {
    const cells = [
      { x: 'Mon', y: 'Zone A', value: 0.4 },
      { x: 'Tue', y: 'Zone A', value: 0.9 },
      { x: 'Mon', y: 'Zone B', value: 0.2 },
      { x: 'Tue', y: 'Zone B', value: 0.6 },
    ];

    it('maps x, y and value and titles the color legend', async () => {
      await set({ type: 'heatmap', data: cells });
      const o = merged();
      expect(o['axes'].bottom).toMatchObject({ scaleType: 'labels', mapsTo: 'x' });
      expect(o['axes'].left).toMatchObject({ scaleType: 'labels', mapsTo: 'y' });
      expect(o['heatmap'].colorLegend.title).toBe('Value');
      expect(chart()).toBeInstanceOf(HeatmapChart);
    });

    it('keeps your legend title and axis mapping', async () => {
      await set({
        type: 'heatmap',
        data: cells.map(({ x, ...rest }) => ({ day: x, ...rest })),
        options: {
          axes: { bottom: { mapsTo: 'day' } },
          heatmap: { colorLegend: { title: 'Utilization' } },
        },
      });
      expect(merged()['axes'].bottom.mapsTo).toBe('day');
      expect(merged()['heatmap'].colorLegend.title).toBe('Utilization');
      expect(merged()['axes'].left.mapsTo).toBe('y');
    });
  });

  describe('thresholds and goals', () => {
    const limits: NgccChartThreshold[] = [
      { value: 90, label: 'Capacity', kind: 'limit' },
      { value: 70, label: 'Target', kind: 'goal' },
    ];

    it('adds reference lines to the value axis of a line chart', async () => {
      await set({ type: 'line', data: monthly, thresholds: limits });
      expect(merged()['axes'].left.thresholds).toEqual(toCarbonThresholds(limits));
    });

    it('works on bar, area and combo charts', async () => {
      for (const type of ['bar', 'stackedBar', 'area', 'stackedArea', 'combo'] as const) {
        await set({ type, data: monthly, thresholds: limits });
        expect(merged()['axes'].left.thresholds.length, type).toBe(2);
      }
    });

    it('uses the bottom axis for horizontal bars (a vertical line)', async () => {
      await set({ type: 'horizontalBar', data: ranked, thresholds: limits });
      expect(merged()['axes'].bottom.thresholds.length).toBe(2);
      expect(merged()['axes'].left.thresholds).toBeUndefined();
    });

    it('keeps thresholds you already put in the axis options', async () => {
      await set({
        type: 'line',
        data: monthly,
        thresholds: [limits[0]],
        options: {
          axes: {
            left: { thresholds: [{ value: 10, label: 'Floor' }] },
            bottom: { scaleType: 'time', mapsTo: 'date' },
          },
        },
      });
      expect(merged()['axes'].left.thresholds.map((t: Opts) => t['label'])).toEqual([
        'Floor',
        'Capacity',
      ]);
    });

    it('adds nothing for charts without a value axis', async () => {
      await set({ type: 'pie', data: ranked, thresholds: limits });
      expect(merged()['axes']).toBeUndefined();
      await set({ type: 'heatmap', data: [{ x: 'a', y: 'b', value: 1 }], thresholds: limits });
      expect(JSON.stringify(merged()['axes'])).not.toContain('thresholds');
    });

    it('updates the drawn chart when thresholds change', async () => {
      await set({ type: 'line', data: monthly, thresholds: [limits[0]] });
      expect(modelOptions()['axes'].left.thresholds.length).toBe(1);
      await set({ thresholds: limits });
      expect(modelOptions()['axes'].left.thresholds.length).toBe(2);
      await set({ thresholds: [] });
      expect(modelOptions()['axes'].left.thresholds ?? []).toHaveLength(0);
    });
  });

  describe('existing chart types keep their behavior', () => {
    it('does not apply ranking or thresholds unless asked', async () => {
      await set({ type: 'bar', data: ranked });
      expect(
        (fixture.componentInstance as any).chart.model.getData().map((r: Opts) => r['group']),
      ).toEqual(ranked.map((r) => r.group));
      expect(merged()['axes'].left.thresholds).toBeUndefined();
    });

    it('redraws when one non-empty dataset replaces another (live data)', async () => {
      await set({ type: 'bar', data: ranked });
      expect((fixture.componentInstance as any).chart.model.getData().length).toBe(4);

      await set({ data: [{ group: 'Only', value: 1 }] });
      expect((fixture.componentInstance as any).chart.model.getData()).toEqual([
        { group: 'Only', value: 1 },
      ]);
    });

    it('applies changed options to the drawn chart', async () => {
      await set({ type: 'bar', data: ranked, options: { title: 'First' } });
      expect(modelOptions()['title']).toBe('First');
      await set({ options: { title: 'Second' } });
      expect(modelOptions()['title']).toBe('Second');
    });

    it('stackedBar is still stacked', async () => {
      await set({ type: 'stackedBar', data: monthly });
      expect(merged()['axes'].left.stacked).toBe(true);
    });
  });

  describe('loading and empty states', () => {
    it('uses the shared state component for loading', async () => {
      await set({ type: 'heatmap', loading: true });
      expect(fixture.debugElement.query(By.directive(NgccChartState))).not.toBeNull();
      expect(fixture.debugElement.query(By.css('ngcc-skeleton'))).not.toBeNull();
    });

    it('shows the same message for every chart type when there is no data', async () => {
      for (const type of [
        'bar',
        'horizontalBar',
        'stackedArea',
        'combo',
        'heatmap',
        'donut',
      ] as const) {
        await set({ type, data: [], noDataMessage: 'Nothing to show' });
        const empty = fixture.nativeElement.querySelector('.ngcc--charts__empty');
        expect(empty?.textContent, type).toContain('Nothing to show');
        expect(empty.getAttribute('role'), type).toBe('status');
      }
    });
  });
});

describe('NgccChartState', () => {
  let fixture: ComponentFixture<NgccChartState>;
  const set = async (inputs: Record<string, unknown>): Promise<void> => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
  };
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccChartState],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(NgccChartState);
  });

  it('renders nothing when neither loading nor empty', async () => {
    await set({});
    expect(el().querySelector('ngcc-skeleton')).toBeNull();
    expect(el().querySelector('.ngcc--charts__empty')).toBeNull();
  });

  it('shows the library skeleton at the chart height while loading', async () => {
    await set({ loading: true, height: '240px' });
    const skeleton = el().querySelector('ngcc-skeleton p') as HTMLElement;
    expect(skeleton.style.height).toBe('240px');
    expect(el().querySelector('ngcc-skeleton')!.getAttribute('role')).toBe('status');
    expect(el().querySelector('ngcc-skeleton')!.getAttribute('aria-busy')).toBe('true');
  });

  it('shows the message at the same height when empty, announced politely', async () => {
    await set({ empty: true, message: 'No utilization data', height: '240px' });
    const box = el().querySelector('.ngcc--charts__empty') as HTMLElement;
    expect(box.style.height).toBe('240px');
    expect(box.textContent).toContain('No utilization data');
    expect(box.getAttribute('role')).toBe('status');
  });

  it('prefers loading over empty so a loading chart never reads as "no data"', async () => {
    await set({ loading: true, empty: true });
    expect(el().querySelector('.ngcc--charts__empty')).toBeNull();
    expect(el().querySelector('ngcc-skeleton')).not.toBeNull();
  });
});

describe('NgccGaugeChart: live data', () => {
  it('redraws when one non-empty dataset replaces another', async () => {
    await TestBed.configureTestingModule({
      imports: [NgccGaugeChart],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    Element.prototype.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 300,
          height: 200,
          top: 0,
          left: 0,
          bottom: 200,
          right: 300,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect,
    );
    const fixture = TestBed.createComponent(NgccGaugeChart);
    fixture.componentRef.setInput('data', [{ group: 'value', value: 40 }]);
    await fixture.whenStable();
    expect((fixture.componentInstance as any).chart.model.getData()[0].value).toBe(40);

    fixture.componentRef.setInput('data', [{ group: 'value', value: 85 }]);
    await fixture.whenStable();
    expect((fixture.componentInstance as any).chart.model.getData()[0].value).toBe(85);
  });
});
