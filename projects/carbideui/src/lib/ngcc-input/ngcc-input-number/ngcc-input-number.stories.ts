import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgccInputNumber } from './ngcc-input-number';

const meta: Meta<NgccInputNumber> = {
  title: 'Components/Input/Number',
  component: NgccInputNumber,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccInputNumber, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    fluid: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    helperText: { control: 'text' },
    ariaLabel: { control: 'text' },
    invalid: { control: 'boolean' },
    value: { control: 'text' },
    errorMessage: { control: 'text' },
    integerOnly: { control: 'boolean' },
    decimalOnly: { control: 'boolean' },
    decimalPadding: { control: 'number' },
    hideArrows: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    currency: { control: 'boolean' },
    currencyCode: {
      control: 'select',
      options: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY'],
    },
  },
};

export default meta;
type Story = StoryObj<NgccInputNumber>;

export const Default: Story = {
  args: {
    label: 'Age',
    placeholder: 'Enter age',
  },
};

export const IntegerOnly: Story = {
  args: {
    label: 'Integer Only',
    integerOnly: true,
    placeholder: 'Digits only',
  },
};

export const DecimalOnly: Story = {
  args: {
    label: 'Decimal Only',
    decimalOnly: true,
    decimalPadding: 2,
    placeholder: 'Enter decimal',
  },
};

export const DecimalPaddingOverride: Story = {
  args: {
    label: 'Decimal Padding Override',
    decimalOnly: true,
    decimalPadding: 3,
    placeholder: 'e.g. 44.123',
  },
};

export const HideArrows: Story = {
  args: {
    label: 'No Arrows',
    hideArrows: true,
    placeholder: 'Type a number',
  },
};

export const Currency: Story = {
  args: {
    label: 'Amount',
    placeholder: 'Enter amount',
    currency: true,
    decimalOnly: true,
    decimalPadding: 2,
  },
};

export const CurrencyReactiveForm: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      salary: ['', { nonNullable: true, validators: [Validators.required, Validators.min(0)] }],
    });
    return {
      props: { form },
      template: `
        <form [formGroup]="form" novalidate>
          <ngcc-input-number
            label="Salary"
            [currency]=true
            currencyCode="EUR"
            [decimalPadding]="2"
            formControlName="salary"
            [required]='true'
            helperText="Enter amount in EUR"
          ></ngcc-input-number>
        </form>
        <p>Form value: {{ form.value | json }}</p>
        <p>Form valid: {{ form.valid }}</p>
      `,
    };
  },
};

export const ReactiveForm: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      salary: [null, { validators: [Validators.required, Validators.min(1000)] }],
      bonus: [null, { validators: [Validators.required] }],
    });

    return {
      props: { form },
      template: `
        <form [formGroup]="form">
          <ngcc-input-number
            #salaryInput
            label="Salary"
            [decimalOnly]="true"
            [decimalPadding]="2"
            formControlName="salary"
            [required]="true"
            [min]="1000"
            helperText="Minimum 1000 required"
          ></ngcc-input-number>
          <br/><br/>
          <ngcc-input-number
            #bonusInput
            label="Bonus %"
            [integerOnly]="true"
            formControlName="bonus"
            [required]="true"
            helperText="Enter whole numbers only"
          ></ngcc-input-number>
        </form>

    <h4>Form state</h4>
<p>Form value: {{ form.value | json }}</p>
<p>Form valid: {{ form.valid }}</p>

<h4>Control values (numeric)</h4>
<p>Salary raw: {{ form.get('salary')?.value }}</p>
<p>Bonus raw: {{ form.get('bonus')?.value }}</p>

<h4>Display values (formatted)</h4>
<p>Salary display: {{ salaryInput.displayValue() }}</p>
<p>Bonus display: {{ bonusInput.displayValue() }}</p>

      `,
    };
  },
};
