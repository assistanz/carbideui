import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';

/**
 * Enterprise-grade Carbon Design System header shell.
 *
 * Composition API — project children in document order:
 *   1. <ngcc-hamburger>          optional — side-nav toggle
 *   2. <ngcc-header-name>        brand + product name link
 *   3. <ngcc-header-navigation>  horizontal nav bar
 *   4. <ngcc-header-global>      right-side action buttons
 *
 * Full example:
 * ```html
 * <ngcc-header ariaLabel="My Product" skipTo="main-content">
 *   <ngcc-hamburger [(active)]="sideNavOpen" />
 *   <ngcc-header-name brand="CarbideUI" productName="MyApp" href="/" />
 *
 *   <ngcc-header-navigation ariaLabel="MyApp">
 *     <ngcc-header-item href="/" [isCurrentPage]="true">Dashboard</ngcc-header-item>
 *     <ngcc-header-menu title="Settings">
 *       <ngcc-header-menu-item href="/settings/profile">Profile</ngcc-header-menu-item>
 *     </ngcc-header-menu>
 *   </ngcc-header-navigation>
 *
 *   <ngcc-header-global>
 *     <ngcc-header-action ariaLabel="Search" [(active)]="searchOpen">
 *       <svg>…</svg>
 *     </ngcc-header-action>
 *   </ngcc-header-global>
 * </ngcc-header>
 *
 * <ngcc-header-panel [expanded]="searchOpen" ariaLabel="Search">…</ngcc-header-panel>
 * ```
 */
@Component({
  selector: 'ngcc-header',
  standalone: true,
  imports: [],
  templateUrl: './ngcc-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccHeader implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? '');
    if (changes['skipTo']) this._skipTo.set(changes['skipTo'].currentValue ?? 'main-content');
  }

  /**
   * Accessible label for the <header> landmark.
   * Should match the product name shown in NgccHeaderName.
   */
  @Input() ariaLabel = '';
  private readonly _ariaLabel = signal('');

  /**
   * ID of the main content element for the skip link.
   * Renders a visually-hidden skip link for keyboard/screen-reader users.
   * Pass an empty string to disable.
   */
  @Input() skipTo = 'main-content';
  private readonly _skipTo = signal('main-content');
}
