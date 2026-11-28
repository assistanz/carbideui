import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { NGCC_CONTENT_SWITCHER } from './ngcc-content-switcher.token';

@Component({
  selector: 'ngcc-content-switcher-option',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    class="cds--content-switcher-btn"
    [class.cds--content-switcher--selected]="active()"
    role="tab"
    [attr.aria-selected]="active()"
    [attr.tabindex]="active() ? 0 : -1"
    (click)="handleClick($event)"
    (focus)="handleFocus($event)"
  >
    <span class="cds--content-switcher__label"><ng-content></ng-content></span>
  </button>`,
})
export class NgccContentSwitcherOption {
  readonly name = input('option');
  readonly active = signal(false);
  readonly selectionMode = signal<'automatic' | 'manual'>('automatic');

  readonly selected = output<boolean>();
  readonly clicked = output<MouseEvent>();
  readonly focused = output<FocusEvent>();

  private readonly switcher = inject(NGCC_CONTENT_SWITCHER, { optional: true });

  handleClick(event: MouseEvent): void {
    this.clicked.emit(event);
    if (this.active()) return;

    if (this.switcher) {
      this.switcher.selectOption(this);
    } else {
      this.active.set(true);
    }
    this.selected.emit(true);
  }

  handleFocus(event: FocusEvent): void {
    this.focused.emit(event);
    if (this.active()) return;
    if (this.selectionMode() === 'manual') return;

    if (this.switcher) {
      this.switcher.selectOption(this);
    } else {
      this.active.set(true);
    }
    this.selected.emit(true);
  }
}
