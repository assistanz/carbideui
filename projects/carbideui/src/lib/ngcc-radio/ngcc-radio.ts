import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
  templateUrl: './ngcc-radio.html',
})
export class NgccRadio<T = unknown> {
  private readonly group = inject(NGCC_RADIO_GROUP_TOKEN, { optional: true });

  // ── Signal inputs ─────────────────────────────────────────────────────────
  readonly value = input<T | null>(null);
  readonly id = input<string>(`ngcc-radio-${radioIdCounter++}`);
  readonly name = input<string>('');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly labelPlacement = input<NgccRadioLabelPlacement>('right');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledby = input<string | undefined>(undefined);
  readonly skeleton = input<boolean>(false);

  /** Two-way writable signal — group sets this when selection changes. */
  readonly checked = model<boolean>(false);

  // ── Output ────────────────────────────────────────────────────────────────
  readonly change = output<NgccRadioChange<T | null> & { source: NgccRadio<T> }>();

  // ── Computed (group values take precedence when inside a group) ───────────
  readonly effectiveName = computed(() => this.group?.name() || this.name());
  readonly isDisabled = computed(() => this.disabled() || (this.group?.isDisabled() ?? false));
  readonly isReadOnly = computed(() => this.group?.readOnly() ?? false);
  readonly effectiveLabelPlacement = computed(
    () => this.group?.labelPlacement() ?? this.labelPlacement(),
  );
  readonly effectiveSkeleton = computed(() => this.group?.skeleton() || this.skeleton());
  readonly effectiveAriaLabelledby = computed(() => this.ariaLabelledby() ?? `label-${this.id()}`);
  readonly hostClasses = computed(() =>
    [
      'cds--radio-button-wrapper',
      this.effectiveLabelPlacement() === 'left' ? 'cds--radio-button-wrapper--label-left' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // ── ViewChild signal — Angular-native reference, no querySelector needed ──
  private readonly radioInputRef = viewChild<ElementRef<HTMLInputElement>>('radioInput');

  constructor() {
    // Imperatively sync the native checked property whenever the signal changes.
    // [checked]="checked()" alone does not reliably update the DOM after initial
    // render because browsers manage radio checked state natively.
    effect(() => {
      const el = this.radioInputRef()?.nativeElement;
      if (el) el.checked = this.checked();
    });
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
    if (this.isDisabled() || this.isReadOnly()) {
      event.preventDefault();
      return;
    }
    this.checked.set((event.target as HTMLInputElement).checked);
    const radioEvent = { source: this, value: this.value() };
    this.change.emit(radioEvent);
    this.radioChangeHandler(radioEvent);
  }

  /** Stop native change from bubbling — selection is managed via click. */
  onChange(event: Event): void {
    event.stopPropagation();
  }
}
