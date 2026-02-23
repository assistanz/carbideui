import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './ngcc-notification.service';
import { NgccNotification } from './ngcc-notification';

@Component({
  selector: 'ngcc-notification-container',
  standalone: true,
  imports: [CommonModule, NgccNotification],
  template: `
    <div class="cds--notification-notification-container" role="region" aria-live="polite">
      @for (t of notifications(); track t.id) {
        <ngcc-notification [cfg]="t" (closed)="onClosed($event)"></ngcc-notification>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccNotificationContainer {
  private readonly notificationSvc = inject(NotificationService);
  readonly notifications = this.notificationSvc.notifications;

  constructor() {
    // trigger effect to keep signal reactive
    effect(() => {
      this.notifications();
    });
  }

  onClosed(id: string): void {
    this.notificationSvc.remove(id);
  }
}
