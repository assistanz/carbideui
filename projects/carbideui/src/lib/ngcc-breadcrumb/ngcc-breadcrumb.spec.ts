import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccBreadcrumbComponent } from './ngcc-breadcrumb';
import { NgccBreadcrumbItemComponent } from './ngcc-breadcrumb-item';
import { NgccBreadcrumbItem, NgccBreadcrumbSize } from './ngcc-breadcrumb.types';

@Component({
  template: `
    <ngcc-breadcrumb
      [items]="items"
      [size]="size"
      [noTrailingSlash]="noTrailingSlash"
      [skeleton]="skeleton"
      [skeletonCount]="skeletonCount"
      [ariaLabel]="ariaLabel"
    />
  `,
  standalone: true,
  imports: [NgccBreadcrumbComponent],
})
class TestHostComponent {
  items: NgccBreadcrumbItem[] = [];
  size: NgccBreadcrumbSize = 'md';
  noTrailingSlash = false;
  skeleton = false;
  skeletonCount = 3;
  ariaLabel = 'Breadcrumb';
}

describe('NgccBreadcrumbComponent', () => {
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

  function getBreadcrumbItems() {
    return fixture.debugElement.queryAll(By.directive(NgccBreadcrumbItemComponent));
  }

  function getNav() {
    return fixture.nativeElement.querySelector('nav.cds--breadcrumb');
  }

  describe('Core rendering', () => {
    it('should create', () => {
      detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('renders a nav element with correct class', () => {
      detectChanges();
      expect(getNav()).toBeTruthy();
    });

    it('renders the correct number of breadcrumb items', () => {
      host.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Details', href: '/products/details' },
      ];
      detectChanges();
      expect(getBreadcrumbItems().length).toBe(3);
    });

    it('renders no items when items array is empty', () => {
      host.items = [];
      detectChanges();
      expect(getBreadcrumbItems().length).toBe(0);
    });

    it('renders item labels including the current (last) item', () => {
      host.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Details' },
      ];
      detectChanges();

      const navText = getNav().textContent;
      expect(navText).toContain('Home');
      expect(navText).toContain('Products');
      expect(navText).toContain('Details');
    });
  });

  describe('Current page detection', () => {
    it('automatically marks the last item as current', () => {
      host.items = [
        { label: 'Home', href: '/' },
        { label: 'Details', href: '/details' },
      ];
      detectChanges();

      const items = getBreadcrumbItems();
      const lastItem = items[items.length - 1];
      expect(lastItem.componentInstance.current()).toBe(true);
    });

    it('respects explicit current flag on items', () => {
      host.items = [
        { label: 'Home', href: '/', current: true },
        { label: 'Details', href: '/details' },
      ];
      detectChanges();

      const items = getBreadcrumbItems();
      expect(items[0].componentInstance.current()).toBe(true);
    });

    it('non-last items are not current by default', () => {
      host.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Details', href: '/details' },
      ];
      detectChanges();

      const items = getBreadcrumbItems();
      expect(items[0].componentInstance.current()).toBe(false);
      expect(items[1].componentInstance.current()).toBe(false);
    });
  });

  describe('Skeleton state', () => {
    it('renders skeleton items when skeleton is true', () => {
      host.skeleton = true;
      host.skeletonCount = 3;
      detectChanges();

      const items = getBreadcrumbItems();
      expect(items.length).toBe(3);
      items.forEach((item) => {
        expect(item.componentInstance.skeleton()).toBe(true);
      });
    });

    it('uses skeletonCount to control number of skeleton items', () => {
      host.skeleton = true;
      host.skeletonCount = 5;
      detectChanges();
      expect(getBreadcrumbItems().length).toBe(5);
    });

    it('does not render real items in skeleton mode', () => {
      host.skeleton = true;
      host.items = [{ label: 'Home', href: '/' }];
      detectChanges();

      const nav = getNav();
      expect(nav.textContent).not.toContain('Home');
    });
  });

  describe('No trailing slash', () => {
    it('applies no-trailing-slash class when enabled', () => {
      host.noTrailingSlash = true;
      detectChanges();
      expect(getNav().classList).toContain('cds--breadcrumb--no-trailing-slash');
    });

    it('does not apply no-trailing-slash class by default', () => {
      detectChanges();
      expect(getNav().classList).not.toContain('cds--breadcrumb--no-trailing-slash');
    });
  });

  describe('Size', () => {
    it('applies no size modifier class by default (md)', () => {
      detectChanges();
      expect(getNav().classList).not.toContain('cds--breadcrumb--sm');
    });

    it('applies cds--breadcrumb--sm class when size is sm', () => {
      host.size = 'sm';
      detectChanges();
      expect(getNav().classList).toContain('cds--breadcrumb--sm');
    });

    it('does not apply cds--breadcrumb--sm class when size is md', () => {
      host.size = 'md';
      detectChanges();
      expect(getNav().classList).not.toContain('cds--breadcrumb--sm');
    });
  });

  describe('Accessibility', () => {
    it('sets aria-label on nav element', () => {
      host.ariaLabel = 'Page navigation';
      detectChanges();
      expect(getNav().getAttribute('aria-label')).toBe('Page navigation');
    });

    it('uses default aria-label "Breadcrumb"', () => {
      detectChanges();
      expect(getNav().getAttribute('aria-label')).toBe('Breadcrumb');
    });
  });
});
