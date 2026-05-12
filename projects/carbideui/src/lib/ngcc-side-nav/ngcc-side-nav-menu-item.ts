import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * A navigable link nested inside <ngcc-side-nav-menu>.
 *
 * Renders as:
 *   <li class="cds--side-nav__menu-item">
 *     <a class="cds--side-nav__link [cds--side-nav__link--current]">
 *       <span>Label</span>
 *     </a>
 *   </li>
 *
 * Usage:
 *   <ngcc-side-nav-menu title="Settings">
 *     <ngcc-side-nav-menu-item href="/settings/profile" [active]="true">Profile</ngcc-side-nav-menu-item>
 *   </ngcc-side-nav-menu>
 */
@Component({
  selector: 'ngcc-side-nav-menu-item',
  standalone: true,
  imports: [],
  templateUrl: './ngcc-side-nav-menu-item.html',
  styleUrls: ['./ngcc-side-nav-menu-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccSideNavMenuItem {
  /** Navigation URL */
  @Input() href = '#';
  /** Marks this link as the active / current page */
  @Input() active = false;
  /** Optional title attribute for the anchor */
  @Input() title = '';

  @Output() itemClick = new EventEmitter<Event>();

  onClick(event: Event): void {
    this.itemClick.emit(event);
  }
}
