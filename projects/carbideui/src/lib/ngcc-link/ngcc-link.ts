import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input, computed, output } from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccIconNameType } from '../ngcc-icons/icons';
import { NgccLinkSize, NgccLinkTarget, NgccLinkAriaCurrent } from './ngcc-link.types';

@Component({
  selector: 'ngcc-link',
  standalone: true,
  imports: [CommonModule, NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-link.html',
})
export class NgccLink {
  // Inputs (signal-based — no @Input decorator)
  readonly href = input<string>('');
  readonly target = input<NgccLinkTarget>('_self');
  readonly rel = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly inline = input<boolean>(false);
  readonly size = input<NgccLinkSize>('md');
  readonly visited = input<boolean>(false);
  readonly iconName = input<NgccIconNameType | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaCurrent = input<NgccLinkAriaCurrent | undefined>(undefined);
  readonly className = input<string>('');

  // Output
  readonly linkClick = output<MouseEvent>();

  // Computed: all CSS classes
  readonly classes = computed(() => {
    const sizeMap: Record<NgccLinkSize, string> = {
      sm: 'cds--link--sm',
      md: '',
      lg: 'cds--link--lg',
    };

    return [
      'cds--link',
      sizeMap[this.size()],
      this.inline() ? 'cds--link--inline' : '',
      this.visited() ? 'cds--link--visited' : '',
      this.disabled() ? 'cds--link--disabled' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  // Computed: auto-add noopener noreferrer when target="_blank"
  readonly resolvedRel = computed<string | null>(() => {
    if (this.target() === '_blank') {
      const parts = new Set(this.rel() ? this.rel().split(' ') : []);
      parts.add('noopener');
      parts.add('noreferrer');
      return Array.from(parts).join(' ');
    }
    return this.rel() || null;
  });

  // Computed: tabindex — removed from tab order when disabled
  readonly resolvedTabIndex = computed(() => (this.disabled() ? -1 : 0));

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.linkClick.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    // Enter activates link; Space is intentionally NOT handled (native scroll behavior)
    if (event.key === 'Enter') {
      (event.target as HTMLElement).click();
    }
  }
}
