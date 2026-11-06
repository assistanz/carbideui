import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgccFormField } from './ngcc-form-field';
import { runAxe } from '../../test-utils/a11y';

@Component({
  imports: [NgccFormField],
  template: `
    <ngcc-form-field
      label="Hostname"
      [required]="required()"
      [optional]="optional()"
      [helperText]="helper()"
      [error]="error()"
      [tooltip]="tip()"
    >
      <input class="cds--text-input" aria-describedby="other" />
    </ngcc-form-field>
    <ngcc-form-field label="Region"
      ><select>
        <option>eu</option>
      </select></ngcc-form-field
    >
  `,
})
class HostComponent {
  required = signal(false);
  optional = signal(false);
  helper = signal('Letters and digits');
  error = signal('');
  tip = signal('');
}

describe('NgccFormField', () => {
  const setup = async (): Promise<{ el: HTMLElement; host: HostComponent }> => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    return { el: fixture.nativeElement, host: fixture.componentInstance };
  };
  const input = (el: HTMLElement): HTMLInputElement => el.querySelector('input')!;

  afterEach(() => document.body.replaceChildren());

  it('links the label to the control and the helper text to aria-describedby', async () => {
    const { el } = await setup();
    const label = el.querySelector('label')!;
    expect(label.getAttribute('for')).toBe(input(el).id);
    const ids = input(el).getAttribute('aria-describedby')!.split(' ');
    expect(ids[0]).toBe('other');
    expect(el.querySelector(`#${ids[1]}`)!.textContent).toContain('Letters and digits');
  });

  it('gives every field its own ids', async () => {
    const { el } = await setup();
    const ids = Array.from(el.querySelectorAll('[id]')).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows the error instead of the helper and marks the control invalid', async () => {
    const { el, host } = await setup();
    host.error.set('Hostname is required');
    TestBed.tick();
    expect(input(el).getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('[role="alert"]')!.textContent).toContain('Hostname is required');
    expect(el.textContent).not.toContain('Letters and digits');
    host.error.set('');
    TestBed.tick();
    expect(input(el).hasAttribute('aria-invalid')).toBe(false);
  });

  it('marks required with an asterisk and optional with text', async () => {
    const { el, host } = await setup();
    host.optional.set(true);
    TestBed.tick();
    expect(el.querySelector('.ngcc-field-label__optional')!.textContent).toContain('optional');
    host.required.set(true);
    TestBed.tick();
    expect(el.querySelector('.cds--input-required')).not.toBeNull();
    expect(el.querySelector('.ngcc-field-label__optional')).toBeNull();
    expect(input(el).getAttribute('aria-required')).toBe('true');
  });

  it('adds a tooltip button only when a tooltip is given', async () => {
    const { el, host } = await setup();
    expect(el.querySelector('.ngcc-field-label__tip')).toBeNull();
    host.tip.set('Used in the URL');
    TestBed.tick();
    expect(el.querySelector('.ngcc-field-label__tip')!.getAttribute('aria-label')).toBe(
      'Used in the URL',
    );
  });

  it('has no axe violations', async () => {
    const { el } = await setup();
    expect((await runAxe(el)).violations).toEqual([]);
  });
});
