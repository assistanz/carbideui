import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccLink } from './ngcc-link';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { ICONS, NgccIconNameType } from '../ngcc-icons/icons';

const meta: Meta<NgccLink> = {
  title: 'Components/Link',
  component: NgccLink,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccLink, NgccIcon],
    }),
  ],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    target: {
      control: { type: 'select' },
      options: ['_self', '_blank', '_parent', '_top'],
    },
    ariaCurrent: {
      control: { type: 'select' },
      options: ['page', 'step', 'location', 'date', 'time', 'true', 'false'],
    },
    iconName: {
      control: { type: 'select' },
      options: Object.keys(ICONS) as NgccIconNameType[],
    },
    ariaLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    inline: { control: 'boolean' },
    visited: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<NgccLink>;

export const Default: Story = {
  args: {
    href: '/docs',
    size: 'md',
    disabled: false,
    visited: false,
    inline: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <ngcc-link
        [href]="href"
        [size]="size"
        [disabled]="disabled"
        [visited]="visited"
        [inline]="inline"
        [iconName]="iconName"
        [target]="target"
        [ariaLabel]="ariaLabel"
        [ariaCurrent]="ariaCurrent"
      >Carbon Link</ngcc-link>
    `,
  }),
};

export const Inline: Story = {
  args: {
    href: '/policy',
    inline: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <p style="font-size: 14px;">
        Read our
        <ngcc-link [href]="href" [inline]="true">privacy policy</ngcc-link>
        for more information.
      </p>
    `,
  }),
};

export const WithIcon: Story = {
  args: {
    href: '/launch',
    iconName: 'arrow_up',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <ngcc-link [href]="href" [iconName]="iconName" [size]="size">
        Launch App
      </ngcc-link>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    href: '/restricted',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ngcc-link [href]="href" [disabled]="disabled">
        Unavailable Link
      </ngcc-link>
    `,
  }),
};

export const ExternalLink: Story = {
  args: {
    href: 'https://carbondesignsystem.com',
    iconName: 'arrow_up',
  },
  render: (args) => ({
    props: args,
    template: `
      <ngcc-link [href]="href" [target]="'_blank'" [iconName]="iconName">
        Carbon Design System
      </ngcc-link>
    `,
  }),
};

export const Sizes: Story = {
  tags: ['!dev'],
  render: () => ({
    template: `
      <div style="display: flex; gap: 1.5rem; align-items: center;">
        <ngcc-link href="/sm" size="sm">Small Link</ngcc-link>
        <ngcc-link href="/md" size="md">Medium Link</ngcc-link>
        <ngcc-link href="/lg" size="lg">Large Link</ngcc-link>
      </div>
    `,
  }),
};
