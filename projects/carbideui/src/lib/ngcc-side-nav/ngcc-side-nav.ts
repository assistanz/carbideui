import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { NgccSideNavMenu } from './ngcc-side-nav-menu';
import { NGCC_SIDE_NAV_CONTEXT, NgccSideNavContext } from './ngcc-side-nav.types';
import { NgccButton } from '../ngcc-button/ngcc-button';

/**
 * Enterprise-grade Carbon Design System side navigation shell.
 *
 * Composition API — project children directly into this component:
 *   - <ngcc-side-nav-item>   — a single navigable link
 *   - <ngcc-side-nav-menu>   — a collapsible submenu with nested items
 *   - <ngcc-side-nav-divider> — a visual separator
 *
 * Full example:
 * ```html
 * <ngcc-side-nav ariaLabel="App navigation" [(expanded)]="sideNavOpen">
 *   <ngcc-side-nav-item href="/" iconName="home" [active]="true">Home</ngcc-side-nav-item>
 *
 *   <ngcc-side-nav-menu title="Settings" iconName="configuration">
 *     <ngcc-side-nav-menu-item href="/settings/profile">Profile</ngcc-side-nav-menu-item>
 *     <ngcc-side-nav-menu-item href="/settings/security">Security</ngcc-side-nav-menu-item>
 *   </ngcc-side-nav-menu>
 *
 *   <ngcc-side-nav-divider />
 *   <ngcc-side-nav-item href="/help" iconName="information">Help</ngcc-side-nav-item>
 * </ngcc-side-nav>
 * ```
 *
 * Pass `[allowExpansion]="true"` to render an expand/collapse toggle button in the footer.
 * Bind `[(expanded)]="open"` for two-way control of the expanded state.
 *
 * Rail mode: add `[rail]="true"` for the compact icon-only side-nav variant.
 * In rail mode, clicking a <ngcc-side-nav-menu> automatically expands the nav.
 */
@Component({
  selector: 'ngcc-side-nav',
  standalone: true,
  imports: [NgccButton],
  templateUrl: './ngcc-side-nav.html',
  styleUrls: ['./ngcc-side-nav.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cds--side-nav',
    '[class.cds--side-nav--expanded]': 'expanded',
    '[class.cds--side-nav--hidden]': 'hidden',
    '[class.cds--side-nav--rail]': 'rail',
  },
  // Provide this component as NgccSideNavContext so projected NgccSideNavMenu
  // children can inject it via NGCC_SIDE_NAV_CONTEXT without a circular import.
  providers: [{ provide: NGCC_SIDE_NAV_CONTEXT, useExisting: NgccSideNav }],
})
export class NgccSideNav implements NgccSideNavContext, OnChanges, AfterContentInit {
  /** Accessible label for the <nav> landmark. */
  @Input() ariaLabel = 'Side navigation';

  /**
   * Two-way bindable expanded/collapsed state.
   * Use `[(expanded)]="sideNavOpen"` in the parent.
   * Defaults to `true` (expanded).
   */
  @Input() expanded = true;
  @Output() expandedChange = new EventEmitter<boolean>();

  /** When `true`, hides the side-nav entirely (e.g. on mobile). */
  @Input() hidden = false;

  /**
   * Rail mode: shows only icons when the nav is collapsed.
   * Requires icons on all items/menus for a good visual.
   */
  @Input() rail = false;

  /**
   * When `true`, renders an expand/collapse toggle button in the side-nav footer.
   * Use with `[(expanded)]` for controlled expand/collapse behaviour.
   */
  @Input() allowExpansion = false;

  /** Label shown on the expand toggle when collapsed. */
  @Input() openLabel = 'Open navigation menu';

  /** Label shown on the collapse toggle when expanded. */
  @Input() closeLabel = 'Close navigation menu';

  /**
   * All projected <ngcc-side-nav-menu> instances (direct + nested).
   * Used to auto-close open submenus when the nav collapses or enters rail mode.
   */
  @ContentChildren(NgccSideNavMenu, { descendants: true })
  private menus!: QueryList<NgccSideNavMenu>;

  private prevRail = false;

  ngOnChanges(changes: SimpleChanges): void {
    // Close all open submenus when:
    // 1. The nav collapses  (expanded → false)
    // 2. The nav enters rail mode for the first time  (rail false → true)
    if (changes['expanded'] && changes['expanded'].currentValue === false) {
      this.closeAllMenus();
    }

    if (changes['rail']) {
      const newRail = !!changes['rail'].currentValue;
      if (newRail && !this.prevRail) this.closeAllMenus();
      this.prevRail = newRail;
    }
  }

  // Ensure we have an initial prevRail value after content init
  ngAfterContentInit(): void {
    this.prevRail = this.rail;
  }

  private closeAllMenus(): void {
    this.menus?.forEach((menu) => (menu.expanded = false));
  }

  // ── NgccSideNavContext implementation ───────────────────────────────────────

  /** Expands the side nav — called by NgccSideNavMenu when clicked in rail mode. */
  expand(): void {
    this.setExpanded(true);
  }

  // ── Public helpers ──────────────────────────────────────────────────────────

  toggle(): void {
    this.setExpanded(!this.expanded);
  }

  private setExpanded(value: boolean): void {
    if (this.expanded === value) return;
    this.expanded = value;
    this.expandedChange.emit(value);
    if (!value) this.closeAllMenus();
  }
}
