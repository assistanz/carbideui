import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgccColorThemeSwitcher } from './ngcc-color-theme-switcher';
import { NgccColorThemeService } from './ngcc-color-theme.service';

const meta: Meta<NgccColorThemeSwitcher> = {
  title: 'Components/Color Theme Switcher',
  component: NgccColorThemeSwitcher,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      providers: [NgccColorThemeService],
    }),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### 🎨 NgccColorThemeSwitcher

The **NgccColorThemeSwitcher** lets you interactively customize your Carbon color palette:
- Select *primary* and *secondary* base colors
- Toggle between base Carbon themes (\`g10\`, \`g90\`, \`g100\`)
- Preview color shades in real-time

#### 🔧 How It Works
- The component uses the **ColorThemeService** with Angular **signals** for reactive theme updates.
- Color changes instantly apply via CSS variable overrides on \`document.documentElement\`.
- Persist your chosen palette by saving the theme configuration in your application settings.

#### 🎨 Sections
The picker is organized into sections, each listing the colors you can change **and the CSS tokens each one drives** (click a token to copy it). Use the search box to find a color or token, e.g. \`info\` or \`--cds-support-error\`.

| Section | Colors |
| --- | --- |
| Brand | brand color, derives buttons, interactive states, charts |
| Surfaces | background, layer 01, layer 02 |
| Text & icons | text, secondary text |
| Borders | subtle border, strong border |
| Status colors | error, warning, success, **info** |
| Links & focus | link, focus ring |
| Accessibility | WCAG target, auto-adjust, live report |
| Result & export | effective palette, applied tokens, copy CSS / settings |

Quick starts: **Carbon**, **Ocean**, **Royal** and **Ember** color themes.

Changes apply live to the **active base theme** (White, G10, G90, G100) and are kept per theme. Status, link
and focus colors are contrast-adjusted for the WCAG target, so the applied value can differ slightly from the
one you pick. Values are stored with the brand color, included in *Copy CSS* / settings export, and cleared
by *Reset to Defaults*.

\`\`\`ts
colorTheme.setThemeColor('g10', 'background', '#eef2f7');
colorTheme.setThemeColor('g10', 'support-info', '#0072c3'); // status, link and focus work the same way
colorTheme.resetThemeColors('g10');                         // whole theme
colorTheme.resetThemeColors('g10', 'background');           // one color
\`\`\`

#### 🧱 Usage
\`\`\`html
<ngcc-color-theme-switcher></ngcc-color-theme-switcher>
\`\`\`

#### 💡 Tip
You can combine this with **CarbonThemeService** for full theme & color control across your enterprise app.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<NgccColorThemeSwitcher>;

export const Default: Story = {
  name: 'Interactive Demo',
  render: () => ({
    template: `
      <div style="max-width: 800px; margin: 2rem auto; font-family: var(--cds-body-compact-01);">
        <ngcc-color-theme-switcher></ngcc-color-theme-switcher>
      </div>
    `,
  }),
};
