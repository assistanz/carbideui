# @assistanz/carbideui

An independent, community-driven Angular component library inspired by the [Carbon Design System](https://carbondesignsystem.com/).

[![npm version](https://img.shields.io/npm/v/@assistanz/carbideui.svg?style=flat-square)](https://www.npmjs.com/package/@assistanz/carbideui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://github.com/assistanz/carbideui/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20%2B-DD0031.svg?style=flat-square)](https://angular.dev)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-brightgreen.svg?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)

> **Disclaimer:** This project is NOT affiliated with, endorsed by, or sponsored by IBM or the Carbon Design System team. "Carbon" is a trademark of IBM Corporation.

---

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Quick Start](#quick-start)
- [Components](#components)
  - [Forms](#forms)
  - [Button](#button)
  - [Data — Table & Pagination](#data--table--pagination)
  - [Feedback — Notification & Toast](#feedback--notification--toast)
  - [Modal](#modal)
  - [Tooltip & Skeleton](#tooltip--skeleton)
  - [Navigation — Tabs & Accordion](#navigation--tabs--accordion)
  - [Charts](#charts)
  - [Theming](#theming)
- [Reactive Forms](#reactive-forms)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)
- [Compatibility](#compatibility)
- [Resources](#resources)

---

## Installation

```bash
npm install @assistanz/carbideui @carbon/styles @carbon/charts
```
---

## Setup

### 1. Import styles

Add the following to your global stylesheet (`src/styles.scss`):

```scss
@use '@carbon/styles/scss/config' with (
  $use-flexbox-grid: true,
  $font-path: '@ibm/plex'
);

@use '@carbon/styles';
@use '@assistanz/carbideui/styles';
```

> Without this, components will render unstyled.

---

## Quick Start

Import only the components you need — all are standalone and tree-shakeable.

```typescript
import { NgccButton, NgccInput, NgccCheckbox } from '@assistanz/carbideui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgccButton, NgccInput, NgccCheckbox],
  template: `
    <ngcc-input label="Email" type="email" [(value)]="email" />
    <ngcc-checkbox label="I agree to terms" [(checked)]="agreed" />
    <ngcc-button label="Submit" variant="primary" (click)="submit()" />
  `,
})
export class AppComponent {
  email = '';
  agreed = false;

  submit() {}
}
```

---

## Components

### Forms

All form components implement `ControlValueAccessor` and support both template-driven (`[(ngModel)]`) and reactive forms.

#### NgccInput

```typescript
import { NgccInput } from '@assistanz/carbideui';

// template
<ngcc-input
  label="Email"
  type="email"
  placeholder="user@example.com"
  [(value)]="email"
  [required]="true"
  [invalid]="isEmailInvalid()"
  errorMessage="Please enter a valid email"
  helperText="We'll never share your email"
/>
```
---

## Reactive Forms

```typescript
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgccInput, NgccCheckbox, NgccDropdown } from '@assistanz/carbideui';

@Component({
  imports: [ReactiveFormsModule, NgccInput, NgccCheckbox, NgccDropdown],
  template: `
    <form [formGroup]="form">
      <ngcc-input    label="Email"     formControlName="email" />
      <ngcc-checkbox label="Subscribe" formControlName="subscribe" />
      <ngcc-dropdown label="Country"   formControlName="country" [items]="countries" />
    </form>
  `,
})
export class MyComponent {
  form = new FormGroup({
    email:     new FormControl(''),
    subscribe: new FormControl(false),
    country:   new FormControl(null),
  });
}
```

---

## Accessibility

All components are built to **WCAG 2.1 AA** standard:

- ARIA labels via `ariaLabel` prop on every interactive component
- Keyboard navigation — Tab, arrow keys, Enter/Space
- Focus trap inside modals
- Screen reader support (tested with NVDA / JAWS)
- Automated axe-core testing on every component

Always provide a label or `ariaLabel` on interactive elements:

```html
<ngcc-button ariaLabel="Submit registration form" variant="primary" />
```

---

## Troubleshooting

**Components render unstyled**
Ensure `@carbon/styles` is imported **before** any component usage in your global stylesheet.

```scss
@use '@carbon/styles'; /* must be present */
```

**Two-way binding `[(value)]` does not update**
Import `FormsModule` in your component:

```typescript
import { FormsModule } from '@angular/forms';
@Component({ imports: [FormsModule, NgccInput] })
```

**`NullInjectorError` for NotificationService / ToastService**
These services are `providedIn: 'root'`. Ensure you are bootstrapping with `bootstrapApplication()`:

```typescript
bootstrapApplication(AppComponent);
```

**Theme does not change**
Use the signal setter — direct assignment does not trigger reactivity:

```typescript
this.themeService.baseTheme.set('g90');  // correct
this.themeService.baseTheme = 'g90';     // does not work
```

---

## Compatibility

| Dependency      | Version            |
| --------------- | ------------------ |
| Angular         | ^20.0.0            |
| @carbon/styles  | ^1.98.0            |
| @carbon/charts  | ^1.27.0            |
| TypeScript      | ~5.9               |
| Node.js         | >=20               |

---

## Resources

- [GitHub Repository](https://github.com/assistanz/carbideui)
- [Storybook / Interactive Docs](https://assistanz.github.io/carbideui)
- [Component Usage Reference](https://github.com/assistanz/carbideui/blob/main/COMPONENT_USAGE_REFERENCE.md)
- [Changelog](https://github.com/assistanz/carbideui/blob/main/CHANGELOG.md)
- [Issue Tracker](https://github.com/assistanz/carbideui/issues)
- [Contributing Guide](https://github.com/assistanz/carbideui/blob/main/.github/CONTRIBUTING.md)

---

## License

[MIT](https://github.com/assistanz/carbideui/blob/main/LICENSE) — Maintained by [Assistanz Networks Pvt Ltd](https://assistanz.com/)
