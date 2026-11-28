import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { NgccButton } from '../../ngcc-button/ngcc-button';
import { NgccIcon } from '../../ngcc-icons/ngcc-icon';
import type { NgccIconNameType } from '../../ngcc-icons/icons';

/**
 * Global header action button (search, notifications, app-switcher, etc.).
 * Placed inside <ngcc-header-global>.
 *
 * Renders via NgccButton (ghost, icon-only). Use [(active)] for two-way panel toggling:
 *   <ngcc-header-action ariaLabel="Search" iconName="search" [(active)]="searchOpen" />
 */
@Component({
  selector: 'ngcc-header-action',
  standalone: true,
  imports: [CommonModule, NgccButton, NgccIcon],
  templateUrl: './ngcc-header-action.html',
  styleUrls: ['./ngcc-header-action.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccHeaderAction implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? '');
    if (changes['iconName']) this._iconName.set(changes['iconName'].currentValue ?? undefined);
    if (changes['toggleable']) this._toggleable.set(changes['toggleable'].currentValue ?? true);
    if (changes['active']) {
      this._active.set(changes['active'].currentValue ?? false);
    }
    if (changes['href']) {
      this._href.set(changes['href'].currentValue ?? undefined);
    }
  }

  private elementRef = inject(ElementRef);

  /** Accessible label for the button */
  @Input() ariaLabel = '';
  private readonly _ariaLabel = signal('');

  /**
   * Badge on the icon: `'dot'` for a plain dot, or a count (0 or less hides it). Counts above `badgeMax`
   * show as `99+`. The count is announced through the button's accessible name.
   */
  @Input() badge: number | 'dot' | null = null;
  @Input() badgeMax = 99;
  /** Accessible text for the count; `{count}` is replaced. Translate here. */
  @Input() badgeLabel = '{count} unread';

  protected get badgeText(): string {
    return typeof this.badge === 'number'
      ? this.badge > this.badgeMax
        ? `${this.badgeMax}+`
        : String(this.badge)
      : '';
  }

  protected get hasBadge(): boolean {
    return this.badge === 'dot' || (typeof this.badge === 'number' && this.badge > 0);
  }

  protected get accessibleLabel(): string {
    if (typeof this.badge !== 'number' || this.badge <= 0) return this.ariaLabel;
    const count = this.badgeLabel.replace('{count}', String(this.badge));
    return this.ariaLabel ? `${this.ariaLabel}, ${count}` : count;
  }

  /** Two-way bindable active/panel-open state — use [(active)]="myVar" in parent */
  @Input() active = false;
  @Output() activeChange = new EventEmitter<boolean>();
  private readonly _active = signal(false);

  /** Optional link target for actions that behave like anchors, e.g. “Switch to Legacy”. */
  @Input() href?: string | null = null;
  private readonly _href = signal<string | null>(null);

  /** Icon to display — any key from the NgccIcon registry */
  @Input() iconName: NgccIconNameType | undefined = undefined;
  private readonly _iconName = signal<NgccIconNameType | undefined>(undefined);

  /** Set false to make the button fire-and-forget (no toggle behaviour) */
  @Input() toggleable = true;
  private readonly _toggleable = signal(true);

  @Output() actionClick = new EventEmitter<MouseEvent>();
  @Output() linkClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (this._href()) {
      this.linkClick.emit(event);
      return;
    }

    this.actionClick.emit(event);
    if (this._toggleable()) {
      this._active.update((v) => !v);
      this.activeChange.emit(this._active());
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this._active() || !this._toggleable()) return;

    // Evaluate click path to support detached DOM elements
    const path = event.composedPath() as HTMLElement[];
    const isInsideAction = path.includes(this.elementRef.nativeElement);

    // If click is inside any panel, we do not close the action so the panel remains usable
    const isInsidePanel = path.some((el) => el.tagName?.toLowerCase() === 'ngcc-header-panel');

    if (!isInsideAction && !isInsidePanel) {
      this._active.set(false);
      this.activeChange.emit(this._active());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this._active() && this._toggleable()) {
      this._active.set(false);
      this.activeChange.emit(this._active());
      // Return focus to the trigger element when closed via Escape key
      this.elementRef.nativeElement.querySelector('button')?.focus();
    }
  }
}
