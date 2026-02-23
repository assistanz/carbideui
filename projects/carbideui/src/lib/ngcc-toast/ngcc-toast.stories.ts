import { Meta, StoryObj } from '@storybook/angular';
import { NgccToast } from './ngcc-toast';
import { NgccToastConfig } from './ngcc-toast.types';

const meta: Meta<NgccToast> = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  component: NgccToast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 🧩 Client Usage

To use this Toast in your Angular app:

### 1. Add the container once
\`\`\`html
<ngcc-toast-container></ngcc-toast-container>
\`\`\`

### 2. Inject and trigger from any component
\`\`\`ts
constructor(private toast: ToastService) {}

this.toast.show({
  type: 'success',
  title: 'Saved!',
  subtitle: 'Your changes were applied.',
});
\`\`\`

> ⚙️ Fully reactive, Carbon-styled, and Angular v20+ signal-based.
`,
      },
    },
  },
  argTypes: {
    cfg: {
      control: 'object',
      description: 'Toast configuration (NgccToastConfig)',
    },
  },
};

export default meta;
type Story = StoryObj<NgccToast>;

const base: NgccToastConfig = {
  id: 'toast-demo',
  title: 'Sample Notification',
  subtitle: 'Informational message for user',
  caption: 'Just now',
  showClose: true,
  timeout: 0,
  lowContrast: false,
  type: 'info',
};

export const Info: Story = { args: { cfg: { ...base, type: 'info' } } };

export const Success: Story = {
  args: { cfg: { ...base, type: 'success', title: 'Success!' } },
};

export const Warning: Story = {
  args: {
    cfg: {
      ...base,
      type: 'warning',
      title: 'Warning',
      subtitle: 'Check your inputs.',
    },
  },
};

export const Error: Story = {
  args: {
    cfg: {
      ...base,
      type: 'error',
      title: 'Error occurred',
      subtitle: 'Please retry later.',
    },
  },
};

export const AutoDismiss: Story = {
  args: {
    cfg: {
      ...base,
      type: 'info',
      title: 'Auto-dismiss',
      subtitle: 'This will close after 3 seconds',
      timeout: 3000,
    },
  },
};

export const LowContrast: Story = {
  args: {
    cfg: {
      ...base,
      type: 'success',
      lowContrast: true,
      title: 'Low Contrast Variant',
      subtitle: 'Optimized for dark themes.',
    },
  },
};

export const CustomIcon: Story = {
  args: {
    cfg: {
      ...base,
      type: 'info',
      title: 'Custom Icon Toast',
      subtitle: 'This toast uses a star icon.',
      icon: 'checkmark',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates custom icon support via the `icon` field.',
      },
    },
  },
};
