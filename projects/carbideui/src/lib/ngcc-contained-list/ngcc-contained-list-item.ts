import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
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
    '[class]': 'classes',
    role: 'listitem',
  },
})
export class NgccContainedListItem {
  /** Whether this item is disabled (only applies when clickable). */
  @Input() disabled = false;

  /** Whether this item is clickable — renders a <button> as the content wrapper. */
  @Input() clickable = false;

  /** Optional icon name to display before the item content. */
  @Input() iconName?: NgccIconNameType;

  /** Whether an action element has been projected via [ngccContainedListItemAction]. */
  @Input() hasAction = false;

  /** Emits when a clickable item is activated. */
  @Output() clicked = new EventEmitter<void>();

  get classes(): string {
    const cls = ['cds--contained-list-item'];
    if (this.clickable) cls.push('cds--contained-list-item--clickable');
    if (this.iconName) cls.push('cds--contained-list-item--with-icon');
    if (this.hasAction) cls.push('cds--contained-list-item--with-action');
    return cls.join(' ');
  }

  onContentClick(): void {
    if (this.clickable && !this.disabled) {
      this.clicked.emit();
    }
  }

  onKeydown(event: Event): void {
    if (this.clickable && !this.disabled) {
      event.preventDefault();
      this.clicked.emit();
    }
  }
}
