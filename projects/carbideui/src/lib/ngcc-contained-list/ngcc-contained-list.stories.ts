import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgccContainedList } from './ngcc-contained-list';
import { NgccContainedListItem } from './ngcc-contained-list-item';
import { NgccButton } from '../ngcc-button/ngcc-button';
import {
  NgccContainedListActionDirective,
  NgccContainedListItemActionDirective,
  NgccContainedListKind,
  NgccContainedListSize,
} from './ngcc-contained-list.types';

const meta: Meta<NgccContainedList> = {
  title: 'Components/ContainedList',
  component: NgccContainedList,
  decorators: [
    moduleMetadata({
      imports: [
        NgccContainedList,
        NgccContainedListItem,
        NgccButton,
        NgccContainedListActionDirective,
        NgccContainedListItemActionDirective,
      ],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    kind: {
      control: { type: 'radio' },
      options: ['on-page', 'disclosed'] satisfies NgccContainedListKind[],
    },
    size: {
      control: { type: 'select' },
      options: [undefined, 'sm', 'md', 'lg', 'xl'] satisfies (NgccContainedListSize | undefined)[],
    },
    isInset: { control: 'boolean' },
  },
  args: {
    label: 'List title',
    kind: 'on-page',
    isInset: false,
  },
};
export default meta;

type Story = StoryObj<NgccContainedList>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <ngcc-contained-list [label]="label" [kind]="kind" [size]="size" [isInset]="isInset">
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
      </ngcc-contained-list>
    `,
  }),
};

export const Disclosed: Story = {
  render: (args) => ({
    props: { ...args, kind: 'disclosed' },
    template: `
      <ngcc-contained-list [label]="label" kind="disclosed" [size]="size" [isInset]="isInset">
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
      </ngcc-contained-list>
    `,
  }),
};

export const WithActions: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <ngcc-contained-list [label]="label" [kind]="kind" [size]="size" [isInset]="isInset" [hasAction]="true">
        <ngcc-button ngccContainedListAction label="Add" variant="ghost" iconName="add" [iconOnly]="true" />
        <ngcc-contained-list-item [hasAction]="true">
          List item
          <ngcc-button ngccContainedListItemAction label="Options" variant="ghost" iconName="overflow_menu_vertical" [iconOnly]="true" />
        </ngcc-contained-list-item>
        <ngcc-contained-list-item [hasAction]="true">
          List item
          <ngcc-button ngccContainedListItemAction label="Options" variant="ghost" iconName="overflow_menu_vertical" [iconOnly]="true" />
        </ngcc-contained-list-item>
        <ngcc-contained-list-item [hasAction]="true">
          List item
          <ngcc-button ngccContainedListItemAction label="Options" variant="ghost" iconName="overflow_menu_vertical" [iconOnly]="true" />
        </ngcc-contained-list-item>
      </ngcc-contained-list>
    `,
  }),
};

export const WithIcons: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <ngcc-contained-list [label]="label" [kind]="kind" [size]="size" [isInset]="isInset">
        <ngcc-contained-list-item iconName="user">List item</ngcc-contained-list-item>
        <ngcc-contained-list-item iconName="user">List item</ngcc-contained-list-item>
        <ngcc-contained-list-item iconName="user">List item</ngcc-contained-list-item>
        <ngcc-contained-list-item iconName="user">List item</ngcc-contained-list-item>
      </ngcc-contained-list>
    `,
  }),
};

export const WithInteractiveItems: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <ngcc-contained-list [label]="label" [kind]="kind" [size]="size" [isInset]="isInset">
        <ngcc-contained-list-item [clickable]="true">List item</ngcc-contained-list-item>
        <ngcc-contained-list-item [clickable]="true">List item</ngcc-contained-list-item>
        <ngcc-contained-list-item [clickable]="true">List item</ngcc-contained-list-item>
        <ngcc-contained-list-item [clickable]="true">List item</ngcc-contained-list-item>
      </ngcc-contained-list>
    `,
  }),
};

export const InsetRulers: Story = {
  render: (args) => ({
    props: { ...args, isInset: true },
    template: `
      <ngcc-contained-list [label]="label" [kind]="kind" [size]="size" [isInset]="true">
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
        <ngcc-contained-list-item>List item</ngcc-contained-list-item>
      </ngcc-contained-list>
    `,
  }),
};
