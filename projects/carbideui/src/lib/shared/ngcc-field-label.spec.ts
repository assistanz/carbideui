import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgccInput } from '../ngcc-input/ngcc-input-text/ngcc-input';
import { NgccInputNumber } from '../ngcc-input/ngcc-input-number/ngcc-input-number';
import { NgccTextAreaComponent } from '../ngcc-input/ngcc-textarea/ngcc-text-area';
import { NgccDropdown } from '../ngcc-dropdown/ngcc-dropdown';
import { NgccMultiSelect } from '../ngcc-multi-select/ngcc-multi-select';
import { NgccFormField } from '../ngcc-form-field/ngcc-form-field';
import { runAxe } from '../../test-utils/a11y';

/** Every form component must mark optional and required fields and offer a tooltip the same way. */
@Component({
  imports: [
    NgccInput,
    NgccInputNumber,
    NgccTextAreaComponent,
    NgccDropdown,
    NgccMultiSelect,
    NgccFormField,
  ],
  template: `
    <ngcc-input label="Text" [optional]="true" tooltip="Text help" />
    <ngcc-input-number label="Number" [optional]="true" tooltip="Number help" />
    <ngcc-text-area label="Area" [optional]="true" tooltip="Area help" />
    <ngcc-dropdown label="Drop" [optional]="true" tooltip="Drop help" [options]="[]" />
    <ngcc-multi-select label="Multi" [optional]="true" tooltip="Multi help" [options]="[]" />
    <ngcc-form-field label="Native" [optional]="true" tooltip="Native help"
      ><input
    /></ngcc-form-field>
    <ngcc-input label="Req" [required]="true" [optional]="true" optionalLabel="facultatif" />
    <ngcc-input label="Plain" />
    <ngcc-input label="French" [optional]="true" optionalLabel="facultatif" />
  `,
})
class HostComponent {}

describe('shared field label (consistency across form components)', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => el.remove());

  const labelOf = (text: string): HTMLElement =>
    Array.from(el.querySelectorAll<HTMLElement>('ngcc-field-label')).find((l) =>
      l.querySelector('label')!.textContent!.includes(text),
    )!;

  it.each(['Text', 'Number', 'Area', 'Drop', 'Multi', 'Native'])(
    '%s: shows "(optional)" in the label and a named tooltip button next to it',
    (name) => {
      const l = labelOf(name);
      expect(l.querySelector('label .ngcc-field-label__optional')!.textContent).toBe('(optional)');
      const tip = l.querySelector('button.ngcc-field-label__tip')!;
      expect(tip.getAttribute('aria-label')).toBe(`${name} help`);
      // A button inside a label is invalid, so the tip must sit beside it.
      expect(l.querySelector('label button')).toBeNull();
    },
  );

  it('required wins over optional', () => {
    const l = labelOf('Req');
    expect(l.querySelector('.cds--input-required')).not.toBeNull();
    expect(l.querySelector('.ngcc-field-label__optional')).toBeNull();
  });

  it('translates the optional text and shows nothing extra by default', () => {
    expect(labelOf('French').querySelector('.ngcc-field-label__optional')!.textContent).toBe(
      '(facultatif)',
    );
    const plain = labelOf('Plain');
    expect(plain.querySelector('.ngcc-field-label__optional')).toBeNull();
    expect(plain.querySelector('.ngcc-field-label__tip')).toBeNull();
  });

  it('keeps each label tied to its own control', () => {
    for (const l of Array.from(el.querySelectorAll('ngcc-field-label'))) {
      const forId = l.querySelector('label')!.getAttribute('for');
      expect(forId, l.textContent!).toBeTruthy();
      expect(el.querySelectorAll(`[id="${forId}"]`).length, `${l.textContent} -> ${forId}`).toBe(1);
    }
  });

  it('has no axe violations', async () => {
    expect((await runAxe(el)).violations).toEqual([]);
  });
});
