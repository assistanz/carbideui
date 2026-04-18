import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccIconNameType } from '../ngcc-icons/icons';

@Component({
  selector: 'ngcc-contained-list-item',
  standalone: true,
  imports: [NgccIcon],
  templateUrl: './ngcc-contained-list-item.html',
  styleUrls: ['./ngcc-contained-list-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    role: 'listitem',
  },
})
export class NgccContainedListItem {
  /** Whether this item is disabled (only applies when clickable). */
  readonly disabled = input(false);

  /** Whether this item is clickable — renders a <button> as the content wrapper. */
  readonly clickable = input(false);

  /** Optional icon name to display before the item content. */
  readonly iconName = input<NgccIconNameType | undefined>(undefined);

  /** Whether an action element has been projected via [ngccContainedListItemAction]. */
  readonly hasAction = input(false);

  /** Emits when a clickable item is activated. */
  readonly clicked = output<void>();

  readonly classes = computed(() => {
    const cls = ['cds--contained-list-item'];
    if (this.clickable()) cls.push('cds--contained-list-item--clickable');
    if (this.iconName()) cls.push('cds--contained-list-item--with-icon');
    if (this.hasAction()) cls.push('cds--contained-list-item--with-action');
    return cls.join(' ');
  });

  onContentClick(): void {
    if (this.clickable() && !this.disabled()) {
      this.clicked.emit();
    }
  }

  onKeydown(event: Event): void {
    if (this.clickable() && !this.disabled()) {
      event.preventDefault();
      this.clicked.emit();
    }
  }
}
