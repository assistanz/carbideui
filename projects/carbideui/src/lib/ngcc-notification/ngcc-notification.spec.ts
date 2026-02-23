import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgccNotification } from './ngcc-notification';
import { NgccNotificationConfig } from './ngcc-notification.types';
import { provideZonelessChangeDetection } from '@angular/core';
import { axe } from 'vitest-axe';

describe('NgccNotification', () => {
  let fixture: ComponentFixture<NgccNotification>;
  let component: NgccNotification;

  const baseCfg: NgccNotificationConfig = {
    id: 'notif-1',
    type: 'info',
    title: 'Info Title',
    subtitle: 'Informational message',
    caption: 'Just now',
    showClose: true,
    timeout: 0,
    lowContrast: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccNotification],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccNotification);
    component = fixture.componentInstance;

    // ✅ Use Angular v20 setInput API instead of direct signal access
    fixture.componentRef.setInput('cfg', baseCfg);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and subtitle', async () => {
    const title = fixture.debugElement.query(By.css('.cds--inline-notification__title'));
    const subtitle = fixture.debugElement.query(By.css('.cds--inline-notification__subtitle'));
    expect(title.nativeElement.textContent.trim()).toBe(baseCfg.title);
    expect(subtitle.nativeElement.textContent.trim()).toBe(baseCfg.subtitle);
  });

  it('should render correct Carbon icon per type', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'success' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.iconName()).toBe('success_filled');

    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'error' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.iconName()).toBe('error_filled');

    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'warning' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.iconName()).toBe('warning_filled');

    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'info' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.iconName()).toBe('info_filled');
  });

  it('should use custom icon if provided', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, icon: 'star_filled' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.iconName()).toBe('star_filled');
  });

  it('should hide icon when hideIcon is true', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, hideIcon: true });
    fixture.detectChanges();
    await fixture.whenStable();

    const iconEl = fixture.debugElement.query(By.css('cds--toast-notification__icon'));
    expect(iconEl).toBeNull();
  });

  it('should emit closed event when close button clicked', async () => {
    vi.spyOn(component.closed, 'emit');
    const btn = fixture.debugElement.query(By.css('.cds--inline-notification__close-button'));
    btn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.closed.emit).toHaveBeenCalledWith(baseCfg?.id ?? '');
    const notif = fixture.debugElement.query(By.css('.cds--inline-notification'));
    expect(notif).toBeNull();
  });

  it('should trigger action callback and close on click', async () => {
    const actionSpy = vi.fn();
    fixture.componentRef.setInput('cfg', {
      ...baseCfg,
      actionLabel: 'Undo',
      action: actionSpy,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.debugElement.query(By.css('.ngcc--notification_action-button'));
    btn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(actionSpy).toHaveBeenCalled();
    const notif = fixture.debugElement.query(By.css('.cds--inline-notification'));
    expect(notif).toBeNull();
  });

  it('should auto-dismiss after timeout', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, timeout: 100 });
    fixture.detectChanges();
    await fixture.whenStable();

    const notifBefore = fixture.debugElement.query(By.css('.cds--inline-notification'));
    expect(notifBefore).not.toBeNull();

    await new Promise((r) => setTimeout(r, 150));
    fixture.detectChanges();

    const notifAfter = fixture.debugElement.query(By.css('.cds--inline-notification'));
    expect(notifAfter).toBeNull();
  });

  it('should not auto-dismiss when timeout=0', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, timeout: 0 });
    fixture.detectChanges();
    await fixture.whenStable();

    await new Promise((r) => setTimeout(r, 150));
    fixture.detectChanges();

    const notif = fixture.debugElement.query(By.css('.cds--inline-notification'));
    expect(notif).not.toBeNull();
  });

  it('should set correct aria role and live region', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'error' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.role()).toBe('alert');
    expect(component.ariaLive()).toBe('assertive');

    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'info' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.role()).toBe('status');
    expect(component.ariaLive()).toBe('polite');
  });

  // ─────────────────────────────────────────────
  // WCAG & Accessibility
  // ─────────────────────────────────────────────

  describe('WCAG & Accessibility', () => {
    it('should have no accessibility violations (default notification)', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when action button is present', async () => {
      fixture.componentRef.setInput('cfg', {
        ...baseCfg,
        actionLabel: 'Undo',
        action: vi.fn(),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when icon is hidden', async () => {
      fixture.componentRef.setInput('cfg', {
        ...baseCfg,
        hideIcon: true,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should use alert role for error notifications', async () => {
      fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'error' });
      fixture.detectChanges();
      await fixture.whenStable();

      const notif = fixture.debugElement.query(By.css('.cds--inline-notification'));
      expect(notif.nativeElement.getAttribute('role')).toBe('alert');
      expect(notif.nativeElement.getAttribute('aria-live')).toBe('assertive');
    });

    it('should use status role for info notifications', async () => {
      fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'info' });
      fixture.detectChanges();
      await fixture.whenStable();

      const notif = fixture.debugElement.query(By.css('.cds--inline-notification'));
      expect(notif.nativeElement.getAttribute('role')).toBe('status');
      expect(notif.nativeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should have accessible close button', async () => {
      const closeBtn = fixture.debugElement.query(
        By.css('.cds--inline-notification__close-button'),
      );

      expect(closeBtn).toBeTruthy();
      expect(closeBtn.nativeElement.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have accessible action button when provided', async () => {
      fixture.componentRef.setInput('cfg', {
        ...baseCfg,
        actionLabel: 'Undo',
        action: vi.fn(),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const actionBtn = fixture.debugElement.query(By.css('.ngcc--notification_action-button'));

      expect(actionBtn).toBeTruthy();
      expect(actionBtn.nativeElement.textContent.trim()).toBe('Undo');
    });
  });
});
