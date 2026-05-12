import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import type { NgccIconNameType } from '../ngcc-icons/icons';

/**
 * A single navigable link inside <ngcc-side-nav>.
 *
 * Renders as:
 *   <li class="cds--side-nav__item [cds--side-nav__item--icon]">
 *     <a class="cds--side-nav__link [cds--side-nav__link--current]">
 *       [icon]
 *       <span>Label</span>
 *     </a>
 *   </li>
 *
 * Usage:
 *   <ngcc-side-nav-item href="/dashboard" iconName="home" [active]="true">
 *     Dashboard
 *   </ngcc-side-nav-item>
 */
@Component({
  selector: 'ngcc-side-nav-item',
  standalone: true,
  imports: [NgccIcon],
  templateUrl: './ngcc-side-nav-item.html',
  styleUrls: ['./ngcc-side-nav-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccSideNavItem {
  /** Navigation URL */
  @Input() href = '#';
  /** Marks this link as the active / current page */
  @Input() active = false;
  /** Optional title attribute for the anchor */
  @Input() title = '';
  /** Optional icon placed before the link text */
  @Input() iconName: NgccIconNameType | undefined = undefined;

  @Output() itemClick = new EventEmitter<Event>();

  get itemClasses(): string {
    return ['cds--side-nav__item'].filter(Boolean).join(' ');
  }

  get linkClasses(): string {
    return ['cds--side-nav__link', this.active ? 'cds--side-nav__link--current' : '']
      .filter(Boolean)
      .join(' ');
  }

  onClick(event: Event): void {
    this.itemClick.emit(event);
  }
}
