import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { NGCC_GRID_GAPS, NgccGridGap } from './ngcc-layout.types';

/**
 * Responsive grid of panels (tiles, stat tiles, charts) that are as tall as the tallest panel in
 * their row. Columns wrap by themselves: each panel is at least `min` wide, and there are at most
 * `columns` per row.
 *
 * ```html
 * <ngcc-panel-grid [columns]="3" min="16rem">
 *   <ngcc-tile>…</ngcc-tile>
 *   <ngcc-stat-tile …/>
 * </ngcc-panel-grid>
 * ```
 */
@Component({
  selector: 'ngcc-panel-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './ngcc-layout.scss',
  host: {
    class: 'ngcc-panel-grid',
    '[style.--ngcc-grid-gap]': 'gapValue()',
    '[style.--ngcc-panel-min]': 'min()',
    '[style.--ngcc-panel-cols]': 'columns()',
  },
  template: `<ng-content />`,
})
export class NgccPanelGrid {
  /** Most panels per row. */
  readonly columns = input(4);
  /** Narrowest a panel may get before it wraps to the next row. */
  readonly min = input('16rem');
  readonly gap = input<NgccGridGap>('default');
  protected readonly gapValue = computed(() => NGCC_GRID_GAPS[this.gap()]);
}
