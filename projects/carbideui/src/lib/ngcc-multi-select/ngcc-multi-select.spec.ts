import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgccMultiSelect } from './ngcc-multi-select';
import { NgccMultiSelectOption } from './ngcc-multi-select.types';
import { runAxe } from '../../test-utils/a11y';

const OPTIONS: NgccMultiSelectOption[] = [
  { value: 'eu', label: 'Europe West', group: 'Europe' },
  { value: 'eun', label: 'Europe North', group: 'Europe' },
  { value: 'us', label: 'US East', group: 'Americas' },
  { value: 'ap', label: 'Asia Pacific' },
  { value: 'gone', label: 'Retired', disabled: true },
];

@Component({
  imports: [NgccMultiSelect],
  template: `
    <ngcc-multi-select
      label="Regions"
      helperText="Pick some"
      [options]="options()"
      [(value)]="value"
      [selectAll]="selectAll()"
      [creatable]="creatable()"
      [loading]="loading()"
      [error]="error()"
      [disabled]="disabled()"
      [required]="required()"
      (created)="created.push($event)"
      (retry)="retries = retries + 1"
    />
  `,
})
class HostComponent {
  options = signal(OPTIONS);
  value = signal<string[]>([]);
  selectAll = signal(false);
  creatable = signal(false);
  loading = signal(false);
  error = signal('');
  disabled = signal(false);
  required = signal(false);
  created: string[] = [];
  retries = 0;
}

@Component({
  imports: [NgccMultiSelect, ReactiveFormsModule],
  template: `<ngcc-multi-select label="Tags" [options]="options" [formControl]="control" />`,
})
class FormHostComponent {
  options = OPTIONS;
  control = new FormControl<string[]>(['us'], {
    nonNullable: true,
    validators: Validators.required,
  });
}

describe('NgccMultiSelect', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const input = (): HTMLInputElement => el().querySelector('input[role="combobox"]')!;
  const menu = (): HTMLElement => el().querySelector('[role="listbox"]')!;
  const options = (): HTMLElement[] => Array.from(menu().querySelectorAll('[role="option"]'));
  const chips = (): string[] =>
    Array.from(el().querySelectorAll('ngcc-tag')).map((t) => t.textContent!.trim());
  const flush = (): Promise<void> => fixture.whenStable();
  const type = async (text: string): Promise<void> => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    await flush();
  };
  const key = async (k: string): Promise<void> => {
    input().dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
    );
    await flush();
  };
  const blur = async (): Promise<void> => {
    input().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await flush();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, FormHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    await flush();
  });

  afterEach(() => el().remove());

  it('is closed at first and exposes a labelled combobox', () => {
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(menu().hidden).toBe(true);
    expect(el().querySelector('label')!.getAttribute('for')).toBe(input().id);
    expect(menu().getAttribute('aria-multiselectable')).toBe('true');
    expect(input().getAttribute('aria-controls')).toBe(menu().id);
  });

  it('opens on typing and filters by label', async () => {
    await type('europe');
    expect(menu().hidden).toBe(false);
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(options().map((o) => o.textContent!.trim())).toEqual([
      expect.stringContaining('Europe West'),
      expect.stringContaining('Europe North'),
    ]);
  });

  it('groups options under headings, ungrouped first', async () => {
    await key('ArrowDown');
    const items = Array.from(menu().querySelectorAll('li')).map((li) => li.textContent!.trim());
    expect(items[0]).toContain('Asia Pacific');
    expect(items.indexOf('Europe')).toBeLessThan(items.indexOf('Americas') + 10);
    expect(menu().querySelectorAll('.ngcc--multi-select__group').length).toBe(2);
  });

  it('selects on click, shows a chip, and keeps the list open', async () => {
    await key('ArrowDown');
    options()
      .find((o) => o.textContent!.includes('US East'))!
      .click();
    await flush();
    expect(host.value()).toEqual(['us']);
    expect(chips()).toEqual(['US East']);
    expect(menu().hidden).toBe(false);
    expect(
      options()
        .find((o) => o.textContent!.includes('US East'))!
        .getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('removes a chip with its button and with Backspace', async () => {
    host.value.set(['us', 'ap']);
    await flush();
    el().querySelector<HTMLButtonElement>('ngcc-tag button')!.click();
    await flush();
    expect(host.value()).toEqual(['ap']);
    await key('Backspace');
    expect(host.value()).toEqual([]);
  });

  it('labels the chip buttons for assistive technology', async () => {
    host.value.set(['us']);
    await flush();
    expect(el().querySelector('ngcc-tag button')!.getAttribute('aria-label')).toBe(
      'Remove US East',
    );
  });

  it('does not select disabled options', async () => {
    await key('ArrowDown');
    const retired = options().find((o) => o.textContent!.includes('Retired'))!;
    expect(retired.getAttribute('aria-disabled')).toBe('true');
    retired.click();
    await flush();
    expect(host.value()).toEqual([]);
  });

  describe('keyboard', () => {
    it('moves with the arrows, wraps, and picks with Enter', async () => {
      await key('ArrowDown');
      await key('ArrowDown');
      const active = options().find((o) => o.id === input().getAttribute('aria-activedescendant'))!;
      expect(active).toBeTruthy();
      await key('Enter');
      expect(host.value().length).toBe(1);
    });

    it('skips disabled options', async () => {
      await type('Retired');
      expect(input().getAttribute('aria-activedescendant')).toBeNull();
      await key('Enter');
      expect(host.value()).toEqual([]);
    });

    it('closes on Escape, clearing the search', async () => {
      await type('eu');
      await key('Escape');
      expect(menu().hidden).toBe(true);
      expect(input().value).toBe('');
    });

    it('does not trap Enter while closed', async () => {
      const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      input().dispatchEvent(ev);
      expect(ev.defaultPrevented).toBe(false);
    });
  });

  describe('select all', () => {
    beforeEach(async () => {
      host.selectAll.set(true);
      await flush();
      await key('ArrowDown');
    });

    it('selects every enabled option, then clears them', async () => {
      menu().querySelector<HTMLElement>('.ngcc--multi-select__option--all')!.click();
      await flush();
      expect(host.value().sort()).toEqual(['ap', 'eu', 'eun', 'us']);
      menu().querySelector<HTMLElement>('.ngcc--multi-select__option--all')!.click();
      await flush();
      expect(host.value()).toEqual([]);
    });

    it('acts on the matches only', async () => {
      await type('europe');
      menu().querySelector<HTMLElement>('.ngcc--multi-select__option--all')!.click();
      await flush();
      expect(host.value().sort()).toEqual(['eu', 'eun']);
    });
  });

  describe('creatable', () => {
    beforeEach(async () => {
      host.creatable.set(true);
      await flush();
    });

    it('offers to create unmatched text and adds the value', async () => {
      await type('Mars');
      const create = menu().querySelector<HTMLElement>('.ngcc--multi-select__option--create')!;
      expect(create.textContent).toContain('Create "Mars"');
      await key('ArrowDown');
      await key('Enter');
      expect(host.value()).toEqual(['Mars']);
      expect(host.created).toEqual(['Mars']);
      expect(chips()).toEqual(['Mars']);
      expect(input().value).toBe('');
    });

    it('does not offer to create something that already exists', async () => {
      await type('us east');
      expect(menu().querySelector('.ngcc--multi-select__option--create')).toBeNull();
    });
  });

  describe('states', () => {
    it('shows a loading row', async () => {
      host.loading.set(true);
      await flush();
      await key('ArrowDown');
      expect(menu().textContent).toContain('Loading…');
    });

    it('shows an error with a working retry', async () => {
      host.error.set('Could not load regions');
      await flush();
      await key('ArrowDown');
      expect(menu().textContent).toContain('Could not load regions');
      menu().querySelector<HTMLButtonElement>('.ngcc--multi-select__retry')!.click();
      expect(host.retries).toBe(1);
    });

    it('says when nothing matches', async () => {
      await type('zzz');
      expect(menu().textContent).toContain('No matches');
    });

    it('cannot be changed while disabled', async () => {
      host.disabled.set(true);
      host.value.set(['us']);
      await flush();
      expect(input().disabled).toBe(true);
      expect(el().querySelector('ngcc-tag button')).toBeNull();
    });

    it('turns invalid after blur when required and empty', async () => {
      host.required.set(true);
      await flush();
      expect(el().querySelector('.ngcc--form-requirement')).toBeNull();
      await blur();
      expect(el().querySelector('.ngcc--form-requirement')!.textContent).toContain(
        'Select at least one option',
      );
      expect(input().getAttribute('aria-invalid')).toBe('true');
      expect(input().getAttribute('aria-describedby')).toBe(
        el().querySelector('.ngcc--form-requirement')!.id,
      );
    });
  });

  it('announces the number of results', async () => {
    await type('europe');
    expect(el().querySelector('[role="status"]')!.textContent).toBe('2 results');
  });

  it('closes when focus leaves but not when it stays inside', async () => {
    await key('ArrowDown');
    input().dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: el().querySelector(
          '.ngcc--multi-select__clear, .ngcc--multi-select__toggle',
        ),
      }),
    );
    await flush();
    expect(menu().hidden).toBe(false);
    await blur();
    expect(menu().hidden).toBe(true);
  });

  it('gives every instance its own ids', () => {
    const second = TestBed.createComponent(HostComponent);
    second.detectChanges();
    try {
      const ids = [fixture, second].map(
        (f) => (f.nativeElement as HTMLElement).querySelector('input')!.id,
      );
      expect(new Set(ids).size).toBe(2);
    } finally {
      second.destroy();
    }
  });

  it('has no axe violations closed and open', async () => {
    expect((await runAxe(el())).violations).toEqual([]);
    host.value.set(['us']);
    await flush();
    await key('ArrowDown');
    expect((await runAxe(el())).violations).toEqual([]);
  });

  describe('with Angular forms', () => {
    let f: ComponentFixture<FormHostComponent>;
    beforeEach(async () => {
      f = TestBed.createComponent(FormHostComponent);
      document.body.appendChild(f.nativeElement);
      await f.whenStable();
    });
    afterEach(() => f.nativeElement.remove());

    it('writes the form value as chips and reports changes back', async () => {
      const root = f.nativeElement as HTMLElement;
      expect(root.querySelector('ngcc-tag')!.textContent).toContain('US East');
      const box = root.querySelector<HTMLInputElement>('input')!;
      box.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await f.whenStable();
      Array.from(root.querySelectorAll<HTMLElement>('[role="option"]'))
        .find((o) => o.textContent!.includes('Asia'))!
        .click();
      await f.whenStable();
      expect(f.componentInstance.control.value).toEqual(['us', 'ap']);
    });

    it('shows the invalid state after the control is touched while empty', async () => {
      const root = f.nativeElement as HTMLElement;
      f.componentInstance.control.setValue([]);
      await f.whenStable();
      root
        .querySelector('input')!
        .dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      await f.whenStable();
      expect(root.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
    });

    it('follows the disabled state of the control', async () => {
      f.componentInstance.control.disable();
      await f.whenStable();
      expect((f.nativeElement as HTMLElement).querySelector('input')!.disabled).toBe(true);
    });
  });
});
