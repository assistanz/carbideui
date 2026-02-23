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
} from '@carbon/charts';
import { NgccSkeleton } from '../ngcc-skeleton/ngcc-skeleton';
import { NgccBaseChart } from '../shared/ngcc-base-chart';
import { NgccChartType, NgccChartOptions } from './ngcc-charts.types';

const chartTypeMap = {
  bar: SimpleBarChart,
  stackedBar: StackedBarChart,
  line: LineChart,
  area: AreaChart,
  pie: PieChart,
  donut: DonutChart,
} as const;

@Component({
  selector: 'ngcc-charts',
  standalone: true,
  templateUrl: './ngcc-charts.html',
  styleUrl: './charts.scss',
  imports: [NgccSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccCharts<T extends NgccChartType = 'bar'>
  extends NgccBaseChart<NgccChartOptions<T>>
  implements OnChanges
{
  @Input() type: T = 'bar' as T;

  // Internal state signal
  private readonly _type = signal<T>('bar' as T);

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['type']) {
      this._type.set(changes['type'].currentValue ?? ('bar' as T));
    }
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
      if (this.chart && this.hasData()) {
        this.chart.model.setData(this.data);
        this.chart.model.setOptions(this.getMergedOptions());
        this.chart.update();
      }
    });
  }

  protected initChart(el: HTMLElement): void {
    const ChartClass = chartTypeMap[this._type()];
    const opts = this.getMergedOptions();
    this.chart = new ChartClass(el as HTMLDivElement, { data: this.data, options: opts });
    this.observeResize(el);
  }

  private getMergedOptions(): NgccChartOptions<T> {
    const userOpts = this.options;
    const opts = userOpts as Record<string, unknown>;
    const theme = (opts['theme'] as string) ?? 'white';
    const userAxes = (opts['axes'] ?? {}) as Record<string, Record<string, unknown>>;
    const userColor = (opts['color'] ?? {}) as Record<string, Record<string, unknown>>;

    if (['bar', 'stackedBar', 'line', 'area'].includes(this._type())) {
      return {
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
            stacked: this._type() === 'stackedBar',
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
      } as NgccChartOptions<T>;
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

  getType(): T {
    return this._type();
  }
}
