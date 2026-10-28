import { applicationConfig, type Decorator, type Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../projects/carbideui/documentation.json';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initNgccTheme } from '../projects/carbideui/src/lib/ngcc-theme-switcher/ngcc-theme-init';

setCompodocJson(docJson);
initNgccTheme('white');
const THEME_STORAGE_KEY = 'ngcc-theme';

/**
 * Three independent toolbar categories. addon-themes registers every decorator under one
 * global key, so stacking withThemeByDataAttribute() would leave only the last menu; custom
 * globalTypes give each category its own menu.
 *
 * Attributes are set directly for instant feedback, and the same values are written to the
 * key NgccThemeService persists to, so a story that injects the service starts from the
 * toolbar's choice instead of resetting it.
 */
const withAppearance: Decorator = (story, context) => {
  // Stories that expose their own theme controls set `parameters.managesAppearance` so the
  // toolbar doesn't overwrite what their controls just applied.
  if (context.parameters['managesAppearance']) return story();
  const { theme = 'white', cornerStyle = 'square', buttonAlign = 'left' } = context.globals;
  const root = document.documentElement;
  root.setAttribute('data-carbon-theme', theme);
  root.setAttribute('data-corner-style', cornerStyle);
  root.setAttribute('data-button-align', buttonAlign);
  try {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ version: 2, theme, followSystem: false, cornerStyle, buttonAlign }),
    );
  } catch {
    /* storage unavailable (private mode): attributes above still apply */
  }
  return story();
};

const preview: Preview = {
  initialGlobals: {
    theme: 'white',
    cornerStyle: 'square',
    buttonAlign: 'left',
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Color theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'white', title: 'White' },
          { value: 'g10', title: 'Gray 10' },
          { value: 'g90', title: 'Gray 90' },
          { value: 'g100', title: 'Gray 100' },
        ],
      },
    },
    cornerStyle: {
      description: 'Corner style',
      toolbar: {
        title: 'Corner style',
        icon: 'component',
        dynamicTitle: true,
        items: [
          { value: 'square', title: 'Square' },
          { value: 'rounded', title: 'Rounded' },
          { value: 'curved', title: 'Curved' },
        ],
      },
    },
    buttonAlign: {
      description: 'Button label alignment',
      toolbar: {
        title: 'Button alignment',
        icon: 'sidebar',
        dynamicTitle: true,
        items: [
          { value: 'left', title: 'Left' },
          { value: 'centered', title: 'Centered' },
        ],
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withAppearance,
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(), // zoneless mode
        provideRouter([]), // required by routerLink / ActivatedRoute in components
      ],
    }),
  ],
};

export default preview;
