import type { Meta, StoryObj } from '@storybook/angular';
import { NgccCharts } from './ngcc-charts';
import { ScaleTypes } from '@carbon/charts';
import { NgccChartsArgs } from './ngcc-charts.types';

// =========================
// STORYBOOK META
// =========================
const meta: Meta<NgccCharts> = {
  title: 'Components/Charts/NgccCharts',
  component: NgccCharts,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# **NgccCharts (Enterprise Component)**

Signal-driven Angular v20+ wrapper around **Carbon Charts**, supporting:
- Dynamic theming (via NgccThemeService)
- Axis, grid, legend, tooltip customization
- Responsive resize handling
- 10 chart types: **bar, horizontalBar, stackedBar, line, area, stackedArea, combo, heatmap, pie, donut**
- **Thresholds and goals**: reference lines (capacity limits, targets) on bar, line, area and combo charts
- **Ranked lists**: \`sort\` and \`limit\` for top-N horizontal bars
- Shared loading and empty states (\`NgccChartState\`) for every chart type

---

## 💡 Features
- Works seamlessly with dark/light Carbon themes
- Full reactivity — auto-updates on data, options, or theme change
- Strongly typed options per chart type
- Adaptive card-style dashboard ready

---

## 🧠 Usage Example
\`\`\`html
<ngcc-charts
  type="line"
  [data]="chartData"
  [options]="{
    title: 'Trend',
    axes: {
      bottom: { mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', includeZero: true }
    },
    curve: 'curveMonotoneX',
    grid: { x: { enabled: true }, y: { enabled: true } },
  }"
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: [
        'bar',
        'horizontalBar',
        'stackedBar',
        'line',
        'area',
        'stackedArea',
        'combo',
        'heatmap',
        'pie',
        'donut',
      ],
      description: 'Chart type to render',
      table: {
        category: 'General',
        defaultValue: { summary: 'bar' },
      },
    },
    data: {
      control: 'object',
      description: 'Dataset for the chart',
      table: { category: 'Data' },
    },
    options: {
      control: 'object',
      description: 'Chart configuration options',
      table: { category: 'Config' },
    },
    loading: {
      control: 'boolean',
      description: 'Shows skeleton while data loads',
      table: { category: 'State' },
    },
    noDataMessage: {
      control: 'text',
      description: 'Message when data array is empty',
      table: { category: 'State' },
    },
    thresholds: {
      control: 'object',
      description:
        'Reference lines on the value axis: { value, label, kind: "limit" | "goal", color? }',
      table: { category: 'Reference lines' },
    },
    sort: {
      control: 'radio',
      options: ['none', 'asc', 'desc'],
      description: 'Sort rows by value before drawing (ranked charts)',
      table: { category: 'Ranking', defaultValue: { summary: 'none' } },
    },
    limit: {
      control: 'number',
      description: 'Keep only the first N rows after sorting (top N)',
      table: { category: 'Ranking' },
    },
  },
};
export default meta;
type Story = StoryObj<typeof NgccCharts & NgccChartsArgs>;

// =========================
// BAR CHART
// =========================
export const BarChart: Story = {
  args: {
    type: 'bar',
    data: [
      { group: 'Available', value: 60 },
      { group: 'Used', value: 40 },
    ],
    options: {
      title: 'Memory Usage',
      axes: {
        left: { mapsTo: 'value', scaleType: ScaleTypes.LINEAR },
        bottom: { mapsTo: 'group', scaleType: ScaleTypes.LABELS },
      },
      grid: { x: { enabled: true }, y: { enabled: true } },
      legend: { enabled: true, position: 'bottom' },
      height: '320px',
    },
  },
  parameters: {
    docs: {
      source: {
        format: true,
      },
    },
  },
};

// =========================
// STACKED BAR CHART
// =========================
export const StackedBarChart: Story = {
  args: {
    type: 'stackedBar',
    data: [
      { group: 'Engineering', key: 'Q1', value: 5000 },
      { group: 'Engineering', key: 'Q2', value: 7000 },
      { group: 'Sales', key: 'Q1', value: 3000 },
      { group: 'Sales', key: 'Q2', value: 5000 },
    ],
    options: {
      title: 'Quarterly Revenue (Stacked)',
      axes: {
        left: { mapsTo: 'value', stacked: true, includeZero: true },
        bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
      },
      legend: { enabled: true, position: 'bottom' },
      grid: { x: { enabled: true }, y: { enabled: true } },
      height: '350px',
    },
  },
  parameters: {
    docs: {
      source: {
        format: true,
      },
    },
  },
};

// =========================
// LINE CHART
// =========================
export const LineChart: Story = {
  args: {
    type: 'line',
    data: [
      { group: 'Used', key: 'Jan', value: 30 },
      { group: 'Used', key: 'Feb', value: 45 },
      { group: 'Used', key: 'Mar', value: 60 },
      { group: 'Available', key: 'Jan', value: 70 },
      { group: 'Available', key: 'Feb', value: 55 },
      { group: 'Available', key: 'Mar', value: 40 },
    ],
    options: {
      title: 'Memory Trend',
      axes: {
        bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: { mapsTo: 'value', scaleType: ScaleTypes.LINEAR, includeZero: true },
      },
      curve: 'curveMonotoneX',
      legend: { enabled: true, position: 'bottom' },
      grid: { x: { enabled: true }, y: { enabled: true } },
      height: '350px',
    },
  },
};

// =========================
// AREA CHART
// =========================
export const AreaChart: Story = {
  args: {
    type: 'area',
    data: [
      { group: 'Server A', key: 'Q1', value: 0 },
      { group: 'Server A', key: 'Q2', value: 5000 },
      { group: 'Server A', key: 'Q3', value: 4500 },
      { group: 'Server B', key: 'Q1', value: 2800 },
      { group: 'Server B', key: 'Q2', value: 5200 },
      { group: 'Server B', key: 'Q3', value: 4800 },
    ],
    options: {
      title: 'Server Load Over Quarters',
      axes: {
        bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: { mapsTo: 'value', scaleType: ScaleTypes.LINEAR, includeZero: false },
      },
      legend: { enabled: true },
      grid: { x: { enabled: true }, y: { enabled: true } },
      height: '350px',
    },
  },
};

// =========================
// PIE CHART
// =========================
export const PieChart: Story = {
  args: {
    type: 'pie',
    data: [
      { group: 'Chrome', value: 50 },
      { group: 'Firefox', value: 25 },
      { group: 'Safari', value: 15 },
      { group: 'Edge', value: 10 },
    ],
    options: {
      title: 'Browser Usage Share',
      legend: { enabled: true, position: 'right' },
      height: '300px',
    },
  },
};

// =========================
// DONUT CHART
// =========================
export const DonutChart: Story = {
  args: {
    type: 'donut',
    data: [
      { group: 'Used', value: 40 },
      { group: 'Free', value: 60 },
    ],
    options: {
      title: 'Storage Utilization',
      donut: { center: { label: '60% Free' } },
      legend: { enabled: true, position: 'bottom' },
      height: '300px',
    },
  },
};

// =========================
// CUSTOM COLORS
// =========================
export const CustomColors: Story = {
  args: {
    type: 'bar',
    data: [
      { group: 'Used', value: 40 },
      { group: 'Available', value: 60 },
    ],
    options: {
      title: 'Custom Colors Example',
      color: {
        scale: {
          Used: '#FFA500', // Light Orange
          Available: '#66B2FF', // Light Blue
        },
      },
      height: '300px',
    },
  },
};

// =========================
// DASHBOARD SHOWCASE
// =========================
export const DashboardShowcase: Story = {
  render: () => ({
    template: `
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 2rem;
          padding: 2rem;
          background: var(--cds-background, #f4f4f4);
        "
      >
        <div class="chart-card">
          <h4 class="chart-title">Department Revenue</h4>
          <ngcc-charts type="bar" [data]="barData" [options]="barOpts"></ngcc-charts>
        </div>

        <div class="chart-card">
          <h4 class="chart-title">Quarterly Stacked Performance</h4>
          <ngcc-charts type="stackedBar" [data]="stackedData" [options]="stackedOpts"></ngcc-charts>
        </div>

        <div class="chart-card">
          <h4 class="chart-title">Sales Trend (North vs South)</h4>
          <ngcc-charts type="line" [data]="lineData" [options]="lineOpts"></ngcc-charts>
        </div>

        <div class="chart-card">
          <h4 class="chart-title">Server Load (24h)</h4>
          <ngcc-charts type="area" [data]="areaData" [options]="areaOpts"></ngcc-charts>
        </div>

        <div class="chart-card">
          <h4 class="chart-title">Browser Usage</h4>
          <ngcc-charts type="pie" [data]="pieData" [options]="pieOpts"></ngcc-charts>
        </div>

        <div class="chart-card">
          <h4 class="chart-title">Storage Utilization</h4>
          <ngcc-charts type="donut" [data]="donutData" [options]="donutOpts"></ngcc-charts>
        </div>
      </div>
    `,
    styles: [
      `
      .chart-card {
        background: var(--cds-layer, #fff);
        border-radius: 0.5rem;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .chart-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.12);
      }
      .chart-title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--cds-text-primary, #161616);
      }
    `,
    ],
    props: {
      barData: [
        { group: 'Sales', value: 420 },
        { group: 'Marketing', value: 310 },
        { group: 'Engineering', value: 580 },
        { group: 'HR', value: 200 },
      ],
      barOpts: {
        axes: {
          left: { mapsTo: 'value', scaleType: ScaleTypes.LINEAR },
          bottom: { mapsTo: 'group', scaleType: ScaleTypes.LABELS },
        },
        height: '260px',
      },
      stackedData: [
        { group: 'Team A', key: 'Jan', value: 40 },
        { group: 'Team A', key: 'Feb', value: 50 },
        { group: 'Team B', key: 'Jan', value: 30 },
        { group: 'Team B', key: 'Feb', value: 60 },
      ],
      stackedOpts: {
        axes: {
          left: { mapsTo: 'value', stacked: true },
          bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        },
        height: '260px',
      },
      lineData: [
        { group: 'North', key: 'Jan', value: 120 },
        { group: 'North', key: 'Feb', value: 135 },
        { group: 'South', key: 'Jan', value: 80 },
        { group: 'South', key: 'Feb', value: 95 },
      ],
      lineOpts: {
        axes: {
          bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
          left: { mapsTo: 'value', scaleType: ScaleTypes.LINEAR },
        },
        curve: 'curveMonotoneX',
        legend: { enabled: true },
        height: '260px',
      },
      areaData: [
        { group: 'Server A', key: '00:00', value: 65 },
        { group: 'Server A', key: '12:00', value: 90 },
        { group: 'Server B', key: '00:00', value: 55 },
        { group: 'Server B', key: '12:00', value: 75 },
      ],
      areaOpts: {
        axes: {
          bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
          left: { mapsTo: 'value', includeZero: true },
        },
        height: '260px',
      },
      pieData: [
        { group: 'Chrome', value: 46 },
        { group: 'Firefox', value: 21 },
        { group: 'Safari', value: 18 },
        { group: 'Edge', value: 9 },
      ],
      pieOpts: {
        legend: { enabled: true, position: 'right' },
        height: '260px',
      },
      donutData: [
        { group: 'Used', value: 70 },
        { group: 'Free', value: 30 },
      ],
      donutOpts: {
        donut: { center: { label: '70% Used' } },
        legend: { enabled: true },
        height: '260px',
      },
    },
  }),
};

// =========================
// STACKED AREA
// =========================
export const StackedAreaChart: Story = {
  args: {
    type: 'stackedArea',
    data: [
      { group: 'Compute', key: 'Jan', value: 42 },
      { group: 'Compute', key: 'Feb', value: 48 },
      { group: 'Compute', key: 'Mar', value: 55 },
      { group: 'Compute', key: 'Apr', value: 61 },
      { group: 'Storage', key: 'Jan', value: 20 },
      { group: 'Storage', key: 'Feb', value: 24 },
      { group: 'Storage', key: 'Mar', value: 27 },
      { group: 'Storage', key: 'Apr', value: 33 },
      { group: 'Network', key: 'Jan', value: 8 },
      { group: 'Network', key: 'Feb', value: 10 },
      { group: 'Network', key: 'Mar', value: 12 },
      { group: 'Network', key: 'Apr', value: 13 },
    ],
    options: {
      title: 'Monthly usage by service (stacked)',
      axes: {
        bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: { mapsTo: 'value', stacked: true, includeZero: true },
      },
      legend: { enabled: true, position: 'bottom' },
      height: '350px',
    },
  },
};

// =========================
// COMBO (BAR + LINE)
// =========================
export const ComboChart: Story = {
  name: 'Combo: revenue vs capacity',
  args: {
    type: 'combo',
    data: [
      { group: 'Revenue', key: 'Jan', value: 40 },
      { group: 'Revenue', key: 'Feb', value: 55 },
      { group: 'Revenue', key: 'Mar', value: 62 },
      { group: 'Revenue', key: 'Apr', value: 78 },
      { group: 'Capacity', key: 'Jan', value: 70 },
      { group: 'Capacity', key: 'Feb', value: 75 },
      { group: 'Capacity', key: 'Mar', value: 80 },
      { group: 'Capacity', key: 'Apr', value: 85 },
    ],
    // Without `comboChartTypes`, the first series is drawn as bars and the rest as lines.
    options: {
      title: 'Revenue (bars) vs capacity (line)',
      axes: {
        bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: { mapsTo: 'value', includeZero: true },
      },
      legend: { enabled: true, position: 'bottom' },
      height: '350px',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Choose which series are bars and which are lines with `ngccComboChartTypes({ bars: ["Revenue"], lines: ["Capacity"] })` in `options.comboChartTypes`.',
      },
    },
  },
};

// =========================
// THRESHOLDS AND GOALS
// =========================
export const ThresholdsAndGoals: Story = {
  args: {
    type: 'line',
    data: [
      { group: 'CPU', key: 'Mon', value: 52 },
      { group: 'CPU', key: 'Tue', value: 61 },
      { group: 'CPU', key: 'Wed', value: 74 },
      { group: 'CPU', key: 'Thu', value: 88 },
      { group: 'CPU', key: 'Fri', value: 93 },
    ],
    thresholds: [
      { value: 90, label: 'Capacity limit (90%)', kind: 'limit' },
      { value: 70, label: 'Target (70%)', kind: 'goal' },
    ],
    options: {
      title: 'CPU utilization vs limits',
      axes: {
        bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: { mapsTo: 'value', includeZero: true },
      },
      legend: { enabled: false },
      height: '350px',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A `limit` is red and a `goal` is green; set `color` to override. Works on bar, area, stacked and combo charts too.',
      },
    },
  },
};

export const BarWithCapacityLimit: Story = {
  args: {
    type: 'bar',
    data: [
      { group: 'Zone A', value: 62 },
      { group: 'Zone B', value: 91 },
      { group: 'Zone C', value: 48 },
    ],
    thresholds: [{ value: 85, label: 'Capacity', kind: 'limit' }],
    options: {
      title: 'Rack utilization',
      axes: {
        left: { mapsTo: 'value', includeZero: true },
        bottom: { mapsTo: 'group', scaleType: ScaleTypes.LABELS },
      },
      legend: { enabled: false },
      height: '320px',
    },
  },
};

// =========================
// HORIZONTAL BAR / RANKED LIST
// =========================
export const RankedHorizontalBar: Story = {
  name: 'Horizontal bar: top 5 customers',
  args: {
    type: 'horizontalBar',
    sort: 'desc',
    limit: 5,
    data: [
      { group: 'Acme Corp', value: 12400 },
      { group: 'Globex', value: 34100 },
      { group: 'Initech', value: 9000 },
      { group: 'Umbrella', value: 21000 },
      { group: 'Hooli', value: 27800 },
      { group: 'Stark Industries', value: 15300 },
      { group: 'Wayne Enterprises', value: 6100 },
    ],
    options: {
      title: 'Top customers by spend',
      axes: { bottom: { title: 'Monthly spend ($)' } },
      height: '340px',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Data is `{ group, value }`. `sort="desc"` with `limit` gives a ranked top-N; the chart redraws as the data changes.',
      },
    },
  },
};

// =========================
// HEAT MAP
// =========================
const HEAT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HEAT_ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
const HEAT_DATA = HEAT_ZONES.flatMap((y, zi) =>
  HEAT_DAYS.map((x, di) => ({
    x,
    y,
    value: Math.round(35 + ((zi * 17 + di * 23 + zi * di * 7) % 60)),
  })),
);

export const HeatMap: Story = {
  name: 'Heat map: utilization by zone and day',
  args: {
    type: 'heatmap',
    data: HEAT_DATA,
    options: {
      title: 'Utilization (%) by zone and day',
      heatmap: { colorLegend: { title: 'Utilization %' } },
      height: '340px',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Data is `{ x, y, value }`: x along the bottom, y up the side, `value` as the color. Values are also in the tooltip, so color is never the only carrier of meaning.',
      },
    },
  },
};

// =========================
// LOADING / EMPTY
// =========================
export const LoadingState: Story = {
  args: { type: 'combo', loading: true, data: [], options: { height: '300px' } },
  parameters: {
    docs: {
      description: {
        story:
          'The same skeleton for every chart type and for `ngcc-chart-state`, which you can also use in your own chart panels.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    type: 'heatmap',
    loading: false,
    data: [],
    noDataMessage: 'No utilization data for this period',
    options: { height: '300px' },
  },
};
