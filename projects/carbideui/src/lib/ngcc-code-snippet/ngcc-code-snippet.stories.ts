import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccCodeSnippetComponent } from './ngcc-code-snippet';

const singleLineCode = `node -e "process.versions" | grep node`;

const multiLineCode = `import React from 'react';
import { Button } from '@carbon/react';

function App() {
  return (
    <div>
      <Button kind="primary">Click me</Button>
    </div>
  );
}

export default App;`;

const meta: Meta<NgccCodeSnippetComponent> = {
  title: 'Components/CodeSnippet',
  component: NgccCodeSnippetComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccCodeSnippetComponent],
    }),
  ],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['inline', 'single', 'multi'],
    },
    code: { control: 'text' },
    disabled: { control: 'boolean' },
    hideCopyButton: { control: 'boolean' },
    wrapText: { control: 'boolean' },
    light: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    feedback: { control: 'text' },
    feedbackTimeout: { control: 'number' },
    showMoreText: { control: 'text' },
    showLessText: { control: 'text' },
    copyButtonDescription: { control: 'text' },
    ariaLabel: { control: 'text' },
    maxCollapsedNumberOfRows: { control: 'number' },
    maxExpandedNumberOfRows: { control: 'number' },
  },
};
export default meta;

type Story = StoryObj<NgccCodeSnippetComponent>;

export const Default: Story = {
  args: {
    type: 'single',
    code: singleLineCode,
  },
};

export const MultiWrapText: Story = {
  name: 'Multi — Wrap Text',
  args: {
    type: 'multi',
    code: multiLineCode,
    wrapText: true,
  },
};

export const NoCopyButton: Story = {
  name: 'No Copy Button',
  args: {
    type: 'single',
    code: singleLineCode,
    hideCopyButton: true,
  },
};

export const Disabled: Story = {
  args: {
    type: 'single',
    code: singleLineCode,
    disabled: true,
  },
};

export const Skeleton: Story = {
  render: () => ({
    props: {},
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Single</p>
          <ngcc-code-snippet type="single" [skeleton]="true" />
        </div>
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Multi</p>
          <ngcc-code-snippet type="multi" [skeleton]="true" />
        </div>
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Inline</p>
          <p style="font-size: 14px; font-family: sans-serif;">
            Loading: <ngcc-code-snippet type="inline" [skeleton]="true" />
          </p>
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: {
      singleCode: singleLineCode,
      multiCode: multiLineCode,
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Inline</p>
          <p style="font-size: 14px; font-family: sans-serif;">
            Run <ngcc-code-snippet type="inline" [code]="singleCode" /> to install dependencies.
          </p>
        </div>
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Single</p>
          <ngcc-code-snippet type="single" [code]="singleCode" />
        </div>
        <div>
          <p style="margin-bottom: 0.5rem; font-size: 12px; color: #525252;">Multi</p>
          <ngcc-code-snippet type="multi" [code]="multiCode" [maxCollapsedNumberOfRows]="4" />
        </div>
      </div>
    `,
  }),
};
