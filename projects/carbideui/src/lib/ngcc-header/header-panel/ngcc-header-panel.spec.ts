import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccHeaderPanel } from './ngcc-header-panel';
import { runAxe } from '../../../test-utils/a11y';

@Component({
  template: `
    <ngcc-header-panel
      [expanded]="expanded"
      [ariaLabel]="ariaLabel"
      [width]="width"
      [size]="size"
      (closed)="onClosed()"
    >
      <p class="panel-content">Panel content</p>
      <button ngccPanelFooter type="button" class="panel-footer-btn">View all</button>
    </ngcc-header-panel>
  `,
  standalone: true,
  imports: [NgccHeaderPanel],
})
class TestHeaderPanelHost {
  expanded = false;
  ariaLabel = 'Notifications';
  width = '';
  size: 'full' | 'content' = 'full';
  closedCount = 0;
  onClosed(): void {
    this.closedCount++;
  }
}

describe('NgccHeaderPanel', () => {
  let fixture: ComponentFixture<TestHeaderPanelHost>;
  let host: TestHeaderPanelHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHeaderPanelHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHeaderPanelHost);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
    fixture.whenStable?.();
  }

  function redetect() {
    fixture.changeDetectorRef.markForCheck();
    detectChanges();
  }

  function getPanel() {
    return fixture.debugElement.query(By.css('[role="dialog"]'));
  }

  describe('Core Functionality', () => {
    it('renders a non-modal dialog', () => {
      detectChanges();
      expect(getPanel()).toBeTruthy();
    });

    it('applies cds--header-panel class', () => {
      detectChanges();
      expect(getPanel().nativeElement.classList).toContain('cds--header-panel');
    });

    it('sets aria-label', () => {
      host.ariaLabel = 'Notifications';
      detectChanges();
      expect(getPanel().nativeElement.getAttribute('aria-label')).toBe('Notifications');
    });

    it('projects children into the panel', () => {
      detectChanges();
      const content = fixture.debugElement.query(By.css('.panel-content'));
      expect(content).toBeTruthy();
      expect(content.nativeElement.textContent.trim()).toBe('Panel content');
    });
  });

  describe('Expanded State', () => {
    it('does not have expanded class when collapsed', () => {
      host.expanded = false;
      detectChanges();
      expect(getPanel().nativeElement.classList).not.toContain('cds--header-panel--expanded');
    });

    it('adds expanded class when expanded is true', () => {
      host.expanded = true;
      detectChanges();
      expect(getPanel().nativeElement.classList).toContain('cds--header-panel--expanded');
    });

    it('aria-hidden is "true" when collapsed', () => {
      host.expanded = false;
      detectChanges();
      expect(getPanel().nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('aria-hidden is "false" when expanded', () => {
      host.expanded = true;
      detectChanges();
      expect(getPanel().nativeElement.getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('Dismissal and focus', () => {
    it('emits closed on Escape only while expanded', () => {
      detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(host.closedCount).toBe(0);
      host.expanded = true;
      redetect();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(host.closedCount).toBe(1);
    });

    it('emits closed on an outside click but not on a click inside', () => {
      host.expanded = true;
      detectChanges();
      getPanel().nativeElement.querySelector('.panel-content').click();
      expect(host.closedCount).toBe(0);
      document.body.click();
      expect(host.closedCount).toBe(1);
    });

    it('is inert while collapsed', () => {
      detectChanges();
      expect(getPanel().nativeElement.hasAttribute('inert')).toBe(true);
      host.expanded = true;
      redetect();
      expect(getPanel().nativeElement.hasAttribute('inert')).toBe(false);
    });

    it('returns focus to the opener when it closes', () => {
      const opener = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
      host.expanded = true;
      detectChanges();
      const inner = document.createElement('button');
      getPanel().nativeElement.appendChild(inner);
      inner.focus();
      host.expanded = false;
      redetect();
      expect(document.activeElement).toBe(opener);
      opener.remove();
    });
  });

  describe('Width', () => {
    it('sets --ngcc-header-panel-width only when a width is given', () => {
      detectChanges();
      expect(getPanel().nativeElement.style.getPropertyValue('--ngcc-header-panel-width')).toBe('');
      host.width = '24rem';
      redetect();
      expect(getPanel().nativeElement.style.getPropertyValue('--ngcc-header-panel-width')).toBe(
        '24rem',
      );
    });
  });

  describe('Size and footer', () => {
    it('fits content only when asked', () => {
      detectChanges();
      expect(getPanel().nativeElement.classList).not.toContain('ngcc-header-panel--content');
      host.size = 'content';
      redetect();
      expect(getPanel().nativeElement.classList).toContain('ngcc-header-panel--content');
    });

    it('projects the footer outside the scrolling body', () => {
      detectChanges();
      const footer = getPanel().nativeElement.querySelector('.ngcc-header-panel__footer');
      expect(footer.querySelector('.panel-footer-btn')).not.toBeNull();
      expect(
        getPanel().nativeElement.querySelector('.ngcc-header-panel__body .panel-footer-btn'),
      ).toBeNull();
    });
  });

  describe('WCAG & Accessibility', () => {
    it('should have no accessibility violations when collapsed', async () => {
      host.expanded = false;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when expanded', async () => {
      host.expanded = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
