import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccIconNameType } from '../ngcc-icons/icons';
import { NgccLinkSize, NgccLinkTarget, NgccLinkAriaCurrent } from './ngcc-link.types';

@Component({
  selector: 'ngcc-link',
  standalone: true,
  imports: [NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-link.html',
})
export class NgccLink {
  @Input() href = '';
  @Input() target: NgccLinkTarget = '_self';
  @Input() rel = '';
  @Input() disabled = false;
  @Input() inline = false;
  @Input() size: NgccLinkSize = 'md';
  @Input() visited = false;
  @Input() iconName: NgccIconNameType | undefined = undefined;
  @Input() ariaLabel: string | undefined = undefined;
  @Input() ariaCurrent: NgccLinkAriaCurrent | undefined = undefined;
  @Input() className = '';

  @Output() linkClick = new EventEmitter<MouseEvent>();

  get classes(): string {
    const sizeMap: Record<NgccLinkSize, string> = {
      sm: 'cds--link--sm',
      md: '',
      lg: 'cds--link--lg',
    };

    return [
      'cds--link',
      sizeMap[this.size],
      this.inline ? 'cds--link--inline' : '',
      this.visited ? 'cds--link--visited' : '',
      this.disabled ? 'cds--link--disabled' : '',
      this.className,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get resolvedRel(): string | null {
    if (this.target === '_blank') {
      const parts = new Set(this.rel ? this.rel.split(' ') : []);
      parts.add('noopener');
      parts.add('noreferrer');
      return Array.from(parts).join(' ');
    }
    return this.rel || null;
  }

  get resolvedTabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.linkClick.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    // Enter activates link; Space is intentionally NOT handled (native scroll behavior)
    if (event.key === 'Enter') {
      (event.target as HTMLElement).click();
    }
  }
}
