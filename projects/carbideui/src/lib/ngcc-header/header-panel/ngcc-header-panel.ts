import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Sliding panel linked to a header action (notifications, app-switcher, etc.).
 * Typically placed immediately after <ngcc-header> in the page layout.
 *
 * <ngcc-header-panel [expanded]="notifOpen" ariaLabel="Notifications" (closed)="notifOpen = false">
 *   <!-- panel content -->
 * </ngcc-header-panel>
 *
 * It is a non-modal dialog (`role="dialog"`, named by `ariaLabel`): the page stays usable behind it.
 * Escape and a click outside emit `closed` (set `expanded` to false in response). Focus returns to the
 * element that had it when the panel opened. A collapsed panel is `inert`, so its content is not
 * reachable by keyboard. A click on a `ngcc-header-action` or on an element with `aria-expanded` is
 * not an outside click, so the opening control can toggle the panel itself.
 *
 * Size: `size="content"` fits the panel to its content (up to the viewport height); the default fills the
 * height. Project a `[ngccPanelFooter]` to pin an action row at the bottom. Surface: the background is
 * `--ngcc-header-panel-background` (default `--cds-layer-01`); set it to match your header.
 *
 * Width: 16rem by default. Set `width` (any CSS length) or the `--ngcc-header-panel-width` custom
 * property on the panel or an ancestor. Never wider than the viewport.
 */
@Component({
  selector: 'ngcc-header-panel',
  standalone: true,
  imports: [],
  templateUrl: './ngcc-header-panel.html',
  styleUrls: ['./ngcc-header-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccHeaderPanel implements OnChanges {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private opener: HTMLElement | null = null;

  /** Panel width as a CSS length, e.g. `24rem`. Defaults to 16rem. */
  readonly width = input<string>('');
  /**
   * `full` fills the viewport height under the header (a `[ngccPanelFooter]` stays pinned at the bottom).
   * `content` fits the content, up to the viewport height.
   */
  readonly size = input<'full' | 'content'>('full');
  /** Emit `closed` on a click outside the panel. */
  readonly closeOnOutsideClick = input(true);
  /** Escape or an outside click asked to close the panel. */
  readonly closed = output<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expanded']) {
      const open = changes['expanded'].currentValue ?? false;
      this._expanded.set(open);
      if (open) this.opener = this.doc.activeElement as HTMLElement | null;
      else this.restoreFocus();
    }
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? 'Panel');
  }

  @Input() expanded = false;
  private readonly _expanded = signal(false);
  @Input() ariaLabel = 'Panel';
  private readonly _ariaLabel = signal('Panel');

  /** Give focus back to the opener, but only if focus was inside the panel or has been lost. */
  private restoreFocus(): void {
    const active = this.doc.activeElement;
    const lost = !active || active === this.doc.body || this.host.nativeElement.contains(active);
    if (lost && this.opener?.isConnected) this.opener.focus();
    this.opener = null;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.expanded) this.closed.emit();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.expanded || !this.closeOnOutsideClick()) return;
    const path = event.composedPath() as HTMLElement[];
    const inside = path.some(
      (el) =>
        el === this.host.nativeElement ||
        el.tagName?.toLowerCase() === 'ngcc-header-action' ||
        el.hasAttribute?.('aria-expanded'),
    );
    if (!inside) this.closed.emit();
  }

  get panelClasses(): string {
    return [
      'cds--header-panel',
      this._expanded() ? 'cds--header-panel--expanded' : '',
      this.size() === 'content' ? 'ngcc-header-panel--content' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
