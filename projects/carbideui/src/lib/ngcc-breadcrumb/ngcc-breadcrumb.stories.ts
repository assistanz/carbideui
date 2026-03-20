import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { NgccBreadcrumbComponent } from './ngcc-breadcrumb';
import { NgccBreadcrumbItemComponent } from './ngcc-breadcrumb-item';

const meta: Meta<NgccBreadcrumbComponent> = {
  title: 'Components/Breadcrumb',
  component: NgccBreadcrumbComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
    moduleMetadata({
      imports: [NgccBreadcrumbComponent, NgccBreadcrumbItemComponent],
    }),
  ],
  argTypes: {
    items: { control: 'object' },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    noTrailingSlash: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    skeletonCount: { control: 'number' },
    ariaLabel: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<NgccBreadcrumbComponent>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details' },
    ],
  },
};

export const NoTrailingSlash: Story = {
  args: {
    noTrailingSlash: true,
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details' },
    ],
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Restricted', href: '/restricted', disabled: true },
      { label: 'Details' },
    ],
  },
};

export const WithExternalLinks: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', target: '_blank' },
      { label: 'Products', href: '/products', target: '_blank' },
      { label: 'Details' },
    ],
  },
};

export const Skeleton: Story = {
  args: {
    skeleton: true,
    skeletonCount: 3,
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Home' }],
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details' },
    ],
  },
};

export const SmallSkeleton: Story = {
  args: {
    size: 'sm',
    skeleton: true,
    skeletonCount: 3,
  },
};

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Medium (default)</p>
          <ngcc-breadcrumb size="md" [items]="items" />
        </div>
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Small</p>
          <ngcc-breadcrumb size="sm" [items]="items" />
        </div>
      </div>
    `,
  }),
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details' },
    ],
  },
};
