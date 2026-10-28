import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { NgccPopoverPlacement, NgccPopoverTrigger } from './ngcc-popover.types';

let nextId = 0;

/**
 * Non-modal popover for detail panels: anchored to a trigger, no backdrop, the page stays usable.
 *
 * ```html
 * <ngcc-popover label="Cluster details" placement="bottom-start">
 *   <button ngccPopoverTrigger class="cds--btn cds--btn--ghost">Details</button>
 *   <p>Region eu-west-1, 12 nodes</p>
 * </ngcc-popover>
 * ```
 *
 * The element marked `ngccPopoverTrigger` gets `aria-expanded`, `aria-controls` and
 * `aria-haspopup="dialog"`. Escape and a click outside close it (Escape returns focus to the
 * trigger). The content follows the trigger in tab order, so keyboard users reach it naturally.
 * With `trigger="hover"` it also opens on keyboard focus, and the content stays open while the
 * pointer is over it.
 */
@Component({
  selector: 'ngcc-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '(click)': 'onHostClick($event)',
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
    '(keydown.escape)': 'onEscape($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <ng-content select="[ngccPopoverTrigger]" />
    <span class="cds--popover">
      <span
        class="cds--popover-content"
        role="dialog"
        [id]="contentId"
        [attr.aria-label]="label() || null"
      >
        <span class="ngcc-popover__body"><ng-content /></span>
      </span>
    </span>
  `,
  styles: `
    .ngcc-popover__body {
      display: block;
      padding: 1rem;
      min-inline-size: 12rem;
      max-inline-size: 24rem;
    }
  `,
})
export class NgccPopover {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Two-way: whether the popover is showing. */
  readonly open = model(false);
  readonly placement = input<NgccPopoverPlacement>('bottom');
  readonly trigger = input<NgccPopoverTrigger>('click');
  /** Accessible name of the popover content (what it is about). */
  readonly label = input('');
  readonly caret = input(true);
  readonly closeOnOutsideClick = input(true);

  protected readonly contentId = `ngcc-popover-${nextId++}`;

  protected readonly hostClasses = computed(() =>
    [
      'cds--popover-container',
      `cds--popover--${this.placement()}`,
      'cds--popover--drop-shadow',
      this.caret() ? 'cds--popover--caret' : '',
      this.open() ? 'cds--popover--open' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    effect(() => {
      const open = this.open();
      const trigger = this.triggerEl();
      if (!trigger) return;
      trigger.setAttribute('aria-expanded', String(open));
      trigger.setAttribute('aria-controls', this.contentId);
      trigger.setAttribute('aria-haspopup', 'dialog');
    });
  }

  private triggerEl(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[ngccPopoverTrigger]');
  }

  private fromTrigger(target: EventTarget | null): boolean {
    const trigger = this.triggerEl();
    return !!trigger && target instanceof Node && trigger.contains(target);
  }

  protected onHostClick(event: Event): void {
    if (this.trigger() === 'click' && this.fromTrigger(event.target)) this.open.update((o) => !o);
  }

  protected onEnter(): void {
    if (this.trigger() === 'hover') this.open.set(true);
  }

  protected onLeave(): void {
    if (this.trigger() === 'hover') this.open.set(false);
  }

  protected onFocusIn(): void {
    if (this.trigger() === 'hover') this.open.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (this.trigger() !== 'hover') return;
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) this.open.set(false);
  }

  protected onEscape(event: Event): void {
    if (!this.open()) return;
    event.stopPropagation();
    this.open.set(false);
    this.triggerEl()?.focus();
  }

  protected onDocumentClick(event: Event): void {
    if (!this.open() || !this.closeOnOutsideClick() || this.trigger() !== 'click') return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
