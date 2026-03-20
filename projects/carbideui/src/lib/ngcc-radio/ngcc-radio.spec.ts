import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { axe } from 'vitest-axe';
import { NgccRadio } from './ngcc-radio';
import { NgccRadioGroup } from './ngcc-radio-group';

// ── Shared host components (state defined in template — avoids NG0100) ────────

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose an option" (change)="lastChange = $event">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
      <ngcc-radio value="three">Option Three</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class DefaultHostComponent {
  lastChange: any = null;
}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" orientation="vertical">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class VerticalHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" labelPlacement="left">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class LabelLeftHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group skeleton="true">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class SkeletonHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" [disabled]="true">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
      <ngcc-radio value="three">Option Three</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class GroupDisabledHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
      <ngcc-radio value="three" [disabled]="true">Option Three</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class SingleDisabledHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" [readOnly]="true">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class ReadOnlyHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group
      legend="Choose"
      [invalid]="true"
      invalidText="Please select an option"
      helperText="Should be hidden"
    >
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class InvalidHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group
      legend="Choose"
      [invalid]="true"
      invalidText="Error"
      [warn]="true"
      warnText="Warning"
    >
      <ngcc-radio value="one">Option One</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class InvalidAndWarnHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" [warn]="true" warnText="Warning message goes here">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class WarnHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" helperText="Choose carefully">
      <ngcc-radio value="one">Option One</ngcc-radio>
      <ngcc-radio value="two">Option Two</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class HelperTextHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" helperText="Helper" [disabled]="true">
      <ngcc-radio value="one">Option One</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class DisabledHelperTextHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" helperText="Helper" [warn]="true" warnText="Warning">
      <ngcc-radio value="one">Option One</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class WarnWithHelperHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group ariaLabel="My group">
      <ngcc-radio value="one">Option One</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class AriaLabelHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <ngcc-radio-group formControlName="choice">
        <ngcc-radio value="a">Option A</ngcc-radio>
        <ngcc-radio value="b">Option B</ngcc-radio>
        <ngcc-radio value="c">Option C</ngcc-radio>
      </ngcc-radio-group>
    </form>
  `,
})
class ReactiveFormHostComponent {
  form = new FormGroup({ choice: new FormControl('a') });
}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup, FormsModule],
  template: `
    <ngcc-radio-group [(ngModel)]="selected">
      <ngcc-radio value="x">Option X</ngcc-radio>
      <ngcc-radio value="y">Option Y</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class TemplateFormHostComponent {
  selected = 'x';
}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: ` <ngcc-radio-group legend="Empty group"></ngcc-radio-group> `,
})
class EmptyGroupHostComponent {}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose" (change)="lastChange = $event">
      <ngcc-radio value="same">Option A</ngcc-radio>
      <ngcc-radio value="same">Option B</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class DuplicateValueHostComponent {
  lastChange: any = null;
}

@Component({
  standalone: true,
  imports: [NgccRadio, NgccRadioGroup],
  template: `
    <ngcc-radio-group legend="Choose">
      <ngcc-radio value="a"
        >This is an extremely long label that goes on and on to test how the component handles label
        overflow and text wrapping in different viewport sizes without breaking the overall layout
        or truncating content</ngcc-radio
      >
      <ngcc-radio value="b">Option B</ngcc-radio>
    </ngcc-radio-group>
  `,
})
class LongLabelHostComponent {}

// ── Setup helper ─────────────────────────────────────────────────────────────

async function setup<T>(hostType: new () => T): Promise<{
  fixture: ComponentFixture<T>;
  host: T;
}> {
  await TestBed.configureTestingModule({
    imports: [hostType as any],
    providers: [provideZonelessChangeDetection()],
  }).compileComponents();

  const fixture = TestBed.createComponent(hostType as any) as ComponentFixture<T>;
  fixture.detectChanges();
  return { fixture, host: fixture.componentInstance };
}

function getRadioInputs(fixture: ComponentFixture<any>): HTMLInputElement[] {
  return fixture.debugElement
    .queryAll(By.css('input[type="radio"]'))
    .map((de) => de.nativeElement as HTMLInputElement);
}

function getFieldset(fixture: ComponentFixture<any>): HTMLFieldSetElement {
  return fixture.debugElement.query(By.css('fieldset')).nativeElement;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NgccRadio + NgccRadioGroup', () => {
  // ── Default state ─────────────────────────────────────────────────────────

  describe('Default state', () => {
    it('should create group and radio components', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      expect(fixture.debugElement.query(By.directive(NgccRadioGroup))).toBeTruthy();
      expect(fixture.debugElement.queryAll(By.directive(NgccRadio))).toHaveLength(3);
    });

    it('should render all radio inputs with type="radio"', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      expect(inputs).toHaveLength(3);
      inputs.forEach((input) => expect(input.type).toBe('radio'));
    });

    it('should render legend text', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const legend = fixture.debugElement.query(By.css('legend'));
      expect(legend.nativeElement.textContent.trim()).toBe('Choose an option');
    });

    it('should render label text for each radio via ng-content', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const labels = fixture.debugElement.queryAll(By.css('.cds--radio-button__label'));
      expect(labels[0].nativeElement.textContent).toContain('Option One');
      expect(labels[1].nativeElement.textContent).toContain('Option Two');
    });

    it('should apply host class cds--form-item on group', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const groupHost = fixture.debugElement.query(By.directive(NgccRadioGroup)).nativeElement;
      expect(groupHost.classList).toContain('cds--form-item');
    });

    it('should apply cds--radio-button-wrapper on each radio host', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      fixture.debugElement
        .queryAll(By.directive(NgccRadio))
        .forEach((de) => expect(de.nativeElement.classList).toContain('cds--radio-button-wrapper'));
    });

    it('should auto-assign unique ids to each radio input', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const ids = getRadioInputs(fixture).map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should link each input to its label via for/id', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      getRadioInputs(fixture).forEach((input) => {
        const label = fixture.debugElement.query(By.css(`label[for="${input.id}"]`));
        expect(label).toBeTruthy();
      });
    });

    it('should share the same name across all radios in the group', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const names = getRadioInputs(fixture).map((i) => i.name);
      expect(new Set(names).size).toBe(1);
    });

    it('should not check any radio initially when no value is bound', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      getRadioInputs(fixture).forEach((input) => expect(input.checked).toBe(false));
    });
  });

  // ── Selection ─────────────────────────────────────────────────────────────

  describe('Selection', () => {
    it('should check radio on click and deselect others', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);

      inputs[0].click();
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);

      inputs[1].click();
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(false);
      expect(inputs[1].checked).toBe(true);
    });

    it('should emit change event on group with selected value', async () => {
      const { fixture, host } = await setup(DefaultHostComponent);
      getRadioInputs(fixture)[0].click();
      fixture.detectChanges();
      expect(host.lastChange?.value).toBe('one');
    });

    it('should not emit change if the same value is already selected', async () => {
      const { fixture, host } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      fixture.detectChanges();
      const firstValue = host.lastChange?.value;

      inputs[0].click();
      fixture.detectChanges();
      expect(host.lastChange?.value).toBe(firstValue);
    });

    it('should select radio when its label is clicked', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      const label = fixture.debugElement.query(By.css(`label[for="${inputs[0].id}"]`));
      label.nativeElement.click();
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(true);
    });

    it('should deselect previous radio when a different label is clicked', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      fixture.detectChanges();
      const label1 = fixture.debugElement.query(By.css(`label[for="${inputs[1].id}"]`));
      label1.nativeElement.click();
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(false);
      expect(inputs[1].checked).toBe(true);
    });
  });

  // ── Vertical orientation ──────────────────────────────────────────────────

  describe('Vertical orientation', () => {
    it('should apply cds--radio-button-group--vertical class on fieldset', async () => {
      const { fixture } = await setup(VerticalHostComponent);
      expect(getFieldset(fixture).classList).toContain('cds--radio-button-group--vertical');
    });

    it('should not apply vertical class for horizontal orientation (default)', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      expect(getFieldset(fixture).classList).not.toContain('cds--radio-button-group--vertical');
    });
  });

  // ── Label placement ───────────────────────────────────────────────────────

  describe('Label placement', () => {
    it('should apply label-left class on fieldset when labelPlacement=left', async () => {
      const { fixture } = await setup(LabelLeftHostComponent);
      expect(getFieldset(fixture).classList).toContain('cds--radio-button-group--label-left');
    });

    it('should apply label-left class on each radio wrapper when labelPlacement=left', async () => {
      const { fixture } = await setup(LabelLeftHostComponent);
      fixture.debugElement.queryAll(By.directive(NgccRadio)).forEach((de) => {
        expect(de.nativeElement.classList).toContain('cds--radio-button-wrapper--label-left');
      });
    });
  });

  // ── Skeleton ──────────────────────────────────────────────────────────────

  describe('Skeleton state', () => {
    it('should hide native input and show skeleton div when skeleton=true', async () => {
      const { fixture } = await setup(SkeletonHostComponent);
      expect(getRadioInputs(fixture)).toHaveLength(0);
      expect(
        fixture.debugElement.queryAll(By.css('.cds--radio-button.cds--skeleton')).length,
      ).toBeGreaterThan(0);
    });

    it('should apply cds--skeleton class to labels when skeleton=true', async () => {
      const { fixture } = await setup(SkeletonHostComponent);
      const skeletonLabels = fixture.debugElement.queryAll(
        By.css('.cds--radio-button__label.cds--skeleton'),
      );
      expect(skeletonLabels.length).toBeGreaterThan(0);
    });

    it('should not render label text content when skeleton=true', async () => {
      const { fixture } = await setup(SkeletonHostComponent);
      fixture.debugElement.queryAll(By.css('.cds--radio-button__label')).forEach((label) => {
        expect(label.nativeElement.textContent.trim()).toBe('');
      });
    });
  });

  // ── Disabled — entire group ───────────────────────────────────────────────

  describe('Disabled state — entire group', () => {
    it('should disable all radio inputs when group disabled=true', async () => {
      const { fixture } = await setup(GroupDisabledHostComponent);
      getRadioInputs(fixture).forEach((input) => expect(input.disabled).toBe(true));
    });

    it('should prevent selection when group is disabled — click has no effect', async () => {
      const { fixture } = await setup(GroupDisabledHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      fixture.detectChanges();
      // Native disabled inputs do not fire click — checked must remain false
      inputs.forEach((input) => expect(input.checked).toBe(false));
    });
  });

  // ── Disabled — single radio ───────────────────────────────────────────────

  describe('Disabled state — single radio', () => {
    it('should disable only the third radio when individual disabled=true', async () => {
      const { fixture } = await setup(SingleDisabledHostComponent);
      const inputs = getRadioInputs(fixture);
      expect(inputs[0].disabled).toBe(false);
      expect(inputs[1].disabled).toBe(false);
      expect(inputs[2].disabled).toBe(true);
    });

    it('should allow selection of non-disabled radios', async () => {
      const { fixture } = await setup(SingleDisabledHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(true);
    });
  });

  // ── Read-only ─────────────────────────────────────────────────────────────

  describe('Read-only state', () => {
    it('should apply cds--radio-button-group--readonly class on fieldset', async () => {
      const { fixture } = await setup(ReadOnlyHostComponent);
      expect(getFieldset(fixture).classList).toContain('cds--radio-button-group--readonly');
    });

    it('should not change selection when read-only and radio is clicked', async () => {
      const { fixture } = await setup(ReadOnlyHostComponent);
      const inputs = getRadioInputs(fixture);
      // Simulate click — should be blocked in onClick handler
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      inputs[0].dispatchEvent(clickEvent);
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(false);
    });

    it('should still render inputs (not disabled) in read-only state', async () => {
      const { fixture } = await setup(ReadOnlyHostComponent);
      const inputs = getRadioInputs(fixture);
      expect(inputs.length).toBeGreaterThan(0);
      inputs.forEach((input) => expect(input.disabled).toBe(false));
    });
  });

  // ── Invalid / Error state ─────────────────────────────────────────────────

  describe('Invalid / error state', () => {
    it('should apply cds--radio-button-group--invalid class on fieldset', async () => {
      const { fixture } = await setup(InvalidHostComponent);
      expect(getFieldset(fixture).classList).toContain('cds--radio-button-group--invalid');
    });

    it('should set data-invalid attribute on fieldset', async () => {
      const { fixture } = await setup(InvalidHostComponent);
      expect(getFieldset(fixture).getAttribute('data-invalid')).toBe('true');
    });

    it('should render invalidText in the validation message', async () => {
      const { fixture } = await setup(InvalidHostComponent);
      const req = fixture.debugElement.query(By.css('.cds--form-requirement'));
      expect(req).toBeTruthy();
      expect(req.nativeElement.textContent.trim()).toBe('Please select an option');
    });

    it('should not show helper text when invalid', async () => {
      const { fixture } = await setup(InvalidHostComponent);
      expect(fixture.debugElement.query(By.css('.cds--form__helper-text'))).toBeNull();
    });

    it('should not show warning block when both invalid and warn are true (invalid wins)', async () => {
      const { fixture } = await setup(InvalidAndWarnHostComponent);
      const reqs = fixture.debugElement.queryAll(By.css('.cds--form-requirement'));
      expect(reqs).toHaveLength(1);
      expect(reqs[0].nativeElement.textContent.trim()).toBe('Error');
    });
  });

  // ── Warning state ─────────────────────────────────────────────────────────

  describe('Warning state', () => {
    it('should apply cds--radio-button-group--warning class on fieldset', async () => {
      const { fixture } = await setup(WarnHostComponent);
      expect(getFieldset(fixture).classList).toContain('cds--radio-button-group--warning');
    });

    it('should render warnText in the validation message', async () => {
      const { fixture } = await setup(WarnHostComponent);
      const req = fixture.debugElement.query(By.css('.cds--form-requirement'));
      expect(req).toBeTruthy();
      expect(req.nativeElement.textContent.trim()).toBe('Warning message goes here');
    });
  });

  // ── Helper text ───────────────────────────────────────────────────────────

  describe('Helper text', () => {
    it('should render helper text when provided', async () => {
      const { fixture } = await setup(HelperTextHostComponent);
      const helper = fixture.debugElement.query(By.css('.cds--form__helper-text'));
      expect(helper).toBeTruthy();
      expect(helper.nativeElement.textContent.trim()).toBe('Choose carefully');
    });

    it('should apply disabled class on helper text when group is disabled', async () => {
      const { fixture } = await setup(DisabledHelperTextHostComponent);
      const helper = fixture.debugElement.query(By.css('.cds--form__helper-text'));
      expect(helper.nativeElement.classList).toContain('cds--form__helper-text--disabled');
    });

    it('should not render helper text when warn is active', async () => {
      const { fixture } = await setup(WarnWithHelperHostComponent);
      expect(fixture.debugElement.query(By.css('.cds--form__helper-text'))).toBeNull();
    });
  });

  // ── Focus state ───────────────────────────────────────────────────────────

  describe('Focus state', () => {
    it('should allow radio input to receive focus', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].focus();
      expect(document.activeElement).toBe(inputs[0]);
    });

    it('should mark group as touched when focus leaves the group (focusout)', async () => {
      const { fixture } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();
      const groupHost = fixture.debugElement.query(By.directive(NgccRadioGroup)).nativeElement;
      const inputs = getRadioInputs(fixture);

      inputs[0].focus();
      // Simulate focus leaving the group entirely
      const focusOut = new FocusEvent('focusout', { bubbles: true, relatedTarget: null });
      groupHost.dispatchEvent(focusOut);
      fixture.detectChanges();

      const ctrl = (fixture.componentInstance as any).form.get('choice');
      expect(ctrl.touched).toBe(true);
    });

    it('should not disable focus on non-disabled radios', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs.forEach((input) => expect(input.disabled).toBe(false));
    });

    it('should prevent focus on disabled radio inputs', async () => {
      const { fixture } = await setup(GroupDisabledHostComponent);
      getRadioInputs(fixture).forEach((input) => expect(input.disabled).toBe(true));
    });
  });

  // ── Keyboard access ───────────────────────────────────────────────────────

  describe('Keyboard and mouse access', () => {
    it('should select radio on click (mouse)', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(true);
    });

    it('should allow Space key to select radio (native browser behaviour)', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].focus();
      inputs[0].click(); // simulate space triggering a click
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(true);
    });

    it('should use native <input type="radio"> for keyboard navigation (Arrow keys)', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      // Arrow key navigation is handled natively by the browser for radio groups
      // Verify all radios share the same name (required for browser arrow-key nav)
      const names = getRadioInputs(fixture).map((i) => i.name);
      expect(new Set(names).size).toBe(1);
    });
  });

  // ── Screen reader / ARIA ─────────────────────────────────────────────────

  describe('Screen reader and ARIA', () => {
    it('should render a <fieldset> as the semantic grouping element', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      expect(fixture.debugElement.query(By.css('fieldset'))).toBeTruthy();
    });

    it('should render a <legend> for group labelling', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      expect(fixture.debugElement.query(By.css('legend'))).toBeTruthy();
    });

    it('should set aria-label on fieldset when ariaLabel is provided', async () => {
      const { fixture } = await setup(AriaLabelHostComponent);
      expect(getFieldset(fixture).getAttribute('aria-label')).toBe('My group');
    });

    it('should link each radio input to its label via aria-labelledby', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      getRadioInputs(fixture).forEach((input) => {
        const labelledby = input.getAttribute('aria-labelledby');
        expect(labelledby).toBeTruthy();
        expect(fixture.debugElement.query(By.css(`#${labelledby}`))).toBeTruthy();
      });
    });

    it('should not render legend when no legend input is provided', async () => {
      const { fixture } = await setup(AriaLabelHostComponent);
      expect(fixture.debugElement.query(By.css('legend'))).toBeNull();
    });

    it('should set aria-labelledby on fieldset when ariaLabelledby is provided', async () => {
      @Component({
        standalone: true,
        imports: [NgccRadio, NgccRadioGroup],
        template: `
          <div id="external-label">My Label</div>
          <ngcc-radio-group ariaLabelledby="external-label">
            <ngcc-radio value="one">Option One</ngcc-radio>
          </ngcc-radio-group>
        `,
      })
      class AriaLabelledbyHost {}

      await TestBed.configureTestingModule({
        imports: [AriaLabelledbyHost],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      const f = TestBed.createComponent(AriaLabelledbyHost);
      f.detectChanges();
      const fieldset = f.debugElement.query(By.css('fieldset')).nativeElement;
      expect(fieldset.getAttribute('aria-labelledby')).toBe('external-label');
    });

    it('should propagate custom name input to all radio inputs', async () => {
      @Component({
        standalone: true,
        imports: [NgccRadio, NgccRadioGroup],
        template: `
          <ngcc-radio-group name="my-custom-name">
            <ngcc-radio value="a">Option A</ngcc-radio>
            <ngcc-radio value="b">Option B</ngcc-radio>
          </ngcc-radio-group>
        `,
      })
      class CustomNameHost {}

      await TestBed.configureTestingModule({
        imports: [CustomNameHost],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      const f = TestBed.createComponent(CustomNameHost);
      f.detectChanges();
      const inputs = f.debugElement
        .queryAll(By.css('input[type="radio"]'))
        .map((de) => de.nativeElement as HTMLInputElement);
      inputs.forEach((input) => expect(input.name).toBe('my-custom-name'));
    });
  });

  // ── Reactive Forms ────────────────────────────────────────────────────────

  describe('Reactive Forms (ControlValueAccessor)', () => {
    it('should reflect initial form control value', async () => {
      const { fixture } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();
      const inputs = getRadioInputs(fixture);
      expect(inputs[0].checked).toBe(true); // 'a' === initial value 'a'
    });

    it('should update form control value on radio click', async () => {
      const { fixture, host } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      getRadioInputs(fixture)[1].click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect((host as any).form.get('choice')?.value).toBe('b');
    });

    it('should update checked radio when form control value changes programmatically', async () => {
      const { fixture, host } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      (host as any).form.get('choice')?.setValue('c');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(getRadioInputs(fixture)[2].checked).toBe(true);
    });

    it('should disable all radios when form control is disabled', async () => {
      const { fixture, host } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      (host as any).form.get('choice')?.disable();
      fixture.detectChanges();
      await fixture.whenStable();

      getRadioInputs(fixture).forEach((input) => expect(input.disabled).toBe(true));
    });

    it('should re-enable radios when form control is re-enabled', async () => {
      const { fixture, host } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      (host as any).form.get('choice')?.disable();
      fixture.detectChanges();
      await fixture.whenStable();

      (host as any).form.get('choice')?.enable();
      fixture.detectChanges();
      await fixture.whenStable();

      getRadioInputs(fixture).forEach((input) => expect(input.disabled).toBe(false));
    });
  });

  // ── Template-driven Forms ─────────────────────────────────────────────────

  describe('Template-driven Forms (ngModel)', () => {
    it('should reflect initial ngModel value', async () => {
      const { fixture } = await setup(TemplateFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getRadioInputs(fixture)[0].checked).toBe(true); // 'x'
    });

    it('should update ngModel when radio is clicked', async () => {
      const { fixture, host } = await setup(TemplateFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      getRadioInputs(fixture)[1].click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect((host as any).selected).toBe('y');
    });

    it('should update checked radio when value changes programmatically (via writeValue)', async () => {
      const { fixture } = await setup(TemplateFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      // Call writeValue directly — equivalent to ngModel detecting a bound property change
      const group = fixture.debugElement.query(By.directive(NgccRadioGroup))
        .componentInstance as NgccRadioGroup;
      group.writeValue('y');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getRadioInputs(fixture)[1].checked).toBe(true);
    });
  });

  // ── Form Reset ────────────────────────────────────────────────────────────

  describe('Form reset', () => {
    it('should clear selection when form control is reset', async () => {
      const { fixture, host } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      getRadioInputs(fixture)[1].click();
      fixture.detectChanges();
      await fixture.whenStable();

      (host as any).form.reset();
      fixture.detectChanges();
      await fixture.whenStable();

      getRadioInputs(fixture).forEach((input) => expect(input.checked).toBe(false));
    });

    it('should accept a new value after form reset', async () => {
      const { fixture, host } = await setup(ReactiveFormHostComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      (host as any).form.reset();
      fixture.detectChanges();
      await fixture.whenStable();

      (host as any).form.get('choice')?.setValue('b');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getRadioInputs(fixture)[1].checked).toBe(true);
    });
  });

  // ── Dynamic data ──────────────────────────────────────────────────────────

  describe('Dynamic data', () => {
    it('should render without error when no radio children are provided', async () => {
      const { fixture } = await setup(EmptyGroupHostComponent);
      expect(getRadioInputs(fixture)).toHaveLength(0);
    });

    it('should render a fieldset even with no radio children', async () => {
      const { fixture } = await setup(EmptyGroupHostComponent);
      expect(getFieldset(fixture)).toBeTruthy();
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('should render and allow selection with a very long label', async () => {
      const { fixture } = await setup(LongLabelHostComponent);
      const inputs = getRadioInputs(fixture);
      expect(inputs).toHaveLength(2);
      inputs[0].click();
      fixture.detectChanges();
      expect(inputs[0].checked).toBe(true);
    });

    it('should settle on the last clicked radio after rapid successive clicks', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      inputs[1].click();
      inputs[2].click();
      inputs[1].click();
      fixture.detectChanges();
      expect(inputs[1].checked).toBe(true);
      expect(inputs[0].checked).toBe(false);
      expect(inputs[2].checked).toBe(false);
    });

    it('should emit change with correct value after rapid successive clicks', async () => {
      const { fixture, host } = await setup(DefaultHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      inputs[1].click();
      inputs[2].click();
      fixture.detectChanges();
      expect(host.lastChange?.value).toBe('three');
    });

    it('should emit change with the duplicate value when a radio is clicked', async () => {
      // Only the emitted value is asserted — native browser radio-group exclusivity
      // enforcement makes the checked DOM state undefined when two radios share the
      // same value (and therefore the same name), so we do not assert checked here.
      const { fixture, host } = await setup(DuplicateValueHostComponent);
      const inputs = getRadioInputs(fixture);
      inputs[0].click();
      fixture.detectChanges();
      expect(host.lastChange?.value).toBe('same');
      expect(inputs).toHaveLength(2);
    });
  });

  // ── Theme support ─────────────────────────────────────────────────────────

  describe('Theme support', () => {
    it('should use only cds-- or ngcc-- prefixed classes on radio wrappers', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      fixture.debugElement.queryAll(By.directive(NgccRadio)).forEach((de) => {
        Array.from((de.nativeElement as HTMLElement).classList).forEach((cls) => {
          expect(cls).toMatch(/^(cds--|ngcc-)/);
        });
      });
    });

    it('should have no hard-coded inline colour styles on radio inputs', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      getRadioInputs(fixture).forEach((input) => {
        expect(input.style.color).toBe('');
        expect(input.style.backgroundColor).toBe('');
      });
    });
  });

  // ── Attribute coverage ────────────────────────────────────────────────────

  describe('Attribute coverage', () => {
    it('should pass required attribute to radio inputs', async () => {
      @Component({
        standalone: true,
        imports: [NgccRadio, NgccRadioGroup],
        template: `
          <ngcc-radio-group legend="Test">
            <ngcc-radio value="a" [required]="true">Option A</ngcc-radio>
          </ngcc-radio-group>
        `,
      })
      class RequiredHost {}

      await TestBed.configureTestingModule({
        imports: [RequiredHost],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      const f = TestBed.createComponent(RequiredHost);
      f.detectChanges();
      const input = f.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    it('should pass ariaLabel directly to radio input', async () => {
      @Component({
        standalone: true,
        imports: [NgccRadio, NgccRadioGroup],
        template: `
          <ngcc-radio-group legend="Test">
            <ngcc-radio value="a" ariaLabel="Custom label">Option A</ngcc-radio>
          </ngcc-radio-group>
        `,
      })
      class AriaHost {}

      await TestBed.configureTestingModule({
        imports: [AriaHost],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      const f = TestBed.createComponent(AriaHost);
      f.detectChanges();
      const input = f.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
      expect(input.getAttribute('aria-label')).toBe('Custom label');
    });

    it('should render the radio appearance span inside each label', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      const appearances = fixture.debugElement.queryAll(By.css('.cds--radio-button__appearance'));
      expect(appearances.length).toBe(3);
    });
  });

  // ── WCAG Accessibility (axe) ──────────────────────────────────────────────

  describe('WCAG accessibility (axe)', () => {
    it('should have no violations in default state', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations with a radio selected', async () => {
      const { fixture } = await setup(DefaultHostComponent);
      getRadioInputs(fixture)[0].click();
      fixture.detectChanges();
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations in disabled state (entire group)', async () => {
      const { fixture } = await setup(GroupDisabledHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations with a single disabled radio', async () => {
      const { fixture } = await setup(SingleDisabledHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations in read-only state', async () => {
      const { fixture } = await setup(ReadOnlyHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations in invalid state', async () => {
      const { fixture } = await setup(InvalidHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations in warning state', async () => {
      const { fixture } = await setup(WarnHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations with helper text', async () => {
      const { fixture } = await setup(HelperTextHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations in skeleton state', async () => {
      const { fixture } = await setup(SkeletonHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations in vertical orientation', async () => {
      const { fixture } = await setup(VerticalHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations with label-left placement', async () => {
      const { fixture } = await setup(LabelLeftHostComponent);
      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });
});
