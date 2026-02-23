import {
  PieChartOptions,
  DonutChartOptions,
  LineChartOptions,
  BarChartOptions,
  StackedBarChartOptions,
  AreaChartOptions,
} from '@carbon/charts';

export type NgccChartType = 'bar' | 'stackedBar' | 'line' | 'area' | 'pie' | 'donut';

/**
 * Automatically maps each chart type to its Carbon option type.
 */
export interface NgccChartOptionMap {
  bar: BarChartOptions;
  stackedBar: StackedBarChartOptions;
  line: LineChartOptions;
  area: AreaChartOptions;
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
}
