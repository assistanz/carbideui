import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgccThemeService } from './ngcc-theme.service';
import { NgccThemeSwitcher } from './ngcc-theme-switcher';

const meta: Meta<NgccThemeSwitcher> = {
  title: 'Components/Theme Switcher',
  tags: ['autodocs'],
  component: NgccThemeSwitcher,
  decorators: [
    moduleMetadata({
      providers: [NgccThemeService],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### NgccThemeSwitcher

Three independent categories, applied as attributes on \`<html>\`. Any combination works.

| Category | Attribute | Options |
| --- | --- | --- |
| Color theme | \`data-carbon-theme\` | White, Gray 10, Gray 90, Gray 100 (the four Carbon themes) |
| Corner style | \`data-corner-style\` | Square (Carbon default), Rounded (controls 4px, containers 8px), Curved (pill buttons, inputs 24px, containers 16px) |
| Button label alignment | \`data-button-align\` | Left (Carbon default), Centered |

Components are never edited: global CSS in \`styles/_theme-corners.scss\` and
\`styles/_theme-button-align.scss\` reads these attributes and the \`--ngcc-radius-*\` tokens.

#### Usage

\`\`\`html
<ngcc-theme-switcher />
<ngcc-theme-switcher [showCornerStyle]="false" [showButtonAlign]="false" />
\`\`\`

#### Programmatic

\`\`\`ts
const theme = inject(NgccThemeService);
theme.setTheme('g100');
theme.setCornerStyle('rounded');
theme.setButtonAlign('centered');
\`\`\`

Choices persist and sync across tabs. The old names \`'rounded'\`, \`'curved'\` and \`'centered'\`
passed to \`setTheme()\` (or found in storage) are migrated to the matching corner style / alignment.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<NgccThemeSwitcher>;

export const Default: Story = {
  name: 'Default',
};

/**
 * Plain Carbon markup on purpose: the overrides are global, so this shows exactly what
 * every component inherits without any component knowing about the theme.
 */
export const WithLivePreview: Story = {
  name: 'With live preview',
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:minmax(18rem,24rem) 1fr;gap:2rem;align-items:start">
        <ngcc-theme-switcher />
        <div style="display:flex;flex-direction:column;gap:1rem;max-width:32rem">
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="cds--btn cds--btn--primary" type="button">Primary</button>
            <button class="cds--btn cds--btn--secondary" type="button">Secondary</button>
            <button class="cds--btn cds--btn--tertiary" type="button">Tertiary</button>
            <button class="cds--btn cds--btn--ghost" type="button">Ghost</button>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="cds--btn cds--btn--primary cds--btn--sm" type="button" style="inline-size:12rem">Small, fixed width</button>
            <button class="cds--btn cds--btn--primary cds--btn--lg" type="button" style="inline-size:12rem">Large, fixed width</button>
          </div>
          <input class="cds--text-input" type="text" placeholder="Text input" aria-label="Text input" />
          <div class="cds--tile">Tile / card container</div>
        </div>
      </div>
    `,
  }),
};
