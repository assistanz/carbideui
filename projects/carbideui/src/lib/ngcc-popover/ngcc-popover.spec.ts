import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccPopover } from './ngcc-popover';
import { NgccPopoverPlacement, NgccPopoverTrigger } from './ngcc-popover.types';
import { runAxe } from '../../test-utils/a11y';

@Component({
  imports: [NgccPopover],
  template: `
    <button id="outside" type="button">Outside</button>
    <ngcc-popover
      [(open)]="open"
      [placement]="placement()"
      [trigger]="trigger()"
      label="Cluster details"
    >
      <button ngccPopoverTrigger id="t" type="button" class="cds--btn">Details</button>
      <p class="content">Region eu-west-1</p>
      <button type="button" id="inner">Inner</button>
    </ngcc-popover>
  `,
})
class HostComponent {
  open = signal(false);
  placement = signal<NgccPopoverPlacement>('bottom');
  trigger = signal<NgccPopoverTrigger>('click');
}

describe('NgccPopover', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const pop = (): HTMLElement => el().querySelector('ngcc-popover')!;
  const trigger = (): HTMLButtonElement => el().querySelector('#t')!;
  const flush = (): Promise<void> => fixture.whenStable();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    await flush();
  });

  afterEach(() => el().remove());

  it('is closed at first and uses the Carbon popover structure', () => {
    expect(pop().classList).toContain('cds--popover-container');
    expect(pop().classList).not.toContain('cds--popover--open');
    expect(pop().querySelector('.cds--popover > .cds--popover-content')).not.toBeNull();
  });

  describe('click trigger', () => {
    it('opens and closes from the trigger', async () => {
      trigger().click();
      await flush();
      expect(pop().classList).toContain('cds--popover--open');
      expect(host.open()).toBe(true);
      trigger().click();
      await flush();
      expect(host.open()).toBe(false);
    });

    it('does not toggle when the content itself is clicked', async () => {
      host.open.set(true);
      await flush();
      el().querySelector<HTMLElement>('.content')!.click();
      await flush();
      expect(host.open()).toBe(true);
    });

    it('closes on a click outside', async () => {
      trigger().click();
      await flush();
      el().querySelector<HTMLElement>('#outside')!.click();
      await flush();
      expect(host.open()).toBe(false);
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      trigger().click();
      await flush();
      const inner = el().querySelector<HTMLElement>('#inner')!;
      inner.focus();
      inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await flush();
      expect(host.open()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    });

    it('ignores Escape while closed', async () => {
      const stop = vi.fn();
      const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      ev.stopPropagation = stop;
      trigger().dispatchEvent(ev);
      expect(stop).not.toHaveBeenCalled();
    });
  });

  describe('hover trigger', () => {
    beforeEach(async () => {
      host.trigger.set('hover');
      await flush();
    });

    it('opens on pointer enter and closes on leave', async () => {
      pop().dispatchEvent(new MouseEvent('mouseenter'));
      await flush();
      expect(host.open()).toBe(true);
      pop().dispatchEvent(new MouseEvent('mouseleave'));
      await flush();
      expect(host.open()).toBe(false);
    });

    it('keeps the content inside the host so moving onto it is not a leave', () => {
      const content = pop().querySelector('.cds--popover-content')!;
      expect(pop().contains(content)).toBe(true);
    });

    it('opens on keyboard focus and closes when focus leaves', async () => {
      trigger().focus();
      await flush();
      expect(host.open()).toBe(true);
      el().querySelector<HTMLElement>('#outside')!.focus();
      await flush();
      expect(host.open()).toBe(false);
    });

    it('stays open while focus moves inside the popover', async () => {
      trigger().focus();
      el().querySelector<HTMLElement>('#inner')!.focus();
      await flush();
      expect(host.open()).toBe(true);
    });

    it('does not toggle on click', async () => {
      trigger().click();
      await flush();
      expect(host.open()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('wires aria-expanded, aria-controls and aria-haspopup on the trigger', async () => {
      const content = pop().querySelector('.cds--popover-content')!;
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(trigger().getAttribute('aria-controls')).toBe(content.id);
      expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
      trigger().click();
      await flush();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('is a named, non-modal dialog', () => {
      const content = pop().querySelector('.cds--popover-content')!;
      expect(content.getAttribute('role')).toBe('dialog');
      expect(content.getAttribute('aria-label')).toBe('Cluster details');
      expect(content.getAttribute('aria-modal')).toBeNull();
    });

    it('gives each popover its own id', () => {
      const second = TestBed.createComponent(HostComponent);
      second.detectChanges();
      try {
        const ids = [fixture, second].map(
          (f) => (f.nativeElement as HTMLElement).querySelector('.cds--popover-content')!.id,
        );
        expect(new Set(ids).size).toBe(2);
      } finally {
        second.destroy();
      }
    });

    it('has no axe violations open', async () => {
      trigger().click();
      await flush();
      expect((await runAxe(el())).violations).toEqual([]);
    });
  });

  it('applies the placement', async () => {
    host.placement.set('right-start');
    await flush();
    expect(pop().classList).toContain('cds--popover--right-start');
  });
});
