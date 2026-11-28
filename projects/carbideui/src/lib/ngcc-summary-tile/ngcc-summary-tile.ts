import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgccTile } from '../ngcc-tile/ngcc-tile';

export interface NgccSummaryItem {
  label: string;
  /** `null`, `undefined` and empty text show the empty marker. */
  value?: string | number | null;
}

/**
 * Description-list tile for a live summary ("Review" panels, side summaries). Missing values are
 * shown as an em dash (read as "Not set"), and the header has a slot for a status tag.
 *
 * ```html
 * <ngcc-summary-tile heading="Plan" [items]="[{ label: 'Region', value: region }, { label: 'Disk', value: disk }]">
 *   <ngcc-tag ngccSummaryStatus type="green">Valid</ngcc-tag>
 * </ngcc-summary-tile>
 * ```
 */
@Component({
  selector: 'ngcc-summary-tile',
  standalone: true,
  imports: [NgccTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  styleUrl: './ngcc-summary-tile.scss',
  template: `
    <ngcc-tile [heading]="heading()" [light]="light()">
      <ng-content select="[ngccSummaryStatus]" ngProjectAs="[ngccTileAction]" />
      <dl class="ngcc--summary-tile__list" [style.--ngcc-summary-columns]="columns()">
        @for (item of items(); track item.label) {
          <div class="ngcc--summary-tile__row">
            <dt class="ngcc--summary-tile__label">{{ item.label }}</dt>
            @if (isEmpty(item)) {
              <dd class="ngcc--summary-tile__value ngcc--summary-tile__value--empty">
                <span aria-hidden="true">—</span>
                <span class="cds--visually-hidden">{{ emptyLabel() }}</span>
              </dd>
            } @else {
              <dd class="ngcc--summary-tile__value">{{ item.value }}</dd>
            }
          </div>
        }
      </dl>
      <ng-content />
    </ngcc-tile>
  `,
})
export class NgccSummaryTile {
  readonly heading = input('');
  readonly items = input<NgccSummaryItem[]>([]);
  /** Text read for a missing value. */
  readonly emptyLabel = input('Not set');
  /** Number of label/value columns. */
  readonly columns = input(1);
  readonly light = input(false);

  protected isEmpty(item: NgccSummaryItem): boolean {
    return item.value === null || item.value === undefined || String(item.value).trim() === '';
  }
}
