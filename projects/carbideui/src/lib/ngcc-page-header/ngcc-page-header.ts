import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgccBreadcrumbComponent } from '../ngcc-breadcrumb/ngcc-breadcrumb';
import { NgccBreadcrumbItem } from '../ngcc-breadcrumb/ngcc-breadcrumb.types';
import { NgccSkeleton } from '../ngcc-skeleton/ngcc-skeleton';

/**
 * Page header: breadcrumbs, the page's one `<h1>`, a description and an action area.
 *
 * Slots (content projection):
 *  - `[ngccPageActions]` — buttons on the right of the title (stack under it on narrow screens)
 *  - `[ngccPageMeta]`    — extra line under the description (status tag, last updated…)
 *  - `[ngccPageTabs]`    — tabs along the bottom edge
 *
 * Every module page should render exactly one of these, so each page has one heading and a
 * consistent place for its primary action.
 */
@Component({
  selector: 'ngcc-page-header',
  standalone: true,
  imports: [NgccBreadcrumbComponent, NgccSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  styleUrl: './ngcc-page-header.scss',
  template: `
    <header class="ngcc-page-header" [class.ngcc-page-header--has-tabs]="hasTabs()">
      @if (breadcrumbs().length) {
        <ngcc-breadcrumb
          class="ngcc-page-header__breadcrumb"
          [items]="breadcrumbs()"
          [noTrailingSlash]="true"
          [ariaLabel]="breadcrumbLabel()"
        />
      }
      <div class="ngcc-page-header__row">
        <div class="ngcc-page-header__text">
          @if (loading()) {
            <ngcc-skeleton width="16rem" height="2rem" />
          } @else {
            <h1 class="ngcc-page-header__title">{{ title() }}</h1>
            @if (description()) {
              <p class="ngcc-page-header__description">{{ description() }}</p>
            }
          }
          <div class="ngcc-page-header__meta"><ng-content select="[ngccPageMeta]" /></div>
        </div>
        <div class="ngcc-page-header__actions"><ng-content select="[ngccPageActions]" /></div>
      </div>
      <div class="ngcc-page-header__tabs"><ng-content select="[ngccPageTabs]" /></div>
    </header>
  `,
})
export class NgccPageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly breadcrumbs = input<NgccBreadcrumbItem[]>([]);
  readonly breadcrumbLabel = input('Breadcrumb');
  /** Shows a skeleton in place of the title while it is being fetched. */
  readonly loading = input(false);
  /** Set when you project `[ngccPageTabs]`, so the header drops its bottom padding. */
  readonly hasTabs = input(false);
}
