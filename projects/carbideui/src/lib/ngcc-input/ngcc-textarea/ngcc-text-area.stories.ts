import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgccTextAreaComponent } from './ngcc-text-area';

const meta: Meta<NgccTextAreaComponent> = {
  title: 'Components/Input/TextArea',
  component: NgccTextAreaComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    value: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    fluid: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    helperText: { control: 'text' },
    invalid: { control: 'boolean' },
    errorMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<NgccTextAreaComponent>;

// --- Default ---
export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter text...',
    helperText: 'Optional details',
  },
};

// --- With MaxLength ---
export const WithMaxLength: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Type up to 200 characters...',
    maxLength: 200,
    helperText: 'You can enter up to 200 chars',
  },
};

// --- Disabled ---
export const Disabled: Story = {
  args: {
    label: 'Disabled Notes',
    value: 'This is read-only',
    disabled: true,
  },
};

// --- Readonly ---
export const Readonly: Story = {
  args: {
    label: 'Readonly Notes',
    value: 'Fixed content',
    readonly: true,
  },
};

// --- Skeleton ---
export const Skeleton: Story = {
  args: {
    skeleton: true,
  },
};

// --- Fluid Layout ---
export const Fluid: Story = {
  args: {
    label: 'Fluid TextArea',
    placeholder: 'Expands to full width',
    fluid: true,
  },
};

// --- Reactive Form Validation ---
export const ReactiveForm: Story = {
  render: (args) => {
    const fb = new FormBuilder();
    const form = fb.group({
      comment: fb.control('', [Validators.required, Validators.minLength(5)]),
    });

    return {
      props: {
        form,
        args,
      },
      template: `
        <form [formGroup]="form" style="max-width: 400px;">
          <ngcc-text-area
            label="Comment"
            minLength='5'
            formControlName="comment"
            placeholder="Write at least 5 characters"
            helperText='Write at least 5 characters'
            required="true"
          ></ngcc-text-area>
          <div style="margin-top: 1rem;">
            Form Status: {{ form.status }}
          </div>
        </form>
      `,
    };
  },
};

// --- Invalid State (Manual Override) ---
export const InvalidManual: Story = {
  args: {
    label: 'Comment',
    value: '',
    invalid: true,
    errorMessage: 'This field is required',
  },
};
