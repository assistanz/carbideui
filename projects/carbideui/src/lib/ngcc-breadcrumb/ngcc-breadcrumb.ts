import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgccBreadcrumbItemComponent } from './ngcc-breadcrumb-item';
import { NgccBreadcrumbItem, NgccBreadcrumbSize } from './ngcc-breadcrumb.types';

@Component({
  selector: 'ngcc-breadcrumb',
  standalone: true,
  imports: [NgccBreadcrumbItemComponent],
  templateUrl: './ngcc-breadcrumb.html',
  styleUrls: ['./ngcc-breadcrumb.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccBreadcrumbComponent {
  readonly items = input<NgccBreadcrumbItem[]>([]);
  readonly size = input<NgccBreadcrumbSize>('md');
  readonly noTrailingSlash = input(false);
  readonly skeleton = input(false);
  readonly skeletonCount = input(3);
  readonly ariaLabel = input('Breadcrumb');

  readonly resolvedItems = computed(() =>
    this.items().map((item, index, arr) => ({
      ...item,
      current: item.current ?? index === arr.length - 1,
    })),
  );

  readonly skeletonItems = computed(() => Array(this.skeletonCount()).fill(null));
}
