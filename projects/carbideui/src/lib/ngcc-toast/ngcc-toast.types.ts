export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface NgccToastConfig {
  /** Unique identifier. If omitted, service will assign */
  id?: string;
  type: ToastType;
  title: string;
  subtitle?: string;
  caption?: string;
  /** milliseconds before auto-dismiss. 0 or negative = no auto-dismiss and  sticky */
  timeout?: number;
  /** low contrast style */
  lowContrast?: boolean;
  /** whether close button is shown */
  showClose?: boolean;
  /** Optional custom icon name (uses NgccIcon) */
  icon?: string;
  /** If true, hides the icon completely */
  hideIcon?: boolean;
}
