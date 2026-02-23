import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccTextAreaComponent } from './ngcc-text-area';
import { axe } from 'vitest-axe';

describe('NgccTextAreaComponent', () => {
  let component: NgccTextAreaComponent;
  let fixture: ComponentFixture<NgccTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccTextAreaComponent, FormsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render Carbon textarea with default classes', () => {
    const textareaEl: HTMLTextAreaElement = fixture.debugElement.query(
      By.css('textarea'),
    ).nativeElement;
    expect(textareaEl).toBeTruthy();
    expect(textareaEl.classList).toContain('cds--text-area');
    expect(textareaEl.rows).toBe(4);
  });

  it('should render label when provided', () => {
    fixture.componentRef.setInput('label', 'Description');
    fixture.detectChanges();
    const labelEl: HTMLLabelElement = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(labelEl.textContent).toContain('Description');
    expect(labelEl.classList).toContain('cds--label');
  });

  it('should bind value via two-way binding', () => {
    component.value = 'Hello';
    fixture.detectChanges();
    const textareaEl: HTMLTextAreaElement = fixture.debugElement.query(
      By.css('textarea'),
    ).nativeElement;
    expect(textareaEl.value).toBe('Hello');

    textareaEl.value = 'World';
    textareaEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value).toBe('World');
  });

  it('should support disabled and readonly states', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    const textareaEl: HTMLTextAreaElement = fixture.debugElement.query(
      By.css('textarea'),
    ).nativeElement;
    expect(textareaEl.disabled).toBe(true);
    expect(textareaEl.readOnly).toBe(true);
  });

  it('should bind rows and maxLength correctly', () => {
    fixture.componentRef.setInput('rows', 6);
    fixture.componentRef.setInput('maxLength', 100);
    fixture.detectChanges();

    const textareaEl: HTMLTextAreaElement = fixture.debugElement.query(
      By.css('textarea'),
    ).nativeElement;
    expect(textareaEl.rows).toBe(6);
    expect(textareaEl.maxLength).toBe(100);
  });

  it('should render helper text when valid', () => {
    fixture.componentRef.setInput('helperText', 'Help message');
    fixture.detectChanges();

    const helperEl = fixture.debugElement.query(By.css('.cds--form__helper-text')).nativeElement;
    expect(helperEl.textContent).toContain('Help message');
    expect(fixture.debugElement.query(By.css('.cds--form-requirement'))).toBeNull();
  });

  it('should render error message when invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errorMessage', 'Required field');
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.ngcc--form-requirement')).nativeElement;
    expect(errorEl.textContent).toContain('Required field');
    expect(fixture.debugElement.query(By.css('.cds--form__helper-text'))).toBeNull();
  });

  it('should set ARIA attributes correctly', () => {
    fixture.componentRef.setInput('label', 'Comment');
    fixture.componentRef.setInput('helperText', 'Helper');
    fixture.componentRef.setInput('required', false);
    fixture.detectChanges();

    let textareaEl: HTMLTextAreaElement = fixture.debugElement.query(
      By.css('textarea'),
    ).nativeElement;
    expect(textareaEl.getAttribute('aria-required')).toBe('false');
    expect(textareaEl.getAttribute('aria-invalid')).toBe('false');
    expect(textareaEl.getAttribute('aria-describedby')).toContain('-helper');

    // switch to invalid
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errorMessage', 'Required!');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    textareaEl = fixture.debugElement.query(By.css('textarea')).nativeElement;
    expect(textareaEl.getAttribute('aria-invalid')).toBe('true');
    expect(textareaEl.getAttribute('aria-required')).toBe('true');
    const describedBy = textareaEl.getAttribute('aria-describedby')!;
    expect(describedBy).toContain('-error');
    expect(describedBy).not.toContain('-helper');
  });
});
describe('NgccTextAreaComponent – WCAG / Accessibility', () => {
  let fixture: ComponentFixture<NgccTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccTextAreaComponent, FormsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccTextAreaComponent);
    fixture.detectChanges();
  });

  function getTextarea(): HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('textarea')).nativeElement;
  }

  /* ------------------------------------------------------------------
   * WCAG AUTOMATED — axe-core
   * ------------------------------------------------------------------ */
  describe('Automated WCAG audit (axe)', () => {
    it('has no WCAG violations when labeled', async () => {
      fixture.componentRef.setInput('label', 'Comment');
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with ariaLabel only', async () => {
      fixture.componentRef.setInput('ariaLabel', 'Comment input');
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 1.3.1 — Info & Relationships (manual logic only)
   * ------------------------------------------------------------------ */
  describe('Perceivable: Labels & Descriptions', () => {
    it('associates label with textarea using for/id', () => {
      fixture.componentRef.setInput('label', 'Comment');
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('label')).nativeElement;
      const textarea = getTextarea();

      expect(label.getAttribute('for')).toBe(textarea.id);
    });

    it('binds helper text via aria-describedby', () => {
      fixture.componentRef.setInput('helperText', 'Helpful text');
      fixture.detectChanges();

      const helper = fixture.debugElement.query(By.css('.cds--form__helper-text'));
      expect(getTextarea().getAttribute('aria-describedby')).toContain(helper.nativeElement.id);
    });

    it('switches aria-describedby to error when invalid', () => {
      fixture.componentRef.setInput('invalid', true);
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();

      expect(getTextarea().getAttribute('aria-describedby')).toContain('-error');
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 1.3.2 — Skeleton state
   * ------------------------------------------------------------------ */
  describe('Skeleton state accessibility', () => {
    it('does not render textarea when skeleton=true', () => {
      fixture.componentRef.setInput('skeleton', true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('textarea'))).toBeNull();
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 2.1.1 — Keyboard
   * ------------------------------------------------------------------ */
  describe('Operable: Keyboard & Focus', () => {
    it('is focusable when enabled', () => {
      const textarea = getTextarea();
      textarea.focus();
      expect(document.activeElement).toBe(textarea);
    });

    it('is not focusable when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const textarea = getTextarea();
      textarea.focus();
      expect(document.activeElement).not.toBe(textarea);
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 3.3.1 / 3.3.2 — Errors & Required
   * ------------------------------------------------------------------ */
  describe('Understandable: Required & Errors', () => {
    it('sets aria-required=true when required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(getTextarea().getAttribute('aria-required')).toBe('true');
    });

    it('sets aria-invalid=true when invalid', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      getTextarea().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(getTextarea().getAttribute('aria-invalid')).toBe('true');
    });

    it('clears aria-invalid when valid', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const textarea = getTextarea();
      textarea.value = 'Valid content';
      textarea.dispatchEvent(new Event('input'));
      textarea.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(textarea.getAttribute('aria-invalid')).toBe('false');
    });

    it('renders error message text when invalid', () => {
      fixture.componentRef.setInput('invalid', true);
      fixture.componentRef.setInput('errorMessage', 'Required field');
      fixture.detectChanges();

      const error = fixture.debugElement.query(By.css('.ngcc--form-requirement'));
      expect(error.nativeElement.textContent).toContain('Required field');
    });
  });

  /* ------------------------------------------------------------------
   * WCAG 4.1.2 — Name, Role, Value (manual gaps only)
   * ------------------------------------------------------------------ */
  describe('Robust: ARIA semantics', () => {
    it('does not render empty aria-label', () => {
      fixture.detectChanges();
      expect(getTextarea().getAttribute('aria-label')).toBe('textarea-label');
    });

    it('prefers explicit ariaLabel over label', () => {
      fixture.componentRef.setInput('label', 'Message');
      fixture.componentRef.setInput('ariaLabel', 'Custom label');
      fixture.detectChanges();

      expect(getTextarea().getAttribute('aria-label')).toBe('Custom label');
    });
  });
});
