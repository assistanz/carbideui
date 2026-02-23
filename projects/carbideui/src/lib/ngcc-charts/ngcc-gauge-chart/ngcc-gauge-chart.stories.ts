import type { Meta, StoryObj } from '@storybook/angular';
import { NgccGaugeChart } from './ngcc-gauge-chart';
import { ChartTheme } from '@carbon/charts';

const meta: Meta<NgccGaugeChart> = {
  title: 'Components/Charts/NgccGaugeChart',
  component: NgccGaugeChart,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<NgccGaugeChart>;

export const SemiGauge: Story = {
  args: {
    data: [
      { group: 'value', value: 65 },
      { group: 'delta', value: -5 },
    ],
    options: {
      title: 'CPU Utilization',
      height: '260px',
      width: '300px',
      gauge: {
        type: 'semi',
        status: 'success',
        showPercentageSymbol: true,
      },
      theme: ChartTheme.WHITE,
    },
  },
};

export const FullGauge: Story = {
  args: {
    data: [
      { group: 'value', value: 82 },
      { group: 'delta', value: 3 },
    ],
    options: {
      title: 'Memory Usage',
      height: '260px',
      width: '300px',
      gauge: {
        type: 'full',
        status: 'warning',
      },
      theme: ChartTheme.WHITE,
    },
  },
};

export const DashboardGauges: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;padding:2rem">
        <div class="chart-card">
          <h4>CPU Utilization</h4>
          <ngcc-gauge-chart [data]="cpuData" [options]="cpuOpts"></ngcc-gauge-chart>
        </div>

        <div class="chart-card">
          <h4>Memory Usage</h4>
          <ngcc-gauge-chart [data]="memData" [options]="memOpts"></ngcc-gauge-chart>
        </div>

        <div class="chart-card">
          <h4>Disk Usage</h4>
          <ngcc-gauge-chart [data]="diskData" [options]="diskOpts"></ngcc-gauge-chart>
        </div>
      </div>
    `,
    props: {
      cpuData: [
        { group: 'value', value: 72 },
        { group: 'delta', value: 2 },
      ],
      memData: [
        { group: 'value', value: 85 },
        { group: 'delta', value: -3 },
      ],
      diskData: [
        { group: 'value', value: 57 },
        { group: 'delta', value: 4 },
      ],
      cpuOpts: {
        height: '240px',
        gauge: { type: 'semi', status: 'success' },
        theme: ChartTheme.WHITE,
      },
      memOpts: {
        height: '240px',
        gauge: { type: 'semi', status: 'warning' },
        theme: ChartTheme.WHITE,
      },
      diskOpts: {
        height: '240px',
        gauge: { type: 'semi', status: 'danger' },
        theme: ChartTheme.WHITE,
      },
    },
  }),
};
