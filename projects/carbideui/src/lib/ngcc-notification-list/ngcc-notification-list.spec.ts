import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgccNotificationList, NgccNotificationItem } from './ngcc-notification-list';
import { runAxe } from '../../test-utils/a11y';

describe('NgccNotificationList', () => {
  let fixture: ComponentFixture<NgccNotificationList>;
  const el = () => fixture.nativeElement as HTMLElement;
  const items: NgccNotificationItem[] = [
    { id: 1, title: 'A', read: false },
    { id: 2, title: 'B', read: true },
    { id: 3, title: 'C' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccNotificationList],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(NgccNotificationList);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
  });

  it('shows the unread count', () => {
    expect(el().querySelector('.ngcc-notif__count')!.textContent).toContain('2');
  });

  it('emits markAllRead and clear', () => {
    const c = fixture.componentInstance;
    let marked = 0;
    let cleared = 0;
    c.markAllRead.subscribe(() => marked++);
    c.clear.subscribe(() => cleared++);
    const [markBtn, clearBtn] = Array.from(
      el().querySelectorAll<HTMLButtonElement>('.ngcc-notif__link'),
    );
    markBtn.click();
    clearBtn.click();
    expect([marked, cleared]).toEqual([1, 1]);
  });

  it('emits itemClicked and dismissed with the item', () => {
    const c = fixture.componentInstance;
    const clicked: unknown[] = [];
    const dismissed: unknown[] = [];
    c.itemClicked.subscribe((i) => clicked.push(i));
    c.dismissed.subscribe((i) => dismissed.push(i));
    el().querySelector<HTMLButtonElement>('.ngcc-notif__main')!.click();
    el().querySelector<HTMLButtonElement>('.ngcc-notif__dismiss')!.click();
    expect(clicked).toEqual([items[0]]);
    expect(dismissed).toEqual([items[0]]);
  });

  it('disables mark-all-read when everything is read, and shows empty text with no items', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'A', read: true }]);
    await fixture.whenStable();
    expect(el().querySelector<HTMLButtonElement>('.ngcc-notif__link')!.disabled).toBe(true);
    expect(el().querySelector('.ngcc-notif__count')).toBeNull();
    fixture.componentRef.setInput('items', []);
    await fixture.whenStable();
    expect(el().textContent).toContain("You're all caught up");
    expect(el().querySelector('ngcc-empty-state')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    expect(await runAxe(el())).toHaveNoViolations();
  });

  describe('labels', () => {
    it('uses English defaults and lets every string be translated', async () => {
      const link = (): string[] =>
        Array.from(el().querySelectorAll('.ngcc-notif__link-text')).map((n) => n.textContent!);
      expect(link()).toEqual(['Mark all read', 'Clear all']);
      fixture.componentRef.setInput('labels', {
        markAllRead: 'Tout marquer comme lu',
        unreadCount: '{count} non lues',
        dismiss: 'Ignorer {title}',
        unread: 'Non lue',
      });
      await fixture.whenStable();
      expect(link()[0]).toBe('Tout marquer comme lu');
      expect(link()[1]).toBe('Clear all');
      expect(el().querySelector('.ngcc-notif__count')!.getAttribute('aria-label')).toBe(
        '2 non lues',
      );
      expect(el().querySelector('.ngcc-notif__dismiss')!.getAttribute('aria-label')).toBe(
        'Ignorer A',
      );
      expect(el().querySelector('.ngcc-notif__main')!.textContent).toContain('Non lue:');
    });

    it('keeps the action text available as a tooltip for the icon-only layout', () => {
      const links = Array.from(el().querySelectorAll('.ngcc-notif__link'));
      expect(links.map((l) => l.getAttribute('title'))).toEqual(['Mark all read', 'Clear all']);
    });
  });

  describe('severity', () => {
    it('shows an icon and a text label for read and unread items alike', async () => {
      fixture.componentRef.setInput('items', [
        { id: 1, title: 'A', severity: 'error', read: false },
        { id: 2, title: 'B', severity: 'warning', read: true },
        { id: 3, title: 'C' },
      ]);
      fixture.componentRef.setInput('labels', { severityError: 'Erreur' });
      await fixture.whenStable();
      const mains = Array.from(el().querySelectorAll('.ngcc-notif__main'));
      expect(mains.every((m) => m.querySelector('svg.ngcc-notif__severity'))).toBe(true);
      expect(mains[0].textContent).toContain('Erreur.');
      expect(mains[1].textContent).toContain('Warning.');
      expect(mains[2].textContent).toContain('Information.');
    });
  });

  describe('states', () => {
    const set = async (name: string, value: unknown): Promise<void> => {
      fixture.componentRef.setInput(name, value);
      await fixture.whenStable();
    };

    it('shows skeleton rows while loading and no items', async () => {
      await set('items', []);
      await set('loading', true);
      expect(el().querySelectorAll('.ngcc-notif__skeleton').length).toBe(3);
      expect(el().querySelector('[aria-label="Loading notifications"]')).not.toBeNull();
      expect(el().querySelector('ngcc-empty-state')).toBeNull();
    });

    it('shows an error state with retry when there is nothing to show', async () => {
      await set('items', []);
      await set('error', 'Server down');
      expect(el().textContent).toContain('Could not load notifications');
      expect(el().textContent).toContain('Server down');
      let retries = 0;
      fixture.componentInstance.retry.subscribe(() => retries++);
      el().querySelector<HTMLButtonElement>('ngcc-empty-state button')!.click();
      expect(retries).toBe(1);
    });

    it('keeps the last list and shows a notice when a refresh fails', async () => {
      await set('error', true);
      expect(el().querySelectorAll('.ngcc-notif__item').length).toBe(3);
      expect(el().querySelector('.ngcc-notif__stale')!.textContent).toContain(
        'Showing the last list',
      );
    });

    it('uses custom empty title and description', async () => {
      await set('items', []);
      await set('emptyTitle', 'Nothing here');
      await set('emptyDescription', 'Check back later');
      expect(el().textContent).toContain('Nothing here');
      expect(el().textContent).toContain('Check back later');
    });
  });

  describe('time and grouping', () => {
    const now = Date.now();
    it('renders <time datetime> with relative text', async () => {
      fixture.componentRef.setInput('locale', 'en');
      fixture.componentRef.setInput('items', [
        { id: 1, title: 'A', time: new Date(now - 5 * 60_000) },
        { id: 2, title: 'B', timestamp: 'Yesterday 9:00' },
      ]);
      await fixture.whenStable();
      const t = el().querySelector('time')!;
      expect(t.textContent).toContain('5 minutes ago');
      expect(t.getAttribute('datetime')).toBe(new Date(now - 5 * 60_000).toISOString());
      expect(el().textContent).toContain('Yesterday 9:00');
    });

    it('groups by day with translatable labels', async () => {
      fixture.componentRef.setInput('locale', 'en');
      fixture.componentRef.setInput('groupBy', 'day');
      fixture.componentRef.setInput('labels', { groupToday: 'Aujourd’hui' });
      fixture.componentRef.setInput('items', [
        { id: 1, title: 'A', time: new Date(now) },
        { id: 2, title: 'B', time: new Date(now - 86_400_000) },
      ]);
      await fixture.whenStable();
      const groups = Array.from(el().querySelectorAll('.ngcc-notif__group')).map(
        (g) => g.textContent,
      );
      expect(groups).toEqual(['Aujourd’hui', 'Yesterday']);
    });
  });

  describe('item content', () => {
    it('shows an unread dot only on unread items', () => {
      const dots = el().querySelectorAll('.ngcc-notif__dot').length;
      expect(dots).toBe(2);
    });

    it('clamps messages and exposes the full text', async () => {
      fixture.componentRef.setInput('items', [{ id: 1, title: 'A', message: 'Long message' }]);
      fixture.componentRef.setInput('messageLines', 2);
      await fixture.whenStable();
      const m = el().querySelector<HTMLElement>('.ngcc-notif__message')!;
      expect(m.classList).toContain('ngcc-notif__message--clamped');
      expect(m.style.getPropertyValue('--ngcc-notif-lines')).toBe('2');
      expect(m.getAttribute('title')).toBe('Long message');
    });

    it('renders an anchor for href items and still emits itemClicked', async () => {
      fixture.componentRef.setInput('items', [{ id: 1, title: 'A', href: '/orders/1' }]);
      await fixture.whenStable();
      const a = el().querySelector<HTMLAnchorElement>('a.ngcc-notif__main')!;
      expect(a.getAttribute('href')).toBe('/orders/1');
      let clicks = 0;
      fixture.componentInstance.itemClicked.subscribe(() => clicks++);
      a.addEventListener('click', (e) => e.preventDefault());
      a.click();
      expect(clicks).toBe(1);
    });

    it('renders a routerLink anchor', async () => {
      fixture.componentRef.setInput('items', [{ id: 1, title: 'A', routerLink: '/orders/1' }]);
      await fixture.whenStable();
      expect(el().querySelector('a.ngcc-notif__main')!.getAttribute('href')).toBe('/orders/1');
    });

    it('emits markRead for an unread item only', () => {
      const seen: unknown[] = [];
      fixture.componentInstance.markRead.subscribe((i) => seen.push(i));
      const buttons = el().querySelectorAll<HTMLButtonElement>('.ngcc-notif__item-actions button');
      // item 1 (unread): mark read + dismiss; item 2 (read): dismiss only; item 3 (unread): both
      expect(buttons.length).toBe(5);
      buttons[0].click();
      expect(seen).toEqual([items[0]]);
    });
  });

  describe('footer, paging and announcements', () => {
    it('shows load more only when there is more', async () => {
      expect(el().textContent).not.toContain('Load more');
      fixture.componentRef.setInput('hasMore', true);
      await fixture.whenStable();
      let loads = 0;
      fixture.componentInstance.loadMore.subscribe(() => loads++);
      const btn = Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find((b) =>
        b.textContent!.includes('Load more'),
      )!;
      btn.click();
      expect(loads).toBe(1);
    });

    it('announces new unread arrivals when asked', async () => {
      fixture.componentRef.setInput('announceNew', true);
      await fixture.whenStable();
      fixture.componentRef.setInput('items', [
        ...items,
        { id: 4, title: 'D' },
        { id: 5, title: 'E' },
      ]);
      await fixture.whenStable();
      expect(el().querySelector('[role="status"]')!.textContent).toContain('2 new notifications');
    });

    it('can use a neutral count badge', async () => {
      fixture.componentRef.setInput('countVariant', 'neutral');
      await fixture.whenStable();
      expect(el().querySelector('.ngcc-notif__count')!.classList).toContain(
        'ngcc-notif__count--neutral',
      );
    });
  });
});
