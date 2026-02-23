import { Component, ChangeDetectionStrategy, effect } from '@angular/core';
import { GaugeChart, GaugeChartOptions } from '@carbon/charts';
import { NgccSkeleton } from '../../ngcc-skeleton/ngcc-skeleton';
import { NgccBaseChart } from '../../shared/ngcc-base-chart';

@Component({
  selector: 'ngcc-gauge-chart',
  standalone: true,
  templateUrl: './ngcc-gauge-chart.html',
  imports: [NgccSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccGaugeChart extends NgccBaseChart<GaugeChartOptions> {
  constructor() {
    super();

    effect(() => {
      const el = this.chartContainer()?.nativeElement;
      if (!el) return;

      this.destroyChart();
      this.initChart(el);
    });

    // Reactively update on data/options change
    effect(() => {
      if (this.chart && this.hasData()) {
        this.chart.model.setData(this.data);
        this.chart.model.setOptions(this.getMergedOptions());
        this.chart.update();
      }
    });
  }

  protected initChart(el: HTMLElement): void {
    const options = this.getMergedOptions();
    this.chart = new GaugeChart(el as HTMLDivElement, { data: this.data, options });
  }

  private getMergedOptions(): GaugeChartOptions {
    const userOpts = this.options;
    const opts = userOpts as Record<string, unknown>;
    const userGauge = (opts['gauge'] ?? {}) as Record<string, unknown>;
    const userColor = (opts['color'] ?? {}) as Record<string, Record<string, unknown>>;

    return {
      resizable: true,
      height: this.chartHeight(),
      legend: { enabled: false },
      title: '',
      accessibility: {
        svgAriaLabel: undefined,
      },
      gauge: {
        type: 'semi',
        status: 'success',
        deltaArrow: { enabled: true },
        ...userGauge,
      },
      color: {
        scale: {
          success: '#42be65',
          warning: '#f1c21b',
          danger: '#fa4d56',
          ...userColor['scale'],
        },
      },
      ...userOpts,
    } as GaugeChartOptions;
  }
}
