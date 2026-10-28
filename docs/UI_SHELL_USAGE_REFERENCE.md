# UI Shell Usage Reference

## 1) Angular router support for shell navigation

The following components now accept `routerLink` in addition to `href`.

- `ngcc-side-nav-item`
- `ngcc-side-nav-menu-item`
- `ngcc-header-item`
- `ngcc-header-menu-item`

When `routerLink` is provided, it takes precedence over `href`.

### Side nav example
```html
<ngcc-side-nav ariaLabel="Primary navigation" [(expanded)]="sideNavOpen">
  <ngcc-side-nav-item [routerLink]="['/dashboard']" iconName="home" [active]="true">
    Dashboard
  </ngcc-side-nav-item>

  <ngcc-side-nav-menu title="Operations" iconName="services">
    <ngcc-side-nav-menu-item [routerLink]="['/billing']">Billing</ngcc-side-nav-menu-item>
    <ngcc-side-nav-menu-item [routerLink]="['/reports']">Reports</ngcc-side-nav-menu-item>
  </ngcc-side-nav-menu>
</ngcc-side-nav>
```

### Header nav example
```html
<ngcc-header-navigation ariaLabel="Primary navigation">
  <ngcc-header-item [routerLink]="['/dashboard']" [isCurrentPage]="true">Dashboard</ngcc-header-item>
  <ngcc-header-item [routerLink]="['/billing']">Billing</ngcc-header-item>

  <ngcc-header-menu title="Settings">
    <ngcc-header-menu-item [routerLink]="['/settings/profile']">Profile</ngcc-header-menu-item>
    <ngcc-header-menu-item [routerLink]="['/settings/account']">Account</ngcc-header-menu-item>
  </ngcc-header-menu>
</ngcc-header-navigation>
```

### Legacy href fallback
```html
<ngcc-side-nav-item href="/dashboard" iconName="home">Dashboard</ngcc-side-nav-item>
<ngcc-header-item href="/billing">Billing</ngcc-header-item>
```

## 2) Header action link support

`ngcc-header-action` supports either toggleable button behavior or a standard link-like action by passing `href`.

```html
<ngcc-header-global>
  <ngcc-header-action
    ariaLabel="Search"
    iconName="search"
    [(active)]="searchOpen"
  />

  <ngcc-header-action
    ariaLabel="Switch to legacy UI"
    iconName="external_link"
    href="/legacy"
    [toggleable]="false"
  />
</ngcc-header-global>
```

Notes:
- When `href` is present, the action behaves like a link.
- When `href` is absent, it behaves like the normal toggleable button.
- `toggleable` still controls the active state toggle for button mode.

## 3) Public icon-name type export

The package root now exposes `NgccIconNameType` for downstream apps.

```ts
import type { NgccIconNameType } from 'carbideui';

const icon: NgccIconNameType = 'dashboard';
```

Typical usage in component templates:
```html
<ngcc-button iconName="search" label="Search" />
<ngcc-side-nav-item iconName="home" href="/home">Home</ngcc-side-nav-item>
```

## 4) Active/current-page behavior

For routed shell links, the current route is treated as active when the router matches. The components also retain the explicit `active` / `isCurrentPage` inputs for cases where the app manages state manually.

