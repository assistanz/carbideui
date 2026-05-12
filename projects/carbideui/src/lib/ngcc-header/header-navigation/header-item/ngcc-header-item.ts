import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';

/**
 * A single navigation link inside <ngcc-header-navigation>.
 * Renders as <li role="none"><a role="menuitem">…</a></li>
 *
 * <ngcc-header-item href="/dashboard" [isCurrentPage]="true">Dashboard</ngcc-header-item>
 */
@Component({
  selector: 'ngcc-header-item',
  standalone: true,
  imports: [],
  templateUrl: './ngcc-header-item.html',
  styleUrls: ['./ngcc-header-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccHeaderItem implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['href']) this._href.set(changes['href'].currentValue ?? '/');
    if (changes['isCurrentPage'])
      this._isCurrentPage.set(changes['isCurrentPage'].currentValue ?? false);
    if (changes['tabIndex']) this._tabIndex.set(changes['tabIndex'].currentValue ?? 0);
  }

  /** Navigation URL */
  @Input() href: string = '/';
  private readonly _href = signal('/');
  /** Marks this link as the active / current page */
  @Input() isCurrentPage = false;
  private readonly _isCurrentPage = signal(false);
  /** Tab index override */
  @Input() tabIndex = 0;
  private readonly _tabIndex = signal(0);

  @Output() itemClick = new EventEmitter<Event>();

  readonly linkClasses = computed(() =>
    ['cds--header__menu-item', this._isCurrentPage() ? 'cds--header__menu-item--current' : '']
      .filter(Boolean)
      .join(' '),
  );

  onClick(event: Event): void {
    this.itemClick.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.itemClick.emit(event);
    }
  }
}
