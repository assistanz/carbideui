# CarbideUi NGCC - Complete Usage Reference

Quick reference guide for all components with use cases, capabilities, and examples.

---

## FORM COMPONENTS

### 1. NgccInput (Text Input)

**What it does**: Captures single-line text input with validation, error messages, and helper text.

**When to use**:
- User text entry (email, name, search)
- Form fields requiring validation
- When you need built-in error display

**Key Features**:
- **Types**: `text`, `email`, `password`, `number`
- **Sizes**: `sm`, `md`, `lg`
- **Validation**: `required`, `invalid`, `errorMessage`
- **ControlValueAccessor**: Works with `[(ngModel)]` and reactive forms
- **Helper Text**: Display guidance below input
- **Read-only & Disabled states**

**Example**:
```typescript
<ngcc-input
  label="Email"
  type="email"
  placeholder="user@example.com"
  [(value)]="email"
  [required]="true"
  [invalid]="isEmailInvalid()"
  errorMessage="Please enter valid email"
  helperText="We'll never share your email"
/>
```

---

### 2. NgccTextarea

**What it does**: Multi-line text input for longer content.

**When to use**:
- Comments, reviews, descriptions
- Form fields requiring multiple lines
- When you need character count or resize options

**Key Features**:
- **Multi-line editing**
- **Validation support**: Same as NgccInput
- **ControlValueAccessor**: Reactive forms support
- **Resizable**: Can expand/contract
- **Row configuration**: Control initial height

**Example**:
```typescript
<ngcc-textarea
  label="Message"
  placeholder="Enter your message"
  [(value)]="message"
  [required]="true"
  helperText="Maximum 500 characters"
/>
```

---

### 3. NgccCheckbox

**What it does**: Single checkbox for binary true/false selection.

**When to use**:
- Agreement terms (I agree to terms)
- Feature toggles/preferences
- Multiple independent selections

**Key Features**:
- **ControlValueAccessor**: Two-way binding with `[(checked)]`
- **Reactive forms**: Fully supported
- **Disabled state**
- **Indeterminate state**: For partially selected group items
- **ARIA labels**: Accessibility built-in

**Example**:
```typescript
<ngcc-checkbox
  label="I agree to terms and conditions"
  [(checked)]="agreedToTerms"
  ariaLabel="Accept terms"
/>
```

---

### 4. NgccDropdown

**What it does**: Single or multi-select dropdown with optional search.

**When to use**:
- Selecting one item from many options (countries, categories)
- Multi-select scenarios (tags, filters)
- When user needs to search/filter options
- Form fields with predefined choices

**Key Features**:
- **Single/Multi-select**: `[multi]="true"`
- **Searchable**: Built-in search/filter
- **Typed Values**: Generic `<T>` for type safety
- **Disabled items**: Mark items as unavailable
- **ControlValueAccessor**: Reactive forms support
- **Sizes**: `sm`, `md`, `lg`

**Example**:
```typescript
<ngcc-dropdown
  label="Select Country"
  [items]="countries"
  [multi]="false"
  placeholder="Choose..."
  [(value)]="selectedCountry"
  ariaLabel="Country selection"
/>

// Component
countries: NgccDropdownItem<string>[] = [
  { label: 'USA', value: 'us', disabled: false },
  { label: 'Canada', value: 'ca' },
  { label: 'Mexico', value: 'mx' },
];
```

---

### 5. NgccDatepicker

**What it does**: Calendar-based date selection with optional time.

**When to use**:
- Birth date, event date selection
- Date range filtering
- Appointment scheduling
- Any date input where user needs calendar UI

**Key Features**:
- **Calendar view**: Month/year navigation
- **Date formatting**: Configurable format
- **Range selection**: Optional start/end dates
- **Disabled dates**: Block specific dates
- **Keyboard navigation**: Full accessibility

**Example**:
```typescript
<ngcc-datepicker
  label="Event Date"
  [(value)]="eventDate"
  [required]="true"
  placeholder="Select date"
/>
```

---

### 6. NgccRadioGroup / NgccRadio

**What it does**: A group of mutually exclusive radio buttons for single-option selection from a set.

**When to use**:
- Selecting one option from a small, visible set (2–5 choices)
- Settings pages (choose a plan, pick a preference)
- Forms requiring a required single choice
- When choices should all be visible at once (prefer over dropdown for ≤5 options)

**Key Features**:
- **ControlValueAccessor**: Works with `[(ngModel)]`, `[formControl]`, and `formControlName`
- **Orientation**: `horizontal` (default) or `vertical` layout
- **Label placement**: `right` (default) or `left`
- **Validation states**: `invalid` + `invalidText`, `warn` + `warnText`
- **Helper text**: Guidance shown below the group
- **Legend**: Accessible fieldset caption
- **Read-only**: Prevents changes without disabling
- **Disabled**: Entire group or individual radio buttons
- **Skeleton**: Loading placeholder state

**NgccRadioGroup inputs**:

| Input | Type | Default | Description |
|---|---|---|---|
| `legend` | `string` | — | Fieldset caption |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `labelPlacement` | `'right' \| 'left'` | `'right'` | Label position relative to radio |
| `helperText` | `string` | — | Guidance text below the group |
| `invalid` | `boolean` | `false` | Marks group as invalid |
| `invalidText` | `string` | — | Error message when `invalid=true` |
| `warn` | `boolean` | `false` | Marks group with a warning |
| `warnText` | `string` | — | Warning message when `warn=true` |
| `disabled` | `boolean` | `false` | Disables all radios in the group |
| `readOnly` | `boolean` | `false` | Prevents selection changes |
| `skeleton` | `boolean` | `false` | Shows skeleton loading state |
| `ariaLabel` | `string` | — | `aria-label` on the fieldset |
| `ariaLabelledby` | `string` | — | `aria-labelledby` on the fieldset |

**NgccRadio inputs**:

| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `T \| null` | `null` | Value emitted when this radio is selected |
| `disabled` | `boolean` | `false` | Disables this individual radio |
| `labelPlacement` | `'right' \| 'left'` | `'right'` | Overridden by group when inside a group |
| `skeleton` | `boolean` | `false` | Skeleton state (overridden by group) |

**Output** (`NgccRadioGroup`): `change` — emits `{ value, source: NgccRadio }` on selection.

**Example — basic with ngModel**:
```typescript
<ngcc-radio-group
  [(ngModel)]="selectedPlan"
  legend="Select a plan"
  helperText="You can change this later"
>
  <ngcc-radio value="starter">Starter</ngcc-radio>
  <ngcc-radio value="pro">Pro</ngcc-radio>
  <ngcc-radio value="enterprise">Enterprise</ngcc-radio>
</ngcc-radio-group>
```

**Example — reactive form**:
```typescript
<ngcc-radio-group
  formControlName="plan"
  legend="Choose a plan"
  [invalid]="form.get('plan')?.invalid && form.get('plan')?.touched"
  invalidText="Please select an option to continue."
>
  <ngcc-radio value="starter">Starter</ngcc-radio>
  <ngcc-radio value="pro">Pro</ngcc-radio>
  <ngcc-radio value="enterprise">Enterprise</ngcc-radio>
</ngcc-radio-group>
```

**Example — vertical layout with one disabled radio**:
```typescript
<ngcc-radio-group orientation="vertical" legend="Notification preference">
  <ngcc-radio value="email">Email</ngcc-radio>
  <ngcc-radio value="sms">SMS</ngcc-radio>
  <ngcc-radio value="none" [disabled]="true">None (unavailable)</ngcc-radio>
</ngcc-radio-group>
```

---

## ACTION COMPONENTS

### 7. NgccButton

**What it does**: Clickable action trigger with multiple styles and sizes.

**When to use**:
- Form submissions (primary variant)
- Secondary actions (secondary variant)
- Danger actions (delete, remove)
- Any user-triggered action

**Key Features**:
- **Variants**: `primary`, `secondary`, `tertiary`, `ghost`, `danger`, `danger_tertiary`, `danger_ghost`
- **Sizes**: `xs`, `sm`, `md`, `lg`, `xl`
- **Types**: `button`, `submit`, `reset`
- **Icon support**: Add icons left/right
- **Icon-only mode**: Button with just icon
- **Disabled state**
- **Loading/Skeleton state**

**When to use each variant**:
- **primary**: Main action (Submit, Continue)
- **secondary**: Alternative action (Save, Next)
- **tertiary**: Less prominent action
- **ghost**: Minimal styling, subtle action
- **danger**: Destructive action (Delete)
- **danger_tertiary**: Danger alternative
- **danger_ghost**: Danger minimal

**Example**:
```typescript
<!-- Primary action -->
<ngcc-button label="Submit" variant="primary" (click)="onSubmit()" />

<!-- Danger action -->
<ngcc-button 
  label="Delete"
  variant="danger"
  [disabled]="!isSelected"
  (click)="onDelete()"
/>

<!-- Icon only -->
<ngcc-button
  iconName="search"
  iconOnly="true"
  ariaLabel="Search"
/>
```

---

## DATA COMPONENTS

### 8. NgccTable

**What it does**: Displays tabular data with sorting, pagination, and search.

**When to use**:
- Display lists of data (users, products, orders)
- Need sorting/filtering on data
- Large datasets with pagination
- When user needs to select/interact with rows

**Key Features**:
- **Sortable columns**: Click header to sort
- **Pagination**: Built-in page navigation
- **Search/Filter**: Filter rows dynamically
- **Row selection**: Single or multiple selection
- **Configurable columns**: Custom headers, widths, alignment
- **Skeleton loading**: Loading state
- **Toolbar support**: Add custom actions

**Example**:
```typescript
<ngcc-table
  [headers]="tableHeaders"
  [rows]="tableData"
  [config]="tableConfig"
  title="Users"
/>

// Component
tableHeaders: TableHeader[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
];

tableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

tableConfig: NgccTableConfig = {
  pagination: true,
  pageSize: 10,
  rowSelection: 'multiple',
  search: { enabled: true },
};
```

---

### 9. NgccPagination

**What it does**: Navigate between pages of data.

**When to use**:
- Data lists split across pages
- Combined with table or card grid
- When total items > page size

**Key Features**:
- **Total items tracking**
- **Current page indicator**
- **Prev/Next navigation**
- **Page size selector**: Change items per page
- **Keyboard navigation**: Arrow keys

**Example**:
```typescript
<ngcc-pagination
  [totalItems]="100"
  [pageSize]="10"
  [(currentPage)]="currentPage"
  (pageChange)="onPageChange($event)"
/>
```

---

## FEEDBACK COMPONENTS

### 10. NgccNotification

**What it does**: Display persistent notifications in top-right corner (via service).

**When to use**:
- API response feedback (success/error)
- Form validation messages
- User action confirmations
- Persistent alerts that don't auto-dismiss

**Key Features**:
- **Types**: `success`, `error`, `info`, `warning`
- **Service-based**: Inject `NotificationService`
- **Auto-dismiss**: Optional timeout (ms)
- **Close button**: Manual dismiss
- **Action button**: Optional callback action
- **Max visible**: Limit stacked notifications
- **Low contrast**: Alternative styling

**Example**:
```typescript
private notificationService = inject(NotificationService);

showSuccess(): void {
  this.notificationService.show({
    type: 'success',
    title: 'Success!',
    subtitle: 'Profile updated',
    timeout: 5000, // Auto-dismiss after 5s
    showClose: true,
  });
}

showError(): void {
  this.notificationService.show({
    type: 'error',
    title: 'Error!',
    subtitle: 'Failed to save',
    timeout: 0, // Sticky - don't auto-dismiss
    actionLabel: 'Retry',
    action: () => this.retry(),
  });
}
```

---

### 11. NgccToast

**What it does**: Transient toast messages (similar to notifications but more temporary).

**When to use**:
- Quick feedback messages
- Copy-to-clipboard confirmations
- Temporary status updates
- Short-lived notifications

**Key Features**:
- **Same types as Notifications**: `success`, `error`, `info`, `warning`
- **Shorter default timeout**: Auto-dismiss by default
- **Service-based**: Inject `ToastService`
- **Max visible**: Stack limit (default 5)
- **Close button**: Optional manual dismiss

**Example**:
```typescript
private toastService = inject(ToastService);

copyToClipboard(): void {
  navigator.clipboard.writeText(this.code);
  this.toastService.show({
    type: 'success',
    title: 'Copied!',
    timeout: 2000,
  });
}
```

---

### 12. NgccModal

**What it does**: Modal dialog for confirmations, alerts, or multi-step forms.

**When to use**:
- Confirm destructive actions (delete)
- Collect additional input
- Alert user about important information
- Multi-step workflows
- Forms that need isolation

**Key Features**:
- **Variants**: `default`, `passive`, `danger`
- **Sizes**: `sm`, `md`, `lg`
- **Primary/Secondary buttons**: Action choices
- **Close on overlay click**: Optional
- **Events**: `submitted`, `closed`, `secondaryClicked`
- **Keyboard support**: Escape to close
- **Focus trap**: Modal focus management

**When to use each variant**:
- **default**: Standard modals
- **passive**: Information only
- **danger**: Destructive confirmations

**Example**:
```typescript
isOpen = signal(false);

<ngcc-modal
  [open]="isOpen()"
  title="Delete User?"
  primaryLabel="Delete"
  secondaryLabel="Cancel"
  variant="danger"
  (submitted)="onDelete()"
  (closed)="isOpen.set(false)"
  (secondaryClicked)="isOpen.set(false)"
>
  <p>This action cannot be undone. Are you sure?</p>
</ngcc-modal>

// Component
onDelete(): void {
  this.userService.delete(this.userId).subscribe({
    next: () => {
      this.isOpen.set(false);
      this.notificationService.show({ type: 'success', title: 'User deleted' });
    }
  });
}
```

---

### 13. NgccTooltip

**What it does**: Hover-triggered helper text over elements.

**When to use**:
- Explain icon buttons or abbreviated text
- Show additional context on hover
- Help text for complex fields
- Icon descriptions

**Key Features**:
- **Positioned**: Auto-position to fit screen
- **Keyboard accessible**: Focusable elements trigger tooltip
- **Delay**: Optional show delay
- **Customizable content**: Text or HTML

**Example**:
```typescript
<button
  ngcc-tooltip="Click to save your changes"
  tooltipPosition="top"
>
  Save
</button>

<!-- On icon -->
<ngcc-icon
  name="info"
  ngcc-tooltip="This field is required for export"
/>
```

---

### 14. NgccSkeleton

**What it does**: Placeholder while loading content.

**When to use**:
- Show loading state while fetching data
- Skeleton screens for tables, lists, cards
- Visual feedback during async operations

**Key Features**:
- **Shape variants**: Line, circle, square
- **Animation**: Smooth pulsing
- **Composable**: Build custom skeletons

**Example**:
```typescript
<!-- Loading state -->
@if (isLoading()) {
  <ngcc-skeleton count="5" type="line" />
} @else {
  <div *ngFor="let item of items">{{ item.name }}</div>
}
```

---

## NAVIGATION COMPONENTS

### 15. NgccTabs

**What it does**: Tabbed content interface with switchable panels.

**When to use**:
- Multi-section pages (Overview, Details, Settings)
- Organize related content
- Tab-based navigation within a page
- Optional router integration

**Key Features**:
- **Multiple tabs**: Add as many as needed
- **Active indicator**: Show current tab
- **Router support**: Optional route binding
- **Keyboard navigation**: Arrow keys to switch tabs
- **Tab order**: Tab key navigation

**Example**:
```typescript
<ngcc-tabs>
  <ngcc-tab label="Overview">
    <h3>Overview Content</h3>
    <p>Main information here</p>
  </ngcc-tab>
  
  <ngcc-tab label="Details">
    <h3>Details</h3>
    <p>Detailed information</p>
  </ngcc-tab>
  
  <ngcc-tab label="Settings">
    <h3>Settings</h3>
    <p>Configuration options</p>
  </ngcc-tab>
</ngcc-tabs>
```

---

### 16. NgccAccordion

**What it does**: Expandable/collapsible sections for content organization.

**When to use**:
- FAQ sections
- Settings panels with sub-options
- Reduce page length by hiding secondary content
- Step-by-step workflows

**Key Features**:
- **Single/Multiple open**: Control collapse behavior
- **Nested support**: Accordions within accordions
- **Icons**: Visual expand/collapse indicators
- **Smooth animation**: Open/close transitions
- **Keyboard support**: Arrow keys, Enter to toggle

**Example**:
```typescript
<ngcc-accordion title="FAQ">
  <ngcc-accordion-item title="What is NGCC?">
    <p>NGCC is an Angular UI library...</p>
  </ngcc-accordion-item>
  
  <ngcc-accordion-item title="How do I install it?">
    <p>npm install ngcc</p>
  </ngcc-accordion-item>
  
  <ngcc-accordion-item title="Is it free?">
    <p>Yes, MIT licensed.</p>
  </ngcc-accordion-item>
</ngcc-accordion>
```

---

### 16. NgccBreadcrumb

**What it does**: Shows the user's current location within a site hierarchy as a navigable trail of links.

**When to use**:
- Multi-level page hierarchies (e.g. Home › Products › Details)
- Help users understand where they are and navigate back
- Any page that is more than one level deep in the IA

**Key Features**:
- **Sizes**: `sm`, `md` (default)
- **No trailing slash**: `noTrailingSlash` removes the `/` after the last item
- **Disabled items**: Individual items can be non-navigable (`disabled: true`)
- **External links**: `target="_blank"` and `rel` per item
- **Router links**: `routerLink` per item for SPA navigation
- **Skeleton loading**: `skeleton` + `skeletonCount` for loading state
- **Auto-current**: Last item in `items` array is automatically marked as current (non-link span)
- **Custom current**: Override auto-detection with `current: true` on any item

**Inputs — NgccBreadcrumbComponent**:

| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `NgccBreadcrumbItem[]` | `[]` | Breadcrumb trail items |
| `size` | `'sm' \| 'md'` | `'md'` | Compact or standard size |
| `noTrailingSlash` | `boolean` | `false` | Hide separator after last item |
| `skeleton` | `boolean` | `false` | Show skeleton loading state |
| `skeletonCount` | `number` | `3` | Number of skeleton placeholders |
| `ariaLabel` | `string` | `'Breadcrumb'` | `aria-label` on the `<nav>` |

**NgccBreadcrumbItem interface**:
```typescript
interface NgccBreadcrumbItem {
  label: string;
  href?: string;               // Standard anchor href
  routerLink?: string | string[]; // Angular router navigation
  current?: boolean;           // Mark as current page (auto-set for last item)
  disabled?: boolean;          // Non-navigable, greyed out
  target?: string;             // e.g. '_blank' for external links
  rel?: string;                // e.g. 'noopener noreferrer'
}
```

**Examples**:

```html
<!-- Default -->
<ngcc-breadcrumb [items]="breadcrumbs" />

<!-- No trailing slash on current page -->
<ngcc-breadcrumb [items]="breadcrumbs" [noTrailingSlash]="true" />

<!-- Small size -->
<ngcc-breadcrumb size="sm" [items]="breadcrumbs" />

<!-- Skeleton loading state -->
<ngcc-breadcrumb [skeleton]="isLoading()" [skeletonCount]="3" />

<!-- Custom aria-label -->
<ngcc-breadcrumb [items]="breadcrumbs" ariaLabel="Page navigation" />
```

```typescript
// Component
breadcrumbs: NgccBreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Details' },                    // Last item auto-marked as current
];

// With disabled item
breadcrumbs: NgccBreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Restricted', href: '/restricted', disabled: true },
  { label: 'Details' },
];

// With router navigation
breadcrumbs: NgccBreadcrumbItem[] = [
  { label: 'Home', routerLink: '/' },
  { label: 'Products', routerLink: ['/products'] },
  { label: 'Details' },
];

// With external links
breadcrumbs: NgccBreadcrumbItem[] = [
  { label: 'Home', href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer' },
  { label: 'Docs', href: 'https://docs.example.com', target: '_blank', rel: 'noopener noreferrer' },
  { label: 'API' },
];
```

**Notes**:
- Import `NgccBreadcrumbComponent` — the item component is used internally
- Add `provideRouter([])` to the app providers (required even if not using `routerLink`)
- The last item renders as a `<span>` (not a link) — Carbon's pattern for the current page
- `disabled` removes the `href`/`routerLink` and applies `cds--link--disabled` styling
- `skeleton` on the container replaces all items; per-item skeleton is not exposed

### 17. NgccCodeSnippet

**What it does**: Displays formatted code with a one-click copy button, available in inline, single-line, and multi-line variants.

**When to use**:
- Show terminal commands or code samples in documentation
- Embed short code references inline within prose (`inline`)
- Display a single-line command with a copy button (`single`)
- Display multi-line code blocks with expand/collapse (`multi`)

**Key Features**:
- **Variants**: `inline`, `single`, `multi`
- **Copy to clipboard**: Clipboard API with `execCommand` fallback for non-secure contexts
- **Expand/Collapse**: Multi-line blocks collapse to a configurable row limit with a Show more/Show less toggle
- **Wrap text**: Optional word-wrap in multi-line variant
- **Hide copy button**: `hideCopyButton` for read-only display
- **Disabled state**: Prevents copy and expand interactions
- **Custom feedback**: Configurable "Copied!" text and display duration
- **Skeleton loading**: Per-variant loading placeholders
- **Light theme**: `light` input for light-background contexts

**Inputs**:

| Input | Type | Default | Description |
|---|---|---|---|
| `type` | `'inline' \| 'single' \| 'multi'` | `'single'` | Display variant |
| `code` | `string` | `''` | Code string to display and copy |
| `disabled` | `boolean` | `false` | Disables copy and expand |
| `hideCopyButton` | `boolean` | `false` | Hides the copy button |
| `wrapText` | `boolean` | `false` | Enables text wrapping (multi only) |
| `light` | `boolean` | `false` | Light background variant |
| `skeleton` | `boolean` | `false` | Show skeleton loading state |
| `feedback` | `string` | `'Copied!'` | Text shown in copy tooltip |
| `feedbackTimeout` | `number` | `2000` | Duration (ms) before tooltip hides |
| `showMoreText` | `string` | `'Show more'` | Expand button label (multi only) |
| `showLessText` | `string` | `'Show less'` | Collapse button label (multi only) |
| `copyButtonDescription` | `string` | `'Copy to clipboard'` | Aria-label for the copy button |
| `ariaLabel` | `string` | `''` | Aria-label for the code container |
| `maxCollapsedNumberOfRows` | `number` | `15` | Max rows when collapsed (multi only, `0` = unlimited) |
| `maxExpandedNumberOfRows` | `number` | `0` | Max rows when expanded (multi only, `0` = unlimited) |

**Examples**:

```html
<!-- Single-line (default) -->
<ngcc-code-snippet code="npm install @carbideui/ngcc" />

<!-- Single — no copy button -->
<ngcc-code-snippet code="npm install @carbideui/ngcc" [hideCopyButton]="true" />

<!-- Inline within prose -->
<p>
  Run <ngcc-code-snippet type="inline" code="node --version" /> to check your Node.js version.
</p>

<!-- Multi-line with collapse -->
<ngcc-code-snippet
  type="multi"
  [code]="codeBlock"
  [maxCollapsedNumberOfRows]="8"
/>

<!-- Multi-line with wrap text -->
<ngcc-code-snippet
  type="multi"
  [code]="codeBlock"
  [wrapText]="true"
/>

<!-- Disabled -->
<ngcc-code-snippet
  [code]="codeBlock"
  [disabled]="true"
/>

<!-- Custom copy feedback -->
<ngcc-code-snippet
  [code]="codeBlock"
  feedback="Done!"
  [feedbackTimeout]="3000"
/>

<!-- Skeleton loading -->
<ngcc-code-snippet type="single" [skeleton]="isLoading()" />
<ngcc-code-snippet type="multi" [skeleton]="isLoading()" />
```

```typescript
// Component
codeBlock = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Hello World</h1>',
})
export class AppComponent {}`;
```

**Notes**:
- `inline` renders as a `<button>` — clicking anywhere on the snippet copies the code
- `single` and `multi` render a separate icon-only copy button; the code area is read-only scrollable
- The expand/collapse button is hidden automatically when the line count is within `maxCollapsedNumberOfRows`
- Setting `maxCollapsedNumberOfRows` to `0` disables the row limit and hides the expand button entirely

---

## UI SHELL COMPONENTS

### 17. NgccHeader

**What it does**: Enterprise Carbon Design System header shell providing brand, navigation, and global actions.

**When to use**:
- Top-level application shell
- Providing global navigation and context
- Actions that persist across the entire application (search, notifications, user profile)

**Key Features**:
- **Hamburger toggle**: Opens/closes the side navigation
- **Brand name**: Product or platform name link
- **Navigation menus**: Horizontal nested menus (`<ngcc-header-menu>`) with keyboard support
- **Global actions**: Right-side toggle buttons (`<ngcc-header-action>`)
- **Slide-in panels**: Panels linked to global actions (`<ngcc-header-panel>`)
- **i18n support**: Fully integrates with `NgccI18nPipe` for translation

**Available Directives/Components**:
- `NgccHeader`, `NgccHamburger`, `NgccHeaderName`
- `NgccHeaderNavigation`, `NgccHeaderItem`
- `NgccHeaderMenu`, `NgccHeaderMenuItem`
- `NgccHeaderGlobal`, `NgccHeaderAction`, `NgccHeaderPanel`

**Example**:
```typescript
<ngcc-header ariaLabel="CarbideUI" skipTo="main-content">
  <ngcc-hamburger [(active)]="sideNavOpen" label="Open menu" labelClose="Close menu" />
  <ngcc-header-name productName="My App" href="/"></ngcc-header-name>

  <ngcc-header-navigation ariaLabel="Primary Navigation">
    <ngcc-header-item href="/dashboard" [isCurrentPage]="true">Dashboard</ngcc-header-item>
    <ngcc-header-menu title="Settings">
      <ngcc-header-menu-item href="/settings/profile">Profile</ngcc-header-menu-item>
      <ngcc-header-menu-item href="/settings/account">Account</ngcc-header-menu-item>
    </ngcc-header-menu>
  </ngcc-header-navigation>

  <ngcc-header-global>
    <ngcc-header-action ariaLabel="Search" iconName="search" [(active)]="searchOpen" />
    <ngcc-header-action ariaLabel="Notifications" iconName="notification" />
  </ngcc-header-global>
</ngcc-header>

<ngcc-header-panel [expanded]="searchOpen" ariaLabel="Search Panel">
  <!-- Panel content (e.g., search input) -->
</ngcc-header-panel>
```

---

### 18. NgccSideNav

**What it does**: Fixed left panel navigation for application routing and deep linking.

**When to use**:
- Companion to `NgccHeader` for application layout
- Primary vertical navigation for large applications
- Multi-level categorization using nested submenus

**Key Features**:
- **Expand/Collapse**: Two-way bindable state (`[(expanded)]`)
- **Rail mode**: Compact icon-only configuration
- **Nested menus**: Collapsible subcategories (`<ngcc-side-nav-menu>`)
- **Auto-active state**: Menus expand automatically when a descendant item is active
- **Footer toggle**: Optional built-in expand/collapse toggle (`[allowExpansion]`)
- **Dividers**: Visual separation between item groups (`<ngcc-side-nav-divider>`)

**Available Directives/Components**:
- `NgccSideNav`, `NgccSideNavItem`
- `NgccSideNavMenu`, `NgccSideNavMenuItem`
- `NgccSideNavDivider`

**Example**:
```typescript
<ngcc-side-nav ariaLabel="Side navigation" [(expanded)]="sideNavOpen" [allowExpansion]="true">
  <ngcc-side-nav-item href="/home" iconName="home" [active]="true">
    Home
  </ngcc-side-nav-item>

  <ngcc-side-nav-menu title="Compute" iconName="cpu">
    <ngcc-side-nav-menu-item href="/compute/instances">Instances</ngcc-side-nav-menu-item>
    <ngcc-side-nav-menu-item href="/compute/images">Images</ngcc-side-nav-menu-item>
  </ngcc-side-nav-menu>

  <ngcc-side-nav-divider />
  <ngcc-side-nav-item href="/help" iconName="notification">Help</ngcc-side-nav-item>
</ngcc-side-nav>
```

---

## DATA VISUALIZATION COMPONENTS (Requires @carbon/charts)

### 19. NgccBaseChart

**What it does**: Base directive/class that normalizes chart inputs and lifecycle for concrete chart components (bar, line, donut, gauge).

**When to use**:
- Library authors or advanced consumers extending chart components
- When building a custom wrapper around `@carbon/charts`

**Key Features**:
- **Inputs**: `data: Record<string, unknown>[]`, `options: object`
- **Lifecycle**: Manages chart init/update/destroy across signals and inputs
- **Extensible**: Concrete chart components (NgccBarChart, NgccLineChart, NgccDonutChart, NgccGaugeChart) extend this base

**Example (internal usage)**:
```typescript
// Simplified: concrete chart extends the base
@Component({ selector: 'ngcc-bar-chart', standalone: true })
export class NgccBarChart extends NgccBaseChart<BarChartOptions> {
  // ...chart-specific wiring (type, options defaults)
}
```

**Notes**: Chart components require `@carbon/charts` in the consumer app to render. Use `NgccBaseChart` behavior when creating custom chart wrappers.


### 20. NgccBarChart

**What it does**: Display data as vertical bars for comparison.

**When to use**:
- Compare values across categories
- Sales by region, expenses by month
- Frequency distribution
- Side-by-side comparisons

**Example**:
```typescript
<ngcc-charts
  type="bar"
  [data]="barChartData"
  [options]="chartOptions"
/>

barChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [{
    label: 'Sales',
    data: [65, 59, 80, 72],
  }]
};
```

---

### 21. NgccLineChart

**What it does**: Display trends over time with connected points.

**When to use**:
- Time-series data (stock prices, website traffic)
- Trend analysis
- Performance metrics over time
- Multiple data series comparison

**Example**:
```typescript
<ngcc-charts
  type="line"
  [data]="lineChartData"
/>

lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    { label: 'Series A', data: [10, 20, 15, 25, 30] },
    { label: 'Series B', data: [5, 15, 20, 18, 25] },
  ]
};
```

---

### 22. NgccDonutChart

**What it does**: Display composition as circular segments (percentage distribution).

**When to use**:
- Show parts of a whole (market share, budget allocation)
- Percentage breakdown
- Category distribution

**Example**:
```typescript
<ngcc-charts
  type="donut"
  [data]="donutData"
/>

donutData = {
  labels: ['Chrome', 'Firefox', 'Safari', 'Edge'],
  datasets: [{
    data: [45, 25, 20, 10],
  }]
};
```

---

### 23. NgccGaugeChart

**What it does**: Circular gauge for showing single metric/percentage.

**When to use**:
- Progress indicators (CPU %, battery, completion)
- KPI display
- Single metric monitoring
- Speedometer-style displays

**Example**:
```typescript
<ngcc-gauge-chart
  [value]="75"
  [max]="100"
  label="Completion"
/>
```

---

## THEMING COMPONENTS

### 24. NgccColorThemeService

**What it does**: Programmatic theme switching and brand color customization.

**When to use**:
- Dynamic theme switching (light/dark mode)
- Custom brand color support
- WCAG compliance checking
- User theme preferences

**Available Themes**:
- `white` (light, default)
- `g10` (light, gray background)
- `g90` (dark)
- `g100` (darker)

**Key Features**:
- **Signal-based**: Reactive theme changes
- **WCAG compliance**: Auto-adjust colors for accessibility
- **Brand color support**: Derive palette from single color
- **Dynamic application**: Real-time switching

**Example**:
```typescript
private themeService = inject(NgccColorThemeService);

switchTheme(theme: 'white' | 'g10' | 'g90' | 'g100'): void {
  this.themeService.baseTheme.set(theme);
}

setBrandColor(color: string): void {
  this.themeService.brandColor.set(color);
}
```

---

### 25. NgccColorThemeSwitcher

**What it does**: Pre-built UI component for user theme selection.

**When to use**:
- When you want out-of-the-box theme switcher UI
- User settings/preferences panel
- Quick theme toggle in header

**Example**:
```typescript
<ngcc-color-theme-switcher />
```

---

## ICONS

### 26. NgccIcon

**What it does**: Render Carbon Design System icons.

**When to use**:
- Icon in buttons, inputs, navigation
- Visual indicators
- Decorative elements
- Any Carbon icon reference

**Example**:
```typescript
<ngcc-icon name="search" />
<ngcc-icon name="delete" size="lg" />
<ngcc-button label="Save" iconName="save-icon" />
```

---

## QUICK DECISION MATRIX

| Need | Component | Alternative |
|------|-----------|-------------|
| App navigation | NgccHeader / NgccSideNav | Tabs (if simple page) |
| User text entry | NgccInput | NgccTextarea (if multi-line) |
| Multi-line text | NgccTextarea | NgccInput (if single-line) |
| Yes/No choice | NgccCheckbox | NgccDropdown (if single selection) |
| Select from list | NgccDropdown | NgccTabs (if navigation) |
| Pick a date | NgccDatepicker | NgccInput (if raw date string) |
| Trigger action | NgccButton | NgccModal (if confirmation needed) |
| Display list | NgccTable | Card grid (custom) |
| Show feedback | NgccNotification (persistent) | NgccToast (temporary) |
| Confirm action | NgccModal | NgccNotification (less intrusive) |
| Multiple sections | NgccTabs | NgccAccordion (if space-saving) |
| Hide/Show content | NgccAccordion | NgccTabs (if tab-like) |
| Show page location | NgccBreadcrumb | NgccTabs (if section-level nav) |
| Display code/commands | NgccCodeSnippet (single) | NgccCodeSnippet inline (if within prose) |
| Multi-line code block | NgccCodeSnippet (multi) | NgccCodeSnippet (single) if one line |
| Compare values | NgccBarChart | NgccLineChart (if over time) |
| Show trend | NgccLineChart | NgccBarChart (if discrete) |
| Show composition | NgccDonutChart | NgccBarChart (if comparison) |
| Show progress | NgccGaugeChart | NgccSkeleton (if loading) |
| Loading state | NgccSkeleton | NgccNotification + disabled inputs |
| Helper text | NgccTooltip | helperText prop (on inputs) |
| Theme switching | NgccColorThemeSwitcher | NgccColorThemeService (programmatic) |

---

## FORM INTEGRATION PATTERNS

All form components support two patterns:

### Pattern 1: Template-Driven (ngModel)
```typescript
<ngcc-input [(value)]="email" />
<ngcc-checkbox [(checked)]="agreed" />
<ngcc-dropdown [(value)]="country" [items]="countries" />
```

### Pattern 2: Reactive Forms
```typescript
form = new FormGroup({
  email: new FormControl(''),
  agreed: new FormControl(false),
  country: new FormControl(null),
});

<ngcc-input [formControl]="form.get('email')" />
```

---

## SERVICE PATTERNS

### Inject and Use
```typescript
private notificationService = inject(NotificationService);
private toastService = inject(ToastService);
private themeService = inject(NgccColorThemeService);

// Call methods
this.notificationService.show({ type: 'success', title: 'Done!' });
this.toastService.show({ type: 'info', title: 'Saved' });
this.themeService.baseTheme.set('g90');
```

---

## ACCESSIBILITY FEATURES

All components include:
- **ARIA labels**: `ariaLabel` prop
- **Semantic HTML**: Proper tag usage
- **Keyboard navigation**: Tab, arrows, Enter
- **Focus management**: Proper focus traps/restore
- **WCAG 2.1 AA**: Full compliance
- **Screen reader support**: Tested with NVDA/JAWS

---

## COMPONENT COMPOSITION EXAMPLE

```typescript
// Multi-component form
@Component({
  imports: [NgccInput, NgccCheckbox, NgccDropdown, NgccButton, FormsModule],
  template: `
    <!-- Form inputs -->
    <ngcc-input label="Name" [(value)]="form.name" required />
    <ngcc-input label="Email" type="email" [(value)]="form.email" />
    <ngcc-dropdown label="Country" [items]="countries" [(value)]="form.country" />
    <ngcc-checkbox label="Subscribe" [(checked)]="form.subscribe" />

    <!-- Actions -->
    <ngcc-button label="Submit" variant="primary" (click)="submit()" />
    <ngcc-button label="Cancel" variant="secondary" />

    <!-- Feedback -->
    <ngcc-modal [open]="showSuccess" title="Success">
      Form submitted successfully!
    </ngcc-modal>
  `
})
```

---

**Use this guide as quick reference. Combine components to build complete, accessible, professional UIs.** 🎨
