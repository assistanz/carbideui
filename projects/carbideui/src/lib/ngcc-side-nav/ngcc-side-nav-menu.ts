import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  inject,
} from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import type { NgccIconNameType } from '../ngcc-icons/icons';
import { NgccSideNavMenuItem } from './ngcc-side-nav-menu-item';
import { NGCC_SIDE_NAV_CONTEXT } from './ngcc-side-nav.types';

/**
 * A collapsible submenu inside <ngcc-side-nav>.
 *
 * Renders as:
 *   <li class="cds--side-nav__item cds--side-nav__item--icon [cds--side-nav__item--active]">
 *     <button class="cds--side-nav__submenu" aria-expanded="…">
 *       [icon]  <span>Title</span>  <chevron/>
 *     </button>
 *     <ul class="cds--side-nav__menu" role="list">
 *       <!-- projected <ngcc-side-nav-menu-item> elements -->
 *     </ul>
 *   </li>
 *
 * Carbon CSS toggles visibility via:
 *   .cds--side-nav__submenu[aria-expanded="true"] ~ .cds--side-nav__menu { display: block }
 *
 * `hasActiveChild` is auto-computed from projected <ngcc-side-nav-menu-item [active]="true">.
 * The menu `<li>` receives `cds--side-nav__item--active` whenever any child is active.
 *
 * Rail mode behaviour:
 *   Clicking the submenu button while the parent NgccSideNav is in rail mode automatically
 *   expands the side nav back to full width so the sub-items are visible. This mirrors the
 *   Carbon Design System pattern: nav items navigate, nav menus reveal their children.
 *
 * Usage:
 *   <ngcc-side-nav-menu title="Settings" iconName="configuration" [(expanded)]="settingsOpen">
 *     <ngcc-side-nav-menu-item href="/settings/profile">Profile</ngcc-side-nav-menu-item>
 *   </ngcc-side-nav-menu>
 */
@Component({
  selector: 'ngcc-side-nav-menu',
  standalone: true,
  imports: [NgccIcon],
  templateUrl: './ngcc-side-nav-menu.html',
  styleUrls: ['./ngcc-side-nav-menu.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccSideNavMenu {
  /** Title displayed on the submenu trigger button */
  @Input() title = '';

  /**
   * Two-way bindable expanded/collapsed state.
   * Use `[(expanded)]="myVar"` in the parent for controlled behaviour.
   */
  @Input() expanded = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  /** Optional icon placed before the title */
  @Input() iconName: NgccIconNameType | undefined;

  /**
   * Content children query: tracks projected <ngcc-side-nav-menu-item> instances.
   */
  @ContentChildren(NgccSideNavMenuItem) private menuItems!: QueryList<NgccSideNavMenuItem>;

  /**
   * True when any projected menu item has `[active]="true"`.
   * Applied as `cds--side-nav__item--active` on the wrapper <li>.
   */
  get hasActiveChild(): boolean {
    return this.menuItems?.some((item) => !!item.active) ?? false;
  }

  /**
   * Optional reference to the parent NgccSideNav provided via NGCC_SIDE_NAV_CONTEXT.
   * `null` when this menu is used outside of a <ngcc-side-nav> (safe-guard).
   */
  private readonly _nav = inject(NGCC_SIDE_NAV_CONTEXT, { optional: true });

  toggle(): void {
    // Rail mode: the nav is collapsed to icon-only width.
    // Sub-items can't be seen in that state — expand the sidenav first so the
    // user can read the full menu before we open/close the submenu.
    if (this._nav?.rail) {
      this._nav.expand();
    }
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }
}
