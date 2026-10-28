import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccStepper } from './ngcc-stepper';
import { NgccStep } from './ngcc-stepper.types';

const STEPS: NgccStep[] = [
  { label: 'Client details' },
  { label: 'Plan', secondaryLabel: 'Optional' },
  { label: 'Billing' },
  { label: 'Review' },
];

const meta: Meta<NgccStepper> = {
  title: 'Components/Stepper',
  component: NgccStepper,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgccStepper] })],
  parameters: {
    docs: {
      description: {
        component: `
Progress indicator for multi-step create flows. \`current\` is the zero-based active step (two-way bindable); earlier steps are complete, later ones incomplete, and a step with \`invalid: true\` shows the error state.

By default (\`linear\`) users can go back to completed steps but not skip ahead.

\`\`\`html
<ngcc-stepper [steps]="steps" [(current)]="step" (stepChange)="validate($event)" />
\`\`\`
        `,
      },
    },
  },
  args: { steps: STEPS, current: 1, vertical: false, linear: true, ariaLabel: 'Create client' },
  argTypes: {
    steps: { control: 'object' },
    current: { control: { type: 'number', min: 0, max: 3 } },
  },
};
export default meta;
type Story = StoryObj<NgccStepper>;

export const Default: Story = {};

export const Vertical: Story = { args: { vertical: true } };

export const WithError: Story = {
  args: { current: 2, steps: STEPS.map((s, i) => (i === 1 ? { ...s, invalid: true } : s)) },
};

export const FreeNavigation: Story = { args: { linear: false } };

export const WithNextAndBack: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngcc-stepper #s [steps]="steps" [(current)]="current" [ariaLabel]="ariaLabel" />
      <p style="margin:1rem 0">{{ s.summary() }}</p>
      <button class="cds--btn cds--btn--secondary" type="button" (click)="s.previous()">Back</button>
      <button class="cds--btn cds--btn--primary" type="button" (click)="s.next()">Next</button>`,
  }),
};
