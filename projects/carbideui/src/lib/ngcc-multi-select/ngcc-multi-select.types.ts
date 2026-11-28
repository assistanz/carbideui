export interface NgccMultiSelectOption {
  value: string;
  label: string;
  /** Options with the same group are listed under one heading. */
  group?: string;
  disabled?: boolean;
  /** Secondary line shown under the label. */
  description?: string;
}

/** Visible and announced texts. Override for other languages. */
export interface NgccMultiSelectLabels {
  placeholder: string;
  selectAll: string;
  clearAll: string;
  noResults: string;
  loading: string;
  retry: string;
  /** `{value}` is replaced with the typed text. */
  create: string;
  /** `{label}` is replaced with the chip label. */
  remove: string;
  /** `{count}` is replaced with the number of matches. */
  results: string;
  /** Shown when `required` and nothing is selected. */
  required: string;
}

export const NGCC_MULTI_SELECT_DEFAULT_LABELS: NgccMultiSelectLabels = {
  placeholder: 'Search or select',
  selectAll: 'Select all',
  clearAll: 'Clear all',
  noResults: 'No matches',
  loading: 'Loading…',
  retry: 'Retry',
  create: 'Create "{value}"',
  remove: 'Remove {label}',
  results: '{count} results',
  required: 'Select at least one option',
};

/** One entry of the open list. */
export type NgccMultiSelectRow =
  | { kind: 'group'; key: string; label: string }
  | { kind: 'all'; key: string; allSelected: boolean }
  | { kind: 'option'; key: string; option: NgccMultiSelectOption; selected: boolean }
  | { kind: 'create'; key: string; text: string };
