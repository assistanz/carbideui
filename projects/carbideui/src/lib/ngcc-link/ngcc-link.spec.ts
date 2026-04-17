import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccLink } from './ngcc-link';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { runAxe } from '../../test-utils/a11y';
import { NgccLinkSize, NgccLinkTarget, NgccLinkAriaCurrent } from './ngcc-link.types';
import { NgccIconNameType } from '../ngcc-icons/icons';

@Component({
  template: `
    <ngcc-link
      [href]="href"
      [target]="target"
      [rel]="rel"
      [disabled]="disabled"
      [inline]="inline"
      [size]="size"
      [visited]="visited"
      [iconName]="iconName"
      [ariaLabel]="ariaLabel"
      [ariaCurrent]="ariaCurrent"
      [className]="className"
      (linkClick)="onLinkClick($event)"
      >Link text</ngcc-link
    >
  `,
  standalone: true,
  imports: [CommonModule, NgccLink],
})
class TestHostComponent {
  href = '/test';
  target: NgccLinkTarget = '_self';
  rel = '';
  disabled = false;
  inline = false;
  size: NgccLinkSize = 'md';
  visited = false;
  iconName: NgccIconNameType | undefined = undefined;
  ariaLabel: string | undefined = undefined;
  ariaCurrent: NgccLinkAriaCurrent | undefined = undefined;
  className = '';

  onLinkClick = (_event: MouseEvent) => {};
}

describe('NgccLink', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
    fixture.whenStable?.();
  }

  function getAnchor(): HTMLAnchorElement {
    return fixture.debugElement.query(By.css('a')).nativeElement;
  }

  // ---------------------------------------------------------------------------
  // Core Functionality
  // ---------------------------------------------------------------------------
  describe('Core Functionality', () => {
    it('renders an <a> element', () => {
      detectChanges();
      expect(getAnchor().tagName.toLowerCase()).toBe('a');
    });

    it('applies href attribute', () => {
      host.href = '/docs';
      detectChanges();
      expect(getAnchor().getAttribute('href')).toBe('/docs');
    });

    it('applies cds--link base class', () => {
      detectChanges();
      expect(getAnchor().classList).toContain('cds--link');
    });

    it('renders projected text content', () => {
      detectChanges();
      expect(getAnchor().textContent?.trim()).toBe('Link text');
    });

    it('applies custom className', () => {
      host.className = 'my-custom-class';
      detectChanges();
      expect(getAnchor().classList).toContain('my-custom-class');
    });

    it('emits linkClick event on click', () => {
      const spy = vi.spyOn(host, 'onLinkClick');
      detectChanges();
      getAnchor().click();
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  // ---------------------------------------------------------------------------
  // Disabled State
  // ---------------------------------------------------------------------------
  describe('Disabled State', () => {
    it('removes href attribute when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getAnchor().getAttribute('href')).toBeNull();
    });

    it('sets aria-disabled="true" when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getAnchor().getAttribute('aria-disabled')).toBe('true');
    });

    it('sets tabindex="-1" when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getAnchor().getAttribute('tabindex')).toBe('-1');
    });

    it('applies cds--link--disabled class when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getAnchor().classList).toContain('cds--link--disabled');
    });

    it('suppresses linkClick emission when disabled', () => {
      const spy = vi.spyOn(host, 'onLinkClick');
      host.disabled = true;
      detectChanges();
      getAnchor().click();
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not set aria-disabled when enabled', () => {
      host.disabled = false;
      detectChanges();
      expect(getAnchor().getAttribute('aria-disabled')).toBeNull();
    });

    it('sets tabindex="0" when enabled', () => {
      detectChanges();
      expect(getAnchor().getAttribute('tabindex')).toBe('0');
    });
  });

  // ---------------------------------------------------------------------------
  // Inline Variant
  // ---------------------------------------------------------------------------
  describe('Inline Variant', () => {
    it('applies cds--link--inline class when inline=true', () => {
      host.inline = true;
      detectChanges();
      expect(getAnchor().classList).toContain('cds--link--inline');
    });

    it('does not apply inline class by default', () => {
      detectChanges();
      expect(getAnchor().classList).not.toContain('cds--link--inline');
    });
  });

  // ---------------------------------------------------------------------------
  // Sizes
  // ---------------------------------------------------------------------------
  describe('Sizes', () => {
    it('applies cds--link--sm for size="sm"', () => {
      host.size = 'sm';
      detectChanges();
      expect(getAnchor().classList).toContain('cds--link--sm');
    });

    it('does not apply a size modifier class for size="md" (default)', () => {
      host.size = 'md';
      detectChanges();
      expect(getAnchor().classList).not.toContain('cds--link--md');
    });

    it('applies cds--link--lg for size="lg"', () => {
      host.size = 'lg';
      detectChanges();
      expect(getAnchor().classList).toContain('cds--link--lg');
    });
  });

  // ---------------------------------------------------------------------------
  // Visited State
  // ---------------------------------------------------------------------------
  describe('Visited State', () => {
    it('applies cds--link--visited class when visited=true', () => {
      host.visited = true;
      detectChanges();
      expect(getAnchor().classList).toContain('cds--link--visited');
    });

    it('does not apply visited class by default', () => {
      detectChanges();
      expect(getAnchor().classList).not.toContain('cds--link--visited');
    });
  });

  // ---------------------------------------------------------------------------
  // Target & Security (rel auto-injection)
  // ---------------------------------------------------------------------------
  describe('Target & Security', () => {
    it('auto-adds noopener for target="_blank"', () => {
      host.target = '_blank';
      detectChanges();
      expect(getAnchor().getAttribute('rel')).toContain('noopener');
    });

    it('auto-adds noreferrer for target="_blank"', () => {
      host.target = '_blank';
      detectChanges();
      expect(getAnchor().getAttribute('rel')).toContain('noreferrer');
    });

    it('merges custom rel value with noopener noreferrer for _blank', () => {
      host.target = '_blank';
      host.rel = 'nofollow';
      detectChanges();
      const rel = getAnchor().getAttribute('rel')!;
      expect(rel).toContain('nofollow');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    it('does not set rel attribute for target="_self" with no rel', () => {
      host.target = '_self';
      host.rel = '';
      detectChanges();
      expect(getAnchor().getAttribute('rel')).toBeNull();
    });

    it('does not set target attribute for target="_self" (default)', () => {
      host.target = '_self';
      detectChanges();
      expect(getAnchor().getAttribute('target')).toBeNull();
    });

    it('sets target="_blank" attribute on the anchor', () => {
      host.target = '_blank';
      detectChanges();
      expect(getAnchor().getAttribute('target')).toBe('_blank');
    });
  });

  // ---------------------------------------------------------------------------
  // Icon Support
  // ---------------------------------------------------------------------------
  describe('Icon Support', () => {
    it('renders NgccIcon when iconName is provided', () => {
      host.iconName = 'add';
      detectChanges();
      expect(fixture.debugElement.query(By.directive(NgccIcon))).toBeTruthy();
    });

    it('wraps icon in cds--link__icon span', () => {
      host.iconName = 'add';
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--link__icon'))).toBeTruthy();
    });

    it('does not render icon span when iconName is undefined', () => {
      host.iconName = undefined;
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--link__icon'))).toBeFalsy();
    });
  });

  // ---------------------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------------------
  describe('Keyboard Navigation', () => {
    it('activates link on Enter key', () => {
      const spy = vi.spyOn(host, 'onLinkClick');
      detectChanges();
      getAnchor().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(spy).toHaveBeenCalled();
    });

    it('does not activate on Enter key when disabled', () => {
      const spy = vi.spyOn(host, 'onLinkClick');
      host.disabled = true;
      detectChanges();
      getAnchor().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not activate on Space key (preserves native scroll behavior)', () => {
      const spy = vi.spyOn(host, 'onLinkClick');
      detectChanges();
      getAnchor().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not activate on Tab key', () => {
      const spy = vi.spyOn(host, 'onLinkClick');
      detectChanges();
      getAnchor().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('link is focusable when enabled', () => {
      detectChanges();
      const anchor = getAnchor();
      anchor.focus();
      expect(document.activeElement).toBe(anchor);
    });

    it('disabled link has tabindex="-1" (excluded from tab order)', () => {
      host.disabled = true;
      detectChanges();
      expect(getAnchor().getAttribute('tabindex')).toBe('-1');
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility (ARIA + runAxe)
  // ---------------------------------------------------------------------------
  describe('Accessibility', () => {
    it('sets aria-label when provided', () => {
      host.ariaLabel = 'Navigate to docs';
      detectChanges();
      expect(getAnchor().getAttribute('aria-label')).toBe('Navigate to docs');
    });

    it('does not set aria-label attribute when undefined', () => {
      host.ariaLabel = undefined;
      detectChanges();
      expect(getAnchor().getAttribute('aria-label')).toBeNull();
    });

    it('sets aria-current="page"', () => {
      host.ariaCurrent = 'page';
      detectChanges();
      expect(getAnchor().getAttribute('aria-current')).toBe('page');
    });

    it('sets aria-current="step"', () => {
      host.ariaCurrent = 'step';
      detectChanges();
      expect(getAnchor().getAttribute('aria-current')).toBe('step');
    });

    it('sets aria-current="location"', () => {
      host.ariaCurrent = 'location';
      detectChanges();
      expect(getAnchor().getAttribute('aria-current')).toBe('location');
    });

    it('does not set aria-current attribute when undefined', () => {
      host.ariaCurrent = undefined;
      detectChanges();
      expect(getAnchor().getAttribute('aria-current')).toBeNull();
    });

    it('has no runAxe violations — default state', async () => {
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — inline variant', async () => {
      host.inline = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — disabled state', async () => {
      host.disabled = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — with aria-label', async () => {
      host.ariaLabel = 'External link to Carbon docs';
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — with aria-current="page"', async () => {
      host.ariaCurrent = 'page';
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — with icon', async () => {
      host.iconName = 'arrow_up';
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — visited state', async () => {
      host.visited = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — external link (target _blank)', async () => {
      host.target = '_blank';
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
