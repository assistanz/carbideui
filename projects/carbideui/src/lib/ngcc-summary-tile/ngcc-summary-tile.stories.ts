import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccSummaryTile } from './ngcc-summary-tile';
import { NgccTag } from '../ngcc-tag/ngcc-tag';

const meta: Meta<NgccSummaryTile> = {
  title: 'Components/Summary Tile',
  component: NgccSummaryTile,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccSummaryTile, NgccTag] })],
  args: {
    heading: 'Plan',
    columns: 1,
    items: [
      { label: 'Region', value: 'eu-west-1' },
      { label: 'Disk', value: '100 GB' },
      { label: 'Owner', value: null },
    ],
  },
  argTypes: { items: { control: 'object' }, columns: { control: 'number' } },
};
export default meta;
type Story = StoryObj<NgccSummaryTile>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:24rem">
        <ngcc-summary-tile [heading]="heading" [items]="items" [columns]="columns">
          <ngcc-tag ngccSummaryStatus type="green" size="sm">Valid</ngcc-tag>
        </ngcc-summary-tile>
      </div>`,
  }),
};

export const TwoColumns: Story = { ...Default, args: { columns: 2 } };
