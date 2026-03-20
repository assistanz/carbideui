export type NgccBreadcrumbSize = 'sm' | 'md';

export interface NgccBreadcrumbItem {
  label: string;
  href?: string;
  routerLink?: string | string[];
  current?: boolean;
  disabled?: boolean;
  target?: string;
  rel?: string;
}
