import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Internal: the label row shared by every form component (and by `ngcc-form-field`), so the required
 * asterisk, the "(optional)" marker and the tooltip button look and behave the same everywhere.
 *
 * The label text is projected. The tooltip button sits next to the label, not inside it (a button
 * inside a label is invalid), and carries the text as its accessible name.
 */
@Component({
  selector: 'ngcc-field-label',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  styleUrl: './ngcc-field-label.scss',
  template: `
    <div class="ngcc-field-label__row">
      <label class="cds--label ngcc-field-label__label" [id]="labelId()" [attr.for]="forId()">
        <ng-content />
        @if (required()) {
          <span class="cds--input-required" aria-hidden="true">*</span>
        } @else if (optional()) {
          <span class="ngcc-field-label__optional">({{ optionalLabel() }})</span>
        }
      </label>
      @if (tooltip()) {
        <button
          type="button"
          class="ngcc-field-label__tip"
          [attr.aria-label]="tooltip()"
          [attr.title]="tooltip()"
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path
              d="M17 22v-8h-4v2h2v6h-3v2h8v-2h-3zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8z"
            ></path>
            <path
              d="M16 30a14 14 0 1 1 14-14 14 14 0 0 1-14 14zm0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4z"
            ></path>
          </svg>
        </button>
      }
    </div>
  `,
})
export class NgccFieldLabel {
  /** `id` of the control the label belongs to. */
  readonly forId = input<string | null>(null);
  readonly labelId = input<string | null>(null);
  /** Show the required asterisk. */
  readonly required = input(false);
  /** Show "(optional)" next to the label. Ignored when `required`. */
  readonly optional = input(false);
  readonly optionalLabel = input('optional');
  /** Short explanation shown from an info button next to the label. */
  readonly tooltip = input('');
}
