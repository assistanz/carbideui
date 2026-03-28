import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccRadio } from './ngcc-radio';
import {
  NGCC_RADIO_GROUP_TOKEN,
  NgccRadioChange,
  NgccRadioGroupContext,
  NgccRadioLabelPlacement,
  NgccRadioOrientation,
} from './ngcc-radio.types';

let radioGroupIdCounter = 0;

/**
 * Container for `<ngcc-radio>` components. Implements `ControlValueAccessor`
 * for use with reactive forms and ngModel.
 *
 * ```html
 * <ngcc-radio-group [formControl]="ctrl" legend="Pick one">
 *   <ngcc-radio value="a">Option A</ngcc-radio>
 *   <ngcc-radio value="b">Option B</ngcc-radio>
 * </ngcc-radio-group>
 * ```
 */
@Component({
  selector: 'ngcc-radio-group',
  standalone: true,
  imports: [NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      // Exposes group context to child NgccRadio via token — avoids circular import.
      provide: NGCC_RADIO_GROUP_TOKEN,
      useExisting: forwardRef(() => NgccRadioGroup),
    },
  ],
  host: {
    class: 'cds--form-item',
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './ngcc-radio-group.html',
})
export class NgccRadioGroup<T = unknown> implements ControlValueAccessor, NgccRadioGroupContext {
  // Use constructor injection pattern to avoid NG0200 circular dep that occurs
  // when combining inject(NgControl) with an NG_VALUE_ACCESSOR provider.
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  // ── Signal inputs ─────────────────────────────────────────────────────────
  readonly name = input<string>(`ngcc-radio-group-${radioGroupIdCounter++}`);
  readonly disabled = input<boolean>(false);
  readonly skeleton = input<boolean>(false);
  readonly orientation = input<NgccRadioOrientation>('horizontal');
  readonly labelPlacement = input<NgccRadioLabelPlacement>('right');
  readonly legend = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledby = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  readonly invalid = input<boolean>(false);
  readonly invalidText = input<string | undefined>(undefined);
  readonly warn = input<boolean>(false);
  readonly warnText = input<string | undefined>(undefined);
  readonly readOnly = input<boolean>(false);

  // ── Output ────────────────────────────────────────────────────────────────
  readonly change = output<NgccRadioChange<T | null> & { source: NgccRadio<T> }>();

  // ── Internal mutable state ────────────────────────────────────────────────
  private readonly _value = signal<T | null>(null);
  private readonly _disabledByForm = signal<boolean>(false);

  // ── NgccRadioGroupContext — consumed by child NgccRadio via injection ──────
  readonly isDisabled = computed(() => this.disabled() || this._disabledByForm());

  // ── Computed fieldset classes ─────────────────────────────────────────────
  readonly fieldsetClasses = computed(() =>
    [
      'cds--radio-button-group',
      this.orientation() === 'vertical' ? 'cds--radio-button-group--vertical' : '',
      this.labelPlacement() === 'left' ? 'cds--radio-button-group--label-left' : '',
      this.invalid() ? 'cds--radio-button-group--invalid' : '',
      !this.invalid() && this.warn() ? 'cds--radio-button-group--warning' : '',
      this.readOnly() ? 'cds--radio-button-group--readonly' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // ── contentChildren signal — replaces @ContentChildren + QueryList ────────
  readonly radios = contentChildren<NgccRadio<T>>(forwardRef(() => NgccRadio));

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    // Re-bind change handlers whenever the set of radio buttons changes.
    // Effect automatically cleans up — no manual unsubscribe needed.
    effect(() => {
      this.bindRadioHandlers(this.radios());
    });

    // Sync checked state whenever radios or the current value changes.
    effect(() => {
      this.syncCheckedState(this.radios());
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private syncCheckedState(radios: readonly NgccRadio<T>[]): void {
    const current = this._value();
    radios.forEach((radio) => radio.checked.set(radio.value() === current));
  }

  private bindRadioHandlers(radios: readonly NgccRadio<T>[]): void {
    radios.forEach((radio) => {
      radio.registerRadioChangeHandler((event) => {
        if (this._value() === event.value) return;
        // Use this.radios() to deselect all other radios at handler time.
        this.radios().forEach((r) => {
          if (r !== event.source) r.checked.set(false);
        });
        this._value.set(event.value);
        this.propagateChange(event.value);
        this.onTouched();
        this.change.emit(event);
      });
    });
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────────

  writeValue(val: T | null): void {
    this._value.set(val);
    // If radios are already available sync immediately;
    // otherwise the syncCheckedState effect will handle it.
    const radios = this.radios();
    if (radios.length > 0) {
      this.syncCheckedState(radios);
    }
  }

  registerOnChange(fn: (val: T | null) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByForm.set(isDisabled);
  }

  // ── Focus handler (declared in host binding above) ────────────────────────
  onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement;
    // Only mark touched when focus leaves the entire group.
    if (!host.contains(event.relatedTarget as Node | null)) {
      this.onTouched();
    }
  }

  private propagateChange: (val: T | null) => void = () => {};
  private onTouched: () => void = () => {};
}
