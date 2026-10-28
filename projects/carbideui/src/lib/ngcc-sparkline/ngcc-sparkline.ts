import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgccSkeleton } from '../ngcc-skeleton/ngcc-skeleton';
import {
  NgccSparklineSentiment,
  NgccSparklineStatus,
  NgccSparklineTrend,
  NgccSparklineType,
} from './ngcc-sparkline.types';

const PAD = 2;

interface NgccSparklineBar {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A tiny trend graphic for KPI tiles and table rows. Pure SVG (no chart library), so dozens can
 * sit on one dashboard cheaply. It has a text alternative generated from the data, a loading
 * skeleton, and an explicit "no data" state.
 *
 * Color: `color` wins, then `status`, then `sentiment` (up/down from the first to the last
 * value), then the theme's interactive color, so it follows any color theme.
 */
@Component({
  selector: 'ngcc-sparkline',
  standalone: true,
  imports: [NgccSkeleton],
  templateUrl: './ngcc-sparkline.html',
  styleUrl: './ngcc-sparkline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ngcc-sparkline' },
})
export class NgccSparkline {
  /** The series, oldest first. Non-finite values are ignored. */
  readonly data = input<readonly number[]>([]);
  readonly type = input<NgccSparklineType>('line');
  /** Drawing width in px; the graphic shrinks to fit narrower containers. */
  readonly width = input(120);
  readonly height = input(32);
  /** Fix the scale (e.g. 0–100 for percentages). Defaults to the data range. */
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly status = input<NgccSparklineStatus>('none');
  readonly sentiment = input<NgccSparklineSentiment>('neutral');
  /** Any CSS color; overrides status and sentiment. */
  readonly color = input('');
  /** Dot on the latest value (line and area). */
  readonly showLastPoint = input(true);
  /** Accessible name. Defaults to a summary built from the data. */
  readonly label = input('');
  /** Hide from assistive technology, e.g. when the surrounding text already says it. */
  readonly decorative = input(false);
  readonly loading = input(false);
  readonly emptyLabel = input('No trend data');

  protected readonly values = computed(() => this.data().filter((v) => Number.isFinite(v)));

  protected readonly isEmpty = computed(
    () => this.values().length < (this.type() === 'bar' ? 1 : 2),
  );

  protected readonly trend = computed<NgccSparklineTrend>(() => {
    const v = this.values();
    if (v.length < 2) return 'flat';
    const delta = v[v.length - 1] - v[0];
    return delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  });

  protected readonly resolvedColor = computed(() => {
    const explicit = this.color();
    if (explicit) return explicit;
    const status = this.status();
    if (status !== 'none') return `var(--cds-support-${status})`;
    const sentiment = this.sentiment();
    const trend = this.trend();
    if (sentiment !== 'neutral' && trend !== 'flat') {
      const good = (trend === 'up') === (sentiment === 'positive-up');
      return good ? 'var(--cds-support-success)' : 'var(--cds-support-error)';
    }
    return 'var(--cds-interactive, #0f62fe)';
  });

  private readonly domain = computed(() => {
    const v = this.values();
    let lo = this.min() ?? Math.min(...v);
    let hi = this.max() ?? Math.max(...v);
    // Bars are read against zero, so zero must be on the scale.
    if (this.type() === 'bar') {
      if (this.min() === undefined) lo = Math.min(lo, 0);
      if (this.max() === undefined) hi = Math.max(hi, 0);
    }
    return { lo, hi };
  });

  private y(value: number): number {
    const { lo, hi } = this.domain();
    const inner = this.height() - 2 * PAD;
    if (hi === lo) return this.height() / 2;
    const clamped = Math.min(hi, Math.max(lo, value));
    return PAD + (1 - (clamped - lo) / (hi - lo)) * inner;
  }

  private x(index: number, count: number): number {
    if (count < 2) return this.width() / 2;
    return PAD + (index * (this.width() - 2 * PAD)) / (count - 1);
  }

  private readonly coords = computed(() => {
    const v = this.values();
    return v.map((value, i) => ({ x: this.x(i, v.length), y: this.y(value) }));
  });

  private static round(n: number): number {
    return Math.round(n * 10) / 10;
  }

  protected readonly linePath = computed(() =>
    this.coords()
      .map(
        (p, i) => `${i === 0 ? 'M' : 'L'}${NgccSparkline.round(p.x)} ${NgccSparkline.round(p.y)}`,
      )
      .join(' '),
  );

  protected readonly areaPath = computed(() => {
    const pts = this.coords();
    if (!pts.length) return '';
    const base = NgccSparkline.round(this.height() - PAD);
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${this.linePath()} L${NgccSparkline.round(last.x)} ${base} L${NgccSparkline.round(first.x)} ${base} Z`;
  });

  protected readonly lastPoint = computed(() => {
    const pts = this.coords();
    return pts.length ? pts[pts.length - 1] : null;
  });

  protected readonly bars = computed<NgccSparklineBar[]>(() => {
    const v = this.values();
    const slot = (this.width() - 2 * PAD) / v.length;
    const barWidth = Math.max(1, slot * 0.7);
    const zeroY = this.y(0);
    return v.map((value, i) => {
      const top = this.y(value);
      return {
        x: NgccSparkline.round(PAD + i * slot + (slot - barWidth) / 2),
        y: NgccSparkline.round(Math.min(top, zeroY)),
        width: NgccSparkline.round(barWidth),
        // A zero or tiny value still shows as a hairline so the slot isn't mistaken for missing data.
        height: NgccSparkline.round(Math.max(1, Math.abs(top - zeroY))),
      };
    });
  });

  protected readonly baselineY = computed(() => NgccSparkline.round(this.height() / 2));

  /** Text alternative: the label, or a summary of the series. */
  protected readonly accessibleName = computed(() => {
    const explicit = this.label();
    if (explicit) return explicit;
    if (this.isEmpty()) return this.emptyLabel();
    const v = this.values();
    const first = v[0];
    const last = v[v.length - 1];
    const direction = this.trend() === 'up' ? 'up' : this.trend() === 'down' ? 'down' : 'unchanged';
    const change =
      first !== 0 && this.trend() !== 'flat'
        ? ` (${last > first ? '+' : '−'}${Math.abs(Math.round(((last - first) / first) * 100))}%)`
        : '';
    return `Trend over ${v.length} points: from ${first} to ${last}, ${direction}${change}`;
  });

  protected readonly widthPx = computed(() => `${this.width()}px`);
  protected readonly heightPx = computed(() => `${this.height()}px`);
}
