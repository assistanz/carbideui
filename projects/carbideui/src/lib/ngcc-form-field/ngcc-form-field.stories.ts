import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccFormField } from './ngcc-form-field';

const meta: Meta<NgccFormField> = {
  title: 'Components/Form Field',
  component: NgccFormField,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccFormField] })],
};
export default meta;
type Story = StoryObj<NgccFormField>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngcc-form-field [label]="label" [optional]="optional" [required]="required"
        [helperText]="helperText" [error]="error" [tooltip]="tooltip">
        <input class="cds--text-input" placeholder="my-host" />
      </ngcc-form-field>`,
  }),
  args: {
    label: 'Hostname',
    optional: true,
    required: false,
    helperText: 'Letters, digits and dashes',
    error: '',
    tooltip: 'Used in the instance URL',
  },
};

export const WithError: Story = {
  ...Default,
  args: { ...Default.args, optional: false, required: true, error: 'Hostname is required' },
};
