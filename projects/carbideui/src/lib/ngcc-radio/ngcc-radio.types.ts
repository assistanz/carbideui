import { InjectionToken, Signal } from '@angular/core';

export type NgccRadioLabelPlacement = 'left' | 'right';
export type NgccRadioOrientation = 'horizontal' | 'vertical';

export interface NgccRadioChange<T = unknown> {
  value: T;
}

/**
 * Context provided by NgccRadioGroup and injected by NgccRadio
 * via NGCC_RADIO_GROUP_TOKEN to avoid circular imports.
 */
export interface NgccRadioGroupContext {
  readonly name: Signal<string>;
  readonly isDisabled: Signal<boolean>;
  readonly readOnly: Signal<boolean>;
  readonly labelPlacement: Signal<NgccRadioLabelPlacement>;
  readonly skeleton: Signal<boolean>;
}

export const NGCC_RADIO_GROUP_TOKEN = new InjectionToken<NgccRadioGroupContext>(
  'NGCC_RADIO_GROUP_TOKEN',
);
