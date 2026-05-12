import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

import { NgccHeaderMenu } from './ngcc-header-menu';
import { NgccHeaderMenuItem } from './header-menu-item/ngcc-header-menu-item';
import type { NgccHeaderMenuTrigger } from '../ngcc-header.types';

@Component({
  template: `
    <ngcc-header-menu [title]="title" [trigger]="trigger" [(expanded)]="expanded">
      <ngcc-header-menu-item href="/item1">Item 1</ngcc-header-menu-item>
      <ngcc-header-menu-item href="/item2">Item 2</ngcc-header-menu-item>
      <ngcc-header-menu-item href="/item3">Item 3</ngcc-header-menu-item>
    </ngcc-header-menu>
  `,
  standalone: true,
  imports: [NgccHeaderMenu, NgccHeaderMenuItem],
})
class TestHeaderMenuHost {
  title = 'Settings';
  trigger: NgccHeaderMenuTrigger = 'click';
  expanded = false;
}

describe('NgccHeaderMenu', () => {
  let fixture: ComponentFixture<TestHeaderMenuHost>;
  let host: TestHeaderMenuHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHeaderMenuHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHeaderMenuHost);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
    fixture.whenStable?.();
  }

  function getTrigger() {
    return fixture.debugElement.query(By.css('.cds--header__menu-title'));
  }

  function getMenuList() {
    return fixture.debugElement.query(By.css('ul.cds--header__menu'));
  }

  function getMenuComponent(): NgccHeaderMenu {
    return fixture.debugElement.query(By.directive(NgccHeaderMenu)).componentInstance;
  }

  function getMenuItemLinks() {
    return fixture.debugElement.queryAll(By.css('a[role="menuitem"]'));
  }

  describe('Core Functionality', () => {
    it('renders trigger element with title text', () => {
      host.title = 'Settings';
      detectChanges();
      expect(getTrigger().nativeElement.textContent).toContain('Settings');
    });

    it('trigger has cds--header__menu-item and cds--header__menu-title classes', () => {
      detectChanges();
      const trigger = getTrigger().nativeElement;
      expect(trigger.classList).toContain('cds--header__menu-item');
      expect(trigger.classList).toContain('cds--header__menu-title');
    });

    it('trigger has aria-haspopup="menu"', () => {
      detectChanges();
      expect(getTrigger().nativeElement.getAttribute('aria-haspopup')).toBe('menu');
    });

    it('renders <ul class="cds--header__menu" role="menu">', () => {
      detectChanges();
      const ul = getMenuList();
      expect(ul).toBeTruthy();
      expect(ul.nativeElement.getAttribute('role')).toBe('menu');
    });

    it('sets aria-label on menu list from title', () => {
      host.title = 'Settings';
      detectChanges();
      expect(getMenuList().nativeElement.getAttribute('aria-label')).toBe('Settings');
    });

    it('starts with aria-expanded="false" on trigger', () => {
      host.expanded = false;
      detectChanges();
      expect(getTrigger().nativeElement.getAttribute('aria-expanded')).toBe('false');
    });

    it('sets aria-expanded="true" on trigger when expanded', () => {
      host.expanded = true;
      detectChanges();
      expect(getTrigger().nativeElement.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Expand / Collapse / Toggle methods', () => {
    // model() is synchronous — read signal directly after method call without detectChanges

    it('expand() sets expanded to true', () => {
      detectChanges();
      getMenuComponent().expand();
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('collapse() sets expanded to false', () => {
      host.expanded = true;
      detectChanges();
      getMenuComponent().collapse();
      expect(getMenuComponent().expanded).toBe(false);
    });

    it('toggle() flips expanded from false to true', () => {
      detectChanges();
      getMenuComponent().toggle();
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('toggle() flips expanded from true to false', () => {
      host.expanded = true;
      detectChanges();
      getMenuComponent().toggle();
      expect(getMenuComponent().expanded).toBe(false);
    });
  });

  describe('Click Trigger (click mode)', () => {
    it('clicking trigger opens menu', () => {
      detectChanges();
      getTrigger().nativeElement.click();
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('clicking trigger again closes menu', () => {
      detectChanges();
      getTrigger().nativeElement.click();
      getTrigger().nativeElement.click();
      expect(getMenuComponent().expanded).toBe(false);
    });

    it('clicking trigger in mouseover mode does not toggle', () => {
      host.trigger = 'mouseover';
      detectChanges();
      getTrigger().nativeElement.click();
      expect(getMenuComponent().expanded).toBe(false);
    });
  });

  describe('Two-way binding', () => {
    it('updates host.expanded when menu is toggled via click', () => {
      detectChanges();
      getTrigger().nativeElement.click();
      expect(host.expanded).toBe(true);
    });

    it('reflects host.expanded=true in aria-expanded', () => {
      host.expanded = true;
      detectChanges();
      expect(getTrigger().nativeElement.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Keyboard Navigation — Trigger', () => {
    it('Enter key opens the menu', () => {
      detectChanges();
      getTrigger().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('Enter key closes the menu when already expanded', () => {
      detectChanges();
      getMenuComponent().expand();
      getTrigger().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(false);
    });

    it('Space key opens the menu', () => {
      detectChanges();
      getTrigger().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('ArrowDown on trigger expands the menu', () => {
      detectChanges();
      getTrigger().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('ArrowUp on trigger expands the menu', () => {
      detectChanges();
      getTrigger().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('Escape on trigger collapses the menu', () => {
      detectChanges();
      getMenuComponent().expand();
      getTrigger().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(false);
    });
  });

  describe('Keyboard Navigation — Menu List', () => {
    it('Tab in menu list collapses the menu', () => {
      host.expanded = true;
      detectChanges();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(false);
    });

    it('Escape in menu list collapses the menu', () => {
      host.expanded = true;
      detectChanges();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      expect(getMenuComponent().expanded).toBe(false);
    });

    it('Escape in menu list returns focus to trigger', () => {
      host.expanded = true;
      detectChanges();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      expect(document.activeElement).toBe(getTrigger().nativeElement);
    });

    it('ArrowDown moves focus to the next menu item', () => {
      host.expanded = true;
      detectChanges();
      const items = getMenuItemLinks();
      items[0].nativeElement.focus();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      expect(document.activeElement).toBe(items[1].nativeElement);
    });

    it('ArrowUp moves focus to the previous menu item', () => {
      host.expanded = true;
      detectChanges();
      const items = getMenuItemLinks();
      items[1].nativeElement.focus();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      expect(document.activeElement).toBe(items[0].nativeElement);
    });

    it('ArrowDown wraps focus from last item to first', () => {
      host.expanded = true;
      detectChanges();
      const items = getMenuItemLinks();
      items[items.length - 1].nativeElement.focus();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      expect(document.activeElement).toBe(items[0].nativeElement);
    });

    it('ArrowUp wraps focus from first item to last', () => {
      host.expanded = true;
      detectChanges();
      const items = getMenuItemLinks();
      items[0].nativeElement.focus();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      expect(document.activeElement).toBe(items[items.length - 1].nativeElement);
    });

    it('Home focuses the first menu item', () => {
      host.expanded = true;
      detectChanges();
      const items = getMenuItemLinks();
      items[2].nativeElement.focus();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
      );
      expect(document.activeElement).toBe(items[0].nativeElement);
    });

    it('End focuses the last menu item', () => {
      host.expanded = true;
      detectChanges();
      const items = getMenuItemLinks();
      items[0].nativeElement.focus();
      getMenuList().nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      expect(document.activeElement).toBe(items[items.length - 1].nativeElement);
    });
  });

  describe('FocusOut — collapse on blur', () => {
    it('collapses when focus moves outside the menu list and trigger', () => {
      host.expanded = true;
      detectChanges();
      const externalEl = document.createElement('button');
      document.body.appendChild(externalEl);
      const focusOutEvent = new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: externalEl,
      });
      getMenuList().nativeElement.dispatchEvent(focusOutEvent);
      expect(getMenuComponent().expanded).toBe(false);
      document.body.removeChild(externalEl);
    });

    it('does not collapse when focus stays within the menu list', () => {
      host.expanded = true;
      detectChanges();
      const items = getMenuItemLinks();
      const focusOutEvent = new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: items[1].nativeElement,
      });
      getMenuList().nativeElement.dispatchEvent(focusOutEvent);
      expect(getMenuComponent().expanded).toBe(true);
    });
  });

  describe('Mouseover Trigger', () => {
    it('mouseenter on trigger expands (mouseover mode)', () => {
      host.trigger = 'mouseover';
      detectChanges();
      getTrigger().nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      expect(getMenuComponent().expanded).toBe(true);
    });

    it('mouseleave on trigger collapses after 150ms delay', () => {
      host.trigger = 'mouseover';
      host.expanded = true;
      detectChanges();
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        getTrigger().nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        expect(getMenuComponent().expanded).toBe(true); // not yet collapsed
        vi.runAllTimers();
        expect(getMenuComponent().expanded).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('mouseleave on menu list collapses after delay', () => {
      host.trigger = 'mouseover';
      host.expanded = true;
      detectChanges();
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        getMenuList().nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        expect(getMenuComponent().expanded).toBe(true);
        vi.runAllTimers();
        expect(getMenuComponent().expanded).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });
    it('mouseenter on menu list clears the collapse timeout', () => {
      host.trigger = 'mouseover';
      host.expanded = true;
      detectChanges();
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        // Trigger mouseleave to start the timer
        getTrigger().nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        // Trigger mouseenter on menu list to clear the timer
        getMenuList().nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        vi.runAllTimers();
        expect(getMenuComponent().expanded).toBe(true); // Should remain open
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // NgccHeaderMenu: the trigger <a> uses aria-expanded which is not allowed on anchors —
  // this is a known Carbon pattern that deviates from strict ARIA; axe tests are omitted here.
});
