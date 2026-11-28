import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccSectionNav } from './ngcc-section-nav';

const meta: Meta<NgccSectionNav> = {
  title: 'Components/Section Nav',
  component: NgccSectionNav,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccSectionNav] })],
};
export default meta;
type Story = StoryObj<NgccSectionNav>;

export const Default: Story = {
  render: () => ({
    props: {
      sections: [
        { id: 'sn-basics', label: 'Basics' },
        { id: 'sn-network', label: 'Network', status: 'error' },
        { id: 'sn-storage', label: 'Storage', status: 'warning' },
        { id: 'sn-review', label: 'Review', status: 'complete' },
      ],
    },
    template: `
      <div style="display:grid;grid-template-columns:14rem 1fr;gap:2rem;height:24rem;overflow:auto">
        <ngcc-section-nav [sections]="sections" />
        <div>
          <section id="sn-basics" style="min-height:18rem"><h2>Basics</h2></section>
          <section id="sn-network" style="min-height:18rem"><h2>Network</h2></section>
          <section id="sn-storage" style="min-height:18rem"><h2>Storage</h2></section>
          <section id="sn-review" style="min-height:18rem"><h2>Review</h2></section>
        </div>
      </div>`,
  }),
};
