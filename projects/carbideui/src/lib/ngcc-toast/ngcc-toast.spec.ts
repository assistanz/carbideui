import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccToast } from './ngcc-toast';
import { NgccToastConfig } from './ngcc-toast.types';
import { axe } from 'vitest-axe';

describe('NgccToast', () => {
  let fixture: ComponentFixture<NgccToast>;
  let component: NgccToast;

  const baseCfg: NgccToastConfig = {
    id: 'toast-1',
    type: 'info',
    title: 'Info Toast',
    subtitle: 'Information available',
    caption: 'Just now',
    showClose: true,
    timeout: 0,
    lowContrast: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccToast],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccToast);
    component = fixture.componentInstance;

    // Required input setup
    fixture.componentRef.setInput('cfg', baseCfg);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title, subtitle and caption', async () => {
    const title = fixture.debugElement.query(By.css('.cds--toast-notification__title'));
    const subtitle = fixture.debugElement.query(By.css('.cds--toast-notification__subtitle'));
    const caption = fixture.debugElement.query(By.css('.cds--toast-notification__caption'));

    expect(title.nativeElement.textContent.trim()).toBe(baseCfg.title);
    expect(subtitle.nativeElement.textContent.trim()).toBe(baseCfg.subtitle);
    expect(caption.nativeElement.textContent.trim()).toBe(baseCfg.caption);
  });

  it('should render proper icon for each type', async () => {
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

  it('should use custom icon when provided', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, icon: 'custom_star' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.iconName()).toBe('custom_star');
  });

  it('should hide icon when hideIcon=true', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, hideIcon: true });
    fixture.detectChanges();
    await fixture.whenStable();

    const iconEl = fixture.debugElement.query(By.css('cds--toast-notification__icon'));
    expect(iconEl).toBeNull();
  });

  it('should emit closed event when close button clicked', async () => {
    vi.spyOn(component.closed, 'emit');

    const closeBtn = fixture.debugElement.query(By.css('.cds--toast-notification__close-button'));
    closeBtn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.closed.emit).toHaveBeenCalledWith(baseCfg.id ?? '');

    const toastEl = fixture.debugElement.query(By.css('.cds--toast-notification'));
    expect(toastEl).toBeNull();
  });

  it('should auto-dismiss after timeout', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, timeout: 100 });
    fixture.detectChanges();
    await fixture.whenStable();

    const before = fixture.debugElement.query(By.css('.cds--toast-notification'));
    expect(before).not.toBeNull();

    await new Promise((r) => setTimeout(r, 150));
    fixture.detectChanges();

    const after = fixture.debugElement.query(By.css('.cds--toast-notification'));
    expect(after).toBeNull();
  });

  it('should not auto-dismiss when timeout=0', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, timeout: 0 });
    fixture.detectChanges();
    await fixture.whenStable();

    await new Promise((r) => setTimeout(r, 200));
    fixture.detectChanges();

    const toast = fixture.debugElement.query(By.css('.cds--toast-notification'));
    expect(toast).not.toBeNull();
  });

  it('should set correct role and aria-live for error/warning types', async () => {
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

  it('should apply low contrast class when enabled', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, lowContrast: true });
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.debugElement.query(By.css('.cds--toast-notification--low-contrast'));
    expect(el).not.toBeNull();
  });
  it('should have no WCAG violations (default toast)', async () => {
    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should have no WCAG violations for error toast', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'error' });
    fixture.detectChanges();
    await fixture.whenStable();

    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should have no WCAG violations in low contrast mode', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, lowContrast: true });
    fixture.detectChanges();
    await fixture.whenStable();

    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should have an accessible close button', async () => {
    const closeBtn = fixture.debugElement.query(By.css('.cds--toast-notification__close-button'));

    expect(closeBtn).not.toBeNull();
    expect(closeBtn.nativeElement.getAttribute('aria-label')).toBeTruthy();

    const results = await axe(closeBtn.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should expose correct ARIA attributes without WCAG violations', async () => {
    fixture.componentRef.setInput('cfg', { ...baseCfg, type: 'warning' });
    fixture.detectChanges();
    await fixture.whenStable();

    const toastEl = fixture.debugElement.query(By.css('.cds--toast-notification')).nativeElement;

    expect(toastEl.getAttribute('role')).toBe('alert');
    expect(toastEl.getAttribute('aria-live')).toBe('assertive');

    const results = await axe(toastEl);
    expect(results).toHaveNoViolations();
  });
});
