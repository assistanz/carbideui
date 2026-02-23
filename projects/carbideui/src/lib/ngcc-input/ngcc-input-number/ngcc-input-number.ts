import {
  ChangeDetectionStrategy,
  Component,
  Optional,
  Self,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgccIcon } from '../../ngcc-icons/ngcc-icon';
import { NgccInputNumberSize } from './ngcc-input-number.types';

@Component({
  selector: 'ngcc-input-number',
  standalone: true,
  imports: [CommonModule, FormsModule, NgccIcon],
  templateUrl: './ngcc-input-number.html',
  styleUrls: ['./ngcc-input-number.scss', './../ngcc-input.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class NgccInputNumber implements ControlValueAccessor, OnChanges {
  // @Input properties
  @Input() label: string | undefined = undefined;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() size: NgccInputNumberSize = 'md';
  @Input() helperText: string | undefined = undefined;
  @Input() ariaLabel: string | undefined = undefined;
  @Input() fluid = false;
  @Input() skeleton = false;

  // Validation overrides
  @Input() invalid: boolean | undefined = undefined;
  @Input() errorMessage: string | undefined = undefined;

  // Number-specific props
  @Input() integerOnly = false;
  @Input() decimalOnly = false;
  @Input() decimalPadding = 2;

  // Currency-specific props
  @Input() currency = false;
  @Input() currencyCode: string | undefined = undefined;
  @Input() currencySymbol = '$';

  @Input() hideArrows = false;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number | undefined = undefined;

  // Two-way binding for value
  @Input() set value(val: string) {
    this._value.set(val);
  }
  get value(): string {
    return this._value();
  }
  @Output() valueChange = new EventEmitter<string>();

  // Public: formatted display value
  @Output() displayValueChange = new EventEmitter<string>();

  // Internal state
  private readonly _value = signal<string>('');
  private readonly _label = signal<string | undefined>(undefined);
  private readonly _placeholder = signal<string>('');
  private readonly _disabled = signal<boolean>(false);
  private readonly _readonly = signal<boolean>(false);
  private readonly _required = signal<boolean>(false);
  private readonly _size = signal<NgccInputNumberSize>('md');
  private readonly _helperText = signal<string | undefined>(undefined);
  private readonly _ariaLabel = signal<string | undefined>(undefined);
  private readonly _fluid = signal<boolean>(false);
  private readonly _skeleton = signal<boolean>(false);
  private readonly _invalid = signal<boolean | undefined>(undefined);
  private readonly _errorMessage = signal<string | undefined>(undefined);
  private readonly _integerOnly = signal<boolean>(false);
  private readonly _decimalOnly = signal<boolean>(false);
  private readonly _decimalPadding = signal<number>(2);
  private readonly _currency = signal<boolean>(false);
  private readonly _currencyCode = signal<string | undefined>(undefined);
  private readonly _currencySymbol = signal<string>('$');
  private readonly _hideArrows = signal<boolean>(false);
  private readonly _min = signal<number | null>(null);
  private readonly _max = signal<number | null>(null);
  private readonly _step = signal<number | undefined>(undefined);

  private localTouched = signal(false);

  // Signals to mirror control state
  private controlTouched = signal(false);
  private controlDirty = signal(false);
  private controlInvalid = signal(false);
  private controlErrors = signal<Record<string, unknown> | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['label']) this._label.set(changes['label'].currentValue);
    if (changes['placeholder']) this._placeholder.set(changes['placeholder'].currentValue ?? '');
    if (changes['disabled']) this._disabled.set(changes['disabled'].currentValue ?? false);
    if (changes['readonly']) this._readonly.set(changes['readonly'].currentValue ?? false);
    if (changes['required']) this._required.set(changes['required'].currentValue ?? false);
    if (changes['size']) this._size.set(changes['size'].currentValue ?? 'md');
    if (changes['helperText']) this._helperText.set(changes['helperText'].currentValue);
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue);
    if (changes['fluid']) this._fluid.set(changes['fluid'].currentValue ?? false);
    if (changes['skeleton']) this._skeleton.set(changes['skeleton'].currentValue ?? false);
    if (changes['invalid']) this._invalid.set(changes['invalid'].currentValue);
    if (changes['errorMessage']) this._errorMessage.set(changes['errorMessage'].currentValue);
    if (changes['integerOnly']) this._integerOnly.set(changes['integerOnly'].currentValue ?? false);
    if (changes['decimalOnly']) this._decimalOnly.set(changes['decimalOnly'].currentValue ?? false);
    if (changes['decimalPadding'])
      this._decimalPadding.set(changes['decimalPadding'].currentValue ?? 2);
    if (changes['currency']) this._currency.set(changes['currency'].currentValue ?? false);
    if (changes['currencyCode']) this._currencyCode.set(changes['currencyCode'].currentValue);
    if (changes['currencySymbol'])
      this._currencySymbol.set(changes['currencySymbol'].currentValue ?? '$');
    if (changes['hideArrows']) this._hideArrows.set(changes['hideArrows'].currentValue ?? false);
    if (changes['min']) this._min.set(changes['min'].currentValue ?? null);
    if (changes['max']) this._max.set(changes['max'].currentValue ?? null);
    if (changes['step']) this._step.set(changes['step'].currentValue);
  }

  // Template accessor methods
  getLabel(): string | undefined {
    return this._label();
  }
  getPlaceholder(): string {
    return this._placeholder();
  }
  getDisabled(): boolean {
    return this._disabled();
  }
  getReadonly(): boolean {
    return this._readonly();
  }
  getRequired(): boolean {
    return this._required();
  }
  getSize(): NgccInputNumberSize {
    return this._size();
  }
  getHelperText(): string | undefined {
    return this._helperText();
  }
  getAriaLabel(): string | undefined {
    return this._ariaLabel();
  }
  getFluid(): boolean {
    return this._fluid();
  }
  getSkeleton(): boolean {
    return this._skeleton();
  }
  getInvalid(): boolean | undefined {
    return this._invalid();
  }
  getErrorMessage(): string | undefined {
    return this._errorMessage();
  }
  getIntegerOnly(): boolean {
    return this._integerOnly();
  }
  getDecimalOnly(): boolean {
    return this._decimalOnly();
  }
  getDecimalPadding(): number {
    return this._decimalPadding();
  }
  getCurrency(): boolean {
    return this._currency();
  }
  getCurrencyCode(): string | undefined {
    return this._currencyCode();
  }
  getCurrencySymbol(): string {
    return this._currencySymbol();
  }
  getHideArrows(): boolean {
    return this._hideArrows();
  }
  getMin(): number | null {
    return this._min();
  }
  getMax(): number | null {
    return this._max();
  }
  getStep(): number | undefined {
    return this._step();
  }

  private static idCounter = 0;
  readonly inputId = `ngcc-input-number-${NgccInputNumber.idCounter++}`;

  constructor(@Optional() @Self() public ngcontrol: NgControl) {
    if (ngcontrol) {
      ngcontrol.valueAccessor = this;
      const control = ngcontrol.control;
      if (control) {
        control.statusChanges?.subscribe(() => this.syncControlState(control));
        control.valueChanges?.subscribe(() => this.syncControlState(control));
        this.syncControlState(control);
      }
    }
  }

  private syncControlState(control: {
    errors: Record<string, unknown> | null;
    invalid: boolean;
    touched: boolean;
    dirty: boolean;
  }): void {
    this.controlErrors.set(control.errors);
    this.controlInvalid.set(!!control.invalid);
    this.controlTouched.set(control.touched);
    this.controlDirty.set(control.dirty);
  }

  // --- Computed ---
  readonly invalid_value = computed(() => {
    if (this.getInvalid() !== undefined) return this.getInvalid();

    const val: string | null = this.value;

    if (this.getRequired() && (val === '' || val === null) && this.localTouched()) {
      return true;
    }

    const numVal = Number(this.sanitize(val));
    const min = this.getMin();
    const max = this.getMax();

    if (!isNaN(numVal) && this.localTouched()) {
      if (min !== null && numVal < min) return true;
      if (max !== null && numVal > max) return true;
    }

    const control = this.ngcontrol?.control;
    if (control) {
      const interacted = this.controlTouched() || this.controlDirty();
      return interacted && this.controlInvalid();
    }
    return false;
  });

  readonly error_msg = computed(() => {
    if (!this.invalid_value()) return '';
    if (this.getErrorMessage()) return this.getErrorMessage();

    const errors = this.controlErrors() ?? {};
    if (errors['required']) return 'This field is required';
    if (errors['min'])
      return `Minimum value is ${(errors['min'] as Record<string, unknown>)?.['min']}`;
    if (errors['max'])
      return `Maximum value is ${(errors['max'] as Record<string, unknown>)?.['max']}`;

    const val: string | null = this.value;
    if (this.getRequired() && (val === '' || val === null)) return 'This field is required';

    const numVal = Number(this.sanitize(val));
    const min = this.getMin();
    const max = this.getMax();
    if (!isNaN(numVal)) {
      if (min !== null && numVal < min) return `Minimum value is ${min}`;
      if (max !== null && numVal > max) return `Maximum value is ${max}`;
    }
    return 'Invalid number';
  });

  readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.getHelperText() && !this.invalid_value()) ids.push(`${this.inputId}-helper`);
    if (this.invalid_value()) ids.push(`${this.inputId}-error`);
    return ids.join(' ') || null;
  });

  protected readonly computedAriaLabel = computed(() => {
    return this.getAriaLabel() ?? this.getLabel() ?? 'number-input-label';
  });

  readonly hostClasses = computed(() => {
    const classes: string[] = [
      'cds--form-item',
      `cds--text-input--${this.getSize()}`,
      `cds--layout--size-${this.getSize()}`,
    ];
    if (this.getFluid()) classes.push('cds--text-input--fluid');
    if (this.getReadonly()) classes.push('cds--text-input--readonly');
    if (this.getHideArrows()) classes.push('ngcc--hide-arrows');
    return classes.join(' ');
  });

  // --- Sanitization ---
  private sanitize(val: string): string {
    const symbol = this.getCurrencySymbol() ?? '$';
    const symbolEscaped = symbol.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const currencyRegex = new RegExp(symbolEscaped, 'g');
    val = val.replace(currencyRegex, '').replace(/,/g, '').trim();

    if (this.getIntegerOnly()) return val.replace(/[^0-9]/g, '');
    if (this.getDecimalOnly() || this.getCurrency()) {
      val = val.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
      return val;
    }
    return val.replace(/[^0-9]/g, '');
  }

  // --- Events ---
  private onChangeFn: (val: number | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  private updateDisplay(val: string): void {
    this.displayValueChange.emit(val);
  }

  onInput(event: Event): void {
    if (this.getReadonly() || this.getDisabled()) return;
    const inputEl = event.target as HTMLInputElement;

    let raw = inputEl.value;
    if (this.getCurrency()) {
      const sym = this.getCurrencySymbol() ?? '$';
      const symEsc = sym.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      raw = raw.replace(new RegExp(symEsc, 'g'), '').replace(/,/g, '');
    }

    const val = this.sanitize(raw);
    if (val !== inputEl.value) inputEl.value = val;

    this.value = val;
    this.valueChange.emit(val);
    this.updateDisplay(val);

    const numVal = val !== '' ? Number(val) : null;
    this.onChangeFn(numVal);
    this.onTouchedFn();

    const control = this.ngcontrol?.control;
    control?.markAsDirty();
    this.controlDirty.set(true);
    control?.updateValueAndValidity();
  }

  onBlur(): void {
    this.onTouchedFn();
    this.localTouched.set(true);

    let val = this.value;
    if (!val) {
      this.onChangeFn(null);
      this.updateDisplay('');
      return;
    }

    // Numeric value first
    let numericVal: number | null = Number(this.sanitize(val));
    if (isNaN(numericVal)) numericVal = null;

    if (this.getIntegerOnly()) {
      val = this.sanitize(val);
      numericVal = Number(val);
    } else if (this.getDecimalOnly() && numericVal !== null) {
      val = numericVal.toFixed(this.getDecimalPadding());
    }

    if (this.getCurrency() && numericVal !== null) {
      val = this.formatCurrencyDisplay(numericVal);
    }

    // Update value
    this.value = val;
    this.valueChange.emit(val);
    this.updateDisplay(val);

    // Always propagate numeric value
    this.onChangeFn(numericVal);

    const control = this.ngcontrol?.control;
    control?.markAsTouched();
    this.controlTouched.set(true);
    control?.updateValueAndValidity();
  }

  // --- CVA ---
  writeValue(val: unknown): void {
    if (val === null || val === undefined || val === '') {
      this.value = '';
      this.updateDisplay('');
      return;
    }

    if (this.getCurrency() && typeof val === 'number' && !isNaN(val)) {
      const formatted = this.formatCurrencyDisplay(val);
      this.value = formatted;
      this.updateDisplay(formatted);
      return;
    }

    const strVal = String(val);
    this.value = strVal;
    this.updateDisplay(strVal);
  }

  registerOnChange(fn: (val: number | null) => void): void {
    this.onChangeFn = (val: number | null) => {
      if (val === null || val === undefined) fn(null);
      else fn(Number(val));
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private formatCurrencyDisplay(num: number): string {
    const pad = Math.max(0, this.getDecimalPadding() ?? 2);
    const currencyCode = this.getCurrencyCode();
    if (currencyCode) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: pad,
          maximumFractionDigits: pad,
        }).format(num);
      } catch {
        // fallback
      }
    }
    const formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: pad,
      maximumFractionDigits: pad,
    });
    return `${this.getCurrencySymbol() ?? '$'}${formatted}`;
  }
}
