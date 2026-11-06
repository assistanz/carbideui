import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  isDevMode,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';

import { NgccFieldLabel } from '../shared/ngcc-field-label';

let nextId = 0;
let warnedNesting = false;

/** Components that draw their own label, helper and error: wrapping them doubles the label. */
const SELF_LABELLED =
  'ngcc-input, ngcc-input-number, ngcc-text-area, ngcc-dropdown, ngcc-multi-select, ngcc-radio-tile-group, ngcc-date-picker';

const CONTROL_SELECTOR =
  'input:not([type=hidden]), select, textarea, button[role=combobox], [role=combobox]';

/**
 * Layout and accessibility wrapper for one form control: label above, optional marker, helper text,
 * error text and an optional tooltip.
 *
 * ```html
 * <ngcc-form-field label="Hostname" [optional]="true" helperText="Letters and digits" [error]="error()">
 *   <input class="cds--text-input" formControlName="host" />
 * </ngcc-form-field>
 * ```
 *
 * The first control inside (input, select, textarea or combobox) is linked automatically: the label's
 * `for`, `aria-describedby` (helper or error, merged with ids you already set), `aria-invalid` and
 * `aria-required`. Use it with native controls, or with controls that do not draw their own label.
 * Do not wrap `ngcc-input`, `ngcc-dropdown` and the other ngcc form components: they have their own
 * `label`, `helperText`, `optional` and `tooltip` inputs (a dev-mode warning flags the double label).
 * Required fields get an asterisk; optional ones get "(optional)" (`optionalLabel` translates it), which
 * is the recommended convention: mark the exception, not the rule.
 */
@Component({
  selector: 'ngcc-form-field',
  standalone: true,
  imports: [NgccFieldLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  styleUrl: './ngcc-form-field.scss',
  template: `
    <ngcc-field-label
      [labelId]="labelId"
      [forId]="controlId"
      [required]="required()"
      [optional]="optional()"
      [optionalLabel]="optionalLabel()"
      [tooltip]="tooltip()"
      >{{ label() }}</ngcc-field-label
    >
    <div class="ngcc-field__control"><ng-content /></div>
    @if (error()) {
      <div class="cds--form-requirement ngcc-field__message" [id]="messageId" role="alert">
        {{ error() }}
      </div>
    } @else if (helperText()) {
      <div class="cds--form__helper-text ngcc-field__message" [id]="messageId">
        {{ helperText() }}
      </div>
    }
  `,
})
export class NgccFormField {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = nextId++;

  readonly label = input.required<string>();
  /** Show the required asterisk (and set `aria-required` on the control). */
  readonly required = input(false);
  /** Show "(optional)" next to the label. Ignored when `required`. */
  readonly optional = input(false);
  readonly optionalLabel = input('optional');
  readonly helperText = input('');
  /** Error message. When set it replaces the helper text and marks the control invalid. */
  readonly error = input('');
  /** Short explanation shown from an info button next to the label. */
  readonly tooltip = input('');

  protected readonly labelId = `ngcc-field-${this.uid}-label`;
  protected readonly messageId = `ngcc-field-${this.uid}-message`;
  protected controlId: string | null = null;

  constructor() {
    afterNextRender(() => this.link());
    effect(() => {
      // Re-link whenever what the control points at changes.
      this.error();
      this.helperText();
      this.required();
      this.link();
    });
  }

  private control(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>(CONTROL_SELECTOR);
  }

  private link(): void {
    if (isDevMode() && !warnedNesting && this.host.nativeElement.querySelector(SELF_LABELLED)) {
      warnedNesting = true;
      console.warn(
        '[ngcc-form-field] It wraps a component that already has its own label, helper text and error ' +
          '(ngcc-input, ngcc-dropdown, ...), so the field would get two labels. Use its own `label`, ' +
          '`optional` and `tooltip` inputs instead; ngcc-form-field is for native and third-party controls.',
      );
    }
    const control = this.control();
    if (!control) return;
    if (!control.id) control.id = `ngcc-field-${this.uid}-control`;
    if (this.controlId !== control.id) {
      this.controlId = control.id;
      this.host.nativeElement.querySelector('label')?.setAttribute('for', control.id);
    }

    const message = this.error() || this.helperText() ? this.messageId : null;
    const others = (control.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id && id !== this.messageId);
    const describedBy = [...others, ...(message ? [message] : [])].join(' ');
    if (describedBy) control.setAttribute('aria-describedby', describedBy);
    else control.removeAttribute('aria-describedby');

    if (this.error()) control.setAttribute('aria-invalid', 'true');
    else if (control.getAttribute('aria-invalid') === 'true')
      control.removeAttribute('aria-invalid');

    if (this.required()) control.setAttribute('aria-required', 'true');
  }
}
