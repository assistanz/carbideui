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
- 6 chart types: **bar, stackedBar, line, area, pie, donut**

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
      options: ['bar', 'stackedBar', 'line', 'area', 'pie', 'donut'],
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
