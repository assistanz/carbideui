# CarbideUI — Angular Carbide Components

> An independent, community-driven Angular component library inspired by the [Carbon Design System](https://carbondesignsystem.com/).

[![npm version](https://img.shields.io/npm/v/@assistanz/carbideui.svg?style=flat-square)](https://www.npmjs.com/package/@assistanz/carbideui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20%2B-DD0031.svg?style=flat-square)](https://angular.dev)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-brightgreen.svg?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)

> **Disclaimer:** This project is NOT affiliated with, endorsed by, or sponsored by IBM or the Carbon Design System team. "Carbon" is a trademark of IBM Corporation. See [THIRD_PARTY_NOTICES.md](./.github/THIRD_PARTY_NOTICES.md) for full attribution.

---

## Features

- **Angular 20+** with Signals, standalone components, and OnPush change detection
- **WCAG 2.1 AA** accessible — automated axe testing on every component
- **Full reactive forms support** (`ControlValueAccessor`) for Checkbox, Input, Dropdown
- **Carbon Design System theming** — white, g10, g90, g100 with dynamic brand color support
- **Tree-shakeable** (`sideEffects: false`)
- **Zoneless-compatible**

---

## Components

| Category   | Components                                                              |
| ---------- | ----------------------------------------------------------------------- |
| Forms      | Input, Textarea, Checkbox, Dropdown, Datepicker                         |
| Actions    | Button                                                                  |
| Data       | Table, Pagination                                                       |
| Feedback   | Notification, Toast, Modal, Tooltip, Skeleton                           |
| Navigation | Tabs, Accordion                                                         |
| Data Viz   | Bar Chart, Line Chart, Donut Chart, Gauge Chart                         |
| Theming    | Theme Switcher, Color Theme Service                                     |

---

## Installation

```bash
npm install @assistanz/carbideui @carbon/styles @carbon/charts
```

### Setup styles

Import Carbon styles in your global stylesheet (`styles.scss`) or register them in `angular.json`:

```scss
@use '@carbon/styles/scss/config' with (
  $use-flexbox-grid: true,
  $font-path: '@ibm/plex'
);

@use '@assistanz/carbideui/styles';
```

---

## Quick Start

```typescript
import { NgccButton, NgccInput, NgccCheckbox } from '@assistanz/carbideui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgccButton, NgccInput, NgccCheckbox],
  template: `
    <ngcc-input label="Email" placeholder="Enter email" [(value)]="email" />
    <ngcc-checkbox label="I agree to terms" [(checked)]="agreed" />
    <ngcc-button label="Submit" variant="primary" (click)="submit()" />
  `,
})
export class ExampleComponent {
  email = '';
  agreed = false;

  submit() {}
}
```

---

## Documentation

Run Storybook locally for interactive component demos and full API docs:

```bash
npm run storybook
```

Hosted docs: [assistanz.github.io/carbideui](https://assistanz.github.io/carbideui)

Full component usage reference: [COMPONENT_USAGE_REFERENCE.md](./COMPONENT_USAGE_REFERENCE.md)

---

## Development

```bash
# Install dependencies
npm install

# Run Storybook (dev server)
npm run storybook

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Build the library
npm run build:lib
```

---

## Compatibility

| Dependency      | Version           |
| --------------- | ----------------- |
| Angular         | ^20.0.0           |
| @carbon/styles  | ^1.98.0           |
| @carbon/charts  | ^1.27.0           |
| TypeScript      | ~5.9              |
| Node.js         | >=20              |

---

## Contributing

Contributions are welcome. Please open an issue or pull request on [GitHub](https://github.com/assistanz/carbideui).

- Bug reports: [issue tracker](https://github.com/assistanz/carbideui/issues)
- Contributing guide: [CONTRIBUTING.md](./.github/CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./.github/CODE_OF_CONDUCT.md)

---

## License

[MIT](./LICENSE) — Maintained by [Assistanz Networks Pvt Ltd](https://assistanz.com/)

## Third-Party Notices

This project uses IBM's Carbon Design System packages (`@carbon/styles`, `@carbon/charts`) under the Apache-2.0 license.
See [THIRD_PARTY_NOTICES.md](./.github/THIRD_PARTY_NOTICES.md) for details.
