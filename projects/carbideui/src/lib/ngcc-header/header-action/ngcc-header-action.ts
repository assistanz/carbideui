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
  imports: [NgccButton],
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
  }

  private elementRef = inject(ElementRef);

  /** Accessible label for the button */
  @Input() ariaLabel = '';
  private readonly _ariaLabel = signal('');

  /** Two-way bindable active/panel-open state — use [(active)]="myVar" in parent */
  @Input() active = false;
  @Output() activeChange = new EventEmitter<boolean>();
  private readonly _active = signal(false);

  /** Icon to display — any key from the NgccIcon registry */
  @Input() iconName: NgccIconNameType | undefined = undefined;
  private readonly _iconName = signal<NgccIconNameType | undefined>(undefined);

  /** Set false to make the button fire-and-forget (no toggle behaviour) */
  @Input() toggleable = true;
  private readonly _toggleable = signal(true);

  @Output() actionClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
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
