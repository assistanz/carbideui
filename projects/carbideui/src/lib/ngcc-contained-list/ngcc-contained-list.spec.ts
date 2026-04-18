import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { runAxe } from '../../test-utils/a11y';
import { NgccContainedList } from './ngcc-contained-list';
import { NgccContainedListItem } from './ngcc-contained-list-item';
import { NgccContainedListKind, NgccContainedListSize } from './ngcc-contained-list.types';

// ---------------------------------------------------------------------------
// Test host
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [CommonModule, NgccContainedList, NgccContainedListItem],
  template: `
    <ngcc-contained-list [label]="label" [kind]="kind" [size]="size" [isInset]="isInset">
      @for (item of items; track $index) {
        <ngcc-contained-list-item
          [disabled]="item.disabled ?? false"
          [clickable]="item.clickable ?? false"
          [iconName]="item.iconName"
          (clicked)="onItemClick(item.label)"
        >
          {{ item.label }}
        </ngcc-contained-list-item>
      }
    </ngcc-contained-list>
  `,
})
class TestHostComponent {
  label = 'List title';
  kind: NgccContainedListKind = 'on-page';
  size: NgccContainedListSize | undefined = undefined;
  isInset = false;
  items: Array<{
    label: string;
    disabled?: boolean;
    clickable?: boolean;
    iconName?: string;
  }> = [];
  clickedItems: string[] = [];

  onItemClick(label: string) {
    this.clickedItems.push(label);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

describe('NgccContainedList & NgccContainedListItem', () => {
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
  }

  function getList() {
    return fixture.debugElement.query(By.directive(NgccContainedList)).nativeElement as HTMLElement;
  }

  function getUl() {
    return fixture.debugElement.query(By.css('ul')).nativeElement as HTMLUListElement;
  }

  function getItems() {
    return fixture.debugElement.queryAll(By.directive(NgccContainedListItem));
  }

  // ---------------------------------------------------------------------------
  // Core Structure
  // ---------------------------------------------------------------------------

  describe('Core Structure', () => {
    it('renders the host element with the base class and kind class', () => {
      host.items = [{ label: 'Item 1' }];
      detectChanges();

      const list = getList();
      expect(list.classList).toContain('cds--contained-list');
      expect(list.classList).toContain('cds--contained-list--on-page');
    });

    it('renders the header with label', () => {
      host.items = [];
      detectChanges();

      const header = fixture.debugElement.query(By.css('.cds--contained-list__header'));
      expect(header).toBeTruthy();

      const labelEl = fixture.debugElement.query(By.css('.cds--contained-list__label'));
      expect(labelEl.nativeElement.textContent.trim()).toBe('List title');
    });

    it('renders a <ul> with role="list"', () => {
      host.items = [{ label: 'A' }];
      detectChanges();

      const ul = getUl();
      expect(ul.tagName.toLowerCase()).toBe('ul');
      expect(ul.getAttribute('role')).toBe('list');
    });

    it('sets aria-labelledby on <ul> pointing to the label id', () => {
      host.items = [{ label: 'A' }];
      detectChanges();

      const ul = getUl();
      const labelEl = fixture.debugElement.query(By.css('.cds--contained-list__label'));
      expect(ul.getAttribute('aria-labelledby')).toBe(labelEl.nativeElement.id);
    });

    it('does not render header when label is empty', () => {
      host.label = '';
      host.items = [];
      detectChanges();

      const header = fixture.debugElement.query(By.css('.cds--contained-list__header'));
      expect(header).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Kind & Size classes
  // ---------------------------------------------------------------------------

  describe('Kind & Size', () => {
    it('applies disclosed class when kind is "disclosed"', () => {
      host.kind = 'disclosed';
      host.items = [];
      detectChanges();

      expect(getList().classList).toContain('cds--contained-list--disclosed');
    });

    it('applies size classes when size is set', () => {
      host.size = 'lg';
      host.items = [];
      detectChanges();

      const list = getList();
      expect(list.classList).toContain('cds--contained-list--lg');
      expect(list.classList).toContain('cds--layout--size-lg');
    });

    it('does not apply size classes when size is undefined', () => {
      host.size = undefined;
      host.items = [];
      detectChanges();

      const list = getList();
      expect(list.classList).not.toContain('cds--contained-list--lg');
      expect(list.classList).not.toContain('cds--layout--size-lg');
    });

    it('applies inset-rulers class when isInset is true', () => {
      host.isInset = true;
      host.items = [];
      detectChanges();

      expect(getList().classList).toContain('cds--contained-list--inset-rulers');
    });
  });

  // ---------------------------------------------------------------------------
  // Items
  // ---------------------------------------------------------------------------

  describe('ContainedListItem', () => {
    it('renders items with role="listitem" and base class', () => {
      host.items = [{ label: 'A' }, { label: 'B' }];
      detectChanges();

      const items = getItems();
      expect(items.length).toBe(2);
      items.forEach((item) => {
        expect(item.nativeElement.getAttribute('role')).toBe('listitem');
        expect(item.nativeElement.classList).toContain('cds--contained-list-item');
      });
    });

    it('renders the content wrapper as a <div> element', () => {
      host.items = [{ label: 'Non-clickable' }];
      detectChanges();

      const contentDiv = fixture.debugElement.query(By.css('.cds--contained-list-item__content'));
      expect(contentDiv.nativeElement.tagName.toLowerCase()).toBe('div');
    });

    it('adds role="button" and tabindex when clickable=true', () => {
      host.items = [{ label: 'Clickable', clickable: true }];
      detectChanges();

      const content = fixture.debugElement.query(By.css('.cds--contained-list-item__content'))
        .nativeElement as HTMLElement;
      expect(content.getAttribute('role')).toBe('button');
      expect(content.getAttribute('tabindex')).toBe('0');
    });

    it('adds clickable class on host when clickable=true', () => {
      host.items = [{ label: 'Clickable', clickable: true }];
      detectChanges();

      const item = getItems()[0].nativeElement as HTMLElement;
      expect(item.classList).toContain('cds--contained-list-item--clickable');
    });

    it('sets aria-disabled and removes tabindex when disabled=true and clickable=true', () => {
      host.items = [{ label: 'Disabled', clickable: true, disabled: true }];
      detectChanges();

      const content = fixture.debugElement.query(By.css('.cds--contained-list-item__content'))
        .nativeElement as HTMLElement;
      expect(content.getAttribute('aria-disabled')).toBe('true');
      expect(content.getAttribute('tabindex')).toBeNull();
    });

    it('emits clicked when a clickable item is activated', () => {
      host.items = [{ label: 'Clickable', clickable: true }];
      detectChanges();

      const content = fixture.debugElement.query(By.css('.cds--contained-list-item__content'))
        .nativeElement as HTMLElement;
      content.click();
      detectChanges();

      expect(host.clickedItems).toContain('Clickable');
    });

    it('does not emit clicked when item is disabled', () => {
      host.items = [{ label: 'Disabled', clickable: true, disabled: true }];
      detectChanges();

      const content = fixture.debugElement.query(By.css('.cds--contained-list-item__content'))
        .nativeElement as HTMLElement;
      content.click();
      detectChanges();

      expect(host.clickedItems).not.toContain('Disabled');
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility (axe)
  // ---------------------------------------------------------------------------

  describe('Accessibility', () => {
    it('should have no axe violations for a basic list', async () => {
      host.items = [{ label: 'Item 1' }, { label: 'Item 2' }];
      detectChanges();
      await fixture.whenStable();

      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations for a clickable list', async () => {
      host.items = [
        { label: 'Item 1', clickable: true },
        { label: 'Item 2', clickable: true },
      ];
      detectChanges();
      await fixture.whenStable();

      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
