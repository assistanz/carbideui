import { Component, ChangeDetectionStrategy, input } from '@angular/core';
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
    '[class.cds--breadcrumb-item--disabled]': 'disabled()',
  },
})
export class NgccBreadcrumbItemComponent {
  readonly label = input('');
  readonly href = input<string>();
  readonly routerLink = input<string | string[]>();
  readonly current = input(false);
  readonly disabled = input(false);
  readonly skeleton = input(false);
  readonly target = input<string>();
  readonly rel = input<string>();
}
