import { Injectable, signal, computed } from '@angular/core';
import { NgccNotificationConfig } from './ngcc-notification.types';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // internal storage of notifications (newest first)
  private readonly _notifications = signal<NgccNotificationConfig[]>([]);
  readonly notifications = computed(() => this._notifications());

  private nextId = 1;

  // configuration
  maxVisible = 5;

  show(config: Partial<NgccNotificationConfig>): string {
    const id = config.id ?? `notification-${this.nextId++}`;
    const full: NgccNotificationConfig = {
      id,
      type: config.type ?? 'info',
      title: config.title ?? 'Notification',
      timeout: config.timeout ?? 5000,
      showClose: config.showClose ?? true,
      lowContrast: config.lowContrast ?? false,
      ...config,
    };

    const exists = this._notifications().some(
      (t) => t.title === full.title && t.subtitle === full.subtitle,
    );

    if (exists) {
      this._notifications.update((arr) => {
        const filtered = arr.filter(
          (t) => !(t.title === full.title && t.subtitle === full.subtitle),
        );
        return [full, ...filtered];
      });
    } else {
      this._notifications.update((arr) => [full, ...arr]);
    }

    this.trimToMax();
    return id;
  }

  remove(id: string): void {
    this._notifications.update((arr) => arr.filter((t) => t.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
  }

  private trimToMax(): void {
    const arr = this._notifications();
    if (arr.length <= this.maxVisible) return;
    const kept = arr.slice(0, this.maxVisible);
    this._notifications.set(kept);
  }
}
