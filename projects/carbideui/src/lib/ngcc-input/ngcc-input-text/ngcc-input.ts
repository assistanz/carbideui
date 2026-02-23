import {
  ChangeDetectionStrategy,
  Component,
  Optional,
  Self,
  computed,
  signal,
  effect,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NgControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgccIcon } from '../../ngcc-icons/ngcc-icon';
import { NgccInputType, NgccInputSize } from './ngcc-input.types';

@Component({
  selector: 'ngcc-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NgccIcon],
  templateUrl: './ngcc-input.html',
  styleUrls: ['./../ngcc-input.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class NgccInput implements ControlValueAccessor, OnChanges {
  // Inputs
  @Input() label: string | undefined = undefined;
  @Input() placeholder = '';
  @Input() type: NgccInputType = 'text';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() size: NgccInputSize = 'md';
  @Input() helperText: string | undefined = undefined;
  @Input() ariaLabel: string | undefined = undefined;
  @Input() fluid = false;
  @Input() skeleton = false;
  @Input() invalid: boolean | undefined = undefined;
  @Input() errorMessage: string | undefined = undefined;
  @Input() value = '';

  // Outputs
  @Output() valueChange = new EventEmitter<string>();

  // Internal state signals
  private readonly _label = signal<string | undefined>(undefined);
  private readonly _placeholder = signal('');
  private readonly _type = signal<NgccInputType>('text');
  private readonly _disabled = signal(false);
  private readonly _readonly = signal(false);
  private readonly _required = signal(false);
  private readonly _size = signal<NgccInputSize>('md');
  private readonly _helperText = signal<string | undefined>(undefined);
  private readonly _ariaLabel = signal<string | undefined>(undefined);
  private readonly _fluid = signal(false);
  private readonly _skeleton = signal(false);
  private readonly _invalid = signal<boolean | undefined>(undefined);
  private readonly _errorMessage = signal<string | undefined>(undefined);
  private readonly _value = signal('');

  private readonly _disabledByForm = signal(false);
  readonly isDisabled = computed(() => this._disabled() || this._disabledByForm());

  // Internal state
  readonly showPassword = signal(false);
  private static idCounter = 0;
  readonly inputId = `ngcc-input-${NgccInput.idCounter++}`;

  // Validation tracking
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
        // Subscribe to form control updates
        control.statusChanges?.subscribe(() => this.syncControlState(control));
        control.valueChanges?.subscribe(() => this.syncControlState(control));
        this.syncControlState(control);

        // Ensure continuous sync (zoneless-safe)
        effect(() => {
          this.controlErrors.set(control.errors);
          this.controlInvalid.set(!!control.invalid);
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['label']) this._label.set(changes['label'].currentValue ?? undefined);
    if (changes['placeholder']) this._placeholder.set(changes['placeholder'].currentValue ?? '');
    if (changes['type']) this._type.set(changes['type'].currentValue ?? 'text');
    if (changes['disabled']) this._disabled.set(changes['disabled'].currentValue ?? false);
    if (changes['readonly']) this._readonly.set(changes['readonly'].currentValue ?? false);
    if (changes['required']) this._required.set(changes['required'].currentValue ?? false);
    if (changes['size']) this._size.set(changes['size'].currentValue ?? 'md');
    if (changes['helperText'])
      this._helperText.set(changes['helperText'].currentValue ?? undefined);
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? undefined);
    if (changes['fluid']) this._fluid.set(changes['fluid'].currentValue ?? false);
    if (changes['skeleton']) this._skeleton.set(changes['skeleton'].currentValue ?? false);
    if (changes['invalid']) this._invalid.set(changes['invalid'].currentValue ?? undefined);
    if (changes['errorMessage'])
      this._errorMessage.set(changes['errorMessage'].currentValue ?? undefined);
    if (changes['value']) this._value.set(changes['value'].currentValue ?? '');
  }

  private syncControlState(
    control:
      | {
          errors: Record<string, unknown> | null;
          invalid: boolean;
          touched: boolean;
          dirty: boolean;
        }
      | null
      | undefined,
  ): void {
    if (!control) {
      this.controlErrors.set(null);
      this.controlInvalid.set(false);
      this.controlTouched.set(false);
      this.controlDirty.set(false);
      return;
    }

    this.controlErrors.set(control.errors ?? null);
    this.controlInvalid.set(!!control.invalid);
    this.controlTouched.set(!!control.touched);
    this.controlDirty.set(!!control.dirty);
  }

  // --- Computed ---
  readonly effectiveType = computed(() => {
    return this._type() === 'password' && this.showPassword() ? 'text' : this._type();
  });

  readonly invalid_value = computed(() => {
    if (this._invalid() !== undefined) return this._invalid();

    const val = this._value() ?? '';
    const control = this.ngcontrol?.control;
    const interacted = this.localTouched() || this.controlTouched() || this.controlDirty();

    // Local required
    if (this._required() && interacted && val.trim() === '') return true;

    // Reactive form validation
    if (control && interacted) {
      const errors = this.controlErrors();
      return !!(errors && Object.keys(errors).length > 0);
    }

    return false;
  });

  readonly error_msg = computed(() => {
    if (!this.invalid_value()) return '';

    if (this._errorMessage()) return this._errorMessage();

    const errors = this.controlErrors() ?? {};
    const val: string | null = this._value();

    // safely access errors
    if (errors['required'] || (this._required() && (val === '' || val === null)))
      return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength'])
      return `Minimum length is ${(errors['minlength'] as Record<string, unknown>)?.['requiredLength']}`;
    if (errors['maxlength'])
      return `Maximum length is ${(errors['maxlength'] as Record<string, unknown>)?.['requiredLength']}`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['domain']) return errors['domain'];

    return 'Invalid value';
  });

  readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this._helperText() && !this.invalid_value()) ids.push(`${this.inputId}-helper`);
    if (this.invalid_value()) ids.push(`${this.inputId}-error`);
    return ids.join(' ') || null;
  });

  readonly computedAriaLabel = computed(() => {
    return this._ariaLabel() ?? this._label() ?? 'input-label';
  });

  readonly hostClasses = computed(() => {
    const classes: string[] = [
      'cds--form-item',
      `cds--text-input--${this._size()}`,
      `cds--layout--size-${this._size()}`,
    ];
    if (this._fluid()) classes.push('cds--text-input-wrapper', 'cds--text-input--fluid');
    if (this._readonly()) classes.push('cds--text-input-wrapper--readonly');
    return classes.join(' ');
  });

  // --- Events ---
  private onChangeFn: (val: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  onInput(event: Event): void {
    if (this._readonly() || this.isDisabled()) return;
    const val = (event.target as HTMLInputElement).value;
    this._value.set(val);
    this.valueChange.emit(val);
    this.onChangeFn(val);
    this.onTouchedFn();

    const control = this.ngcontrol?.control;
    control?.markAsDirty();
    this.controlDirty.set(true);
    control?.updateValueAndValidity({ emitEvent: true });
    this.syncControlState(control);
  }

  onBlur(): void {
    this.onTouchedFn();
    this.localTouched.set(true);
    const control = this.ngcontrol?.control;
    control?.markAsTouched();
    this.controlTouched.set(true);
    control?.updateValueAndValidity({ emitEvent: true });
    this.syncControlState(control);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  // --- CVA ---
  writeValue(val: string): void {
    this._value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByForm.set(isDisabled);
  }

  // Template accessors
  getValue(): string | null {
    return this._value();
  }
}
