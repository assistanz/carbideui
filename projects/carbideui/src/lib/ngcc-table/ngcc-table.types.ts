import type { NgccTagType } from '../ngcc-tag/ngcc-tag';

export type SortDirection = 'asc' | 'desc';

export interface NgccTableColumn<_T = unknown> {
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
