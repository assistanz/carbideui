import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { NGCC_GRID_GAPS, NgccGridGap } from './ngcc-layout.types';

/**
 * Page grid on Carbon's breakpoints: 4 columns below 672px, 8 up to 1055px, 12 above. Direct
 * children span the full row unless they carry `ngccGridSpan`.
 *
 * ```html
 * <ngcc-page-grid>
 *   <ngcc-stat-tile ngccGridSpan [sm]="4" [md]="4" [lg]="3" .../>
 *   <section ngccGridSpan [lg]="8">chart</section>
 *   <aside ngccGridSpan [lg]="4">activity</aside>
 * </ngcc-page-grid>
 * ```
 */
@Component({
  selector: 'ngcc-page-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './ngcc-layout.scss',
  host: { class: 'ngcc-page-grid', '[style.--ngcc-grid-gap]': 'gapValue()' },
  template: `<ng-content />`,
})
export class NgccPageGrid {
  readonly gap = input<NgccGridGap>('default');
  protected readonly gapValue = computed(() => NGCC_GRID_GAPS[this.gap()]);
}

/**
 * How many columns an item spans at each breakpoint (4 / 8 / 12 column grid). Omitted
 * breakpoints span the full row. `start` pins the first column at the large breakpoint.
 */
@Directive({
  selector: '[ngccGridSpan]',
  standalone: true,
  host: {
    '[style.--ngcc-col-sm]': 'cell(sm())',
    '[style.--ngcc-col-md]': 'cell(md())',
    '[style.--ngcc-col-lg]': 'cell(lg(), start())',
  },
})
export class NgccGridSpanDirective {
  readonly sm = input<number | undefined>(undefined);
  readonly md = input<number | undefined>(undefined);
  readonly lg = input<number | undefined>(undefined);
  /** 1-based column the item starts at on large screens. */
  readonly start = input<number | undefined>(undefined);

  protected cell(span: number | undefined, start?: number): string | null {
    if (!span) return null;
    return start ? `${start} / span ${span}` : `span ${span}`;
  }
}
