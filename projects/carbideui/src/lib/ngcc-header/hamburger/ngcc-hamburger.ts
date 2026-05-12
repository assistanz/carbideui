import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { NgccButton } from '../../ngcc-button/ngcc-button';

/**
 * Hamburger / close toggle button for side-nav.
 *
 * Two-way bindable via [(active)]:
 *   <ngcc-hamburger [(active)]="sideNavOpen" />
 */
@Component({
  selector: 'ngcc-hamburger',
  standalone: true,
  imports: [NgccButton],
  templateUrl: './ngcc-hamburger.html',
  styleUrls: ['./ngcc-hamburger.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccHamburger implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['label']) this._label.set(changes['label'].currentValue ?? 'Open navigation menu');
    if (changes['labelClose'])
      this._labelClose.set(changes['labelClose'].currentValue ?? 'Close navigation menu');
    if (changes['active']) {
      this._active.set(changes['active'].currentValue ?? false);
    }
  }

  /** Two-way bindable open/close state — use [(active)]="myVar" in parent */
  @Input() active = false;
  @Output() activeChange = new EventEmitter<boolean>();
  private readonly _active = signal(false);

  @Input() label = 'Open navigation menu';
  private readonly _label = signal('Open navigation menu');

  @Input() labelClose = 'Close navigation menu';
  private readonly _labelClose = signal('Close navigation menu');

  readonly currentLabel = computed(() => (this._active() ? this._labelClose() : this._label()));

  toggle(): void {
    this._active.update((v) => !v);
    this.activeChange.emit(this._active());
  }
}
