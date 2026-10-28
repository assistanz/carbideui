import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccStepper } from './ngcc-stepper';
import { NgccStep } from './ngcc-stepper.types';
import { runAxe } from '../../test-utils/a11y';

const STEPS: NgccStep[] = [
  { label: 'Details' },
  { label: 'Plan', secondaryLabel: 'Optional' },
  { label: 'Billing' },
  { label: 'Review' },
];

describe('NgccStepper', () => {
  let fixture: ComponentFixture<NgccStepper>;
  const set = async (inputs: Record<string, unknown>): Promise<void> => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
  };
  const el = (): HTMLElement => fixture.nativeElement;
  const items = (): HTMLElement[] => Array.from(el().querySelectorAll('li'));
  const buttons = (): HTMLButtonElement[] => Array.from(el().querySelectorAll('button'));
  const states = (): string[] =>
    items().map(
      (li) => /cds--progress-step--(complete|current|incomplete|invalid)\b/.exec(li.className)![1],
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccStepper],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(NgccStepper);
    fixture.componentRef.setInput('steps', STEPS);
    await fixture.whenStable();
  });

  it('marks steps before the current one complete and after it incomplete', async () => {
    expect(states()).toEqual(['current', 'incomplete', 'incomplete', 'incomplete']);
    await set({ current: 2 });
    expect(states()).toEqual(['complete', 'complete', 'current', 'incomplete']);
  });

  it('shows the invalid state for a step with an error', async () => {
    await set({ current: 2, steps: STEPS.map((s, i) => (i === 1 ? { ...s, invalid: true } : s)) });
    expect(states()[1]).toBe('invalid');
  });

  it('shows secondary labels', () => {
    expect(el().querySelector('.cds--progress-optional')!.textContent).toBe('Optional');
  });

  describe('accessibility', () => {
    it('is a labelled nav with an ordered list', async () => {
      expect(el().querySelector('nav')!.getAttribute('aria-label')).toBe('Progress');
      expect(el().querySelector('ol')).not.toBeNull();
      await set({ ariaLabel: 'Create client' });
      expect(el().querySelector('nav')!.getAttribute('aria-label')).toBe('Create client');
    });

    it('marks only the current step with aria-current="step"', async () => {
      await set({ current: 1 });
      expect(buttons().map((b) => b.getAttribute('aria-current'))).toEqual([
        null,
        'step',
        null,
        null,
      ]);
    });

    it('spells out every state in text, not color alone', async () => {
      await set({ current: 1 });
      const hidden = Array.from(el().querySelectorAll('.cds--visually-hidden')).map((n) =>
        n.textContent!.replace(/[:\s]/g, ''),
      );
      expect(hidden).toEqual(['Complete', 'Current', 'Incomplete', 'Incomplete']);
    });

    it('takes unreachable steps out of the tab order', async () => {
      await set({ current: 1 });
      expect(buttons().map((b) => b.tabIndex)).toEqual([0, 0, -1, -1]);
      expect(buttons()[3].getAttribute('aria-disabled')).toBe('true');
    });

    it('has no axe violations', async () => {
      await set({ current: 1 });
      expect((await runAxe(el())).violations).toEqual([]);
    });
  });

  describe('navigation', () => {
    it('lets users go back to a completed step and reports it', async () => {
      await set({ current: 2 });
      const seen: number[] = [];
      fixture.componentInstance.stepChange.subscribe((e) => seen.push(e.index));
      buttons()[0].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.current()).toBe(0);
      expect(seen).toEqual([0]);
    });

    it('does not let a linear flow skip ahead', async () => {
      buttons()[3].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.current()).toBe(0);
    });

    it('allows jumping anywhere when not linear', async () => {
      await set({ linear: false });
      buttons()[3].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.current()).toBe(3);
    });

    it('never navigates to a disabled step', async () => {
      await set({
        linear: false,
        steps: STEPS.map((s, i) => (i === 2 ? { ...s, disabled: true } : s)),
      });
      buttons()[2].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.current()).toBe(0);
    });

    it('next() and previous() stop at the ends', async () => {
      const c = fixture.componentInstance;
      c.previous();
      expect(c.current()).toBe(0);
      for (let i = 0; i < 6; i++) c.next();
      expect(c.current()).toBe(3);
      expect(c.summary()).toBe('Step 4 of 4');
    });

    it('next() and previous() emit stepChange only when the step changes', async () => {
      const c = fixture.componentInstance;
      const seen: number[] = [];
      c.stepChange.subscribe((e) => seen.push(e.index));
      c.previous();
      c.next();
      c.next();
      c.previous();
      expect(seen).toEqual([1, 2, 1]);
    });

    it('keeps an invalid step behind the current one reachable', async () => {
      await set({
        current: 2,
        steps: STEPS.map((s, i) => (i === 0 ? { ...s, invalid: true } : s)),
      });
      expect(states()[0]).toBe('invalid');
      expect(buttons()[0].tabIndex).toBe(0);
    });

    it('tracks steps by id when given', async () => {
      await set({ steps: STEPS.map((s, i) => ({ ...s, id: `s${i}` })) });
      const first = buttons()[0];
      await set({
        steps: [
          { id: 's0', label: 'Renamed' },
          ...STEPS.slice(1).map((s, i) => ({ ...s, id: `s${i + 1}` })),
        ],
      });
      expect(buttons()[0]).toBe(first);
    });

    it('handles an empty steps array', async () => {
      await set({ steps: [] });
      const c = fixture.componentInstance;
      expect(c.summary()).toBe('No steps');
      c.next();
      c.previous();
      expect(c.current()).toBe(0);
    });

    it('stays vertical when asked', async () => {
      await set({ vertical: true });
      expect(el().querySelector('ol')!.classList).toContain('cds--progress--vertical');
    });
  });
});
