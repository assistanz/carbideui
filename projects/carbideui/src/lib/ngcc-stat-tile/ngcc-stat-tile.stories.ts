import type { Meta, StoryObj } from '@storybook/angular';
import { NgccStatTile } from './ngcc-stat-tile';

const meta: Meta<NgccStatTile> = {
  title: 'Components/Stat Tile',
  component: NgccStatTile,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['none', 'success', 'warning', 'error', 'info'] },
    trend: { control: 'select', options: [undefined, 'up', 'down', 'flat'] },
    trendSentiment: { control: 'select', options: ['positive-up', 'positive-down', 'neutral'] },
  },
  args: {
    label: 'Monthly revenue',
    value: '$48,200',
    delta: '+12.4%',
    deltaCaption: 'vs last month',
    status: 'success',
  },
};
export default meta;
type Story = StoryObj<NgccStatTile>;

export const Default: Story = {};

export const CostGoingUp: Story = {
  args: {
    label: 'Cloud spend',
    value: '$9,830',
    delta: '+8%',
    trend: 'up',
    trendSentiment: 'positive-down',
    status: 'warning',
  },
};

export const WithUnit: Story = {
  args: {
    label: 'Uptime',
    value: 99.98,
    unit: '%',
    delta: 0,
    deltaCaption: 'no change',
    status: 'info',
  },
};

export const Grid: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem;">
        <ngcc-stat-tile label="Active users" value="1,284" [delta]="86" deltaCaption="this week" status="success" />
        <ngcc-stat-tile label="Open tickets" value="37" [delta]="-5" trendSentiment="positive-down" status="warning" />
        <ngcc-stat-tile label="Failed payments" value="4" [delta]="2" trendSentiment="positive-down" status="error" />
        <ngcc-stat-tile label="Regions" value="6" />
      </div>`,
  }),
};

export const WithSparkline: Story = {
  args: {
    label: 'Monthly revenue',
    value: '$48,200',
    delta: '+12.4%',
    deltaCaption: 'vs last month',
    status: 'success',
    sparkline: [31, 34, 33, 38, 41, 44, 48],
  },
};

export const SparklineGrid: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem;">
        <ngcc-stat-tile label="Active users" value="1,284" [delta]="86" deltaCaption="this week"
          [sparkline]="[900,940,1010,1100,1150,1200,1284]" />
        <ngcc-stat-tile label="Open tickets" value="37" [delta]="-5" trendSentiment="positive-down"
          [sparkline]="[52,49,47,44,41,39,37]" sparklineType="bar" />
        <ngcc-stat-tile label="Error rate" value="1.2%" [delta]="0.4" trendSentiment="positive-down"
          status="error" [sparkline]="[0.6,0.7,0.7,0.9,1,1.1,1.2]" sparklineType="line" />
      </div>`,
  }),
};
