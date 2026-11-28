import type { NgccTagType } from '../ngcc-tag/ngcc-tag';

export type SortDirection = 'asc' | 'desc';

export interface NgccTableColumn<T = unknown> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'start' | 'center' | 'end';
  /**
   * `status` renders the value as a status tag (dot + text, so color is never the only signal).
   * Default `text`.
   */
  cell?: 'text' | 'status';
  /** For `cell: 'status'`: value -> tag color. Unmapped values use the built-in status names
   * (running, success, pending, warning, error, stopped) and fall back to gray. */
  statusMap?: Record<string, NgccTagType>;
  /**
   * Shows an editor in every row of this column. `text` and `number` render an input, `select`
   * renders a select over `options`. Edits are written to the row object (the `rows` array is not
   * replaced, so selection, sorting and paging stay) and reported by `cellEdit`.
   * A `<ng-template ngccTableCell="key">` takes precedence over the built-in editors.
   */
  editor?: 'text' | 'number' | 'select';
  /** For `editor: 'select'`. */
  options?: { value: string | number; label: string }[];
  /** For `editor: 'number'`: native range hints (`min`, `max`, `step`). */
  min?: number;
  max?: number;
  step?: number;
  /** Returns an error message for the value, or `null` when it is fine. Runs on every edit. */
  validate?: (value: unknown, row: T) => string | null;
}

export interface NgccTableCellEdit<T = unknown> {
  row: T;
  /** Position of the row in the `rows` input. */
  rowIndex: number;
  key: string;
  value: unknown;
  previous: unknown;
  /** Validation message for this cell after the edit, or `null`. */
  error: string | null;
}

export interface NgccTableConfig {
  pagination?: boolean;
  pageSize?: number;
  rowSelection?: 'single' | 'multiple' | 'none';
  /** Set to `false` to hide the expand column even when an expanded-row template is provided. */
  expandable?: boolean;
  search?: {
    enabled?: boolean;
    mode?: 'static' | 'dynamic'; // static filters locally, dynamic emits event
  };
}
