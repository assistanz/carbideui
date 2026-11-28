import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccHeaderAction } from './ngcc-header-action';
import { runAxe } from '../../../test-utils/a11y';

@Component({
  template: `
    <ngcc-header-action
      [ariaLabel]="ariaLabel"
      [(active)]="active"
      [iconName]="iconName"
      [toggleable]="toggleable"
      [badge]="badge"
      (actionClick)="onActionClick($event)"
    />
  `,
  standalone: true,
  imports: [NgccHeaderAction],
})
class TestHeaderActionHost {
  ariaLabel = 'Search';
  active = false;
  iconName: any = 'search';
  toggleable = true;
  badge: number | 'dot' | null = null;
  onActionClick = (_e: MouseEvent) => {};
}

describe('NgccHeaderAction', () => {
  let fixture: ComponentFixture<TestHeaderActionHost>;
  let host: TestHeaderActionHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHeaderActionHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHeaderActionHost);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
    fixture.whenStable?.();
  }

  function getButton() {
    return fixture.debugElement.query(By.css('button'));
  }

  describe('Core Functionality', () => {
    it('renders a button element', () => {
      detectChanges();
      expect(getButton()).toBeTruthy();
    });

    it('sets aria-label on button', () => {
      host.ariaLabel = 'Notifications';
      detectChanges();
      expect(getButton().nativeElement.getAttribute('aria-label')).toBe('Notifications');
    });

    it('aria-expanded is false when inactive', () => {
      host.active = false;
      detectChanges();
      expect(getButton().nativeElement.getAttribute('aria-expanded')).toBe('false');
    });

    it('aria-expanded is true when active', () => {
      host.active = true;
      detectChanges();
      expect(getButton().nativeElement.getAttribute('aria-expanded')).toBe('true');
    });

    it('button has cds--header__action class', () => {
      detectChanges();
      expect(getButton().nativeElement.classList).toContain('cds--header__action');
    });

    it('adds cds--header__action--active class when active', () => {
      host.active = true;
      detectChanges();
      expect(getButton().nativeElement.classList).toContain('cds--header__action--active');
    });

    it('does not add active class when inactive', () => {
      host.active = false;
      detectChanges();
      expect(getButton().nativeElement.classList).not.toContain('cds--header__action--active');
    });
  });

  describe('Toggle Behavior', () => {
    it('clicking button sets active to true when toggleable', () => {
      host.toggleable = true;
      host.active = false;
      detectChanges();
      getButton().nativeElement.click();
      detectChanges();
      expect(host.active).toBe(true);
    });

    it('clicking button sets active back to false when toggleable', () => {
      host.toggleable = true;
      host.active = true;
      detectChanges();
      getButton().nativeElement.click();
      detectChanges();
      expect(host.active).toBe(false);
    });

    it('clicking button does NOT toggle active when not toggleable', () => {
      host.toggleable = false;
      host.active = false;
      detectChanges();
      getButton().nativeElement.click();
      detectChanges();
      expect(host.active).toBe(false);
    });
  });

  describe('Events', () => {
    it('emits actionClick output on click', () => {
      const spy = vi.spyOn(host, 'onActionClick');
      detectChanges();
      getButton().nativeElement.click();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('emits actionClick even when not toggleable', () => {
      const spy = vi.spyOn(host, 'onActionClick');
      host.toggleable = false;
      detectChanges();
      getButton().nativeElement.click();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('emits the MouseEvent instance in actionClick', () => {
      const spy = vi.spyOn(host, 'onActionClick');
      detectChanges();
      getButton().nativeElement.click();
      expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
    });
  });

  describe('WCAG & Accessibility', () => {
    it('should have no accessibility violations when inactive', async () => {
      host.active = false;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when active', async () => {
      host.active = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('badge', () => {
    const btn = () => fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;
    const badge = () => fixture.nativeElement.querySelector('.ngcc-header-action__badge');

    it('shows nothing without a badge or with a zero count', () => {
      fixture.detectChanges();
      expect(badge()).toBeNull();
    });

    it('shows a count, caps it, and announces it in the accessible name', () => {
      host.badge = 120;
      fixture.detectChanges();
      expect(badge().textContent.trim()).toBe('99+');
      expect(badge().getAttribute('aria-hidden')).toBe('true');
      expect(btn().getAttribute('aria-label')).toBe('Search, 120 unread');
    });

    it('shows a dot without changing the accessible name', () => {
      host.badge = 'dot';
      fixture.detectChanges();
      expect(badge().classList).toContain('ngcc-header-action__badge--dot');
      expect(btn().getAttribute('aria-label')).toBe('Search');
    });
  });
});
