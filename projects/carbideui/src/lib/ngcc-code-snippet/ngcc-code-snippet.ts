import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccCodeSnippetType } from './ngcc-code-snippet.types';

/** Line height for code-01 typography token (1.5rem per row). */
const CODE_LINE_HEIGHT_REM = 1.5;

@Component({
  selector: 'ngcc-code-snippet',
  standalone: true,
  imports: [NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-code-snippet.html',
  styleUrls: ['./ngcc-code-snippet.scss'],
})
export class NgccCodeSnippetComponent {
  /** Display variant. */
  @Input() type: NgccCodeSnippetType = 'single';

  /** The code string to display and copy. */
  @Input() code = '';

  /** Disables all interaction (copy, expand). */
  @Input() disabled = false;

  /** Hides the copy button. */
  @Input() hideCopyButton = false;

  /** Enables text wrapping in the multi-line variant. */
  @Input() wrapText = false;

  /** Applies the light theme background. */
  @Input() light = false;

  /** Shows skeleton loading placeholders instead of content. */
  @Input() skeleton = false;

  /** Text shown in the copy-feedback tooltip after a successful copy. */
  @Input() feedback = 'Copied!';

  /** Duration in ms before the copy feedback tooltip disappears. */
  @Input() feedbackTimeout = 2000;

  /** Label for the "Show more" expand button (multi-line). */
  @Input() showMoreText = 'Show more';

  /** Label for the "Show less" collapse button (multi-line). */
  @Input() showLessText = 'Show less';

  /** Aria-label for the copy button. */
  @Input() copyButtonDescription = 'Copy to clipboard';

  /** Aria-label for the scrollable code container (single / multi). */
  @Input() ariaLabel = '';

  /**
   * Maximum number of visible rows in the collapsed multi-line state.
   * Set to 0 for unlimited height (no expand button shown).
   */
  @Input() maxCollapsedNumberOfRows = 15;

  /**
   * Maximum number of visible rows in the expanded multi-line state.
   * Set to 0 for unlimited height.
   */
  @Input() maxExpandedNumberOfRows = 0;

  /** Internal expand state for the multi-line variant. */
  readonly isExpanded = signal(false);

  /** True while the copy-feedback tooltip is animating. */
  readonly isCopying = signal(false);

  /** Whether the multi-line code block needs an expand/collapse button. */
  get needsExpansion(): boolean {
    const max = this.maxCollapsedNumberOfRows;
    if (this.type !== 'multi' || max <= 0) return false;
    return this.code.split('\n').length > max;
  }

  /** Inline style max-height applied to the multi-line container to clamp visible rows. */
  get containerMaxHeight(): string | null {
    if (this.type !== 'multi') return null;
    const rows = this.isExpanded() ? this.maxExpandedNumberOfRows : this.maxCollapsedNumberOfRows;
    return rows > 0 ? `${rows * CODE_LINE_HEIGHT_REM}rem` : null;
  }

  private feedbackTimer?: ReturnType<typeof setTimeout>;

  async copyCode(): Promise<void> {
    if (this.disabled) return;
    try {
      await navigator.clipboard.writeText(this.code);
      this.triggerFeedback();
    } catch (error) {
      console.error('Clipboard copy failed:', error);
    }
  }

  toggleExpand(): void {
    if (this.disabled) return;
    this.isExpanded.update((v) => !v);
  }

  private triggerFeedback(): void {
    clearTimeout(this.feedbackTimer);
    this.isCopying.set(true);
    this.feedbackTimer = setTimeout(() => {
      this.isCopying.set(false);
    }, this.feedbackTimeout);
  }
}
