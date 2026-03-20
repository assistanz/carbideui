import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccBreadcrumbItemComponent } from './ngcc-breadcrumb-item';

@Component({
  template: `
    <ngcc-breadcrumb-item
      [label]="label"
      [href]="href"
      [routerLink]="routerLink"
      [current]="current"
      [disabled]="disabled"
      [skeleton]="skeleton"
      [target]="target"
      [rel]="rel"
    />
  `,
  standalone: true,
  imports: [NgccBreadcrumbItemComponent],
})
class TestHostComponent {
  label = 'Home';
  href: string | undefined = undefined;
  routerLink: string | string[] | undefined = undefined;
  current = false;
  disabled = false;
  skeleton = false;
  target: string | undefined = undefined;
  rel: string | undefined = undefined;
}

describe('NgccBreadcrumbItemComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
  }

  function getItem() {
    return fixture.debugElement.query(By.directive(NgccBreadcrumbItemComponent));
  }

  describe('Core rendering', () => {
    it('should create', () => {
      detectChanges();
      expect(getItem()).toBeTruthy();
    });

    it('renders a link with href for non-current items', () => {
      host.href = '/home';
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor.getAttribute('href')).toBe('/home');
    });

    it('renders a routerLink anchor for angular router navigation', () => {
      host.routerLink = '/products';
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor).toBeTruthy();
    });

    it('renders label text inside the link', () => {
      host.label = 'Home';
      host.href = '/home';
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.textContent.trim()).toBe('Home');
    });

    it('renders a span with aria-current="page" for current item', () => {
      host.current = true;
      detectChanges();

      const span = fixture.nativeElement.querySelector('span[aria-current="page"]');
      expect(span).toBeTruthy();
      expect(fixture.nativeElement.querySelector('a')).toBeFalsy();
    });

    it('renders label text inside the current span', () => {
      host.label = 'Details';
      host.current = true;
      detectChanges();

      const span = fixture.nativeElement.querySelector('span[aria-current="page"]');
      expect(span.textContent.trim()).toBe('Details');
    });

    it('does not set href attribute when no href provided', () => {
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBeNull();
    });
  });

  describe('Disabled state', () => {
    it('sets aria-disabled on anchor when disabled', () => {
      host.href = '/home';
      host.disabled = true;
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('aria-disabled')).toBe('true');
    });

    it('applies disabled class to host element', () => {
      host.disabled = true;
      detectChanges();

      expect(getItem().nativeElement.classList).toContain('cds--breadcrumb-item--disabled');
    });

    it('does not set aria-disabled when not disabled', () => {
      host.href = '/home';
      host.disabled = false;
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('aria-disabled')).toBeNull();
    });

    it('applies cds--link--disabled class to anchor when disabled', () => {
      host.href = '/home';
      host.disabled = true;
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.classList).toContain('cds--link--disabled');
    });

    it('removes href when disabled so the link is not navigable', () => {
      host.href = '/home';
      host.disabled = true;
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBeNull();
    });

    it('keeps href when not disabled', () => {
      host.href = '/home';
      host.disabled = false;
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/home');
    });
  });

  describe('Skeleton state', () => {
    it('renders a span (not an anchor) when skeleton is true', () => {
      host.skeleton = true;
      detectChanges();

      expect(fixture.nativeElement.querySelector('a')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('span')).toBeTruthy();
    });

    it('ignores href input in skeleton mode', () => {
      host.skeleton = true;
      host.href = '/home';
      detectChanges();

      expect(fixture.nativeElement.querySelector('a')).toBeFalsy();
    });
  });

  describe('Link attributes', () => {
    it('sets target attribute on anchor', () => {
      host.href = '/home';
      host.target = '_blank';
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('target')).toBe('_blank');
    });

    it('sets rel attribute on anchor', () => {
      host.href = '/home';
      host.rel = 'noopener noreferrer';
      detectChanges();

      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  describe('Host element', () => {
    it('always has cds--breadcrumb-item class', () => {
      detectChanges();
      expect(getItem().nativeElement.classList).toContain('cds--breadcrumb-item');
    });
  });
});
