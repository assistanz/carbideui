import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgccSectionNav } from './ngcc-section-nav';
import { NgccSectionNavItem } from './ngcc-section-nav.types';
import { runAxe } from '../../test-utils/a11y';

@Component({
  imports: [NgccSectionNav],
  template: `
    <ngcc-section-nav
      [sections]="sections()"
      [(active)]="active"
      [offset]="offset()"
      (sectionSelected)="selected.push($event)"
    />
    <section id="basics"><h2>Basics</h2></section>
    <section id="network"><h2>Network</h2></section>
    <section id="review"><h2>Review</h2></section>
  `,
})
class HostComponent {
  sections = signal<NgccSectionNavItem[]>([
    { id: 'basics', label: 'Basics' },
    { id: 'network', label: 'Network', status: 'error' },
    { id: 'review', label: 'Review', status: 'complete' },
  ]);
  active = signal<string | null>(null);
  offset = signal(0);
  selected: string[] = [];
}

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(
    public cb: Callback,
    public options: IntersectionObserverInit,
  ) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element): void {
    this.observed.push(el);
  }
  disconnect(): void {
    this.disconnected = true;
  }
  unobserve(): void {}
}

describe('NgccSectionNav', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const links = (): HTMLAnchorElement[] => Array.from(el().querySelectorAll('a'));
  const flush = (): Promise<void> => fixture.whenStable();
  const live = (): FakeObserver => FakeObserver.instances.filter((o) => !o.disconnected).at(-1)!;

  beforeEach(async () => {
    FakeObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    await flush();
  });

  afterEach(() => {
    el().remove();
    vi.unstubAllGlobals();
  });

  it('is a labelled nav with a link per section', () => {
    expect(el().querySelector('nav')!.getAttribute('aria-label')).toBe('On this page');
    expect(links().map((a) => a.getAttribute('href'))).toEqual(['#basics', '#network', '#review']);
  });

  it('starts on the first section and marks it current', () => {
    expect(host.active()).toBe('basics');
    expect(links().map((a) => a.getAttribute('aria-current'))).toEqual(['location', null, null]);
  });

  it('follows scrolling: the first visible section becomes current', async () => {
    const obs = live();
    expect(obs.observed.map((e) => e.id)).toEqual(['basics', 'network', 'review']);
    obs.cb([{ isIntersecting: true, target: document.getElementById('network')! }]);
    await flush();
    expect(host.active()).toBe('network');
    obs.cb([{ isIntersecting: false, target: document.getElementById('network')! }]);
    obs.cb([{ isIntersecting: true, target: document.getElementById('review')! }]);
    await flush();
    expect(host.active()).toBe('review');
  });

  it('accounts for a fixed header in the reading line', async () => {
    host.offset.set(64);
    await flush();
    expect(live().options.rootMargin).toBe('-64px 0px -60% 0px');
  });

  it('jumps to a section, reports it and moves focus there', async () => {
    const target = document.getElementById('review')!;
    target.scrollIntoView = vi.fn();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    links()[2].dispatchEvent(ev);
    await flush();
    expect(ev.defaultPrevented).toBe(true);
    expect(target.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(target);
    expect(target.getAttribute('tabindex')).toBe('-1');
    expect(host.active()).toBe('review');
    expect(host.selected).toEqual(['review']);
  });

  it('keeps the browser default when the section is missing', async () => {
    host.sections.set([{ id: 'nowhere', label: 'Nowhere' }]);
    await flush();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    links()[0].dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('writes the status out for screen readers, not colour alone', () => {
    const hidden = Array.from(el().querySelectorAll('.cds--visually-hidden')).map((n) =>
      n.textContent!.trim(),
    );
    expect(hidden).toEqual([', has errors', ', complete']);
  });

  it('re-observes when the sections change and disconnects on destroy', async () => {
    const before = live();
    host.sections.update((s) => [...s, { id: 'extra', label: 'Extra' }]);
    await flush();
    expect(before.disconnected).toBe(true);
    const current = live();
    fixture.destroy();
    expect(current.disconnected).toBe(true);
  });

  it('has no axe violations', async () => {
    expect((await runAxe(el())).violations).toEqual([]);
  });
});
