import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  PLATFORM_ID,
  TemplateRef,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgccEmptyState } from '../ngcc-empty-state/ngcc-empty-state';
import type { NgccIconNameType } from '../ngcc-icons/icons';

/**
 * Marks an `<ng-template>` that renders a leading visual (icon, avatar) for every item:
 * `<ng-template ngccNotificationLeading let-item>…</ng-template>`.
 */
@Directive({ selector: 'ng-template[ngccNotificationLeading]', standalone: true })
export class NgccNotificationLeadingDirective {
  readonly template = inject<TemplateRef<{ $implicit: NgccNotificationItem }>>(TemplateRef);
}

export type NgccNotificationSeverity = 'info' | 'success' | 'warning' | 'error';
export type NgccNotificationEmptyIcon = NgccIconNameType | undefined;

/** Every fixed string of the list. Pass a partial object to translate; the rest stays English. */
export interface NgccNotificationListLabels {
  markAllRead: string;
  clearAll: string;
  /** Screen-reader prefix of an unread item. */
  unread: string;
  /** Accessible name of the unread badge. `{count}` is replaced by the number. */
  unreadCount: string;
  /** Accessible name of an item's dismiss button. `{title}` is replaced by the item title. */
  dismiss: string;
  severityInfo: string;
  severitySuccess: string;
  severityWarning: string;
  severityError: string;
  markRead: string;
  loading: string;
  errorTitle: string;
  errorDescription: string;
  /** Banner when a refresh failed but the last list is still shown. */
  staleError: string;
  retry: string;
  emptyTitle: string;
  loadMore: string;
  /** Live announcement for new arrivals. `{count}` is replaced by the number. */
  newNotifications: string;
  groupToday: string;
  groupYesterday: string;
}

export const NGCC_NOTIFICATION_LIST_LABELS: NgccNotificationListLabels = {
  markAllRead: 'Mark all read',
  clearAll: 'Clear all',
  unread: 'Unread',
  unreadCount: '{count} unread',
  dismiss: 'Dismiss {title}',
  severityInfo: 'Information',
  severitySuccess: 'Success',
  severityWarning: 'Warning',
  severityError: 'Error',
  markRead: 'Mark as read',
  loading: 'Loading notifications',
  errorTitle: 'Could not load notifications',
  errorDescription: 'Check your connection and try again.',
  staleError: 'Could not refresh. Showing the last list.',
  retry: 'Retry',
  emptyTitle: 'No notifications',
  loadMore: 'Load more',
  newNotifications: '{count} new notifications',
  groupToday: 'Today',
  groupYesterday: 'Yesterday',
};

const SEVERITY_ICON: Record<NgccNotificationSeverity, string[]> = {
  info: [
    'M17 22v-8h-4v2h2v6h-3v2h8v-2h-3zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8z',
    'M16 30a14 14 0 1 1 14-14 14 14 0 0 1-14 14zm0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4z',
  ],
  success: [
    'M14 21.5l-5-4.96L10.59 15 14 18.35 21.41 11 23 12.58l-9 8.92z',
    'M16 30a14 14 0 1 1 14-14 14 14 0 0 1-14 14zm0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4z',
  ],
  warning: [
    'M16 23a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 23zm-1-11h2v9h-2z',
    'M29 30H3a1 1 0 0 1-.89-1.45l13-26a1 1 0 0 1 1.78 0l13 26A1 1 0 0 1 29 30zM4.62 28h22.76L16 5.24z',
  ],
  error: [
    'M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm5.4 21L16 17.6 10.6 23 9 21.4l5.4-5.4L9 10.6 10.6 9l5.4 5.4L21.4 9l1.6 1.6-5.4 5.4 5.4 5.4z',
  ],
};

export interface NgccNotificationItem {
  id: string | number;
  title: string;
  message?: string;
  /** Pre-formatted display text, e.g. "5 min ago". Used when `time` is not set. */
  timestamp?: string;
  /**
   * Machine-readable time (Date, ISO string or epoch ms). Rendered as `<time datetime>` with a relative
   * text in the active language ("5 minutes ago"), and used for day grouping.
   */
  time?: Date | string | number;
  /** Link target. The item renders as an anchor; `itemClicked` still fires. */
  href?: string;
  /** Router link commands. Takes precedence over `href`. */
  routerLink?: string | readonly unknown[];
  read?: boolean;
  severity?: NgccNotificationSeverity;
}

/**
 * Notification list sized for `ngcc-header-panel` (fills its width).
 * Stateless: the parent owns `items` and updates them in response to
 * `markRead`, `markAllRead`, `clear`, `dismissed` and `itemClicked`.
 *
 * - Every string can be translated through `labels`.
 * - Header actions collapse to icon only in narrow containers.
 * - Severity is shown with an icon and hidden text, never by color alone; unread items also get a dot and
 *   a heavier title.
 * - States: `loading` (skeleton rows), `error` (with `retry`; if items exist they stay visible with a
 *   "could not refresh" notice), and an empty state.
 * - `time` gives relative times in the current language, `<time datetime>` and optional day grouping.
 * - Project `[ngccNotificationFooter]` for a footer; use `hasMore` and `loadMore` for incremental loading.
 */
@Component({
  selector: 'ngcc-notification-list',
  standalone: true,
  imports: [NgTemplateOutlet, NgccEmptyState, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  styleUrl: './ngcc-notification-list.scss',
  template: `
    <div class="ngcc-notif__header">
      <h2 class="ngcc-notif__heading">
        {{ heading() }}
        @if (unreadCount() > 0) {
          <span
            [class]="'ngcc-notif__count ngcc-notif__count--' + countVariant()"
            [attr.aria-label]="unreadCountLabel()"
            >{{ unreadCount() }}</span
          >
        }
      </h2>
      <div class="ngcc-notif__actions">
        <button
          type="button"
          class="ngcc-notif__link"
          [disabled]="unreadCount() === 0"
          [attr.title]="text().markAllRead"
          (click)="markAllRead.emit()"
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M13 24l-9-9 1.414-1.414L13 21.171 26.586 7.586 28 9 13 24z"></path>
          </svg>
          <span class="ngcc-notif__link-text">{{ text().markAllRead }}</span>
        </button>
        <button
          type="button"
          class="ngcc-notif__link"
          [disabled]="items().length === 0"
          [attr.title]="text().clearAll"
          (click)="clear.emit()"
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M12 12h2v12h-2zM18 12h2v12h-2z"></path>
            <path
              d="M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6zm4 22V8h16v20zM12 2h8v2h-8z"
            ></path>
          </svg>
          <span class="ngcc-notif__link-text">{{ text().clearAll }}</span>
        </button>
      </div>
    </div>

    <div class="cds--visually-hidden" aria-live="polite" role="status">{{ announcement() }}</div>

    @if (error() && items().length) {
      <div class="ngcc-notif__stale" role="status">
        <span>{{ text().staleError }}</span>
        <button type="button" class="ngcc-notif__link" (click)="retry.emit()">
          {{ text().retry }}
        </button>
      </div>
    }

    @if (loading() && !items().length) {
      <div class="ngcc-notif__skeletons" role="status" [attr.aria-label]="text().loading">
        @for (n of skeletonRows; track n) {
          <div class="ngcc-notif__skeleton">
            <span class="ngcc-notif__bar ngcc-notif__bar--title"></span>
            <span class="ngcc-notif__bar"></span>
            <span class="ngcc-notif__bar ngcc-notif__bar--short"></span>
          </div>
        }
      </div>
    } @else if (error() && !items().length) {
      <ngcc-empty-state
        size="sm"
        icon="error_filled"
        [title]="text().errorTitle"
        [description]="errorText()"
      >
        <button
          ngccEmptyAction
          type="button"
          class="cds--btn cds--btn--sm cds--btn--tertiary"
          (click)="retry.emit()"
        >
          {{ text().retry }}
        </button>
      </ngcc-empty-state>
    } @else if (items().length) {
      @for (group of groups(); track group.key) {
        @if (group.label) {
          <h3 class="ngcc-notif__group">{{ group.label }}</h3>
        }
        <ul class="ngcc-notif__list">
          @for (item of group.items; track item.id) {
            <li
              [class]="
                'ngcc-notif__item ngcc-notif__item--' +
                (item.severity ?? 'info') +
                (item.read ? ' ngcc-notif__item--read' : '')
              "
            >
              @if (leading(); as lead) {
                <span class="ngcc-notif__leading">
                  <ng-container
                    [ngTemplateOutlet]="lead.template"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </span>
              }
              @if (item.routerLink) {
                <a
                  class="ngcc-notif__main"
                  [routerLink]="item.routerLink"
                  (click)="itemClicked.emit(item)"
                  ><ng-container
                    [ngTemplateOutlet]="content"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                /></a>
              } @else if (item.href) {
                <a class="ngcc-notif__main" [attr.href]="item.href" (click)="itemClicked.emit(item)"
                  ><ng-container
                    [ngTemplateOutlet]="content"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                /></a>
              } @else {
                <button type="button" class="ngcc-notif__main" (click)="itemClicked.emit(item)">
                  <ng-container
                    [ngTemplateOutlet]="content"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </button>
              }
              <span class="ngcc-notif__item-actions">
                @if (!item.read) {
                  <button
                    type="button"
                    class="ngcc-notif__icon-btn"
                    [attr.aria-label]="markReadLabel(item)"
                    [attr.title]="text().markRead"
                    (click)="markRead.emit(item)"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M13 24l-9-9 1.414-1.414L13 21.171 26.586 7.586 28 9 13 24z"></path>
                    </svg>
                  </button>
                }
                <button
                  type="button"
                  class="ngcc-notif__icon-btn ngcc-notif__dismiss"
                  [attr.aria-label]="dismissLabel(item)"
                  (click)="dismissed.emit(item)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M24 9.4 22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16z"
                    ></path>
                  </svg>
                </button>
              </span>
            </li>
          }
        </ul>
      }
      @if (hasMore()) {
        <div class="ngcc-notif__more">
          <button type="button" class="ngcc-notif__link" (click)="loadMore.emit()">
            {{ text().loadMore }}
          </button>
        </div>
      }
    } @else {
      <ngcc-empty-state
        size="sm"
        [icon]="emptyIcon()"
        [title]="emptyTitle() || text().emptyTitle"
        [description]="emptyDescription() || emptyText()"
      >
        <span ngccEmptyAction><ng-content select="[ngccNotificationEmptyAction]" /></span>
      </ngcc-empty-state>
    }

    <div class="ngcc-notif__footer"><ng-content select="[ngccNotificationFooter]" /></div>

    <ng-template #content let-item>
      <span class="ngcc-notif__title-row">
        @if (!item.read) {
          <span class="ngcc-notif__dot" aria-hidden="true"></span>
        }
        <svg
          class="ngcc-notif__severity"
          width="16"
          height="16"
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden="true"
        >
          @for (d of iconPaths(item); track $index) {
            <path [attr.d]="d"></path>
          }
        </svg>
        <span class="cds--visually-hidden">{{ severityLabel(item) }}. </span>
        @if (!item.read) {
          <span class="cds--visually-hidden">{{ text().unread }}: </span>
        }
        <span class="ngcc-notif__title">{{ item.title }}</span>
      </span>
      @if (item.message) {
        <span
          class="ngcc-notif__message"
          [class.ngcc-notif__message--clamped]="messageLines() > 0"
          [style.--ngcc-notif-lines]="messageLines() || null"
          [attr.title]="messageLines() > 0 ? item.message : null"
          >{{ item.message }}</span
        >
      }
      @if (timeOf(item); as t) {
        <time class="ngcc-notif__time" [attr.datetime]="t.iso">{{ t.text }}</time>
      } @else if (item.timestamp) {
        <span class="ngcc-notif__time">{{ item.timestamp }}</span>
      }
    </ng-template>
  `,
})
export class NgccNotificationList {
  readonly items = input<NgccNotificationItem[]>([]);
  readonly heading = input('Notifications');
  /** Description of the empty state (kept for compatibility; see `emptyDescription`). */
  readonly emptyText = input("You're all caught up");
  readonly emptyTitle = input('');
  readonly emptyDescription = input('');
  readonly emptyIcon = input<NgccNotificationEmptyIcon>('notification');
  /** Override any of the fixed strings (translation). Missing keys keep their English default. */
  readonly labels = input<Partial<NgccNotificationListLabels>>({});

  /** Show skeleton rows while the first load runs. */
  readonly loading = input(false);
  /** A failed load or refresh. A string is used as the message. Pair with `(retry)`. */
  readonly error = input<boolean | string>(false);
  /** `day` groups by Today / Yesterday / date, using each item's `time`. */
  readonly groupBy = input<'none' | 'day'>('none');
  /** BCP 47 tag for relative times and group dates. Defaults to the page language. */
  readonly locale = input<string | undefined>(undefined);
  /** Clamp messages to this many lines (full text stays in a tooltip). 0 = no clamp. */
  readonly messageLines = input(0);
  /** Unread badge style: `error` (red) or `neutral`. */
  readonly countVariant = input<'error' | 'neutral'>('error');
  /** Announce new arrivals in a polite live region. */
  readonly announceNew = input(false);
  /** Show a "Load more" button. */
  readonly hasMore = input(false);

  readonly itemClicked = output<NgccNotificationItem>();
  readonly dismissed = output<NgccNotificationItem>();
  readonly markRead = output<NgccNotificationItem>();
  readonly markAllRead = output<void>();
  readonly clear = output<void>();
  readonly retry = output<void>();
  readonly loadMore = output<void>();

  protected readonly leading = contentChild(NgccNotificationLeadingDirective);
  protected readonly skeletonRows = [1, 2, 3];
  protected readonly announcement = signal('');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly now = signal(Date.now());
  private knownIds: Set<string | number> | null = null;

  constructor() {
    if (this.isBrowser) {
      const timer = setInterval(() => this.now.set(Date.now()), 60_000);
      inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
    effect(() => {
      const items = this.items();
      const ids = new Set(items.map((i) => i.id));
      const previous = this.knownIds;
      this.knownIds = ids;
      if (!this.announceNew() || !previous) return;
      const fresh = items.filter((i) => !previous.has(i.id) && !i.read).length;
      this.announcement.set(
        fresh > 0 ? this.text().newNotifications.replace('{count}', String(fresh)) : '',
      );
    });
  }

  protected readonly text = computed<NgccNotificationListLabels>(() => ({
    ...NGCC_NOTIFICATION_LIST_LABELS,
    ...this.labels(),
  }));

  protected readonly unreadCount = computed(() => this.items().filter((i) => !i.read).length);

  protected readonly unreadCountLabel = computed(() =>
    this.text().unreadCount.replace('{count}', String(this.unreadCount())),
  );

  protected readonly errorText = computed(() => {
    const e = this.error();
    return typeof e === 'string' && e ? e : this.text().errorDescription;
  });

  private readonly lang = computed(() => {
    const explicit = this.locale();
    if (explicit) return explicit;
    return (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  });

  /** Items split into day groups (one unlabeled group when not grouping). */
  protected readonly groups = computed(() => {
    const items = this.items();
    if (this.groupBy() !== 'day') return [{ key: 'all', label: '', items }];
    const groups: { key: string; label: string; items: NgccNotificationItem[] }[] = [];
    for (const item of items) {
      const date = toDate(item.time);
      const key = date ? dayKey(date) : 'none';
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, label: date ? this.dayLabel(date) : '', items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  });

  protected timeOf(item: NgccNotificationItem): { iso: string; text: string } | null {
    const date = toDate(item.time);
    if (!date) return null;
    return { iso: date.toISOString(), text: this.relative(date) };
  }

  private relative(date: Date): string {
    const seconds = Math.round((date.getTime() - this.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(this.lang(), { numeric: 'auto' });
    const abs = Math.abs(seconds);
    if (abs < 45) return rtf.format(0, 'second');
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
    if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), 'hour');
    if (abs < 7 * 86_400) return rtf.format(Math.round(seconds / 86_400), 'day');
    return new Intl.DateTimeFormat(this.lang(), { dateStyle: 'medium' }).format(date);
  }

  private dayLabel(date: Date): string {
    const today = new Date(this.now());
    const startOf = (d: Date): number =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = Math.round((startOf(today) - startOf(date)) / 86_400_000);
    if (diff === 0) return this.text().groupToday;
    if (diff === 1) return this.text().groupYesterday;
    return new Intl.DateTimeFormat(this.lang(), { dateStyle: 'medium' }).format(date);
  }

  protected iconPaths(item: NgccNotificationItem): string[] {
    return SEVERITY_ICON[item.severity ?? 'info'];
  }

  protected severityLabel(item: NgccNotificationItem): string {
    const t = this.text();
    switch (item.severity ?? 'info') {
      case 'success':
        return t.severitySuccess;
      case 'warning':
        return t.severityWarning;
      case 'error':
        return t.severityError;
      default:
        return t.severityInfo;
    }
  }

  protected dismissLabel(item: NgccNotificationItem): string {
    return this.text().dismiss.replace('{title}', item.title);
  }

  protected markReadLabel(item: NgccNotificationItem): string {
    return `${this.text().markRead}: ${item.title}`;
  }
}

function toDate(value: Date | string | number | undefined): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
