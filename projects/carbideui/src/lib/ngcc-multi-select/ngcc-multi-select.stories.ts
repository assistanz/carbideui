import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccMultiSelect } from './ngcc-multi-select';
import { NgccMultiSelectOption } from './ngcc-multi-select.types';

const REGIONS: NgccMultiSelectOption[] = [
  { value: 'euw', label: 'Europe West', group: 'Europe', description: 'Ireland' },
  { value: 'eun', label: 'Europe North', group: 'Europe', description: 'Finland' },
  { value: 'use', label: 'US East', group: 'Americas' },
  { value: 'usw', label: 'US West', group: 'Americas' },
  { value: 'ap', label: 'Asia Pacific' },
  { value: 'old', label: 'Retired region', disabled: true },
];

const meta: Meta<NgccMultiSelect> = {
  title: 'Components/Multi Select',
  component: NgccMultiSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccMultiSelect] })],
  args: { label: 'Regions', helperText: 'Choose where the cluster runs', options: REGIONS },
  argTypes: { options: { control: 'object' } },
};
export default meta;
type Story = StoryObj<NgccMultiSelect>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, value: ['euw'] },
    template: `<div style="max-width:28rem"><ngcc-multi-select [label]="label" [helperText]="helperText" [options]="options" [(value)]="value" /></div>`,
  }),
};

export const SelectAll: Story = {
  render: (args) => ({
    props: { ...args, value: [] },
    template: `<div style="max-width:28rem"><ngcc-multi-select [label]="label" [options]="options" [(value)]="value" selectAll /></div>`,
  }),
};

/** With `creatable` and no options it is a tag input. */
export const TagInput: Story = {
  render: () => ({
    props: { value: ['prod', 'eu'] },
    template: `<div style="max-width:28rem"><ngcc-multi-select label="Tags" helperText="Type and press Enter" [options]="[]" [(value)]="value" creatable /></div>`,
  }),
};

export const CreatableWithOptions: Story = {
  render: (args) => ({
    props: { ...args, value: [] },
    template: `<div style="max-width:28rem"><ngcc-multi-select [label]="label" [options]="options" [(value)]="value" creatable /></div>`,
  }),
};

export const LoadingAndError: Story = {
  render: (args) => ({
    props: { ...args, value: [] },
    template: `<div style="display:grid;gap:2rem;max-width:28rem">
      <ngcc-multi-select label="Loading" [options]="[]" loading />
      <ngcc-multi-select label="Failed" [options]="[]" error="Could not load regions" />
    </div>`,
  }),
};

export const Invalid: Story = {
  render: (args) => ({
    props: { ...args, value: [] },
    template: `<div style="max-width:28rem"><ngcc-multi-select [label]="label" [options]="options" [(value)]="value" invalid errorMessage="Pick at least one region" required /></div>`,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: { ...args, value: ['use', 'ap'] },
    template: `<div style="max-width:28rem"><ngcc-multi-select [label]="label" [options]="options" [(value)]="value" disabled /></div>`,
  }),
};
