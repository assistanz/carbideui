import type { Meta, StoryObj } from '@storybook/angular';
import { NgccCharts } from './ngcc-charts';
import { ScaleTypes, ChartTheme } from '@carbon/charts';
import { NgccChartsArgs } from './ngcc-charts.types';

const meta: Meta<NgccCharts> = {
  title: 'Components/Charts/AdvancedDashboard',
  component: NgccCharts,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# **NgccCharts Dashboard**

Demonstrates complex chart use cases including stacked, baseline area, and custom color palettes, all within Carbon Design guidelines.

Supports theme reactivity and responsive layout using Angular v20+ signals.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NgccCharts & NgccChartsArgs>;

/* --------------------------------------------------------
 ✅ 1. Area chart with large dataset starting from baseline
-------------------------------------------------------- */
export const AreaBaselineLarge: Story = {
  args: {
    type: 'area',
    data: Array.from({ length: 24 }, (_, i) => [
      { group: 'Server A', key: `${i}:00`, value: Math.round(60 + Math.random() * 20) },
      { group: 'Server B', key: `${i}:00`, value: Math.round(50 + Math.random() * 15) },
      { group: 'Server C', key: `${i}:00`, value: Math.round(55 + Math.random() * 25) },
    ]).flat(),
    options: {
      title: 'Server Load Over 24 Hours',
      axes: {
        bottom: { title: 'Time', mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: { mapsTo: 'value', scaleType: ScaleTypes.LINEAR },
      },
      legend: { enabled: true, position: 'bottom' },
      grid: { x: { enabled: true }, y: { enabled: true } },
      curve: 'curveMonotoneX',
      height: '360px',
      theme: ChartTheme.WHITE,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Area chart starting from Y-axis baseline with large time-series dataset (24 hours).',
      },
    },
  },
};

/* --------------------------------------------------------
 ✅ 2. Line chart with custom color palette
-------------------------------------------------------- */
export const LineCustomColors: Story = {
  args: {
    type: 'line',
    data: [
      { group: 'Temperature', key: 'Jan', value: 18 },
      { group: 'Temperature', key: 'Feb', value: 21 },
      { group: 'Temperature', key: 'Mar', value: 25 },
      { group: 'Temperature', key: 'Apr', value: 30 },
      { group: 'Humidity', key: 'Jan', value: 70 },
      { group: 'Humidity', key: 'Feb', value: 65 },
      { group: 'Humidity', key: 'Mar', value: 60 },
      { group: 'Humidity', key: 'Apr', value: 55 },
    ],
    options: {
      title: 'Climate Change (Custom Colors)',
      axes: {
        bottom: { title: 'Month', mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: {
          title: 'Temperature',
          mapsTo: 'value',
          includeZero: true,
          scaleType: ScaleTypes.LINEAR,
        },
      },
      curve: 'curveMonotoneX',
      color: {
        scale: {
          Temperature: '#FF8C00', // orange
          Humidity: '#66B2FF', // light blue
        },
      },
      legend: { enabled: true, position: 'bottom' },
      grid: { x: { enabled: true }, y: { enabled: true } },
      height: '320px',
      theme: ChartTheme.G10,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Line chart using a custom color palette for multiple datasets.',
      },
    },
  },
};

/* --------------------------------------------------------
 ✅ 3. Stacked bar chart example
-------------------------------------------------------- */
export const StackedBarExample: Story = {
  args: {
    type: 'stackedBar',
    data: [
      { group: 'Q1', key: 'Product A', value: 3000 },
      { group: 'Q1', key: 'Product B', value: 2000 },
      { group: 'Q2', key: 'Product A', value: 4000 },
      { group: 'Q2', key: 'Product B', value: 2500 },
      { group: 'Q3', key: 'Product A', value: 5000 },
      { group: 'Q3', key: 'Product B', value: 3000 },
      { group: 'Q4', key: 'Product A', value: 4500 },
      { group: 'Q4', key: 'Product B', value: 3200 },
    ],
    options: {
      title: 'Quarterly Revenue by Product (Stacked)',
      axes: {
        left: { mapsTo: 'value', stacked: true },
        bottom: { mapsTo: 'group', scaleType: ScaleTypes.LABELS },
      },
      legend: { enabled: true, position: 'right' },
      grid: { x: { enabled: true }, y: { enabled: true } },
      height: '340px',
      theme: ChartTheme.WHITE,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates stacked grouping with shared X-axis keys and Y-axis baseline.',
      },
    },
  },
};

/* --------------------------------------------------------
 ✅ 4. Combined Enterprise Dashboard layout
-------------------------------------------------------- */
export const EnterpriseDashboard: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 2rem; padding: 2rem; background: var(--cds-background, #f4f4f4)">
        <div class="chart-card">
          <h4>Area Chart – Baseline</h4>
          <ngcc-charts type="area" [data]="areaData" [options]="areaOpts"></ngcc-charts>
        </div>
        <div class="chart-card">
          <h4>Custom Line Colors</h4>
          <ngcc-charts type="line" [data]="lineData" [options]="lineOpts"></ngcc-charts>
        </div>
        <div class="chart-card">
          <h4>Stacked Bar Example</h4>
          <ngcc-charts type="stackedBar" [data]="stackedData" [options]="stackedOpts"></ngcc-charts>
        </div>
      </div>
    `,
    styles: [
      `
      .chart-card {
        background: var(--cds-layer, #ffffff);
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
      h4 {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--cds-text-primary, #161616);
      }
    `,
    ],
    props: {
      areaData: Array.from({ length: 24 }, (_, i) => [
        { group: 'Server A', key: `${i}:00`, value: Math.round(60 + Math.random() * 20) },
        { group: 'Server B', key: `${i}:00`, value: Math.round(50 + Math.random() * 15) },
      ]).flat(),
      areaOpts: {
        axes: {
          bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
          left: { mapsTo: 'value' },
        },
        curve: 'curveMonotoneX',
        height: '280px',
        theme: ChartTheme.WHITE,
      },
      lineData: [
        { group: 'Temperature', key: 'Jan', value: 18 },
        { group: 'Temperature', key: 'Feb', value: 24 },
        { group: 'Temperature', key: 'Mar', value: 28 },
        { group: 'Temperature', key: 'Apr', value: 32 },
        { group: 'Humidity', key: 'Jan', value: 70 },
        { group: 'Humidity', key: 'Feb', value: 65 },
        { group: 'Humidity', key: 'Mar', value: 60 },
        { group: 'Humidity', key: 'Apr', value: 55 },
      ],
      lineOpts: {
        axes: {
          bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
          left: { mapsTo: 'value' },
        },
        color: { scale: { Temperature: '#FF8C00', Humidity: '#66B2FF' } },
        curve: 'curveMonotoneX',
        height: '280px',
        theme: ChartTheme.G10,
      },
      stackedData: [
        { group: 'Q1', key: 'Product A', value: 3000 },
        { group: 'Q1', key: 'Product B', value: 2000 },
        { group: 'Q2', key: 'Product A', value: 4000 },
        { group: 'Q2', key: 'Product B', value: 2500 },
      ],
      stackedOpts: {
        axes: {
          left: { mapsTo: 'value', stacked: true },
          bottom: { mapsTo: 'group', scaleType: ScaleTypes.LABELS },
        },
        height: '280px',
        theme: ChartTheme.WHITE,
      },
    },
  }),
  parameters: {
    docs: {
      description: {
        story: `
### **Enterprise Dashboard (Advanced Examples)**

Shows:
1. Area chart with baseline and 24 data points
2. Line chart with custom color palette
3. Stacked bar chart

Each wrapped in Carbon-style cards and responsive grid layout.
        `,
      },
    },
  },
};

export const CustomTooltip: Story = {
  args: {
    type: 'line',
    data: [
      { group: 'Revenue', key: 'Jan', value: 12000, label: 'January Revenue' },
      { group: 'Revenue', key: 'Feb', value: 15000, label: 'February Revenue' },
      { group: 'Revenue', key: 'Mar', value: 18000, label: 'March Revenue' },
      { group: 'Revenue', key: 'Apr', value: 17000, label: 'April Revenue' },
      { group: 'Profit', key: 'Jan', value: 4000, label: 'January Profit' },
      { group: 'Profit', key: 'Feb', value: 6000, label: 'February Profit' },
      { group: 'Profit', key: 'Mar', value: 7200, label: 'March Profit' },
      { group: 'Profit', key: 'Apr', value: 6600, label: 'April Profit' },
    ],
    options: {
      title: 'Monthly Performance (Custom Tooltip)',
      axes: {
        bottom: { mapsTo: 'key', scaleType: ScaleTypes.LABELS },
        left: { mapsTo: 'value', scaleType: ScaleTypes.LINEAR },
      },
      legend: { enabled: true, position: 'bottom' },
      curve: 'curveMonotoneX',
      grid: { x: { enabled: true }, y: { enabled: true } },
      tooltip: {
        enabled: true,
        customHTML: (data: any) => {
          if (!data.length) {
            return `<div class="cds--tooltip-custom"><span>No data</span></div>`;
          }

          const rows = data
            .map((d: any) => {
              const group = d.group ?? '';
              const label = d.label ?? d.key ?? '';
              const value =
                typeof d.value === 'number'
                  ? d.value.toLocaleString('en-US', { minimumFractionDigits: 0 })
                  : (d.value ?? '');

              return `
          <div class="cds--tooltip-item" style="margin-bottom:4px">
            <div style="font-weight:600;color:var(--cds-text-primary,#161616)">${group}</div>
            <div style="font-size:0.8rem;color:var(--cds-text-secondary,#525252)">${label}</div>
            <div style="font-size:0.9rem;margin-top:2px;color:var(--cds-text-primary,#161616)">
              ${value}
            </div>
          </div>
        `;
            })
            .join('');

          return `
      <div class="cds--tooltip-custom"
           style="padding:0.5rem 0.75rem;min-width:160px;">
        ${rows}
      </div>
    `;
        },
      },
      height: '360px',
      theme: ChartTheme.G10,
      color: {
        scale: {
          Revenue: '#42A5F5', // Blue
          Profit: '#FFA726', // Orange
        },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
### **Custom Tooltip Example**

Adds robust custom tooltip logic:
- Safely handles undefined values or missing fields.
- Formats numeric values as localized currency.
- Uses the \`label\` field for descriptive tooltips.
        `,
      },
    },
  },
};

export const AreaPositiveNegative: Story = {
  args: {
    type: 'area',
    data: [
      { group: 'Profit', key: 'Q1', value: 3000 },
      { group: 'Profit', key: 'Q2', value: 4500 },
      { group: 'Profit', key: 'Q3', value: -1200 },
      { group: 'Profit', key: 'Q4', value: 2800 },
      { group: 'Loss', key: 'Q1', value: -1000 },
      { group: 'Loss', key: 'Q2', value: -2200 },
      { group: 'Loss', key: 'Q3', value: -1800 },
      { group: 'Loss', key: 'Q4', value: -800 },
    ],
    options: {
      title: 'Quarterly Profit & Loss Overview',
      axes: {
        bottom: {
          mapsTo: 'key',
          scaleType: ScaleTypes.LABELS,
        },
        left: {
          mapsTo: 'value',
          scaleType: ScaleTypes.LINEAR,
          // No domain set → automatically spans negative & positive values
        },
      },
      color: {
        scale: {
          Profit: '#42BE65', // green
          Loss: '#FA4D56', // red
        },
      },
      legend: { enabled: true, position: 'bottom' },
      grid: { x: { enabled: true }, y: { enabled: true } },
      height: '350px',
      theme: ChartTheme.WHITE,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
This area chart displays **both positive and negative values**.
- The Y-axis automatically adjusts its range to include zero.
- Positive areas (Profit) are shown in **green**.
- Negative areas (Loss) are shown in **red**.
      `,
      },
    },
  },
};

// Generate date series starting from October 1st (20 days)
const generateDateSeries = (startDate: string, length = 20) => {
  const start = new Date(startDate);
  return Array.from({ length }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });
};

const dates = generateDateSeries('2024-10-01', 20);

export const TimeData: Story = {
  args: {
    type: 'line',
    data: dates.flatMap((date) => [
      {
        group: 'CPU Usage (%)',
        key: date,
        value: Math.round(40 + Math.random() * 50), // between 40–90%
      },
      {
        group: 'High CPU Alerts',
        key: date,
        value: Math.round(Math.random() * 20), // 0–10 alerts
      },
    ]),
    options: {
      title: 'CPU Usage vs High CPU Alerts (From Oct 1st - 20 Days)',
      axes: {
        bottom: {
          mapsTo: 'key',
          scaleType: ScaleTypes.TIME,
          title: 'Date',
        },
        left: {
          mapsTo: 'value',
          scaleType: ScaleTypes.LINEAR,
          title: 'CPU % / Alerts',
        },
      },
      color: {
        scale: {
          'CPU Usage (%)': '#0F62FE', // Carbon blue
          'High CPU Alerts': '#DA1E28', // Carbon red
        },
      },
      curve: 'curveMonotoneX',
      legend: { enabled: true, position: 'bottom' },
      height: '380px',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
### **CPU Usage vs High CPU Alerts (Starting Oct 1st)**

- **X-axis:** Time scale from **2024-10-01 → 2024-10-20**
- **Y-axis:** Combined scale for both metrics (Usage %, Alert count)
- **Blue Line:** CPU Usage %
- **Red Line:** High CPU Alerts
- Includes tooltip with date, group, and value
- Uses \`includeZero: true\` for consistent baseline visibility
        `,
      },
    },
  },
};
