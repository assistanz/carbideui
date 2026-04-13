import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  effect,
} from '@angular/core';
import { NgccToggleSize } from './ngcc-toggle.types';

@Component({
  selector: 'ngcc-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-toggle.html',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class NgccToggle {
  private static idCounter = 0;
  readonly toggleId = `ngcc-toggle-${NgccToggle.idCounter++}`;

  // Signal inputs — no @Input() decorator
  readonly toggled = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readOnly = input<boolean>(false);
  readonly skeleton = input<boolean>(false);
  readonly hideLabel = input<boolean>(false);
  readonly size = input<NgccToggleSize>('md');
  readonly labelText = input<string>('');
  readonly labelA = input<string>('Off');
  readonly labelB = input<string>('On');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly className = input<string>('');

  // Output
  readonly toggledChange = output<boolean>();

  // Internal state — tracks current on/off
  private readonly _isToggled = signal(false);

  constructor() {
    // Sync controlled toggled input → internal state
    effect(() => {
      this._isToggled.set(this.toggled());
    });
  }

  // Computed: current side label (Off / On)
  readonly sideLabel = computed(() => (this._isToggled() ? this.labelB() : this.labelA()));

  // Computed: host wrapper classes
  // cds--form-item is excluded when skeleton=true (matches Carbon Angular behavior)
  readonly hostClasses = computed(() =>
    [
      this.skeleton() ? '' : 'cds--form-item',
      'cds--toggle',
      this.disabled() ? 'cds--toggle--disabled' : '',
      this.readOnly() ? 'cds--toggle--readonly' : '',
      this.skeleton() ? 'cds--toggle--skeleton' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  // Computed: appearance classes (track)
  readonly appearanceClasses = computed(() =>
    ['cds--toggle__appearance', this.size() === 'sm' ? 'cds--toggle__appearance--sm' : '']
      .filter(Boolean)
      .join(' '),
  );

  // Computed: switch classes (knob)
  readonly switchClasses = computed(() =>
    ['cds--toggle__switch', this._isToggled() ? 'cds--toggle__switch--checked' : '']
      .filter(Boolean)
      .join(' '),
  );

  // Computed: aria-checked value for the button
  readonly ariaChecked = computed(() => this._isToggled());

  // Computed: tabindex — readOnly stays focusable; disabled is removed
  readonly resolvedTabIndex = computed(() => (this.disabled() ? -1 : 0));

  // Computed: effective aria-labelledby — prefer explicit, fallback to generated label id
  readonly resolvedAriaLabelledBy = computed(
    () => this.ariaLabelledBy() ?? `${this.toggleId}-label`,
  );

  // Computed: show checkmark only for sm size, when on, and not readOnly
  readonly showCheckmark = computed(
    () => this.size() === 'sm' && this._isToggled() && !this.readOnly(),
  );

  // Toggle handler — called by button click
  onToggle(): void {
    if (this.disabled() || this.readOnly()) return;
    const next = !this._isToggled();
    this._isToggled.set(next);
    this.toggledChange.emit(next);
  }

  // Keyboard handler — Space and Enter both toggle the switch
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readOnly()) {
      event.preventDefault();
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.onToggle();
    }
  }
}
