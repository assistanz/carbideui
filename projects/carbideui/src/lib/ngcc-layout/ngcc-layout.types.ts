/** Space between grid cells: condensed 0.5rem, default 1rem, wide 2rem. */
export type NgccGridGap = 'condensed' | 'default' | 'wide';

export const NGCC_GRID_GAPS: Record<NgccGridGap, string> = {
  condensed: '0.5rem',
  default: '1rem',
  wide: '2rem',
};
