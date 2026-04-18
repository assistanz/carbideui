import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgccContainedListKind, NgccContainedListSize } from './ngcc-contained-list.types';

@Component({
  selector: 'ngcc-contained-list',
  standalone: true,
  imports: [],
  templateUrl: './ngcc-contained-list.html',
  styleUrls: ['./ngcc-contained-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class NgccContainedList {
  private static count = 0;

  /** A label describing the contained list. */
  readonly label = input('');

  /** The kind of ContainedList you want to display. */
  readonly kind = input<NgccContainedListKind>('on-page');

  /** Specify the size of the contained list. */
  readonly size = input<NgccContainedListSize | undefined>(undefined);

  /** Specify whether the dividing lines in between list items should be inset. */
  readonly isInset = input(false);

  /** Whether a header action element has been projected via [ngccContainedListAction]. */
  readonly hasAction = input(false);

  /** Unique ID for the label element used by aria-labelledby. */
  readonly labelId = `ngcc-contained-list-${NgccContainedList.count++}-header`;

  readonly classes = computed(() => {
    const kind = this.kind();
    const size = this.size();
    const isInset = this.isInset();

    const cls = ['cds--contained-list', `cds--contained-list--${kind}`];
    if (isInset) cls.push('cds--contained-list--inset-rulers');
    if (size) {
      cls.push(`cds--contained-list--${size}`);
      cls.push(`cds--layout--size-${size}`);
    }
    return cls.join(' ');
  });
}
