import { Directive } from '@angular/core';

export type NgccContainedListKind = 'on-page' | 'disclosed';
export type NgccContainedListSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Marker directive for the list header action slot.
 * Apply to the action element: `<button ngccContainedListAction>...</button>`
 * Must be imported by the consuming component alongside NgccContainedList.
 */
@Directive({ selector: '[ngccContainedListAction]', standalone: true })
export class NgccContainedListActionDirective {}

/**
 * Marker directive for a list item action slot.
 * Apply to the action element: `<button ngccContainedListItemAction>...</button>`
 * Must be imported by the consuming component alongside NgccContainedListItem.
 */
@Directive({ selector: '[ngccContainedListItemAction]', standalone: true })
export class NgccContainedListItemActionDirective {}
