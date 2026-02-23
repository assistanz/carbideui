import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgccNotificationConfig } from './ngcc-notification.types';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccIconNameType } from '../ngcc-icons/icons';

@Component({
  selector: 'ngcc-notification',
  standalone: true,
  imports: [NgccIcon],
  templateUrl: './ngcc-notification.html',
  styleUrls: ['./ngcc-notification.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccNotification implements OnChanges {
  @Input() cfg: NgccNotificationConfig | undefined = undefined;
  @Output() closed = new EventEmitter<string>();

  // Internal state signals
  private readonly _cfg = signal<NgccNotificationConfig | undefined>(undefined);
  protected readonly isVisible = signal(true);
  private readonly timeoutSig = computed(() => this._cfg()?.timeout ?? 0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cfg']) {
      this._cfg.set(changes['cfg'].currentValue ?? undefined);
    }
  }

  constructor() {
    effect(() => {
      const tm = this.timeoutSig();
      if (!(this.isVisible() && tm > 0)) return;
      const id = setTimeout(() => this.close(), tm);
      return () => clearTimeout(id);
    });
  }

  readonly role = computed(() => {
    const type = this._cfg()?.type;
    return type === 'error' || type === 'warning' ? 'alert' : 'status';
  });

  readonly ariaLive = computed(() => {
    const type = this._cfg()?.type;
    return type === 'error' || type === 'warning' ? 'assertive' : 'polite';
  });

  /** Determine icon name (custom or type-based) */
  readonly iconName = computed<NgccIconNameType>(() => {
    const config = this._cfg();

    if (config?.icon) return config.icon as NgccIconNameType;

    switch (config?.type) {
      case 'error':
        return 'error_filled';
      case 'warning':
        return 'warning_filled';
      case 'success':
        return 'success_filled';
      default:
        return 'info_filled';
    }
  });

  close(): void {
    const id = this._cfg()?.id;
    this.isVisible.set(false);
    if (id) this.closed.emit(id);
  }

  onAction(): void {
    const action = this._cfg()?.action;
    if (action) {
      try {
        action();
      } catch (e) {
        console.error('Notification action failed', e);
      }
    }
    this.close();
  }
}
