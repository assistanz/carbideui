import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
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
  readonly type = input<NgccCodeSnippetType>('single');

  /** The code string to display and copy. */
  readonly code = input('');

  /** Disables all interaction (copy, expand). */
  readonly disabled = input(false);

  /** Hides the copy button. */
  readonly hideCopyButton = input(false);

  /** Enables text wrapping in the multi-line variant. */
  readonly wrapText = input(false);

  /** Applies the light theme background. */
  readonly light = input(false);

  /** Shows skeleton loading placeholders instead of content. */
  readonly skeleton = input(false);

  /** Text shown in the copy-feedback tooltip after a successful copy. */
  readonly feedback = input('Copied!');

  /** Duration in ms before the copy feedback tooltip disappears. */
  readonly feedbackTimeout = input(2000);

  /** Label for the "Show more" expand button (multi-line). */
  readonly showMoreText = input('Show more');

  /** Label for the "Show less" collapse button (multi-line). */
  readonly showLessText = input('Show less');

  /** Aria-label for the copy button. */
  readonly copyButtonDescription = input('Copy to clipboard');

  /** Aria-label for the scrollable code container (single / multi). */
  readonly ariaLabel = input('');

  /**
   * Maximum number of visible rows in the collapsed multi-line state.
   * Set to 0 for unlimited height (no expand button shown).
   */
  readonly maxCollapsedNumberOfRows = input(15);

  /**
   * Maximum number of visible rows in the expanded multi-line state.
   * Set to 0 for unlimited height.
   */
  readonly maxExpandedNumberOfRows = input(0);

  /** Internal expand state for the multi-line variant. */
  readonly isExpanded = signal(false);

  /** True while the copy-feedback tooltip is animating. */
  readonly isCopying = signal(false);

  /**
   * Whether the multi-line code block needs an expand/collapse button.
   * Derived from line count vs maxCollapsedNumberOfRows.
   */
  readonly needsExpansion = computed(() => {
    const max = this.maxCollapsedNumberOfRows();
    if (this.type() !== 'multi' || max <= 0) return false;
    return this.code().split('\n').length > max;
  });

  /**
   * Inline style max-height applied to the multi-line container
   * to clamp visible rows. Drives the CSS transition.
   */
  readonly containerMaxHeight = computed<string | null>(() => {
    if (this.type() !== 'multi') return null;
    const rows = this.isExpanded()
      ? this.maxExpandedNumberOfRows()
      : this.maxCollapsedNumberOfRows();
    return rows > 0 ? `${rows * CODE_LINE_HEIGHT_REM}rem` : null;
  });

  private feedbackTimer?: ReturnType<typeof setTimeout>;

  async copyCode(): Promise<void> {
    if (this.disabled()) return;
    try {
      await navigator.clipboard.writeText(this.code());
    } catch {
      this.fallbackCopy(this.code());
    }
    this.triggerFeedback();
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  toggleExpand(): void {
    if (this.disabled()) return;
    this.isExpanded.update((v) => !v);
  }

  private triggerFeedback(): void {
    clearTimeout(this.feedbackTimer);
    this.isCopying.set(true);
    this.feedbackTimer = setTimeout(() => {
      this.isCopying.set(false);
    }, this.feedbackTimeout());
  }
}
