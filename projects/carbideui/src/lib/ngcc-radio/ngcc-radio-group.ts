import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  QueryList,
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
export class NgccRadioGroup<T = unknown>
  implements ControlValueAccessor, NgccRadioGroupContext, AfterContentInit
{
  // Use constructor injection pattern to avoid NG0200 circular dep that occurs
  // when combining inject(NgControl) with an NG_VALUE_ACCESSOR provider.
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  // ── Public @Input properties.
  @Input() name = `ngcc-radio-group-${radioGroupIdCounter++}`;
  @Input() disabled = false;
  @Input() skeleton = false;
  @Input() orientation: NgccRadioOrientation = 'horizontal';
  @Input() labelPlacement: NgccRadioLabelPlacement = 'right';
  @Input() legend?: string;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledby?: string;
  @Input() helperText?: string;
  @Input() invalid = false;
  @Input() invalidText?: string;
  @Input() warn = false;
  @Input() warnText?: string;
  @Input() readOnly = false;

  // ── Output event
  @Output() change = new EventEmitter<NgccRadioChange<T | null> & { source: NgccRadio<T> }>();

  // ── Internal mutable state
  private readonly _value = signal<T | null>(null);
  private readonly _disabledByForm = signal<boolean>(false);

  // ── NgccRadioGroupContext properties that satisfy the interface.
  get isDisabled(): boolean {
    return this.disabled || this._disabledByForm();
  }

  // ── Computed fieldset classes
  fieldsetClasses(): string {
    return [
      'cds--radio-button-group',
      this.orientation === 'vertical' ? 'cds--radio-button-group--vertical' : '',
      this.labelPlacement === 'left' ? 'cds--radio-button-group--label-left' : '',
      this.invalid ? 'cds--radio-button-group--invalid' : '',
      !this.invalid && this.warn ? 'cds--radio-button-group--warning' : '',
      this.readOnly ? 'cds--radio-button-group--readonly' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  // ── content children (projected radios)
  @ContentChildren(forwardRef(() => NgccRadio)) radios!: QueryList<NgccRadio<T>>;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private syncCheckedState(radios: readonly NgccRadio<T>[]): void {
    const current = this._value();
    radios.forEach((radio) => radio.setChecked(radio.getValue() === current));
  }

  private bindRadioHandlers(radios: readonly NgccRadio<T>[]): void {
    radios.forEach((radio) => {
      radio.registerRadioChangeHandler((event) => {
        if (this._value() === event.value) return;
        // Deselect all other radios at handler time.
        this.radios.toArray().forEach((r) => {
          if (r !== event.source) r.setChecked(false);
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
    const radios = this.radios ? this.radios.toArray() : [];
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

  ngAfterContentInit(): void {
    // Initial binding
    this.bindRadioHandlers(this.radios.toArray());
    this.syncCheckedState(this.radios.toArray());

    // Re-bind when radios change
    this.radios.changes.subscribe(() => {
      this.bindRadioHandlers(this.radios.toArray());
      this.syncCheckedState(this.radios.toArray());
    });
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
