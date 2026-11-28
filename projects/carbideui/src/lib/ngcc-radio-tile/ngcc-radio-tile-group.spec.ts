import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgccRadioTileGroup } from './ngcc-radio-tile-group';
import { NgccRadioTileOption } from './ngcc-radio-tile-group.types';
import { runAxe } from '../../test-utils/a11y';

const PLANS: NgccRadioTileOption[] = [
  { value: 's', label: 'Starter', description: '1 vCPU' },
  { value: 'p', label: 'Pro', description: '4 vCPU' },
  { value: 'e', label: 'Enterprise', disabled: true },
];

@Component({
  imports: [NgccRadioTileGroup],
  template: `
    <ngcc-radio-tile-group
      legend="Plan"
      helperText="Pick one"
      [options]="plans"
      [(value)]="value"
      [required]="required()"
      [disabled]="disabled()"
      [columns]="columns()"
    />
  `,
})
class HostComponent {
  plans = PLANS;
  value = signal<string | null>(null);
  required = signal(false);
  disabled = signal(false);
  columns = signal<number | undefined>(undefined);
}

@Component({
  imports: [NgccRadioTileGroup, ReactiveFormsModule],
  template: `<ngcc-radio-tile-group legend="Plan" [options]="plans" [formControl]="control" />`,
})
class FormHostComponent {
  plans = PLANS;
  control = new FormControl<string | null>('s', Validators.required);
}

describe('NgccRadioTileGroup', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const radios = (): HTMLInputElement[] => Array.from(el().querySelectorAll('input[type=radio]'));
  const flush = (): Promise<void> => fixture.whenStable();

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

  it('is a named group of native radios sharing one name', () => {
    expect(el().querySelector('fieldset legend')!.textContent).toContain('Plan');
    expect(radios().length).toBe(3);
    expect(new Set(radios().map((r) => r.name)).size).toBe(1);
  });

  it('selects on click and marks the tile selected', async () => {
    radios()[1].click();
    await flush();
    expect(host.value()).toBe('p');
    expect(radios()[1].checked).toBe(true);
    expect(radios()[0].checked).toBe(false);
  });

  it('shows the selected state set from code', async () => {
    host.value.set('s');
    await flush();
    expect(radios()[0].checked).toBe(true);
  });

  it('renders the description and ties it to the radio', () => {
    const first = radios()[0];
    const desc = el().querySelector<HTMLElement>(`#${first.getAttribute('aria-describedby')}`)!;
    expect(desc.textContent).toContain('1 vCPU');
    expect(radios()[2].getAttribute('aria-describedby')).toBeNull();
  });

  it('disables single options', () => {
    expect(radios()[2].disabled).toBe(true);
    expect(radios()[0].disabled).toBe(false);
  });

  it('disables the whole group', async () => {
    host.disabled.set(true);
    await flush();
    expect(el().querySelector('fieldset')!.disabled).toBe(true);
    expect(radios().every((r) => r.disabled)).toBe(true);
  });

  it('uses a fixed column count when asked', async () => {
    host.columns.set(3);
    await flush();
    expect(
      el()
        .querySelector<HTMLElement>('.ngcc--radio-tile-group__grid')!
        .style.getPropertyValue('--ngcc-tile-columns'),
    ).toBe('3');
  });

  it('shows helper text, then an error once touched while required and empty', async () => {
    host.required.set(true);
    await flush();
    expect(el().querySelector('.cds--form__helper-text')).not.toBeNull();
    radios()[0].dispatchEvent(new Event('blur'));
    await flush();
    const err = el().querySelector('.ngcc--form-requirement')!;
    expect(err.textContent).toContain('Select an option');
    expect(el().querySelector('fieldset')!.getAttribute('aria-describedby')).toBe(err.id);
  });

  it('gives every group its own name and ids', () => {
    const second = TestBed.createComponent(HostComponent);
    second.detectChanges();
    try {
      const names = [fixture, second].map(
        (f) => (f.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input')!.name,
      );
      expect(new Set(names).size).toBe(2);
    } finally {
      second.destroy();
    }
  });

  it('has no axe violations', async () => {
    host.value.set('p');
    await flush();
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

    it('writes and reads the control value', async () => {
      const inputs = (): HTMLInputElement[] =>
        Array.from((f.nativeElement as HTMLElement).querySelectorAll('input'));
      expect(inputs()[0].checked).toBe(true);
      inputs()[1].click();
      await f.whenStable();
      expect(f.componentInstance.control.value).toBe('p');
      f.componentInstance.control.setValue(null);
      await f.whenStable();
      expect(inputs().some((i) => i.checked)).toBe(false);
    });

    it('follows disable()', async () => {
      f.componentInstance.control.disable();
      await f.whenStable();
      expect((f.nativeElement as HTMLElement).querySelector('fieldset')!.disabled).toBe(true);
    });
  });
});
