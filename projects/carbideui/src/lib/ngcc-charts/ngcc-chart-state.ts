import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgccSkeleton } from '../ngcc-skeleton/ngcc-skeleton';

/**
 * The loading and empty placeholder shared by every chart panel, so they look and announce the
 * same: the library skeleton while loading, a "no data" message (same height, so the layout does
 * not jump) when there is nothing to draw. Renders nothing when neither applies.
 *
 * Use it for your own chart wrappers too:
 * `<ngcc-chart-state [loading]="loading" [empty]="!rows.length" height="300px" />`
 */
@Component({
  selector: 'ngcc-chart-state',
  standalone: true,
  imports: [NgccSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './ngcc-chart-state.scss',
  template: `
    @if (loading()) {
      <div class="ngcc--charts__loading">
        <ngcc-skeleton width="100%" [height]="height()" />
      </div>
    } @else if (empty()) {
      <div class="ngcc--charts__empty" role="status" [style.height]="height()">
        <p class="bx--label">{{ message() }}</p>
      </div>
    }
  `,
})
export class NgccChartState {
  readonly loading = input(false);
  readonly empty = input(false);
  readonly message = input('No data available');
  readonly height = input('300px');
}
