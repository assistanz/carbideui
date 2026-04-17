import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccToggle } from './ngcc-toggle';
import { runAxe } from '../../test-utils/a11y';
import { NgccToggleSize } from './ngcc-toggle.types';

@Component({
  template: `
    <ngcc-toggle
      [toggled]="toggled"
      [disabled]="disabled"
      [readOnly]="readOnly"
      [skeleton]="skeleton"
      [hideLabel]="hideLabel"
      [size]="size"
      [labelText]="labelText"
      [labelA]="labelA"
      [labelB]="labelB"
      [ariaLabel]="ariaLabel"
      [className]="className"
      (toggledChange)="onToggle($event)"
    ></ngcc-toggle>
  `,
  standalone: true,
  imports: [CommonModule, NgccToggle],
})
class TestHostComponent {
  toggled = false;
  disabled = false;
  readOnly = false;
  skeleton = false;
  hideLabel = false;
  size: NgccToggleSize = 'md';
  labelText = 'Enable feature';
  labelA = 'Off';
  labelB = 'On';
  ariaLabel: string | undefined = undefined;
  className = '';

  onToggle = (_val: boolean) => {};
}

describe('NgccToggle', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
  }

  function getButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button.cds--toggle__button')).nativeElement;
  }

  function getLabel(): HTMLLabelElement {
    return fixture.debugElement.query(By.css('label.cds--toggle__label')).nativeElement;
  }

  function getHost(): HTMLElement {
    return fixture.debugElement.query(By.directive(NgccToggle)).nativeElement;
  }

  // ---------------------------------------------------------------------------
  // Core Structure
  // ---------------------------------------------------------------------------
  describe('Core Structure', () => {
    it('renders button with role="switch"', () => {
      detectChanges();
      expect(getButton().getAttribute('role')).toBe('switch');
    });

    it('renders button with type="button"', () => {
      detectChanges();
      expect(getButton().getAttribute('type')).toBe('button');
    });

    it('renders a label element', () => {
      detectChanges();
      expect(getLabel()).toBeTruthy();
    });

    it('label [for] matches button id', () => {
      detectChanges();
      const btn = getButton();
      const lbl = getLabel();
      expect(lbl.getAttribute('for')).toBe(btn.id);
    });

    it('renders label text', () => {
      detectChanges();
      const span = fixture.debugElement.query(By.css('.cds--toggle__label-text'));
      expect(span.nativeElement.textContent.trim()).toBe('Enable feature');
    });

    it('renders side label text span', () => {
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--toggle__text'))).toBeTruthy();
    });

    it('side label is aria-hidden', () => {
      detectChanges();
      const sideLabel = fixture.debugElement.query(By.css('.cds--toggle__text')).nativeElement;
      expect(sideLabel.getAttribute('aria-hidden')).toBe('true');
    });

    it('applies cds--form-item and cds--toggle host classes', () => {
      detectChanges();
      const hostEl = getHost();
      expect(hostEl.classList).toContain('cds--form-item');
      expect(hostEl.classList).toContain('cds--toggle');
    });
  });

  // ---------------------------------------------------------------------------
  // Toggle State (On / Off)
  // ---------------------------------------------------------------------------
  describe('Toggle State', () => {
    it('sets aria-checked="false" when off', () => {
      host.toggled = false;
      detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('false');
    });

    it('sets aria-checked="true" when on', () => {
      host.toggled = true;
      detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('true');
    });

    it('applies cds--toggle__switch--checked when toggled=true', () => {
      host.toggled = true;
      detectChanges();
      const sw = fixture.debugElement.query(By.css('.cds--toggle__switch')).nativeElement;
      expect(sw.classList).toContain('cds--toggle__switch--checked');
    });

    it('does not apply cds--toggle__switch--checked when toggled=false', () => {
      host.toggled = false;
      detectChanges();
      const sw = fixture.debugElement.query(By.css('.cds--toggle__switch')).nativeElement;
      expect(sw.classList).not.toContain('cds--toggle__switch--checked');
    });

    it('shows labelB (On) as side label when toggled=true', () => {
      host.toggled = true;
      host.labelB = 'On';
      detectChanges();
      const text = fixture.debugElement.query(By.css('.cds--toggle__text')).nativeElement;
      expect(text.textContent.trim()).toBe('On');
    });

    it('shows labelA (Off) as side label when toggled=false', () => {
      host.toggled = false;
      host.labelA = 'Off';
      detectChanges();
      const text = fixture.debugElement.query(By.css('.cds--toggle__text')).nativeElement;
      expect(text.textContent.trim()).toBe('Off');
    });

    it('toggles state on button click', () => {
      detectChanges();
      getButton().click();
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('true');
    });

    it('toggles back to off on second click', () => {
      detectChanges();
      getButton().click();
      fixture.detectChanges();
      getButton().click();
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('false');
    });

    it('emits toggledChange with new state on click', () => {
      const spy = vi.spyOn(host, 'onToggle');
      detectChanges();
      getButton().click();
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('toggles state on label click', () => {
      detectChanges();
      getLabel().click();
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('true');
    });
  });

  // ---------------------------------------------------------------------------
  // Disabled State
  // ---------------------------------------------------------------------------
  describe('Disabled State', () => {
    it('applies cds--toggle--disabled class when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getHost().classList).toContain('cds--toggle--disabled');
    });

    it('sets disabled attribute on button when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getButton().hasAttribute('disabled')).toBe(true);
    });

    it('sets tabindex="-1" when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getButton().getAttribute('tabindex')).toBe('-1');
    });

    it('does not toggle on button click when disabled', () => {
      host.disabled = true;
      detectChanges();
      getButton().click();
      expect(getButton().getAttribute('aria-checked')).toBe('false');
    });

    it('does not emit toggledChange when disabled', () => {
      const spy = vi.spyOn(host, 'onToggle');
      host.disabled = true;
      detectChanges();
      getButton().click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // ReadOnly State
  // ---------------------------------------------------------------------------
  describe('ReadOnly State', () => {
    it('applies cds--toggle--readonly class when readOnly', () => {
      host.readOnly = true;
      detectChanges();
      expect(getHost().classList).toContain('cds--toggle--readonly');
    });

    it('does not toggle on click when readOnly', () => {
      host.readOnly = true;
      detectChanges();
      getButton().click();
      expect(getButton().getAttribute('aria-checked')).toBe('false');
    });

    it('does not emit toggledChange when readOnly', () => {
      const spy = vi.spyOn(host, 'onToggle');
      host.readOnly = true;
      detectChanges();
      getButton().click();
      expect(spy).not.toHaveBeenCalled();
    });

    it('remains focusable (tabindex="0") when readOnly', () => {
      host.readOnly = true;
      detectChanges();
      expect(getButton().getAttribute('tabindex')).toBe('0');
    });

    it('does not disable the button element when readOnly', () => {
      host.readOnly = true;
      detectChanges();
      expect(getButton().hasAttribute('disabled')).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Skeleton State
  // ---------------------------------------------------------------------------
  describe('Skeleton State', () => {
    it('applies cds--toggle--skeleton class when skeleton', () => {
      host.skeleton = true;
      detectChanges();
      expect(getHost().classList).toContain('cds--toggle--skeleton');
    });

    it('renders skeleton elements instead of button/label', () => {
      host.skeleton = true;
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--toggle__skeleton-circle'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.cds--toggle__skeleton-rectangle'))).toBeTruthy();
    });

    it('does not render button when skeleton=true', () => {
      host.skeleton = true;
      detectChanges();
      expect(fixture.debugElement.query(By.css('button.cds--toggle__button'))).toBeFalsy();
    });
  });

  // ---------------------------------------------------------------------------
  // Size Variants
  // ---------------------------------------------------------------------------
  describe('Size Variants', () => {
    it('applies cds--toggle__appearance--sm when size="sm"', () => {
      host.size = 'sm';
      detectChanges();
      const appearance = fixture.debugElement.query(By.css('.cds--toggle__appearance'));
      expect(appearance.nativeElement.classList).toContain('cds--toggle__appearance--sm');
    });

    it('does not apply cds--toggle__appearance--sm when size="md"', () => {
      host.size = 'md';
      detectChanges();
      const appearance = fixture.debugElement.query(By.css('.cds--toggle__appearance'));
      expect(appearance.nativeElement.classList).not.toContain('cds--toggle__appearance--sm');
    });

    it('shows checkmark SVG when size="sm" and toggled=true', () => {
      host.size = 'sm';
      host.toggled = true;
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--toggle__check'))).toBeTruthy();
    });

    it('does not show checkmark when size="md" and toggled=true', () => {
      host.size = 'md';
      host.toggled = true;
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--toggle__check'))).toBeFalsy();
    });

    it('does not show checkmark when size="sm" and toggled=false', () => {
      host.size = 'sm';
      host.toggled = false;
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--toggle__check'))).toBeFalsy();
    });

    it('does not show checkmark when size="sm", toggled=true, and readOnly=true', () => {
      host.size = 'sm';
      host.toggled = true;
      host.readOnly = true;
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--toggle__check'))).toBeFalsy();
    });
  });

  // ---------------------------------------------------------------------------
  // Hide Label
  // ---------------------------------------------------------------------------
  describe('Hide Label', () => {
    it('applies cds--visually-hidden when hideLabel=true', () => {
      host.hideLabel = true;
      detectChanges();
      const labelText = fixture.debugElement.query(By.css('.cds--toggle__label-text'));
      expect(labelText.nativeElement.classList).toContain('cds--visually-hidden');
    });

    it('does not apply cds--visually-hidden when hideLabel=false', () => {
      host.hideLabel = false;
      detectChanges();
      const labelText = fixture.debugElement.query(By.css('.cds--toggle__label-text'));
      expect(labelText.nativeElement.classList).not.toContain('cds--visually-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------------------
  describe('Keyboard Navigation', () => {
    it('toggles on Space key press', () => {
      detectChanges();
      getButton().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('true');
    });

    it('toggles on Enter key press', () => {
      detectChanges();
      getButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('true');
    });

    it('does not toggle on Space when disabled', () => {
      host.disabled = true;
      detectChanges();
      getButton().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(getButton().getAttribute('aria-checked')).toBe('false');
    });

    it('does not toggle on Enter when readOnly', () => {
      host.readOnly = true;
      detectChanges();
      getButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(getButton().getAttribute('aria-checked')).toBe('false');
    });

    it('does not toggle on Tab key', () => {
      detectChanges();
      getButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(getButton().getAttribute('aria-checked')).toBe('false');
    });

    it('button is focusable when enabled', () => {
      detectChanges();
      const btn = getButton();
      btn.focus();
      expect(document.activeElement).toBe(btn);
    });

    it('emits toggledChange on Space key', () => {
      const spy = vi.spyOn(host, 'onToggle');
      detectChanges();
      getButton().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('emits toggledChange on Enter key', () => {
      const spy = vi.spyOn(host, 'onToggle');
      detectChanges();
      getButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(spy).toHaveBeenCalledWith(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility (ARIA + runAxe)
  // ---------------------------------------------------------------------------
  describe('Accessibility', () => {
    it('button has role="switch"', () => {
      detectChanges();
      expect(getButton().getAttribute('role')).toBe('switch');
    });

    it('aria-checked reflects toggled state', () => {
      host.toggled = true;
      detectChanges();
      expect(getButton().getAttribute('aria-checked')).toBe('true');
    });

    it('sets aria-label when provided', () => {
      host.ariaLabel = 'Enable dark mode';
      detectChanges();
      expect(getButton().getAttribute('aria-label')).toBe('Enable dark mode');
    });

    it('does not set aria-label when undefined', () => {
      host.ariaLabel = undefined;
      detectChanges();
      expect(getButton().getAttribute('aria-label')).toBeNull();
    });

    it('has no runAxe violations — default state', async () => {
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — toggled=true', async () => {
      host.toggled = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — disabled', async () => {
      host.disabled = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — readOnly', async () => {
      host.readOnly = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — size="sm" toggled=true', async () => {
      host.size = 'sm';
      host.toggled = true;
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — hideLabel=true', async () => {
      host.hideLabel = true;
      host.ariaLabel = 'Enable feature';
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('has no runAxe violations — with ariaLabel', async () => {
      host.ariaLabel = 'Enable notifications';
      detectChanges();
      const results = await runAxe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
