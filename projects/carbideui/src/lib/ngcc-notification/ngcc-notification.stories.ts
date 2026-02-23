import { Meta, StoryObj } from '@storybook/angular';
import { NgccNotification } from './ngcc-notification';
import { NgccNotificationConfig } from './ngcc-notification.types';
import { action } from 'storybook/actions';

const meta: Meta<NgccNotification> = {
  title: 'Components/Notification',
  tags: ['autodocs'],
  component: NgccNotification,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 🧩 Client Usage

To use this Notification in your Angular app:

### 1. Add the container once
\`\`\`html
<ngcc-notification-container></ngcc-notification-container>
\`\`\`

### 2. Inject and trigger from any component
\`\`\`ts
constructor(private notification: NotificationService) {}

this.notification.show({
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
      description: 'Notification configuration (NgccNotificationConfig)',
    },
  },
};

export default meta;
type Story = StoryObj<NgccNotification>;

const base: NgccNotificationConfig = {
  id: 'notification-demo',
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

export const WithAction: Story = {
  args: {
    cfg: {
      ...base,
      type: 'success',
      title: 'Saved',
      subtitle: 'Settings updated successfully',
      actionLabel: 'Undo',
      action: action('undo-clicked'),
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
      type: 'info',
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
      title: 'Custom Icon Notification',
      subtitle: 'This notification uses a star icon.',
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
