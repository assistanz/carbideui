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
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NgControl } from '@angular/forms';
import { NgccTextAreaSize } from './ngcc-text-area.types';

@Component({
  selector: 'ngcc-text-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ngcc-text-area.html',
  styleUrls: ['./../ngcc-input.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class NgccTextAreaComponent implements ControlValueAccessor, OnChanges {
  // @Input properties
  @Input() label: string | undefined = undefined;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() size: NgccTextAreaSize = 'md';
  @Input() helperText: string | undefined = undefined;
  @Input() ariaLabel: string | undefined = undefined;
  @Input() fluid = false;
  @Input() skeleton = false;
  @Input() rows = 4;
  @Input() maxLength: number | undefined = undefined;
  @Input() minLength: number | undefined = undefined;

  // Validation override
  @Input() invalid: boolean | undefined = undefined;
  @Input() errorMessage: string | undefined = undefined;

  // Two-way binding for value
  @Input() set value(val: string) {
    this._value.set(val);
  }
  get value(): string {
    return this._value();
  }
  @Output() valueChange = new EventEmitter<string>();

  // Internal state
  private readonly _value = signal<string>('');
  private readonly _label = signal<string | undefined>(undefined);
  private readonly _placeholder = signal<string>('');
  private readonly _disabled = signal<boolean>(false);
  private readonly _readonly = signal<boolean>(false);
  private readonly _required = signal<boolean>(false);
  private readonly _size = signal<NgccTextAreaSize>('md');
  private readonly _helperText = signal<string | undefined>(undefined);
  private readonly _ariaLabel = signal<string | undefined>(undefined);
  private readonly _fluid = signal<boolean>(false);
  private readonly _skeleton = signal<boolean>(false);
  private readonly _rows = signal<number>(4);
  private readonly _maxLength = signal<number | undefined>(undefined);
  private readonly _minLength = signal<number | undefined>(undefined);
  private readonly _invalid = signal<boolean | undefined>(undefined);
  private readonly _errorMessage = signal<string | undefined>(undefined);

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
    if (changes['rows']) this._rows.set(changes['rows'].currentValue ?? 4);
    if (changes['maxLength']) this._maxLength.set(changes['maxLength'].currentValue);
    if (changes['minLength']) this._minLength.set(changes['minLength'].currentValue);
    if (changes['invalid']) this._invalid.set(changes['invalid'].currentValue);
    if (changes['errorMessage']) this._errorMessage.set(changes['errorMessage'].currentValue);
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
  getSize(): NgccTextAreaSize {
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
  getRows(): number {
    return this._rows();
  }
  getMaxLength(): number | undefined {
    return this._maxLength();
  }
  getMinLength(): number | undefined {
    return this._minLength();
  }
  getInvalid(): boolean | undefined {
    return this._invalid();
  }
  getErrorMessage(): string | undefined {
    return this._errorMessage();
  }

  // Internal
  private static idCounter = 0;
  readonly inputId = `ngcc-text-area-${NgccTextAreaComponent.idCounter++}`;
  private controlErrors = signal<Record<string, unknown> | null>(null);
  private controlInvalid = signal(false);
  private controlTouched = signal(false);
  private controlDirty = signal(false);
  private localTouched = signal(false);

  constructor(@Optional() @Self() public ngcontrol: NgControl) {
    if (ngcontrol) {
      ngcontrol.valueAccessor = this;
      const control = ngcontrol.control;
      if (control) {
        this.syncControlState(control);

        control.statusChanges?.subscribe(() => this.syncControlState(control));
        control.valueChanges?.subscribe(() => this.syncControlState(control));

        effect(() => {
          this.controlErrors.set(control.errors);
          this.controlInvalid.set(!!control.invalid);
        });
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

    const val = this.value ?? '';
    const control = this.ngcontrol?.control;
    const interacted = this.controlTouched() || this.controlDirty() || this.localTouched();

    // Local required validation should show when interacted and empty (no control or even with control)
    if (this.getRequired() && interacted && val.trim() === '') {
      return true;
    }
    const min = this.getMinLength();
    const max = this.getMaxLength();
    // If not using reactive forms, evaluate local length constraints once interacted
    if (interacted) {
      if (min && val.length < min) return true;
      if (max && val.length > max) return true;
    }
    // If reactive form exists, show invalid if it has any errors
    if (control && interacted) {
      return this.controlInvalid() && !!this.controlErrors();
    }

    return false;
  });

  readonly error_msg = computed(() => {
    if (!this.invalid_value()) return '';
    if (this.getErrorMessage()) return this.getErrorMessage();

    const val = this.value ?? '';
    const errors = this.controlErrors() ?? {};
    const control = this.ngcontrol?.control;

    // ✅ Reactive form errors (authoritative)
    if (control && errors) {
      if (errors['required']) return 'This field is required';
      if (errors['minlength'])
        return `Minimum length is ${(errors['minlength'] as Record<string, unknown>)['requiredLength']} characters`;
      if (errors['maxlength'])
        return `Maximum length is ${(errors['maxlength'] as Record<string, unknown>)['requiredLength']} characters`;
      if (errors['pattern']) return 'Invalid format';
    }
    const min = this.getMinLength();
    const max = this.getMaxLength();
    // ✅ Local fallback
    if (this.getRequired() && val.trim() === '') return 'This field is required';
    if (min && val.length < min) return `Minimum length is ${min} characters`;
    if (max && val.length > max) return `Maximum length is ${this.getMaxLength()} characters`;

    return 'Invalid value';
  });

  readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.getHelperText() && !this.invalid_value()) ids.push(`${this.inputId}-helper`);
    if (this.invalid_value()) ids.push(`${this.inputId}-error`);
    return ids.join(' ') || null;
  });

  readonly computedAriaLabel = computed(() => {
    return this.getAriaLabel() ?? this.getLabel() ?? 'textarea-label';
  });

  readonly hostClasses = computed(() => {
    const classes = [
      'cds--form-item',
      `cds--text-area--${this.getSize()}`,
      `cds--layout--size-${this.getSize()}`,
    ];
    if (this.getFluid()) classes.push('cds--text-area--fluid');
    if (this.getReadonly()) classes.push('cds--text-area--readonly');
    return classes.join(' ');
  });

  // --- Events ---
  private onChangeFn: (val: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  onInput(event: Event): void {
    if (this.getReadonly() || this.getDisabled()) return;
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.valueChange.emit(val);
    this.onChangeFn(val);
    this.onTouchedFn();

    const control = this.ngcontrol?.control;
    control?.markAsDirty();
    this.controlDirty.set(true);
    control?.updateValueAndValidity({ emitEvent: true });
  }

  onBlur(): void {
    this.onTouchedFn();
    this.localTouched.set(true);
    const control = this.ngcontrol?.control;
    control?.markAsTouched();
    this.controlTouched.set(true);
    control?.updateValueAndValidity({ emitEvent: true });
  }

  // --- CVA ---
  writeValue(val: string): void {
    this.value = val ?? '';
  }
  registerOnChange(fn: (val: string) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
