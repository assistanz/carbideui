// ngcc-input-number.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccInputNumber } from './ngcc-input-number';
import { axe } from 'vitest-axe';

// Host component for reactive-form validator tests
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgccInputNumber],
  template: `
    <form [formGroup]="form">
      <ngcc-input-number
        formControlName="age"
        [label]="'Age'"
        [min]="min"
        [max]="max"
        [decimalOnly]="decimalOnly"
        [integerOnly]="integerOnly"
      ></ngcc-input-number>
    </form>
  `,
})
class TestHostComponent {
  min: number | null = null;
  max: number | null = null;
  integerOnly = false;
  decimalOnly = false;

  form = new FormGroup({
    age: new FormControl<number | null>(null),
  });
}

describe('NgccInputNumber (unit)', () => {
  let fixture: ComponentFixture<NgccInputNumber>;
  let component: NgccInputNumber;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccInputNumber],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccInputNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input element and default attributes', () => {
    const inputEl = getInput();
    expect(inputEl).toBeTruthy();
    // component uses a text input and sanitizes programmatically
    expect(inputEl.type).toBe('text');
    expect(inputEl.disabled).toBe(false);
    expect(inputEl.readOnly).toBe(false);
  });

  it('should sanitize non-numeric input immediately', () => {
    const inputEl = getInput();
    inputEl.value = '12abc!@#';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value).toBe('12');
    expect(inputEl.value).toBe('12');
  });

  it('should strip dot when integerOnly is true', () => {
    fixture.componentRef.setInput('integerOnly', true);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '45.67abc';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // integerOnly disallows the dot character
    expect(component.value).toBe('4567');
    expect(inputEl.value).toBe('4567');
  });

  it('should allow decimals but collapse extra dots when decimalOnly is true', () => {
    fixture.componentRef.setInput('decimalOnly', true);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '12.3.4.5abc';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value).toBe('12.345');
    expect(inputEl.value).toBe('12.345');
  });

  it('should format to fixed decimals on blur when decimalOnly is true', () => {
    fixture.componentRef.setInput('decimalOnly', true);
    fixture.componentRef.setInput('decimalPadding', 3);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '5';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.value).toBe('5.000');
    expect(inputEl.value).toBe('5.000');
  });

  it('should round 9.999 to 10.00 when decimalPadding = 2', () => {
    fixture.componentRef.setInput('decimalOnly', true);
    fixture.componentRef.setInput('decimalPadding', 2);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '9.999';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.value).toBe('10.00');
    expect(inputEl.value).toBe('10.00');
  });

  it('should add hide-arrows class when hideArrows=true', () => {
    fixture.componentRef.setInput('hideArrows', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList).toContain('ngcc--hide-arrows');
  });

  it('should set ARIA attributes (label + required)', () => {
    fixture.componentRef.setInput('label', 'Age');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const inputEl = getInput();
    expect(inputEl.getAttribute('aria-label')).toBe('Age');
    expect(inputEl.getAttribute('aria-required')).toBe('true');
  });

  it('should sanitize and parse input with currency symbol when currency=true', () => {
    fixture.componentRef.setInput('currency', true);
    fixture.componentRef.setInput('currencySymbol', '€');
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '€1,234.56abc';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // internal value should be the sanitized numeric string
    expect(component.value).toBe('1234.56');
    expect(inputEl.value).toBe('1234.56');
  });

  it('should format value as currency on blur when currency=true', () => {
    fixture.componentRef.setInput('currency', true);
    fixture.componentRef.setInput('currencySymbol', '$');
    fixture.componentRef.setInput('decimalPadding', 2);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '1234.5';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    // expect display to include currency symbol and fixed decimals
    expect(component.value).toBe('$1,234.50');
    expect(inputEl.value).toBe('$1,234.50');
  });
  it('should show error when value is less than min', () => {
    fixture.componentRef.setInput('min', 10);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '5';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.ngcc--form-requirement'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Minimum value is 10');
  });
  it('should show error when value is greater than max', () => {
    fixture.componentRef.setInput('max', 20);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '25';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.ngcc--form-requirement'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Maximum value is 20');
  });
  it('should show required error when field is empty and required=true', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.ngcc--form-requirement'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('This field is required');
  });
  it('should not show error when value is within min and max', () => {
    fixture.componentRef.setInput('min', 5);
    fixture.componentRef.setInput('max', 10);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '7';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.ngcc--form-requirement'));
    expect(errorEl).toBeNull();
  });
  it('should not show required error when value is present', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const inputEl = getInput();
    inputEl.value = '50';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.ngcc--form-requirement'));
    expect(errorEl).toBeNull();
  });
});

describe('NgccInputNumber (reactive forms integration)', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComp: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComp = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  function getHostInput(): HTMLInputElement {
    return hostFixture.debugElement.query(By.css('input')).nativeElement;
  }

  it('should mark control invalid when required and left empty', () => {
    hostComp.form.get('age')?.addValidators(Validators.required);
    hostFixture.detectChanges();

    const input = getHostInput();
    input.dispatchEvent(new Event('blur'));
    hostFixture.detectChanges();

    expect(hostComp.form.invalid).toBe(true);
    expect(hostComp.form.get('age')?.errors?.['required']).toBe(true);
  });

  it('should mark control invalid when value < min', () => {
    hostComp.min = 10;
    hostComp.form.get('age')?.addValidators(Validators.min(10));

    const input = getHostInput();
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    hostFixture.detectChanges();

    expect(hostComp.form.invalid).toBe(true);
    expect(hostComp.form.get('age')?.errors?.['min']).toBeTruthy();
  });

  it('should mark control invalid when value > max', () => {
    hostComp.max = 20;
    hostComp.form.get('age')?.addValidators(Validators.max(20));

    const input = getHostInput();
    input.value = '25';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    hostFixture.detectChanges();

    expect(hostComp.form.invalid).toBe(true);
    expect(hostComp.form.get('age')?.errors?.['max']).toBeTruthy();
  });

  it('should pass validation when value is within min/max', () => {
    hostComp.min = 5;
    hostComp.max = 15;
    hostComp.form.get('age')?.setValidators([Validators.min(5), Validators.max(15)]);

    const input = getHostInput();
    input.value = '10';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    hostFixture.detectChanges();

    expect(hostComp.form.valid).toBe(true);
  });
});
describe('NgccInputNumber – WCAG / Accessibility', () => {
  let fixture: ComponentFixture<NgccInputNumber>;
  let component: NgccInputNumber;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccInputNumber],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccInputNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getInput = (): HTMLInputElement =>
    fixture.debugElement.query(By.css('input')).nativeElement;

  /* ------------------------------------------------------------------
   * WCAG 1.1 / 1.3 — Labels & Descriptions
   * ------------------------------------------------------------------ */

  describe('Labels & descriptions', () => {
    it('associates label with input using for/id', () => {
      fixture.componentRef.setInput('label', 'Age');
      fixture.detectChanges();

      const labelEl = fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;

      expect(labelEl.htmlFor).toBe(getInput().id);
    });

    it('exposes aria-label when visual label is not rendered', () => {
      fixture.componentRef.setInput('ariaLabel', 'Age input');
      fixture.detectChanges();

      expect(getInput().getAttribute('aria-label')).toBe('Age input');
    });

    it('references helper text via aria-describedby', () => {
      fixture.componentRef.setInput('helperText', 'Enter your age');
      fixture.detectChanges();

      const helper = fixture.debugElement.query(By.css('.cds--form__helper-text')).nativeElement;

      expect(getInput().getAttribute('aria-describedby')).toContain(helper.id);
    });

    it('switches aria-describedby to error message when invalid', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      getInput().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      const error = fixture.debugElement.query(By.css('.ngcc--form-requirement')).nativeElement;

      expect(getInput().getAttribute('aria-describedby')).toContain(error.id);
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 3.3 — Required & Error State
   * ------------------------------------------------------------------ */

  describe('Required & error state', () => {
    it('exposes required state via aria-required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(getInput().getAttribute('aria-required')).toBe('true');
    });

    it('sets aria-invalid=true when invalid', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      getInput().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(getInput().getAttribute('aria-invalid')).toBe('true');
    });

    it('clears aria-invalid when value becomes valid', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const input = getInput();
      input.value = '10';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(getInput().getAttribute('aria-invalid')).toBe('false');
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 4.1 — Name, Role, Value (Input semantics)
   * ------------------------------------------------------------------ */

  describe('Input semantics', () => {
    it('uses inputmode="numeric" by default', () => {
      expect(getInput().getAttribute('inputmode')).toBe('numeric');
    });

    it('uses inputmode="decimal" when decimalOnly=true', () => {
      fixture.componentRef.setInput('decimalOnly', true);
      fixture.detectChanges();

      expect(getInput().getAttribute('inputmode')).toBe('decimal');
    });

    it('exposes numeric pattern for integerOnly', () => {
      fixture.componentRef.setInput('integerOnly', true);
      fixture.detectChanges();

      expect(getInput().getAttribute('pattern')).toBe('[0-9]*');
    });

    it('exposes decimal pattern for decimalOnly', () => {
      fixture.componentRef.setInput('decimalOnly', true);
      fixture.detectChanges();

      expect(getInput().getAttribute('pattern')).toContain('[0-9]*');
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 3.3 — Error Visibility
   * ------------------------------------------------------------------ */

  describe('Error visibility', () => {
    it('renders error icon only when invalid', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('ngcc-icon'))).toBeNull();

      getInput().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('ngcc-icon'))).toBeTruthy();
    });
  });

  /* ------------------------------------------------------------------
   * Skeleton Accessibility
   * ------------------------------------------------------------------ */

  describe('Skeleton state', () => {
    it('does not render input when skeleton=true', () => {
      fixture.componentRef.setInput('skeleton', true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('input'))).toBeNull();
    });
  });

  /* ------------------------------------------------------------------
   * Automated WCAG audit (axe)
   * ------------------------------------------------------------------ */

  describe('Automated WCAG audit', () => {
    it('has no WCAG violations (axe)', async () => {
      fixture.componentRef.setInput('label', 'Age');
      fixture.componentRef.setInput('helperText', 'Enter your age');
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
