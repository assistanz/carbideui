import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { NgccRadioTileOption } from './ngcc-radio-tile-group.types';

let nextId = 0;

/**
 * A group of selectable tiles with radio behavior: one choice, a selected state, a description line.
 * Built on native radio inputs inside Carbon's selectable tile, so arrow keys, Tab (one stop for the
 * group) and screen reader announcements ("radio button, 2 of 3") come from the browser.
 *
 * ```html
 * <ngcc-radio-tile-group legend="Plan" [options]="plans" [(value)]="plan" />
 * <ngcc-radio-tile-group legend="Plan" [options]="plans" formControlName="plan" [columns]="3" />
 * ```
 */
@Component({
  selector: 'ngcc-radio-tile-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  styleUrl: './ngcc-radio-tile-group.scss',
  template: `
    <fieldset
      class="ngcc--radio-tile-group"
      [disabled]="isDisabled()"
      [attr.aria-describedby]="describedBy()"
    >
      @if (legend()) {
        <legend class="cds--label">
          {{ legend() }}
          @if (required()) {
            <span class="cds--input-required" aria-hidden="true">*</span>
          } @else if (optional()) {
            <span class="ngcc--radio-tile__optional">({{ optionalLabel() }})</span>
          }
        </legend>
      }
      <div class="ngcc--radio-tile-group__grid" [style.--ngcc-tile-columns]="columns() || null">
        @for (option of options(); track option.value) {
          <div class="ngcc--radio-tile">
            <input
              class="cds--tile-input"
              type="radio"
              [id]="optionId($index)"
              [name]="name"
              [value]="option.value"
              [checked]="value() === option.value"
              [disabled]="option.disabled || isDisabled()"
              [attr.aria-describedby]="option.description ? optionId($index) + '-desc' : null"
              (change)="select(option.value)"
              (blur)="touch()"
            />
            <label class="cds--tile cds--tile--selectable" [attr.for]="optionId($index)">
              <span class="cds--tile__checkmark" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M8 1a7 7 0 1 0 7 7A7 7 0 0 0 8 1m-1 10.2L4 8.2l.7-.7L7 9.8l4.3-4.3.7.7z"
                  />
                </svg>
              </span>
              <span class="cds--tile-content">
                <span class="ngcc--radio-tile__label">{{ option.label }}</span>
                @if (option.description) {
                  <span class="ngcc--radio-tile__description" [id]="optionId($index) + '-desc'">{{
                    option.description
                  }}</span>
                }
              </span>
            </label>
          </div>
        }
      </div>
      @if (isInvalid() && errorText()) {
        <div class="ngcc--form-requirement" [id]="errorId">{{ errorText() }}</div>
      } @else if (helperText()) {
        <div class="cds--form__helper-text" [id]="helperId">{{ helperText() }}</div>
      }
    </fieldset>
  `,
})
export class NgccRadioTileGroup implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { self: true, optional: true });

  readonly options = input<NgccRadioTileOption[]>([]);
  /** Selected value (two-way); `null` while nothing is chosen. */
  readonly value = model<string | null>(null);
  /** Group name, announced by screen readers. */
  readonly legend = input('');
  readonly helperText = input('');
  readonly errorMessage = input('');
  readonly invalid = input<boolean | undefined>(undefined);
  readonly required = input(false);
  /** Show "(optional)" next to the legend (ignored when `required`). */
  readonly optional = input(false);
  readonly optionalLabel = input('optional');
  readonly disabled = input(false);
  /** Fixed number of columns; by default tiles fill the width (at least 12rem each). */
  readonly columns = input<number | undefined>(undefined);

  private readonly uid = nextId++;
  protected readonly name = `ngcc-radio-tile-${this.uid}`;
  protected readonly helperId = `${this.name}-helper`;
  protected readonly errorId = `${this.name}-error`;

  private readonly cvaDisabled = signal(false);
  private readonly touched = signal(false);
  private readonly controlInvalid = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly isInvalid = computed(() => {
    const forced = this.invalid();
    if (forced !== undefined) return forced;
    if (this.required() && this.touched() && this.value() === null) return true;
    return this.touched() && this.controlInvalid();
  });
  protected readonly errorText = computed(
    () =>
      this.errorMessage() || (this.required() && this.value() === null ? 'Select an option' : ''),
  );
  protected readonly describedBy = computed(() => {
    if (this.isInvalid() && this.errorText()) return this.errorId;
    return this.helperText() ? this.helperId : null;
  });

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  protected optionId(index: number): string {
    return `${this.name}-${index}`;
  }

  protected select(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.controlInvalid.set(!!this.ngControl?.control?.invalid);
  }

  protected touch(): void {
    this.touched.set(true);
    this.onTouched();
    this.controlInvalid.set(!!this.ngControl?.control?.invalid);
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : null);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
