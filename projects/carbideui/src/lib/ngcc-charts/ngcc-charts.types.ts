import {
  PieChartOptions,
  DonutChartOptions,
  LineChartOptions,
  BarChartOptions,
  StackedBarChartOptions,
  AreaChartOptions,
  StackedAreaChartOptions,
  ComboChartOptions,
  HeatmapChartOptions,
} from '@carbon/charts';

export type NgccChartType =
  | 'bar'
  | 'horizontalBar'
  | 'stackedBar'
  | 'line'
  | 'area'
  | 'stackedArea'
  | 'combo'
  | 'heatmap'
  | 'pie'
  | 'donut';

/**
 * Automatically maps each chart type to its Carbon option type.
 */
export interface NgccChartOptionMap {
  bar: BarChartOptions;
  horizontalBar: BarChartOptions;
  stackedBar: StackedBarChartOptions;
  line: LineChartOptions;
  area: AreaChartOptions;
  stackedArea: StackedAreaChartOptions;
  combo: ComboChartOptions;
  heatmap: HeatmapChartOptions;
  pie: PieChartOptions;
  donut: DonutChartOptions;
}

/**
 * A type-safe way to get the right options type for the given chart type.
 */
export type NgccChartOptions<T extends NgccChartType = NgccChartType> = NgccChartOptionMap[T];

export interface NgccChartsArgs {
  type: NgccChartType;
  data: Record<string, unknown>[];
  options: NgccChartOptions;
  loading?: boolean;
  noDataMessage?: string;
  thresholds?: readonly NgccChartThreshold[];
  sort?: NgccChartSort;
  limit?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Thresholds and goals
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A reference line on the value axis: a limit to stay under (capacity, quota) or a goal to reach.
 * `kind` only picks the default color: limit is red, goal is green. `color` overrides it.
 */
export interface NgccChartThreshold {
  value: number;
  label: string;
  kind?: 'limit' | 'goal';
  color?: string;
}

const THRESHOLD_COLORS = { limit: '#da1e28', goal: '#198038' } as const;

/** Converts thresholds to Carbon Charts' axis `thresholds` option. */
export function toCarbonThresholds(
  thresholds: readonly NgccChartThreshold[],
): { value: number; label: string; fillColor: string }[] {
  return thresholds
    .filter((t) => Number.isFinite(t.value))
    .map((t) => ({
      value: t.value,
      label: t.label,
      fillColor: t.color ?? THRESHOLD_COLORS[t.kind ?? 'limit'],
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Ranking (top N) and combo series
// ─────────────────────────────────────────────────────────────────────────────

export type NgccChartSort = 'none' | 'asc' | 'desc';

/** Sorts rows by their `value` and keeps the first `limit`, for top-N charts. */
export function rankChartData(
  rows: readonly Record<string, unknown>[],
  sort: NgccChartSort,
  limit?: number | null,
): Record<string, unknown>[] {
  let out = [...rows];
  if (sort !== 'none') {
    const num = (r: Record<string, unknown>): number => {
      const v = Number(r['value']);
      return Number.isFinite(v) ? v : -Infinity;
    };
    out.sort((a, b) => (sort === 'desc' ? num(b) - num(a) : num(a) - num(b)));
  }
  if (limit !== null && limit !== undefined && limit > 0) out = out.slice(0, limit);
  return out;
}

/**
 * Builds Carbon's `comboChartTypes` from series names: which groups draw as bars and which as
 * lines. Example: `ngccComboChartTypes({ bars: ['Revenue'], lines: ['Capacity'] })`.
 */
export function ngccComboChartTypes(series: {
  bars: readonly string[];
  lines: readonly string[];
}): ComboChartOptions['comboChartTypes'] {
  const result: ComboChartOptions['comboChartTypes'] = [];
  if (series.bars.length) {
    result.push({ type: 'simple-bar', correspondingDatasets: [...series.bars] });
  }
  if (series.lines.length) {
    result.push({
      type: 'line',
      options: { points: { enabled: true } },
      correspondingDatasets: [...series.lines],
    });
  }
  return result;
}
