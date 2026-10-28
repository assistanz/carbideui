import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccAvatar } from './ngcc-avatar';

const meta: Meta<NgccAvatar> = {
  title: 'Components/Avatar',
  component: NgccAvatar,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccAvatar] })],
  parameters: {
    docs: {
      description: {
        component: `
A photo when \`src\` loads, otherwise initials on a color that is stable for that name, otherwise a person icon. White initials meet AA contrast on every color in the palette.

The accessible name is \`name\`. Add \`decorative\` when the name is already printed beside it.

\`\`\`html
<ngcc-avatar name="Ada Lovelace" size="lg" />
<ngcc-avatar name="Ada Lovelace" src="/ada.jpg" [decorative]="true" /> Ada Lovelace
\`\`\`
        `,
      },
    },
  },
  args: { name: 'Ada Lovelace', src: '', size: 'md', shape: 'circle', decorative: false },
  argTypes: {
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'radio', options: ['circle', 'square'] },
  },
};
export default meta;
type Story = StoryObj<NgccAvatar>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:1rem;align-items:center">
        @for (s of ['xs','sm','md','lg','xl']; track s) { <ngcc-avatar name="Ada Lovelace" [size]="s" /> }
      </div>`,
  }),
};

export const ClientList: Story = {
  render: () => ({
    template: `
      <ul style="list-style:none;padding:0;display:grid;gap:.75rem">
        @for (n of ['Acme Corp','Globex','Initech','Umbrella','Hooli','Stark Industries']; track n) {
          <li style="display:flex;gap:.75rem;align-items:center">
            <ngcc-avatar [name]="n" shape="square" [decorative]="true" /> {{ n }}
          </li>
        }
      </ul>`,
  }),
};

export const NoNameFallback: Story = { args: { name: '' } };

export const BrokenPhoto: Story = {
  args: { src: 'https://example.invalid/missing.png' },
  parameters: {
    docs: { description: { story: 'A photo that fails to load falls back to initials.' } },
  },
};
