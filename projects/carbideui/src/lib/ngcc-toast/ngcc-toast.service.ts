import { Injectable, signal, computed } from '@angular/core';
import { NgccToastConfig } from './ngcc-toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  // internal storage of toasts (newest first)
  private readonly _toasts = signal<NgccToastConfig[]>([]);
  readonly toasts = computed(() => this._toasts());

  private nextId = 1;

  // configuration
  maxVisible = 5;

  show(config: Partial<NgccToastConfig>): string {
    const id = config.id ?? `toast-${this.nextId++}`;
    const full: NgccToastConfig = {
      id,
      type: config.type ?? 'info',
      title: config.title ?? 'Notification',
      timeout: config.timeout ?? 5000,
      showClose: config.showClose ?? true,
      lowContrast: config.lowContrast ?? false,
      ...config,
    };

    const exists = this._toasts().some(
      (t) => t.title === full.title && t.subtitle === full.subtitle,
    );

    if (exists) {
      this._toasts.update((arr) => {
        const filtered = arr.filter(
          (t) => !(t.title === full.title && t.subtitle === full.subtitle),
        );
        return [full, ...filtered];
      });
    } else {
      this._toasts.update((arr) => [full, ...arr]);
    }

    this.trimToMax();
    return id;
  }

  remove(id: string): void {
    this._toasts.update((arr) => arr.filter((t) => t.id !== id));
  }

  clearAll(): void {
    this._toasts.set([]);
  }

  private trimToMax(): void {
    const arr = this._toasts();
    if (arr.length <= this.maxVisible) return;
    const kept = arr.slice(0, this.maxVisible);
    this._toasts.set(kept);
  }
}
