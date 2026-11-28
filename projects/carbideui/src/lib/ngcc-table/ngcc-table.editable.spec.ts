import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgccTable, NgccTableCellDirective } from './ngcc-table';
import { NgccTableCellEdit, NgccTableColumn } from './ngcc-table.types';
import { runAxe } from '../../test-utils/a11y';

interface Row {
  name: string;
  size: number | null;
  tier: string;
  owner: string;
}

@Component({
  imports: [NgccTable, NgccTableCellDirective],
  template: `
    <ngcc-table
      [columns]="columns"
      [rows]="rows"
      [config]="config"
      [rowValidator]="rowValidator"
      (cellEdit)="edits.push($event)"
      (validityChange)="validity.push($event)"
      (rowSelect)="selection = $event"
    >
      <ng-template ngccTableCell="owner" let-row let-value="value" let-index="index">
        <span class="custom" [attr.data-index]="index">Owner: {{ value }} / {{ row.name }}</span>
      </ng-template>
    </ngcc-table>
  `,
})
class HostComponent {
  table = viewChild.required(NgccTable);
  config = { pagination: false, rowSelection: 'multiple' as const };
  columns: NgccTableColumn<Row>[] = [
    {
      key: 'name',
      header: 'Name',
      editor: 'text',
      validate: (v) => (String(v).trim() ? null : 'Name is required'),
    },
    {
      key: 'size',
      header: 'Size (GB)',
      editor: 'number',
      min: 1,
      max: 100,
      validate: (v) => (typeof v === 'number' && v >= 1 ? null : 'Size must be at least 1'),
    },
    {
      key: 'tier',
      header: 'Tier',
      editor: 'select',
      options: [
        { value: 'hot', label: 'Hot' },
        { value: 'cold', label: 'Cold' },
      ],
    },
    { key: 'owner', header: 'Owner' },
  ];
  rows: Row[] = [
    { name: 'disk-a', size: 10, tier: 'hot', owner: 'ana' },
    { name: 'disk-b', size: 20, tier: 'cold', owner: 'bo' },
  ];
  rowValidator = (r: Row): string | null =>
    r.tier === 'cold' && (r.size ?? 0) > 50 ? 'Cold storage is limited to 50 GB' : null;
  edits: NgccTableCellEdit<Row>[] = [];
  validity: boolean[] = [];
  selection: Row[] = [];
}

describe('NgccTable editable cells', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const flush = (): Promise<void> => fixture.whenStable();
  const inputs = (): HTMLInputElement[] =>
    Array.from(el().querySelectorAll<HTMLInputElement>('input.ngcc--table-editor'));
  const selects = (): HTMLSelectElement[] =>
    Array.from(el().querySelectorAll<HTMLSelectElement>('td select'));
  const edit = async (input: HTMLInputElement, value: string): Promise<void> => {
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    await flush();
  });

  afterEach(() => el().remove());

  it('renders an editor per row for editable columns and plain text for the rest', () => {
    expect(inputs().length).toBe(4); // name + size, two rows
    expect(selects().length).toBe(2);
    expect(inputs()[0].value).toBe('disk-a');
    expect(inputs()[1].type).toBe('number');
    expect(inputs()[1].min).toBe('1');
    expect(selects()[1].value).toBe('cold');
  });

  it('names every editor by column and row', () => {
    expect(inputs()[0].getAttribute('aria-label')).toBe('Name, row 1');
    expect(selects()[1].getAttribute('aria-label')).toBe('Tier, row 2');
  });

  it('writes the edit into the row and reports it, keeping the rows array', async () => {
    const rows = host.rows;
    await edit(inputs()[0], 'renamed');
    expect(host.rows).toBe(rows);
    expect(host.rows[0].name).toBe('renamed');
    expect(host.edits).toHaveLength(1);
    expect(host.edits[0]).toMatchObject({
      rowIndex: 0,
      key: 'name',
      value: 'renamed',
      previous: 'disk-a',
      error: null,
    });
  });

  it('turns number input into a number and empty into null', async () => {
    await edit(inputs()[1], '42');
    expect(host.rows[0].size).toBe(42);
    await edit(inputs()[1], '');
    expect(host.rows[0].size).toBeNull();
  });

  it('keeps the original option type for selects', async () => {
    const s = selects()[0];
    s.value = 'cold';
    s.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
    expect(host.rows[0].tier).toBe('cold');
  });

  describe('validation', () => {
    it('shows a cell message tied to the control and marks it invalid', async () => {
      await edit(inputs()[0], '  ');
      const msg = el().querySelector('.ngcc--table-cell-error')!;
      expect(msg.textContent).toContain('Name is required');
      expect(inputs()[0].getAttribute('aria-invalid')).toBe('true');
      expect(inputs()[0].getAttribute('aria-describedby')).toBe(msg.id);
      expect(host.edits[0].error).toBe('Name is required');
    });

    it('clears the message once the value is fixed', async () => {
      await edit(inputs()[0], '');
      await edit(inputs()[0], 'ok');
      expect(el().querySelector('.ngcc--table-cell-error')).toBeNull();
      expect(inputs()[0].getAttribute('aria-invalid')).toBeNull();
    });

    it('shows a row-level message under the row, announced as an alert', async () => {
      await edit(inputs()[3], '60');
      const alert = el().querySelector('.ngcc--table-row-error [role="alert"]')!;
      expect(alert.textContent).toContain('Cold storage is limited to 50 GB');
    });

    it('reports validity changes only when they flip', async () => {
      await edit(inputs()[0], '');
      await edit(inputs()[0], ' ');
      expect(host.validity).toEqual([false]);
      await edit(inputs()[0], 'ok');
      expect(host.validity).toEqual([false, true]);
    });

    it('validate() checks every row, shows the messages and returns the result', async () => {
      host.rows[1].name = '';
      expect(host.table().validate()).toBe(false);
      await flush();
      expect(el().querySelectorAll('.ngcc--table-cell-error').length).toBe(1);
      host.rows[1].name = 'fixed';
      expect(host.table().validate()).toBe(true);
      await flush();
      expect(el().querySelector('.ngcc--table-cell-error')).toBeNull();
      expect(host.validity).toEqual([false, true]);
    });
  });

  it('renders a custom cell template with the row, value and index', () => {
    const cells = Array.from(el().querySelectorAll('.custom'));
    expect(cells.map((c) => c.textContent!.trim())).toEqual([
      'Owner: ana / disk-a',
      'Owner: bo / disk-b',
    ]);
    expect(cells[1].getAttribute('data-index')).toBe('1');
  });

  it('does not select the row when the user clicks into an editor', async () => {
    inputs()[0].click();
    selects()[0].click();
    await flush();
    expect(host.selection).toEqual([]);
  });

  it('has no axe violations, with and without errors', async () => {
    expect((await runAxe(el())).violations).toEqual([]);
    await edit(inputs()[0], '');
    expect((await runAxe(el())).violations).toEqual([]);
  });
});
