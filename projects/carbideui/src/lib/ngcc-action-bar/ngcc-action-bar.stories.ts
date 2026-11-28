import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccActionBar } from './ngcc-action-bar';

const meta: Meta<NgccActionBar> = {
  title: 'Components/Action Bar',
  component: NgccActionBar,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccActionBar] })],
};
export default meta;
type Story = StoryObj<NgccActionBar>;

/** Sticks to the bottom of the scrolling box; the content above it is never covered. */
export const Default: Story = {
  render: () => ({
    template: `
      <div style="height:20rem;overflow:auto;border:1px solid var(--cds-border-subtle)">
        <div style="height:40rem;padding:1rem">Long form content…</div>
        <ngcc-action-bar>
          <span ngccActionBarStatus>3 fields need attention</span>
          <button type="button" class="cds--btn cds--btn--secondary">Cancel</button>
          <button type="button" class="cds--btn cds--btn--primary">Save</button>
        </ngcc-action-bar>
      </div>`,
  }),
};
