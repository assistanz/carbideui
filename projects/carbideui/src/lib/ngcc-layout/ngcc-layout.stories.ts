import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccGridSpanDirective, NgccPageGrid } from './ngcc-page-grid';
import { NgccPanelGrid } from './ngcc-panel-grid';
import { NgccTile } from '../ngcc-tile/ngcc-tile';
import { NgccStatTile } from '../ngcc-stat-tile/ngcc-stat-tile';

const meta: Meta = {
  title: 'Components/Layout',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccPageGrid, NgccGridSpanDirective, NgccPanelGrid, NgccTile, NgccStatTile],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Two layout helpers for dashboards and module pages.

**\`ngcc-page-grid\`**: a 4 / 8 / 12 column grid on Carbon's breakpoints. Give children \`ngccGridSpan\` with \`[sm] [md] [lg]\` (and optionally \`[start]\`); children without it fill the row.

**\`ngcc-panel-grid\`**: wrapping panels that are the same height within a row. \`[columns]\` is the most per row, \`min\` the narrowest a panel may get, \`gap\` is \`condensed | default | wide\`.

\`\`\`html
<ngcc-page-grid>
  <ngcc-tile ngccGridSpan [sm]="4" [md]="8" [lg]="8">Chart</ngcc-tile>
  <ngcc-tile ngccGridSpan [sm]="4" [md]="8" [lg]="4">Activity</ngcc-tile>
</ngcc-page-grid>

<ngcc-panel-grid [columns]="3" min="16rem">
  <ngcc-stat-tile label="Users" value="1,284" />
  <ngcc-tile>…</ngcc-tile>
</ngcc-panel-grid>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    gap: { control: 'radio', options: ['condensed', 'default', 'wide'] },
    columns: { control: { type: 'number', min: 1, max: 6 } },
    min: { control: 'text' },
  },
  args: { gap: 'default', columns: 3, min: '14rem' },
};
export default meta;
type Story = StoryObj;

export const PageGrid: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngcc-page-grid [gap]="gap">
        <ngcc-stat-tile ngccGridSpan [sm]="4" [md]="4" [lg]="3" label="Revenue" value="$48k" />
        <ngcc-stat-tile ngccGridSpan [sm]="4" [md]="4" [lg]="3" label="Users" value="1,284" />
        <ngcc-stat-tile ngccGridSpan [sm]="4" [md]="4" [lg]="3" label="Tickets" value="37" />
        <ngcc-stat-tile ngccGridSpan [sm]="4" [md]="4" [lg]="3" label="Uptime" value="99.9%" />
        <ngcc-tile ngccGridSpan [sm]="4" [md]="8" [lg]="8">Main chart (8 of 12)</ngcc-tile>
        <ngcc-tile ngccGridSpan [sm]="4" [md]="8" [lg]="4">Activity (4 of 12)</ngcc-tile>
        <ngcc-tile>Full-width footer panel</ngcc-tile>
      </ngcc-page-grid>`,
  }),
};

export const PanelGridEqualHeights: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngcc-panel-grid [columns]="columns" [min]="min" [gap]="gap">
        <ngcc-tile>Short panel</ngcc-tile>
        <ngcc-tile>
          A much taller panel with several lines of content, so the other panels in this row
          stretch to the same height instead of ending early.
          <p>Second paragraph.</p><p>Third paragraph.</p>
        </ngcc-tile>
        <ngcc-stat-tile label="Open tickets" value="37" />
        <ngcc-tile>Another short panel</ngcc-tile>
        <ngcc-tile>And one more</ngcc-tile>
      </ngcc-panel-grid>`,
  }),
};
