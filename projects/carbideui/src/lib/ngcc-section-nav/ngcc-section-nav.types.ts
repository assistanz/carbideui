export type NgccSectionStatus = 'error' | 'warning' | 'complete';

export interface NgccSectionNavItem {
  /** `id` of the section element on the page. */
  id: string;
  label: string;
  /** Flags a section; the state is also written out for screen readers. */
  status?: NgccSectionStatus | null;
}

export interface NgccSectionNavLabels {
  error: string;
  warning: string;
  complete: string;
}

export const NGCC_SECTION_NAV_DEFAULT_LABELS: NgccSectionNavLabels = {
  error: 'has errors',
  warning: 'needs attention',
  complete: 'complete',
};
