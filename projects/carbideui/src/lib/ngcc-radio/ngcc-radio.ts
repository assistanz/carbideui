import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  inject,
  effect,
  signal,
} from '@angular/core';
import {
  NGCC_RADIO_GROUP_TOKEN,
  NgccRadioChange,
  NgccRadioLabelPlacement,
} from './ngcc-radio.types';

let radioIdCounter = 0;

/**
 * Individual radio button. Must be used inside `<ngcc-radio-group>`.
 *
 * ```html
 * <ngcc-radio-group [(ngModel)]="selected">
 *   <ngcc-radio value="a">Option A</ngcc-radio>
 * </ngcc-radio-group>
 * ```
 */
@Component({
  selector: 'ngcc-radio',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  templateUrl: './ngcc-radio.html',
})
export class NgccRadio<T = unknown> implements OnChanges, AfterViewInit {
  private readonly group = inject(NGCC_RADIO_GROUP_TOKEN, { optional: true });

  // ── Public inputs (library-friendly) ──────────────────────────────────────
  @Input() value: T | null = null;
  @Input() id: string = `ngcc-radio-${radioIdCounter++}`;
  @Input() name: string = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() labelPlacement: NgccRadioLabelPlacement = 'right';
  @Input() ariaLabel: string | undefined = undefined;
  @Input() ariaLabelledby: string | undefined = undefined;
  @Input() skeleton = false;

  // ── Internal signals (private state) ────────────────────────────────────
  private readonly _value = signal<T | null>(this.value);
  private readonly _checked = signal(false);
  private readonly _disabled = signal(this.disabled);

  // ── Outputs (library-friendly)
  @Output() change = new EventEmitter<NgccRadioChange<T | null> & { source: NgccRadio<T> }>();

  // ── Computed (group values take precedence when inside a group)
  get effectiveName(): string {
    return this.group?.name ?? this.name;
  }

  get isDisabled(): boolean {
    return this.disabled || (this.group?.isDisabled ?? false);
  }

  get isReadOnly(): boolean {
    return this.group?.readOnly ?? false;
  }

  get effectiveLabelPlacement(): NgccRadioLabelPlacement {
    return this.group?.labelPlacement ?? this.labelPlacement;
  }

  get effectiveSkeleton(): boolean {
    return this.group?.skeleton || this.skeleton;
  }

  get effectiveAriaLabelledby(): string {
    return this.ariaLabelledby ?? `label-${this.id}`;
  }

  get hostClasses(): string {
    return [
      'cds--radio-button-wrapper',
      this.effectiveLabelPlacement === 'left' ? 'cds--radio-button-wrapper--label-left' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  @ViewChild('radioInput', { static: false }) radioInputRef?: ElementRef<HTMLInputElement>;

  constructor() {
    // Imperatively sync the native checked property whenever the signal changes.
    // We use an effect that will run after view init once the ViewChild is available.
    effect(() => {
      const el = this.radioInputRef?.nativeElement;
      if (el) el.checked = this._checked();
    });
  }

  ngOnChanges(): void {
    this._value.set(this.value);
    this._disabled.set(this.disabled);
  }

  ngAfterViewInit(): void {
    // Ensure the native input reflects initial checked state
    const el = this.radioInputRef?.nativeElement;
    if (el) el.checked = this._checked();
  }

  // ── Internal: registered by the parent group ──────────────────────────────
  private radioChangeHandler: (
    event: NgccRadioChange<T | null> & { source: NgccRadio<T> },
  ) => void = () => {};

  registerRadioChangeHandler(
    fn: (event: NgccRadioChange<T | null> & { source: NgccRadio<T> }) => void,
  ): void {
    this.radioChangeHandler = fn;
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  onClick(event: Event): void {
    if (this.isDisabled || this.isReadOnly) {
      event.preventDefault();
      return;
    }
    const checked = (event.target as HTMLInputElement).checked;
    this._checked.set(checked);
    const radioEvent = { source: this, value: this._value() };
    this.change.emit(radioEvent);
    this.radioChangeHandler(radioEvent);
  }

  /** Stop native change from bubbling — selection is managed via click. */
  onChange(event: Event): void {
    event.stopPropagation();
  }

  // Methods used by NgccRadioGroup internally
  getValue(): T | null {
    return this._value();
  }

  setChecked(v: boolean): void {
    this._checked.set(v);
  }

  isChecked(): boolean {
    return this._checked();
  }

  // Public getter for template binding
  get checked(): boolean {
    return this._checked();
  }
}
