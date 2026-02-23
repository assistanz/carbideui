import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgccInput } from './ngcc-input';

const meta: Meta<NgccInput> = {
  title: 'Components/Input/Text',
  component: NgccInput,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccInput, FormsModule, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number'] },
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
  },
};

export default meta;
type Story = StoryObj<NgccInput>;

// --- BASIC STORIES ---
export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    helperText: 'We will not share your email.',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    required: true,
    helperText: 'At least 8 characters required.',
  },
};

export const InvalidField: Story = {
  args: {
    label: 'Invalid Field',
    placeholder: 'Enter something',
    invalid: true,
    errorMessage: 'This is an error message.',
  },
};

// --- LAYOUT / STYLE STORIES ---
export const Sizes: Story = {
  render: () => ({
    template: `
      <ngcc-input label="Small" size="sm" placeholder="Small size"></ngcc-input><br/><br/>
      <ngcc-input label="Medium" size="md" placeholder="Medium size"></ngcc-input><br/><br/>
      <ngcc-input label="Large" size="lg" placeholder="Large size"></ngcc-input>
    `,
  }),
};

export const Fluid: Story = {
  args: {
    label: 'Fluid Input',
    fluid: true,
    placeholder: 'Full width input',
  },
};

export const DisabledReadonly: Story = {
  args: {
    label: 'Readonly Field',
    readonly: true,
    value: 'Default value',
    placeholder: 'Cannot edit this',
  },
};
export const ValidationDemo: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      username: fb.control('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(8),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]),
      email: fb.control('', [Validators.required, Validators.email]),
      password: fb.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).+$/),
      ]),
    });

    return {
      props: { form },
      template: `
        <form [formGroup]="form" novalidate style="display:flex; flex-direction:column; gap:1.5rem;">

          <ngcc-input
            label="Username"
            formControlName="username"
            placeholder="Enter username"
            helperText="4–8 characters, letters and numbers only"
            required="true"
          ></ngcc-input>

          <ngcc-input
            label="Email"
            type="email"
            formControlName="email"
            placeholder="example@mail.com"
            helperText="Enter a valid email address"
            required="true"
          ></ngcc-input>

          <ngcc-input
            label="Password"
            type="password"
            formControlName="password"
            placeholder="Enter strong password"
            helperText="At least 8 chars, include uppercase, lowercase, number, and special character"
            required="true"
          ></ngcc-input>

          <div style="margin-top: 1rem; font-size: 0.875rem; color: #525252;">
            <p><strong>Form status:</strong> {{ form.status }}</p>
            <p><strong>Username errors:</strong> {{ form.get('username')?.errors | json }}</p>
            <p><strong>Email errors:</strong> {{ form.get('email')?.errors | json }}</p>
            <p><strong>Password errors:</strong> {{ form.get('password')?.errors | json }}</p>
          </div>
        </form>
      `,
    };
  },
};
