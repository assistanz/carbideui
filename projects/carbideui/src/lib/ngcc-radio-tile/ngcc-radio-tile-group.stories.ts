import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccRadioTileGroup } from './ngcc-radio-tile-group';

const PLANS = [
  { value: 'starter', label: 'Starter', description: '1 vCPU, 2 GB RAM' },
  { value: 'pro', label: 'Pro', description: '4 vCPU, 16 GB RAM' },
  { value: 'ent', label: 'Enterprise', description: 'Dedicated hosts', disabled: true },
];

const meta: Meta<NgccRadioTileGroup> = {
  title: 'Components/Radio Tile Group',
  component: NgccRadioTileGroup,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccRadioTileGroup] })],
  args: { legend: 'Plan', helperText: 'You can change this later', options: PLANS },
  argTypes: { options: { control: 'object' }, columns: { control: 'number' } },
};
export default meta;
type Story = StoryObj<NgccRadioTileGroup>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, value: 'starter' },
    template: `<ngcc-radio-tile-group [legend]="legend" [helperText]="helperText" [options]="options" [(value)]="value" [columns]="columns" />`,
  }),
};

export const ThreeColumns: Story = { ...Default, args: { columns: 3 } };

export const RequiredAndEmpty: Story = {
  render: (args) => ({
    props: { ...args, value: null },
    template: `<ngcc-radio-tile-group [legend]="legend" [options]="options" [(value)]="value" required invalid errorMessage="Choose a plan" />`,
  }),
};
