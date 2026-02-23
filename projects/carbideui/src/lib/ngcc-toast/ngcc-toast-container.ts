import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './ngcc-toast.service';
import { NgccToast } from './ngcc-toast';

@Component({
  selector: 'ngcc-toast-container',
  standalone: true,
  imports: [CommonModule, NgccToast],
  template: ` <div class="cds--toast-notification-container" role="region" aria-live="polite">
    @for (t of toasts(); track t.id) {
      <ngcc-toast [cfg]="t" (closed)="onClosed($event)"></ngcc-toast>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccToastContainer {
  private readonly toastSvc = inject(ToastService);
  readonly toasts = this.toastSvc.toasts;

  constructor() {
    // trigger effect to keep signal reactive
    effect(() => {
      this.toasts();
    });
  }

  onClosed(id: string): void {
    this.toastSvc.remove(id);
  }
}
