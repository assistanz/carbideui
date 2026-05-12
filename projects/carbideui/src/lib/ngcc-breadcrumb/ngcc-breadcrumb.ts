import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  @Input() items: NgccBreadcrumbItem[] = [];
  @Input() size: NgccBreadcrumbSize = 'md';
  @Input() noTrailingSlash = false;
  @Input() skeleton = false;
  @Input() skeletonCount = 3;
  @Input() ariaLabel = 'Breadcrumb';

  get resolvedItems(): NgccBreadcrumbItem[] {
    return this.items.map((item, index, arr) => ({
      ...item,
      current: item.current ?? index === arr.length - 1,
    }));
  }

  get skeletonItems(): null[] {
    return Array(this.skeletonCount).fill(null);
  }

  trackByIndex(_index: number): number {
    return _index;
  }
}
