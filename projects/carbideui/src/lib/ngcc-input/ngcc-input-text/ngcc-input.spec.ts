import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccInput } from './ngcc-input';
import { axe } from 'vitest-axe';

// --- Reactive Host Component for form tests ---
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgccInput],
  template: `
    <form [formGroup]="form">
      <ngcc-input formControlName="email" label="Email" type="email"></ngcc-input>
    </form>
  `,
})
class TestHostComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
}

describe('NgccInput (unit)', () => {
  let fixture: ComponentFixture<NgccInput>;
  let component: NgccInput;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccInput],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render Carbon input element', () => {
    const input = getInput();
    expect(input).toBeTruthy();
    expect(input.classList).toContain('cds--text-input');
  });

  it('should bind label text', () => {
    fixture.componentRef.setInput('label', 'Username');
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(labelEl.textContent).toContain('Username');
  });

  it('should update model value on input', () => {
    const inputEl = fixture.nativeElement.querySelector('input');
    inputEl.value = 'Hello';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.getValue()).toBe('Hello');
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should toggle password visibility correctly', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();

    const toggle = fixture.debugElement.query(
      By.css('.cds--text-input--password__visibility__toggle'),
    );
    expect(toggle).toBeTruthy();

    toggle.nativeElement.click();
    fixture.detectChanges();
    expect(getInput().type).toBe('text');

    toggle.nativeElement.click();
    fixture.detectChanges();
    expect(getInput().type).toBe('password');
  });

  it('should apply disabled and readonly attributes', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    const input = getInput();
    expect(input.disabled).toBe(true);
    expect(input.readOnly).toBe(true);
  });

  it('should render error message when invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errorMessage', 'Invalid input');
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.ngcc--form-requirement'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Invalid input');
  });

  it('should render helper text when valid', () => {
    fixture.componentRef.setInput('helperText', 'Helpful text');
    fixture.detectChanges();

    const helperEl = fixture.debugElement.query(By.css('.cds--form__helper-text'));
    expect(helperEl).toBeTruthy();
    expect(helperEl.nativeElement.textContent).toContain('Helpful text');
  });

  it('should compute ARIA attributes properly', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const input = getInput();
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-label')).toBe('Email');
  });
});

describe('NgccInput (reactive forms integration)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  it('should mark control invalid when empty and required', () => {
    const input = getInput();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(host.form.invalid).toBe(true);
    expect(host.form.get('email')?.errors?.['required']).toBe(true);
  });

  it('should mark control invalid when email format is wrong', () => {
    const input = getInput();
    input.value = 'notanemail';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(host.form.invalid).toBe(true);
    expect(host.form.get('email')?.errors?.['email']).toBeTruthy();
  });

  it('should mark control valid when correct email entered', () => {
    const input = getInput();
    input.value = 'valid@example.com';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(host.form.valid).toBe(true);
    expect(host.form.get('email')?.value).toBe('valid@example.com');
  });
});
describe('NgccInput – WCAG / Accessibility', () => {
  let fixture: ComponentFixture<NgccInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccInput],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccInput);
    fixture.detectChanges();
  });

  function getInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  /* ------------------------------------------------------------------
   * Automated WCAG audit (axe-core)
   * Covers:
   * - Name / Role / Value
   * - Label association
   * - ARIA validity
   * - Keyboard focusability
   * ------------------------------------------------------------------ */
  it('has no WCAG violations (axe)', async () => {
    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });

  /* ------------------------------------------------------------------
   * Perceivable — component-specific logic
   * (axe cannot validate dynamic switching)
   * ------------------------------------------------------------------ */
  describe('Labels & Descriptions', () => {
    it('associates label with input using for/id', () => {
      fixture.componentRef.setInput('label', 'Username');
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(label.getAttribute('for')).toBe(getInput().id);
    });

    it('prefers explicit ariaLabel over label', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('ariaLabel', 'Email address input');
      fixture.detectChanges();

      expect(getInput().getAttribute('aria-label')).toBe('Email address input');
    });

    it('switches aria-describedby from helper to error when invalid', () => {
      fixture.componentRef.setInput('helperText', 'Help');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const input = getInput();
      const helperId = input.getAttribute('aria-describedby');

      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(input.getAttribute('aria-describedby')).not.toBe(helperId);
    });
  });

  /* ------------------------------------------------------------------
   * Operable — behavior axe cannot simulate
   * ------------------------------------------------------------------ */
  describe('Keyboard & Focus', () => {
    it('is focusable when enabled', () => {
      getInput().focus();
      expect(document.activeElement).toBe(getInput());
    });

    it('is not focusable when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      getInput().focus();
      expect(document.activeElement).not.toBe(getInput());
    });

    it('password visibility toggle is keyboard operable', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();

      const toggle = fixture.debugElement.query(
        By.css('.cds--text-input--password__visibility__toggle'),
      ).nativeElement as HTMLElement;

      toggle.click();
      fixture.detectChanges();

      expect(getInput().type).toBe('text');
    });
  });

  /* ------------------------------------------------------------------
   * Understandable — required & error state transitions
   * ------------------------------------------------------------------ */
  describe('Required & Error State', () => {
    it('sets aria-required when required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(getInput().getAttribute('aria-required')).toBe('true');
    });

    it('toggles aria-invalid correctly', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const input = getInput();
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(input.getAttribute('aria-invalid')).toBe('true');

      input.value = 'hello';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(input.getAttribute('aria-invalid')).toBe('false');
    });
  });

  /* ------------------------------------------------------------------
   * Skeleton accessibility
   * ------------------------------------------------------------------ */
  describe('Skeleton state', () => {
    it('removes interactive input when skeleton=true', () => {
      fixture.componentRef.setInput('skeleton', true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('input'))).toBeNull();
    });
  });
});
