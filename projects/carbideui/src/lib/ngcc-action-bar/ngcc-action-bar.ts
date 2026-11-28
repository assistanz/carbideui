import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Bottom bar for form actions, with a status area on the left.
 *
 * ```html
 * <ngcc-action-bar>
 *   <span ngccActionBarStatus>3 fields need attention</span>
 *   <button class="cds--btn cds--btn--secondary">Cancel</button>
 *   <button class="cds--btn cds--btn--primary">Save</button>
 * </ngcc-action-bar>
 * ```
 *
 * By default the bar sticks to the bottom of its scroll container, so the content above it is never
 * covered. With `fixed` it is pinned to the viewport and a spacer of the bar's height is kept after it,
 * so the last content can still be scrolled into view. Set `--ngcc-action-bar-inset-start` to the side
 * navigation width when a fixed bar should not run under it. The status area is a polite live region
 * (changes are announced without moving focus).
 */
@Component({
  selector: 'ngcc-action-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block', '[class.ngcc--action-bar--fixed]': 'fixed()' },
  styleUrl: './ngcc-action-bar.scss',
  template: `
    <div
      #bar
      class="ngcc--action-bar"
      role="group"
      [attr.aria-label]="ariaLabel()"
      [class.ngcc--action-bar--elevated]="elevated()"
    >
      <div class="ngcc--action-bar__status" role="status" aria-live="polite">
        <ng-content select="[ngccActionBarStatus]" />
      </div>
      <div class="ngcc--action-bar__actions"><ng-content /></div>
    </div>
    @if (fixed()) {
      <div
        class="ngcc--action-bar__spacer"
        aria-hidden="true"
        [style.block-size.px]="height()"
      ></div>
    }
  `,
})
export class NgccActionBar {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly bar = viewChild<ElementRef<HTMLElement>>('bar');

  /** Accessible name of the group. */
  readonly ariaLabel = input('Form actions');
  /** Pin to the viewport instead of the scroll container. */
  readonly fixed = input(false);
  /** Adds a shadow to separate the bar from content scrolling behind it. */
  readonly elevated = input(true);

  /** Measured height of the bar, kept as a spacer in `fixed` mode. */
  protected readonly height = signal(64);

  constructor() {
    afterNextRender(() => {
      const el = this.bar()?.nativeElement;
      if (!el || !this.isBrowser) return;
      this.height.set(el.offsetHeight || 64);
      if (typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => this.height.set(el.offsetHeight || 64));
      ro.observe(el);
      inject(DestroyRef).onDestroy(() => ro.disconnect());
    });
  }
}
