import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
  viewChild,
  signal,
} from '@angular/core';
import { NgccIcon } from '../../ngcc-icons/ngcc-icon';
import { NgccHeaderMenuTrigger } from '../ngcc-header.types';

/**
 * Flyout dropdown navigation menu for the header nav bar.
 *
 * DOM structure (host is display:contents):
 *   <li class="cds--header__submenu" role="none">
 *     <button class="cds--header__menu-title" aria-expanded="…">Title <chevron/></button>
 *     <ul class="cds--header__menu" role="menu">
 *       <!-- projected <ngcc-header-menu-item> elements -->
 *     </ul>
 *   </li>
 *
 * Carbon CSS shows/hides the dropdown via:
 *   .cds--header__menu-title[aria-expanded="true"] + .cds--header__menu { display: block }
 *
 * Full keyboard support: Enter/Space, Arrow Up/Down, Home, End, Escape, Tab
 */
@Component({
  selector: 'ngcc-header-menu',
  standalone: true,
  imports: [NgccIcon],
  templateUrl: './ngcc-header-menu.html',
  styleUrls: ['./ngcc-header-menu.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccHeaderMenu {
  /** Visible label on the trigger button */
  @Input()
  get title(): string {
    return this._title();
  }
  set title(value: string) {
    this._title.set(value);
  }
  private readonly _title = signal('');
  /** How the menu opens — 'click' (default) or 'mouseover' */
  @Input()
  get trigger(): NgccHeaderMenuTrigger {
    return this._trigger();
  }
  set trigger(value: NgccHeaderMenuTrigger) {
    this._trigger.set(value);
  }
  private readonly _trigger = signal<NgccHeaderMenuTrigger>('click');
  /** Two-way bindable expanded state — use [(expanded)]="myVar" in parent */
  @Input()
  get expanded(): boolean {
    return this._expanded();
  }
  set expanded(value: boolean) {
    this._expanded.set(value);
    this.expandedChange.emit(value);
  }
  @Output() expandedChange = new EventEmitter<boolean>();
  private readonly _expanded = signal(false);

  /**
   * Signal-based view queries (Angular v17.2+).
   * viewChild.required() — refs are unconditionally in the template (not in @if),
   * so they are always present after view init: Signal<T>, never Signal<T|undefined>.
   */
  readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('menuTrigger');
  readonly menuListRef = viewChild.required<ElementRef<HTMLUListElement>>('menuList');

  private _hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // inject(DestroyRef) replaces implements OnDestroy + ngOnDestroy()
    inject(DestroyRef).onDestroy(() => {
      if (this._hoverTimeout !== null) clearTimeout(this._hoverTimeout);
    });
  }

  // ─── Expand / Collapse ─────────────────────────────────────────────────────

  expand(): void {
    this._expanded.set(true);
    this.expandedChange.emit(this._expanded());
  }

  collapse(): void {
    this._expanded.set(false);
    this.expandedChange.emit(this._expanded());
  }

  toggle(): void {
    this._expanded.update((v: boolean) => !v);
    this.expandedChange.emit(this._expanded());
  }

  // ─── Trigger button events ─────────────────────────────────────────────────

  onTriggerClick(): void {
    if (this._trigger() === 'click') this.toggle();
  }

  onTriggerMouseEnter(): void {
    if (this._trigger() === 'mouseover') {
      if (this._hoverTimeout !== null) clearTimeout(this._hoverTimeout);
      this.expand();
    }
  }

  onTriggerMouseLeave(): void {
    if (this._trigger() === 'mouseover') {
      this._hoverTimeout = setTimeout(() => this.collapse(), 150);
    }
  }

  /** Full ARIA keyboard pattern for the menu trigger button */
  onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        if (this._expanded()) {
          // model() updates synchronously — expanded() reflects the new state here
          requestAnimationFrame(() => this.focusMenuItemAt(0));
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!this._expanded()) this.expand();
        requestAnimationFrame(() => this.focusMenuItemAt(0));
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this._expanded()) this.expand();
        requestAnimationFrame(() => this.focusMenuItemAt(-1));
        break;

      case 'Escape':
        event.preventDefault();
        this.collapse();
        break;
    }
  }

  // ─── Menu list events ──────────────────────────────────────────────────────

  onMenuKeydown(event: KeyboardEvent): void {
    const items = this.getMenuItems();
    if (!items.length) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusMenuItemAt((currentIndex + 1) % items.length);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focusMenuItemAt((currentIndex - 1 + items.length) % items.length);
        break;

      case 'Escape':
        event.preventDefault();
        this.collapse();
        this.triggerRef().nativeElement.focus();
        break;

      case 'Home':
        event.preventDefault();
        this.focusMenuItemAt(0);
        break;

      case 'End':
        event.preventDefault();
        this.focusMenuItemAt(items.length - 1);
        break;

      case 'Tab':
        // Natural tab — close but allow focus to move on
        this.collapse();
        break;
    }
  }

  onMenuFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const menuEl = this.menuListRef().nativeElement;
    const triggerEl = this.triggerRef().nativeElement;
    if (!menuEl.contains(relatedTarget) && relatedTarget !== triggerEl) {
      this.collapse();
    }
  }

  onMenuMouseEnter(): void {
    if (this._trigger() === 'mouseover' && this._hoverTimeout !== null) {
      clearTimeout(this._hoverTimeout);
    }
  }

  onMenuMouseLeave(): void {
    if (this._trigger() === 'mouseover') {
      this._hoverTimeout = setTimeout(() => this.collapse(), 150);
    }
  }

  // ─── Focus helpers ─────────────────────────────────────────────────────────

  private getMenuItems(): HTMLElement[] {
    return Array.from(
      this.menuListRef().nativeElement.querySelectorAll<HTMLElement>(
        'a[role="menuitem"]:not([aria-disabled="true"])',
      ),
    );
  }

  private focusMenuItemAt(index: number): void {
    const items = this.getMenuItems();
    if (!items.length) return;
    const normalized = ((index % items.length) + items.length) % items.length;
    items[normalized]?.focus();
  }
}
