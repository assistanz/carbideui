import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';
import { NgccToggleSize } from './ngcc-toggle.types';

@Component({
  selector: 'ngcc-toggle',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-toggle.html',
  host: {
    '[class]': 'hostClasses',
  },
})
export class NgccToggle implements OnChanges {
  private static idCounter = 0;
  readonly toggleId = `ngcc-toggle-${NgccToggle.idCounter++}`;

  @Input() toggled = false;
  @Input() disabled = false;
  @Input() readOnly = false;
  @Input() skeleton = false;
  @Input() hideLabel = false;
  @Input() size: NgccToggleSize = 'md';
  @Input() labelText = '';
  @Input() labelA = 'Off';
  @Input() labelB = 'On';
  @Input() ariaLabel: string | undefined = undefined;
  @Input() ariaLabelledBy: string | undefined = undefined;
  @Input() className = '';

  @Output() toggledChange = new EventEmitter<boolean>();

  // Internal state — tracks current on/off
  private readonly _isToggled = signal(false);

  constructor() {
    // initial sync handled in ngOnChanges
  }

  // Computed: current side label (Off / On)
  get sideLabel(): string {
    return this._isToggled() ? this.labelB : this.labelA;
  }

  // Computed: host wrapper classes
  // cds--form-item is excluded when skeleton=true (matches Carbon Angular behavior)
  get hostClasses(): string {
    return [
      this.skeleton ? '' : 'cds--form-item',
      'cds--toggle',
      this.disabled ? 'cds--toggle--disabled' : '',
      this.readOnly ? 'cds--toggle--readonly' : '',
      this.skeleton ? 'cds--toggle--skeleton' : '',
      this.className,
    ]
      .filter(Boolean)
      .join(' ');
  }

  // Computed: appearance classes (track)
  get appearanceClasses(): string {
    return ['cds--toggle__appearance', this.size === 'sm' ? 'cds--toggle__appearance--sm' : '']
      .filter(Boolean)
      .join(' ');
  }

  // Computed: switch classes (knob)
  get switchClasses(): string {
    return ['cds--toggle__switch', this._isToggled() ? 'cds--toggle__switch--checked' : '']
      .filter(Boolean)
      .join(' ');
  }

  // Computed: aria-checked value for the button
  get ariaChecked(): boolean {
    return this._isToggled();
  }

  // Computed: tabindex — readOnly stays focusable; disabled is removed
  get resolvedTabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  // Computed: effective aria-labelledby — prefer explicit, fallback to generated label id
  get resolvedAriaLabelledBy(): string {
    return this.ariaLabelledBy ?? `${this.toggleId}-label`;
  }

  // Computed: show checkmark only for sm size, when on, and not readOnly
  get showCheckmark(): boolean {
    return this.size === 'sm' && this._isToggled() && !this.readOnly;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toggled']) {
      this._isToggled.set(!!changes['toggled'].currentValue);
    }
  }

  // Toggle handler — called by button click
  onToggle(): void {
    if (this.disabled || this.readOnly) return;
    const next = !this._isToggled();
    this._isToggled.set(next);
    this.toggledChange.emit(next);
  }

  // Keyboard handler — Space and Enter both toggle the switch
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled || this.readOnly) {
      event.preventDefault();
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.onToggle();
    }
  }
}
