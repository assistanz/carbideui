import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccSparkline } from './ngcc-sparkline';
import { NgccStatTile } from '../ngcc-stat-tile/ngcc-stat-tile';

const meta: Meta<NgccSparkline> = {
  title: 'Components/Sparkline',
  component: NgccSparkline,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccSparkline, NgccStatTile] })],
  parameters: {
    docs: {
      description: {
        component: `
A tiny trend graphic for KPI tiles and table rows. Pure SVG (no chart library), so dozens can share a dashboard.

- **Color** follows the theme: \`color\`, then \`status\`, then \`sentiment\` (rising revenue is good, rising cost is bad), then the interactive color.
- **Accessible**: a text summary is generated from the data ("Trend over 6 points: from 1 to 8, up (+700%)"). Override it with \`label\`, or set \`decorative\` when nearby text already says it.
- **States**: \`loading\` shows the library skeleton; fewer than two points (one for bars) shows a dashed baseline and "No trend data".

\`\`\`html
<ngcc-sparkline [data]="[12, 14, 13, 18, 21, 24]" type="area" sentiment="positive-up" />
<ngcc-stat-tile label="Revenue" value="$48k" [sparkline]="series" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    type: { control: 'radio', options: ['line', 'area', 'bar'] },
    status: { control: 'select', options: ['none', 'success', 'warning', 'error', 'info'] },
    sentiment: { control: 'radio', options: ['neutral', 'positive-up', 'positive-down'] },
    color: { control: 'color' },
    data: { control: 'object' },
    min: { control: 'number' },
    max: { control: 'number' },
  },
  args: {
    data: [12, 14, 13, 18, 17, 22, 21, 27],
    type: 'line',
    width: 160,
    height: 40,
    status: 'none',
    sentiment: 'neutral',
    showLastPoint: true,
    decorative: false,
    loading: false,
  },
};
export default meta;
type Story = StoryObj<NgccSparkline>;

export const Line: Story = {};

export const Area: Story = { args: { type: 'area' } };

export const Bars: Story = { args: { type: 'bar', data: [3, 5, 4, 8, 6, 9, 7, 12] } };

export const FixedScale: Story = {
  args: { data: [40, 55, 48, 70], min: 0, max: 100, type: 'area' },
  parameters: {
    docs: { description: { story: 'Pin the scale (here 0–100%) so tiles are comparable.' } },
  },
};

export const Sentiment: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))">
        <div>Revenue up (good) <br /><ngcc-sparkline [data]="[10,12,15,19,24]" type="area" sentiment="positive-up" /></div>
        <div>Cost up (bad) <br /><ngcc-sparkline [data]="[10,12,15,19,24]" type="area" sentiment="positive-down" /></div>
        <div>Cost down (good) <br /><ngcc-sparkline [data]="[24,19,15,12,10]" type="area" sentiment="positive-down" /></div>
        <div>Flat (neutral) <br /><ngcc-sparkline [data]="[5,5,5,5]" sentiment="positive-up" /></div>
      </div>`,
  }),
};

export const Statuses: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap">
        @for (s of ['success','warning','error','info']; track s) {
          <div>{{ s }}<br /><ngcc-sparkline [data]="[4,9,6,12,8,14]" [status]="s" type="bar" /></div>
        }
      </div>`,
  }),
};

export const Loading: Story = { args: { loading: true } };

export const NoData: Story = { args: { data: [4] } };

export const InKpiTiles: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))">
        <ngcc-stat-tile label="Monthly revenue" value="$48,200" delta="+12.4%" deltaCaption="vs last month"
          status="success" [sparkline]="[31,34,33,38,41,44,48]" />
        <ngcc-stat-tile label="Cloud spend" value="$9,830" delta="+8%" trendSentiment="positive-down"
          status="warning" [sparkline]="[7,7.4,8,8.2,9,9.4,9.8]" />
        <ngcc-stat-tile label="Open incidents" value="4" delta="-3" trendSentiment="positive-down"
          [sparkline]="[9,8,8,6,5,4]" sparklineType="bar" />
      </div>`,
  }),
};
