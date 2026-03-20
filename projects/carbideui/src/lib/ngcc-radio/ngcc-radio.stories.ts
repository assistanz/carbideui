import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgccRadio } from './ngcc-radio';
import { NgccRadioGroup } from './ngcc-radio-group';

// ── Shared full template — binds every group input so ALL controls are live ───
// Every story uses this template so that changing any control in the Storybook
// panel is immediately reflected in the rendered component.
const FULL_TEMPLATE = `
  <ngcc-radio-group
    [legend]="legend"
    [orientation]="orientation"
    [labelPlacement]="labelPlacement"
    [disabled]="disabled"
    [readOnly]="readOnly"
    [skeleton]="skeleton"
    [invalid]="invalid"
    [invalidText]="invalidText"
    [warn]="warn"
    [warnText]="warnText"
    [helperText]="helperText"
    [ariaLabel]="ariaLabel"
    [ariaLabelledby]="ariaLabelledby"
    (change)="change($event)"
  >
    <ngcc-radio value="option-1">Option 1</ngcc-radio>
    <ngcc-radio value="option-2">Option 2</ngcc-radio>
    <ngcc-radio value="option-3">Option 3</ngcc-radio>
  </ngcc-radio-group>
`;

const meta: Meta<NgccRadioGroup> = {
  title: 'Components/Radio',
  component: NgccRadioGroup,
  decorators: [
    moduleMetadata({
      imports: [NgccRadio, NgccRadioGroup, ReactiveFormsModule],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    // ── Content ──────────────────────────────────────────────────────────────
    legend: { control: 'text', description: 'Legend text rendered inside the fieldset' },
    helperText: { control: 'text', description: 'Helper text shown below the group' },

    // ── Layout ───────────────────────────────────────────────────────────────
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Direction in which radio buttons are laid out',
    },
    labelPlacement: {
      control: 'radio',
      options: ['right', 'left'],
      description: 'Position of the label relative to the radio button',
    },

    // ── State ────────────────────────────────────────────────────────────────
    disabled: { control: 'boolean', description: 'Disables the entire group' },
    readOnly: { control: 'boolean', description: 'Prevents selection changes without disabling' },
    skeleton: { control: 'boolean', description: 'Shows skeleton loading placeholder' },

    // ── Validation ───────────────────────────────────────────────────────────
    invalid: { control: 'boolean', description: 'Marks the group as invalid' },
    invalidText: { control: 'text', description: 'Error message shown when invalid=true' },
    warn: { control: 'boolean', description: 'Marks the group with a warning' },
    warnText: { control: 'text', description: 'Warning message shown when warn=true' },

    // ── Accessibility ─────────────────────────────────────────────────────────
    ariaLabel: {
      control: 'text',
      description: 'aria-label placed on the fieldset element',
    },
    ariaLabelledby: {
      control: 'text',
      description: 'aria-labelledby placed on the fieldset — references an external label id',
    },

    // ── Output ───────────────────────────────────────────────────────────────
    change: { action: 'change', description: 'Fires when a radio button is selected' },
  },
  args: {
    legend: 'Select an option',
    orientation: 'horizontal',
    labelPlacement: 'right',
    disabled: false,
    readOnly: false,
    skeleton: false,
    invalid: false,
    invalidText: '',
    warn: false,
    warnText: '',
    helperText: '',
    ariaLabel: '',
    ariaLabelledby: '',
  },
};
export default meta;

type Story = StoryObj<NgccRadioGroup>;

// ── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Vertical ──────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  args: { orientation: 'vertical', legend: 'Vertical layout' },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Label left ────────────────────────────────────────────────────────────────

export const LabelLeft: Story = {
  args: { labelPlacement: 'left', legend: 'Label on left' },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

export const Skeleton: Story = {
  args: { skeleton: true, legend: '' },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Disabled (entire group) ───────────────────────────────────────────────────

export const DisabledGroup: Story = {
  args: { disabled: true, legend: 'Disabled group' },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Disabled (single radio) ───────────────────────────────────────────────────
// Individual radio disabled — group-level controls still apply to the wrapper.

export const DisabledSingleRadio: Story = {
  args: { legend: 'One radio disabled' },
  render: (args) => ({
    props: { ...args },
    template: `
      <ngcc-radio-group
        [legend]="legend"
        [orientation]="orientation"
        [labelPlacement]="labelPlacement"
        [helperText]="helperText"
        [ariaLabel]="ariaLabel"
        [ariaLabelledby]="ariaLabelledby"
        (change)="change($event)"
      >
        <ngcc-radio value="a">Option A</ngcc-radio>
        <ngcc-radio value="b" [disabled]="true">Option B (disabled)</ngcc-radio>
        <ngcc-radio value="c">Option C</ngcc-radio>
      </ngcc-radio-group>
    `,
  }),
};

// ── Read-only ─────────────────────────────────────────────────────────────────

export const ReadOnly: Story = {
  args: { readOnly: true, legend: 'Read-only group' },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Invalid / Error ───────────────────────────────────────────────────────────

export const Invalid: Story = {
  args: {
    invalid: true,
    invalidText: 'Please select an option to continue.',
    legend: 'Error state',
  },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Warning ───────────────────────────────────────────────────────────────────

export const Warning: Story = {
  args: {
    warn: true,
    warnText: 'Choosing this option may have unintended consequences.',
    legend: 'Warning state',
  },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── With helper text ──────────────────────────────────────────────────────────

export const WithHelperText: Story = {
  args: {
    helperText: 'Select the option that best describes your preference.',
    legend: 'With helper text',
  },
  render: (args) => ({ props: { ...args }, template: FULL_TEMPLATE }),
};

// ── Reactive form ─────────────────────────────────────────────────────────────
// Uses formControlName — controls panel does not apply here.

export const ReactiveForm: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      plan: fb.control('', Validators.required),
    });

    return {
      props: { form },
      template: `
        <form [formGroup]="form" style="display:flex; flex-direction:column; gap:1rem;">
          <ngcc-radio-group
            legend="Choose a plan"
            formControlName="plan"
            helperText="Select one option to continue"
          >
            <ngcc-radio value="starter">Starter</ngcc-radio>
            <ngcc-radio value="pro">Pro</ngcc-radio>
            <ngcc-radio value="enterprise">Enterprise</ngcc-radio>
          </ngcc-radio-group>

          <div style="margin-top:1rem; display:flex; flex-direction:column; gap:0.5rem;">
            <div><strong>Form status:</strong> {{ form.status }}</div>
            <div><strong>Selected value:</strong> {{ form.get('plan')?.value | json }}</div>
          </div>
        </form>
      `,
    };
  },
};
