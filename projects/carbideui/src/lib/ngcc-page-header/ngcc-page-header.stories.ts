import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccPageHeader } from './ngcc-page-header';
import { NgccButton } from '../ngcc-button/ngcc-button';
import { NgccTag } from '../ngcc-tag/ngcc-tag';

const meta: Meta<NgccPageHeader> = {
  title: 'Components/Page Header',
  component: NgccPageHeader,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccPageHeader, NgccButton, NgccTag] })],
  parameters: {
    docs: {
      description: {
        component: `
Title, breadcrumbs, description and actions for every module page. It renders the page's one \`<h1>\`.

Slots: \`[ngccPageActions]\` (buttons), \`[ngccPageMeta]\` (status, last updated), \`[ngccPageTabs]\` (set \`[hasTabs]="true"\`).

\`\`\`html
<ngcc-page-header title="Invoices" description="All invoices" [breadcrumbs]="crumbs">
  <ngcc-button ngccPageActions label="Create invoice" />
</ngcc-page-header>
\`\`\`
        `,
      },
    },
  },
  args: {
    title: 'Invoices',
    description: 'Review, send and track every invoice for your clients.',
    breadcrumbs: [
      { label: 'Home', href: '#' },
      { label: 'Billing', href: '#' },
      { label: 'Invoices' },
    ],
    loading: false,
    hasTabs: false,
  },
  argTypes: { breadcrumbs: { control: 'object' } },
};
export default meta;
type Story = StoryObj<NgccPageHeader>;

export const Default: Story = {};

export const WithActionsAndStatus: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngcc-page-header [title]="title" [description]="description" [breadcrumbs]="breadcrumbs">
        <ngcc-tag ngccPageMeta type="green" [dot]="true">Active</ngcc-tag>
        <ngcc-button ngccPageActions variant="secondary" label="Export" />
        <ngcc-button ngccPageActions label="Create invoice" />
      </ngcc-page-header>`,
  }),
};

export const Loading: Story = { args: { loading: true } };

export const TitleOnly: Story = { args: { description: '', breadcrumbs: [] } };
