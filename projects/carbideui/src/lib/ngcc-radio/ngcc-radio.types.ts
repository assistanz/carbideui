import { InjectionToken } from '@angular/core';

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
  readonly name: string;
  readonly isDisabled: boolean;
  readonly readOnly: boolean;
  readonly labelPlacement: NgccRadioLabelPlacement;
  readonly skeleton: boolean;
}

export const NGCC_RADIO_GROUP_TOKEN = new InjectionToken<NgccRadioGroupContext>(
  'NGCC_RADIO_GROUP_TOKEN',
);
