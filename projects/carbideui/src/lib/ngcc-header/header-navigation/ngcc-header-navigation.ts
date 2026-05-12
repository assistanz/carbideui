import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';

/**
 * Horizontal navigation bar inside the header shell.
 * Project <ngcc-header-item> and <ngcc-header-menu> elements as children.
 *
 * DOM structure:
 *   <nav class="cds--header__nav" aria-label="…">
 *     <ul class="cds--header__menu-bar" role="menubar">
 *       <!-- projected items / menus -->
 *     </ul>
 *   </nav>
 */
@Component({
  selector: 'ngcc-header-navigation',
  standalone: true,
  imports: [],
  templateUrl: './ngcc-header-navigation.html',
  styleUrls: ['./ngcc-header-navigation.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccHeaderNavigation implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ariaLabel'])
      this._ariaLabel.set(changes['ariaLabel'].currentValue ?? 'Navigation');
  }

  /** Accessible label for the <nav> landmark */
  @Input() ariaLabel = 'Navigation';
  private readonly _ariaLabel = signal('Navigation');
}
