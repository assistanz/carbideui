import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccToggle } from './ngcc-toggle';

const meta: Meta<NgccToggle> = {
  title: 'Components/Toggle',
  component: NgccToggle,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccToggle],
    }),
  ],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
    },
    labelA: { control: 'text' },
    labelB: { control: 'text' },
    labelText: { control: 'text' },
    ariaLabel: { control: 'text' },
    className: { control: 'text' },
    toggled: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<NgccToggle>;

export const Default: Story = {
  args: {
    labelText: 'Enable feature',
    labelA: 'Off',
    labelB: 'On',
    toggled: false,
    disabled: false,
    readOnly: false,
    skeleton: false,
    hideLabel: false,
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <ngcc-toggle
        [labelText]="labelText"
        [labelA]="labelA"
        [labelB]="labelB"
        [toggled]="toggled"
        [disabled]="disabled"
        [readOnly]="readOnly"
        [skeleton]="skeleton"
        [hideLabel]="hideLabel"
        [size]="size"
        [ariaLabel]="ariaLabel"
        [className]="className"
      ></ngcc-toggle>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    labelText: 'Unavailable feature',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <ngcc-toggle [labelText]="labelText" [disabled]="true" [toggled]="false"></ngcc-toggle>
        <ngcc-toggle [labelText]="labelText" [disabled]="true" [toggled]="true"></ngcc-toggle>
      </div>
    `,
  }),
};

export const ReadOnly: Story = {
  args: {
    labelText: 'Read-only setting',
    readOnly: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <ngcc-toggle [labelText]="labelText" [readOnly]="true" [toggled]="false"></ngcc-toggle>
        <ngcc-toggle [labelText]="labelText" [readOnly]="true" [toggled]="true"></ngcc-toggle>
      </div>
    `,
  }),
};

export const HideLabel: Story = {
  tags: ['!dev'],
  args: {
    labelText: 'Hidden label toggle',
    hideLabel: true,
    ariaLabel: 'Hidden label toggle',
  },
  render: (args) => ({
    props: args,
    template: `
      <ngcc-toggle
        [labelText]="labelText"
        [hideLabel]="true"
        [ariaLabel]="ariaLabel"
      ></ngcc-toggle>
    `,
  }),
};

export const Skeleton: Story = {
  render: () => ({
    template: `<ngcc-toggle [skeleton]="true" labelText="Loading"></ngcc-toggle>`,
  }),
};

export const Sizes: Story = {
  tags: ['!dev'],
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <ngcc-toggle labelText="Default (md)" size="md" [toggled]="true"></ngcc-toggle>
        <ngcc-toggle labelText="Small (sm)" size="sm" [toggled]="true"></ngcc-toggle>
      </div>
    `,
  }),
};
