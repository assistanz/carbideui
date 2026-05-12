import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';

/**
 * Sliding panel linked to a header action (notifications, app-switcher, etc.).
 * Typically placed immediately after <ngcc-header> in the page layout.
 *
 * <ngcc-header-panel [expanded]="notifOpen" ariaLabel="Notifications">
 *   <!-- panel content -->
 * </ngcc-header-panel>
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
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expanded']) this._expanded.set(changes['expanded'].currentValue ?? false);
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? 'Panel');
  }

  @Input() expanded = false;
  private readonly _expanded = signal(false);
  @Input() ariaLabel = 'Panel';
  private readonly _ariaLabel = signal('Panel');

  get panelClasses(): string {
    return ['cds--header-panel', this._expanded() ? 'cds--header-panel--expanded' : '']
      .filter(Boolean)
      .join(' ');
  }
}
