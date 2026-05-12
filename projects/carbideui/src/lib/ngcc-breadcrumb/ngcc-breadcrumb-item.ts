import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ngcc-breadcrumb-item',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-breadcrumb-item.html',
  styleUrls: ['./ngcc-breadcrumb-item.scss'],
  host: {
    class: 'cds--breadcrumb-item',
    '[class.cds--breadcrumb-item--disabled]': 'disabled',
  },
})
export class NgccBreadcrumbItemComponent {
  @Input() label = '';
  @Input() href?: string;
  @Input() routerLink?: string | string[];
  @Input() current = false;
  @Input() disabled = false;
  @Input() skeleton = false;
  @Input() target?: string;
  @Input() rel?: string;
}
