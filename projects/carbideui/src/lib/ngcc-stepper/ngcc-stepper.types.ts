export interface NgccStep {
  /** Stable id, used to track the step across re-renders. Defaults to the index. */
  id?: string;
  label: string;
  /** Small text under the label, e.g. "Optional". */
  secondaryLabel?: string;
  /** Marks the step as having an error; shown instead of "complete". */
  invalid?: boolean;
  disabled?: boolean;
}

export type NgccStepState = 'complete' | 'current' | 'incomplete' | 'invalid';
