import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { NgccFieldLabel } from '../shared/ngcc-field-label';
import { NgccTag } from '../ngcc-tag/ngcc-tag';
import {
  NGCC_MULTI_SELECT_DEFAULT_LABELS,
  NgccMultiSelectLabels,
  NgccMultiSelectOption,
  NgccMultiSelectRow,
} from './ngcc-multi-select.types';

let nextId = 0;
const ALL_KEY = '__all';
const CREATE_KEY = '__create';

/**
 * Searchable multi-select: chips for the selection, group headings, select all, optional creation
 * of new values, loading and error states. Works with `[(value)]` and with Angular forms.
 *
 * ```html
 * <ngcc-multi-select label="Regions" [options]="regions" [(value)]="selected" selectAll />
 * <ngcc-multi-select label="Tags" [options]="tags" formControlName="tags" creatable />
 * ```
 *
 * Keyboard (focus stays in the search box): ArrowDown/ArrowUp move through the list (and open it),
 * Enter picks the highlighted row, Escape closes, Backspace in an empty box removes the last chip.
 * With `creatable` and no `options` it works as a tag input.
 */
@Component({
  selector: 'ngcc-multi-select',
  standalone: true,
  imports: [NgccTag, NgccFieldLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-multi-select.html',
  styleUrl: './ngcc-multi-select.scss',
  host: { style: 'display: block', '(focusout)': 'onFocusOut($event)' },
})
export class NgccMultiSelect implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly searchEl = viewChild<ElementRef<HTMLInputElement>>('search');

  readonly options = input<NgccMultiSelectOption[]>([]);
  /** Selected values (two-way). */
  readonly value = model<string[]>([]);
  readonly label = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly helperText = input('');
  readonly required = input(false);
  /** Show "(optional)" next to the label (ignored when `required`). */
  readonly optional = input(false);
  readonly optionalLabel = input('optional');
  /** Short explanation shown from an info button next to the label. */
  readonly tooltip = input('');
  readonly disabled = input(false);
  /** Forces the invalid look; leave unset to derive it from `required` and the form control. */
  readonly invalid = input<boolean | undefined>(undefined);
  readonly errorMessage = input('');
  /** Adds a "Select all" row (it acts on the options matching the search). */
  readonly selectAll = input(false);
  /** Lets the user add a value that is not in `options`. */
  readonly creatable = input(false);
  /** Shows a loading row while options are being fetched. */
  readonly loading = input(false);
  /** Text of a load error; shows it with a Retry button. */
  readonly error = input('');
  readonly labels = input<Partial<NgccMultiSelectLabels>>({});

  /** The search text changed (use it to load options from a server). */
  readonly searchChange = output<string>();
  /** A new value was created. */
  readonly created = output<string>();
  readonly retry = output<void>();

  protected readonly uid = nextId++;
  readonly inputId = `ngcc-multi-select-${this.uid}`;
  protected readonly labelId = `${this.inputId}-label`;
  protected readonly listboxId = `${this.inputId}-listbox`;
  protected readonly helperId = `${this.inputId}-helper`;
  protected readonly errorId = `${this.inputId}-error`;

  protected readonly open = signal(false);
  protected readonly query = signal('');
  private readonly active = signal<string | null>(null);
  private readonly cvaDisabled = signal(false);
  private readonly touched = signal(false);
  private readonly controlInvalid = signal(false);

  protected readonly text = computed<NgccMultiSelectLabels>(() => ({
    ...NGCC_MULTI_SELECT_DEFAULT_LABELS,
    ...this.labels(),
  }));
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly chips = computed(() => {
    const byValue = new Map(this.options().map((o) => [o.value, o.label]));
    return this.value().map((v) => ({ value: v, label: byValue.get(v) ?? v }));
  });

  protected readonly rows = computed<NgccMultiSelectRow[]>(() => {
    const raw = this.query().trim();
    const q = raw.toLowerCase();
    const selected = new Set(this.value());
    const matches = this.options().filter((o) => !q || o.label.toLowerCase().includes(q));
    const rows: NgccMultiSelectRow[] = [];

    const pickable = matches.filter((o) => !o.disabled);
    if (this.selectAll() && pickable.length) {
      rows.push({
        kind: 'all',
        key: ALL_KEY,
        allSelected: pickable.every((o) => selected.has(o.value)),
      });
    }

    const groups = new Map<string, NgccMultiSelectOption[]>();
    for (const o of matches) {
      const g = o.group ?? '';
      groups.set(g, [...(groups.get(g) ?? []), o]);
    }
    const names = [...groups.keys()].sort((a, b) => (a === '' ? -1 : b === '' ? 1 : 0));
    for (const g of names) {
      if (g) rows.push({ kind: 'group', key: `g:${g}`, label: g });
      for (const option of groups.get(g) ?? []) {
        rows.push({
          kind: 'option',
          key: `o:${option.value}`,
          option,
          selected: selected.has(option.value),
        });
      }
    }

    const exists =
      this.options().some((o) => o.label.toLowerCase() === q) ||
      this.value().some((v) => v.toLowerCase() === q);
    if (this.creatable() && raw && !exists) {
      rows.push({ kind: 'create', key: CREATE_KEY, text: raw });
    }
    return rows;
  });

  private readonly selectableKeys = computed(() =>
    this.rows()
      .filter((r) => r.kind !== 'group' && !(r.kind === 'option' && r.option.disabled))
      .map((r) => r.key),
  );

  protected readonly activeKey = computed(() => {
    const keys = this.selectableKeys();
    const a = this.active();
    return a && keys.includes(a) ? a : null;
  });
  protected readonly activeId = computed(() => {
    const k = this.activeKey();
    return k ? this.optionId(k) : null;
  });

  protected readonly hasOptionRows = computed(() =>
    this.rows().some((r) => r.kind === 'option' || r.kind === 'create'),
  );

  protected readonly isInvalid = computed(() => {
    const forced = this.invalid();
    if (forced !== undefined) return forced;
    if (this.required() && this.touched() && !this.value().length) return true;
    return this.touched() && this.controlInvalid();
  });
  protected readonly errorText = computed(() => {
    if (this.errorMessage()) return this.errorMessage();
    return this.required() && !this.value().length ? this.text().required : '';
  });
  protected readonly describedBy = computed(() => {
    if (this.isInvalid() && this.errorText()) return this.errorId;
    return this.helperText() ? this.helperId : null;
  });
  protected readonly announcement = computed(() => {
    if (!this.open()) return '';
    const count = this.rows().filter((r) => r.kind === 'option').length;
    return this.text().results.replace('{count}', String(count));
  });

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  protected optionId(key: string): string {
    return `${this.inputId}-opt-${key.replace(/[^\w-]/g, '_')}`;
  }

  // ── Interaction ───────────────────────────────────────────────────────────
  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    this.open.set(true);
    this.active.set(this.selectableKeys()[0] ?? null);
    this.searchChange.emit(text);
  }

  protected onFieldClick(event: Event): void {
    if ((event.target as HTMLElement).closest('button')) return;
    this.focusInput();
    if (!this.isDisabled()) this.open.set(true);
  }

  protected focusInput(): void {
    this.searchEl()?.nativeElement.focus();
  }

  protected toggleOpen(): void {
    if (this.isDisabled()) return;
    this.open.update((o) => !o);
    if (this.open()) this.focusInput();
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) {
          this.open.set(true);
          this.active.set(this.activeKey() ?? this.selectableKeys()[0] ?? null);
        } else {
          this.move(event.key === 'ArrowDown' ? 1 : -1);
        }
        break;
      case 'Enter': {
        if (!this.open()) break;
        event.preventDefault();
        const row = this.rows().find((r) => r.key === this.activeKey());
        if (row) this.activate(row);
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.stopPropagation();
          this.close();
        }
        break;
      case 'Backspace':
        if (!this.query() && this.value().length && !this.isDisabled()) {
          this.remove(this.value()[this.value().length - 1]);
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  private move(delta: number): void {
    const keys = this.selectableKeys();
    if (!keys.length) return;
    const i = keys.indexOf(this.activeKey() ?? '');
    const next =
      i < 0 ? (delta > 0 ? 0 : keys.length - 1) : (i + delta + keys.length) % keys.length;
    this.active.set(keys[next]);
    this.host.nativeElement
      .querySelector(`[id="${this.optionId(keys[next])}"]`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }

  protected activate(row: NgccMultiSelectRow): void {
    if (this.isDisabled()) return;
    this.active.set(row.key);
    if (row.kind === 'all') {
      const q = this.query().trim().toLowerCase();
      const targets = this.options()
        .filter((o) => !o.disabled && (!q || o.label.toLowerCase().includes(q)))
        .map((o) => o.value);
      const current = new Set(this.value());
      this.setValue(
        row.allSelected
          ? this.value().filter((v) => !targets.includes(v))
          : [...this.value(), ...targets.filter((v) => !current.has(v))],
      );
    } else if (row.kind === 'option') {
      if (row.option.disabled) return;
      const v = row.option.value;
      this.setValue(
        this.value().includes(v) ? this.value().filter((x) => x !== v) : [...this.value(), v],
      );
    } else if (row.kind === 'create') {
      this.setValue([...this.value(), row.text]);
      this.created.emit(row.text);
      this.query.set('');
      this.searchChange.emit('');
    }
  }

  protected remove(value: string): void {
    if (this.isDisabled()) return;
    this.setValue(this.value().filter((v) => v !== value));
  }

  protected clearAll(): void {
    this.setValue([]);
    this.focusInput();
  }

  private setValue(next: string[]): void {
    this.value.set(next);
    this.onChange(next);
    this.syncControl();
  }

  private close(): void {
    this.open.set(false);
    if (this.query()) {
      this.query.set('');
      this.searchChange.emit('');
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.close();
    this.touched.set(true);
    this.onTouched();
    this.syncControl();
  }

  private syncControl(): void {
    this.controlInvalid.set(!!this.ngControl?.control?.invalid);
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────────
  writeValue(value: unknown): void {
    this.value.set(Array.isArray(value) ? value.filter((v) => typeof v === 'string') : []);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
