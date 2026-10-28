import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccPopover } from './ngcc-popover';
import { NgccStatTile } from '../ngcc-stat-tile/ngcc-stat-tile';

const meta: Meta<NgccPopover> = {
  title: 'Components/Popover',
  component: NgccPopover,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccPopover, NgccStatTile] })],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Non-modal popover for detail hovers on dashboard panels: no backdrop, the page stays usable. Mark your trigger with \`ngccPopoverTrigger\`.

- **click** (default): toggles from the trigger; Escape or a click outside closes it.
- **hover**: opens on hover and on keyboard focus, and stays open while the pointer or focus is inside.

\`\`\`html
<ngcc-popover label="Cluster details" placement="bottom-start">
  <button ngccPopoverTrigger class="cds--btn cds--btn--ghost">Details</button>
  <p>Region eu-west-1, 12 nodes</p>
</ngcc-popover>
\`\`\`
        `,
      },
    },
  },
  args: {
    placement: 'bottom',
    trigger: 'click',
    label: 'Cluster details',
    caret: true,
    open: false,
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ],
    },
    trigger: { control: 'radio', options: ['click', 'hover'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:6rem 10rem">
        <ngcc-popover [placement]="placement" [trigger]="trigger" [label]="label" [caret]="caret" [open]="open">
          <button ngccPopoverTrigger type="button" class="cds--btn cds--btn--tertiary">Cluster details</button>
          <strong>prod-eu-west-1</strong>
          <p>12 nodes · 3 zones · Kubernetes 1.30</p>
        </ngcc-popover>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<NgccPopover>;

export const Click: Story = {};

export const Hover: Story = { args: { trigger: 'hover' } };

export const Placements: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,auto);gap:3rem;padding:6rem 10rem">
        @for (p of ['top','right','bottom','left','bottom-start','bottom-end']; track p) {
          <ngcc-popover [placement]="p" trigger="hover" [label]="p">
            <button ngccPopoverTrigger type="button" class="cds--btn cds--btn--ghost">{{ p }}</button>
            <span>Placed {{ p }}</span>
          </ngcc-popover>
        }
      </div>`,
  }),
};
