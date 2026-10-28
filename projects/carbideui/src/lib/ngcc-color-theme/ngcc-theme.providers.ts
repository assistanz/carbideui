import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import {
  NGCC_THEME_CONFIG,
  NGCC_THEME_DEFAULTS,
  NgccThemeConfig,
} from '../ngcc-theme-switcher/ngcc-theme.types';
import { NgccThemeService } from '../ngcc-theme-switcher/ngcc-theme.service';
import { NGCC_COLOR_THEME_OPTIONS, NgccColorThemeOptions } from './ngcc-color-theme.presets';
import { NgccColorThemeService } from './ngcc-color-theme.service';

/**
 * Configure theming app-wide, in `app.config.ts`:
 * `providers: [provideNgccTheme({ defaultTheme: 'g10', defaultCornerStyle: 'rounded' })]`
 *
 * The theme is applied at app start-up. You don't need a switcher on the page, nothing has to
 * inject the service first.
 */
export function provideNgccTheme(config: Partial<NgccThemeConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGCC_THEME_CONFIG, useValue: { ...NGCC_THEME_DEFAULTS, ...config } },
    provideAppInitializer(() => {
      inject(NgccThemeService);
    }),
  ]);
}

/**
 * Choose the app's color theme, in `app.config.ts`:
 * `providers: [provideNgccColorTheme({ defaultPreset: 'ocean' })]`
 *
 * Applied at app start-up. A user's saved customization still wins, and "Reset to Defaults"
 * returns to this preset.
 */
export function provideNgccColorTheme(options: NgccColorThemeOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGCC_COLOR_THEME_OPTIONS, useValue: options },
    provideAppInitializer(() => {
      inject(NgccColorThemeService);
    }),
  ]);
}
