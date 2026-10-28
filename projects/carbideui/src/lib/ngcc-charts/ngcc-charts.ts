import {
  Component,
  ChangeDetectionStrategy,
  effect,
  signal,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  SimpleBarChart,
  StackedBarChart,
  LineChart,
  PieChart,
  DonutChart,
  AreaChart,
  StackedAreaChart,
  ComboChart,
  HeatmapChart,
} from '@carbon/charts';
import { NgccChartState } from './ngcc-chart-state';
import { NgccBaseChart } from '../shared/ngcc-base-chart';
import {
  NgccChartType,
  NgccChartOptions,
  NgccChartThreshold,
  NgccChartSort,
  ngccComboChartTypes,
  rankChartData,
  toCarbonThresholds,
} from './ngcc-charts.types';

const chartTypeMap = {
  bar: SimpleBarChart,
  horizontalBar: SimpleBarChart,
  stackedBar: StackedBarChart,
  line: LineChart,
  area: AreaChart,
  stackedArea: StackedAreaChart,
  combo: ComboChart,
  heatmap: HeatmapChart,
  pie: PieChart,
  donut: DonutChart,
} as const;

/** Chart types drawn on a value axis, which is where thresholds apply. */
const THRESHOLD_TYPES: readonly NgccChartType[] = [
  'bar',
  'horizontalBar',
  'stackedBar',
  'line',
  'area',
  'stackedArea',
  'combo',
];

@Component({
  selector: 'ngcc-charts',
  standalone: true,
  templateUrl: './ngcc-charts.html',
  styleUrl: './charts.scss',
  imports: [NgccChartState],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccCharts<T extends NgccChartType = 'bar'>
  extends NgccBaseChart<NgccChartOptions<T>>
  implements OnChanges
{
  @Input() type: T = 'bar' as T;
  /**
   * Reference lines on the value axis: limits (capacity, quota) and goals. Applies to bar, line,
   * area and combo charts; for `horizontalBar` the line is vertical.
   */
  @Input() thresholds: readonly NgccChartThreshold[] = [];
  /** Sort rows by `value` before drawing (top-N / ranked charts). Default: keep input order. */
  @Input() sort: NgccChartSort = 'none';
  /** Keep only the first N rows after sorting. */
  @Input() limit: number | null = null;

  // Internal state signals
  private readonly _type = signal<T>('bar' as T);
  private readonly _thresholds = signal<readonly NgccChartThreshold[]>([]);
  private readonly _sort = signal<NgccChartSort>('none');
  private readonly _limit = signal<number | null>(null);

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['type']) {
      this._type.set(changes['type'].currentValue ?? ('bar' as T));
    }
    if (changes['thresholds']) this._thresholds.set(changes['thresholds'].currentValue ?? []);
    if (changes['sort']) this._sort.set(changes['sort'].currentValue ?? 'none');
    if (changes['limit']) this._limit.set(changes['limit'].currentValue ?? null);
  }

  /** The rows actually drawn: input data, ranked when `sort` / `limit` are set. */
  protected preparedData(): Record<string, unknown>[] {
    return rankChartData(this.data, this._sort(), this._limit());
  }

  constructor() {
    super();

    // initialize chart on mount
    effect(() => {
      const el = this.chartContainer()?.nativeElement;
      if (!el) return;
      this.destroyChart();
      this.initChart(el);
    });

    // update data reactively
    effect(() => {
      // hasData() is a boolean, so it doesn't change when one non-empty dataset replaces another.
      // Track the inputs themselves, or live data updates never reach the chart.
      this._data();
      this._options();
      if (this.chart && this.hasData()) {
        this.chart.model.setData(this.preparedData());
        this.chart.model.setOptions(this.getMergedOptions());
        this.chart.update();
      }
    });
  }

  protected initChart(el: HTMLElement): void {
    const ChartClass = chartTypeMap[this._type()];
    const opts = this.getMergedOptions();
    this.chart = new ChartClass(
      el as HTMLDivElement,
      {
        data: this.preparedData(),
        options: opts,
      } as never,
    );
    this.observeResize(el);
  }

  private getMergedOptions(): NgccChartOptions<T> {
    const type = this._type();
    const userOpts = this.options;
    const opts = userOpts as Record<string, unknown>;
    const theme = (opts['theme'] as string) ?? 'white';
    const userAxes = (opts['axes'] ?? {}) as Record<string, Record<string, unknown>>;
    const userColor = (opts['color'] ?? {}) as Record<string, Record<string, unknown>>;

    if (type === 'heatmap') {
      return this.heatmapOptions(opts, theme, userAxes);
    }

    if (type === 'horizontalBar') {
      return this.horizontalBarOptions(opts, theme, userAxes, userColor);
    }

    if (['bar', 'stackedBar', 'line', 'area', 'stackedArea', 'combo'].includes(type)) {
      const stacked = type === 'stackedBar' || type === 'stackedArea';
      const merged = {
        resizable: true,
        legend: { enabled: true, position: 'right' },
        tooltip: { enabled: true },
        grid: { x: { enabled: true }, y: { enabled: true } },
        height: this.chartHeight(),
        title: '',
        theme,
        axes: {
          left: {
            includeZero: true,
            stacked,
            ...userAxes['left'],
          },
          bottom: {
            ...userAxes['bottom'],
          },
        },
        color: {
          scale: {
            Primary: '#0f62fe',
            Secondary: '#42be65',
            Accent1: '#08bdba',
            Accent2: '#ee5396',
            ...userColor['scale'],
          },
        },
        ...opts,
      } as Record<string, unknown>;

      if (type === 'combo' && !merged['comboChartTypes']) {
        merged['comboChartTypes'] = this.defaultComboTypes();
      }
      return this.withThresholds(merged, 'left') as unknown as NgccChartOptions<T>;
    }

    // Pie / Donut
    return {
      resizable: true,
      legend: { enabled: true, position: 'right' },
      height: this.chartHeight(),
      theme,
      ...opts,
    } as NgccChartOptions<T>;
  }

  /**
   * Ranked list: categories on the left (first row on top), values along the bottom. Data is
   * `{ group, value }`.
   * Unlike the other axis charts, user `axes` are merged per axis rather than replacing ours.
   */
  private horizontalBarOptions(
    opts: Record<string, unknown>,
    theme: string,
    userAxes: Record<string, Record<string, unknown>>,
    userColor: Record<string, Record<string, unknown>>,
  ): NgccChartOptions<T> {
    const merged = {
      resizable: true,
      legend: { enabled: false },
      tooltip: { enabled: true },
      grid: { x: { enabled: true }, y: { enabled: false } },
      height: this.chartHeight(),
      title: '',
      theme,
      color: {
        scale: { Primary: '#0f62fe', ...userColor['scale'] },
      },
      ...opts,
      axes: {
        // Carbon draws the first category at the bottom. A ranked list reads top-down, so list the
        // categories bottom-up unless the caller sets their own `domain`.
        left: {
          scaleType: 'labels',
          mapsTo: 'group',
          domain: this.groupsTopDown().reverse(),
          ...userAxes['left'],
        },
        bottom: { scaleType: 'linear', mapsTo: 'value', includeZero: true, ...userAxes['bottom'] },
      },
    } as Record<string, unknown>;
    return this.withThresholds(merged, 'bottom') as unknown as NgccChartOptions<T>;
  }

  /** Category labels in the order they should read from the top: the order of the (ranked) rows. */
  private groupsTopDown(): string[] {
    return [...new Set(this.preparedData().map((r) => String(r['group'])))];
  }

  /**
   * Heat map. Data is `{ x, y, value }`: x along the bottom, y up the side, `value` as the color.
   * Carbon draws a color legend; the legend title defaults to "Value".
   */
  private heatmapOptions(
    opts: Record<string, unknown>,
    theme: string,
    userAxes: Record<string, Record<string, unknown>>,
  ): NgccChartOptions<T> {
    const userHeatmap = (opts['heatmap'] ?? {}) as Record<string, Record<string, unknown>>;
    return {
      resizable: true,
      tooltip: { enabled: true },
      height: this.chartHeight(),
      title: '',
      theme,
      ...opts,
      axes: {
        bottom: { scaleType: 'labels', mapsTo: 'x', ...userAxes['bottom'] },
        left: { scaleType: 'labels', mapsTo: 'y', ...userAxes['left'] },
      },
      heatmap: {
        ...userHeatmap,
        colorLegend: { title: 'Value', ...userHeatmap['colorLegend'] },
      },
    } as unknown as NgccChartOptions<T>;
  }

  /** Adds the `thresholds` input to the value axis, after any thresholds the options define. */
  private withThresholds(
    merged: Record<string, unknown>,
    valueAxis: 'left' | 'bottom',
  ): Record<string, unknown> {
    const extra = toCarbonThresholds(this._thresholds());
    if (!extra.length || !THRESHOLD_TYPES.includes(this._type())) return merged;
    const axes = (merged['axes'] ?? {}) as Record<string, Record<string, unknown>>;
    const existing = (axes[valueAxis]?.['thresholds'] ?? []) as unknown[];
    return {
      ...merged,
      axes: { ...axes, [valueAxis]: { ...axes[valueAxis], thresholds: [...existing, ...extra] } },
    };
  }

  /**
   * Combo charts need to know which series are bars and which are lines. Without
   * `comboChartTypes` in the options, the first series draws as bars and the rest as lines.
   */
  private defaultComboTypes(): unknown {
    const groups = [...new Set(this.data.map((r) => String(r['group'])))];
    return ngccComboChartTypes({ bars: groups.slice(0, 1), lines: groups.slice(1) });
  }

  getType(): T {
    return this._type();
  }
}
