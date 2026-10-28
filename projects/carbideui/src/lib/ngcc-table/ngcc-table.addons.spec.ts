import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccTable, NgccTableExpandedRowDirective } from './ngcc-table';
import { NgccTableColumn, NgccTableConfig } from './ngcc-table.types';
import { runAxe } from '../../test-utils/a11y';

interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: string;
}

const ROWS: Invoice[] = [
  { id: 'INV-3', client: 'Charlie', amount: 30, status: 'Pending' },
  { id: 'INV-1', client: 'Alpha', amount: 10, status: 'Running' },
  { id: 'INV-2', client: 'Bravo', amount: 20, status: 'Error' },
];

@Component({
  imports: [NgccTable, NgccTableExpandedRowDirective],
  template: `
    <ngcc-table
      [columns]="columns()"
      [rows]="rows()"
      [config]="config()"
      (rowSelect)="selected = $event"
      (rowExpand)="expandEvents.push($event)"
    >
      @if (withDetails()) {
        <ng-template ngccTableExpandedRow let-row let-index="index">
          <p class="details">Details for {{ row.id }} (#{{ index }})</p>
        </ng-template>
      }
    </ngcc-table>
  `,
})
class HostComponent {
  columns = signal<NgccTableColumn<Invoice>[]>([
    { key: 'id', header: 'Invoice', sortable: true },
    { key: 'client', header: 'Client', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true },
    { key: 'status', header: 'Status', cell: 'status', statusMap: { Pending: 'blue' } },
  ]);
  rows = signal(ROWS);
  config = signal<NgccTableConfig>({ pagination: false, rowSelection: 'multiple' });
  withDetails = signal(true);
  selected: Invoice[] = [];
  expandEvents: { row: Invoice; expanded: boolean }[] = [];
}

describe('NgccTable add-ons', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const flush = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const bodyRows = (): HTMLElement[] =>
    Array.from(el().querySelectorAll<HTMLElement>('tbody tr.cds--data-table__row'));
  const cellText = (): string[] =>
    bodyRows().map((r) => r.querySelectorAll('td.cds--data-table__cell')[2].textContent!.trim());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await flush();
  });

  describe('row selection follows the row, not its position', () => {
    it('selects the clicked row even after sorting', async () => {
      el().querySelectorAll<HTMLElement>('th button.cds--table-sort')[0].click(); // sort by invoice
      await flush();
      expect(bodyRows()[0].textContent).toContain('INV-1');

      el().querySelectorAll<HTMLInputElement>('tbody input[type=checkbox]')[0].click();
      await flush();
      expect(host.selected.map((r) => r.id)).toEqual(['INV-1']);
    });

    it('keeps the selection when the sort order changes', async () => {
      bodyRows()[0].click(); // INV-3, as given
      await flush();
      el().querySelectorAll<HTMLElement>('th button.cds--table-sort')[0].click();
      await flush();
      const selectedRow = bodyRows().find((r) => r.getAttribute('aria-selected') === 'true')!;
      expect(selectedRow.textContent).toContain('INV-3');
      expect(bodyRows().filter((r) => r.getAttribute('aria-selected') === 'true').length).toBe(1);
    });

    it('a click on the checkbox toggles once, not twice', async () => {
      el().querySelectorAll<HTMLInputElement>('tbody input[type=checkbox]')[1].click();
      await flush();
      expect(host.selected.map((r) => r.id)).toEqual(['INV-1']);
    });

    it('select-all selects every visible row and clears again', async () => {
      el().querySelector<HTMLInputElement>('thead input[type=checkbox]')!.click();
      await flush();
      expect(host.selected.length).toBe(3);
      el().querySelector<HTMLInputElement>('thead input[type=checkbox]')!.click();
      await flush();
      expect(host.selected).toEqual([]);
    });

    it('single mode keeps one row and drops the select-all box', async () => {
      host.config.set({ pagination: false, rowSelection: 'single' });
      await flush();
      expect(el().querySelector('thead input[type=checkbox]')).toBeNull();
      bodyRows()[0].click();
      await flush();
      bodyRows()[1].click();
      await flush();
      expect(host.selected.map((r) => r.id)).toEqual(['INV-1']);
    });

    it('does not select on click when selection is off', async () => {
      host.config.set({ pagination: false, rowSelection: 'none' });
      await flush();
      bodyRows()[0].click();
      await flush();
      expect(host.selected).toEqual([]);
    });

    it('clears the selection when the rows are replaced', async () => {
      bodyRows()[0].click();
      await flush();
      host.rows.set([{ id: 'INV-9', client: 'Zed', amount: 5, status: 'Running' }]);
      await flush();
      expect(el().querySelector('[aria-selected="true"]')).toBeNull();
    });
  });

  describe('expandable rows', () => {
    const toggle = (i: number): HTMLButtonElement =>
      el().querySelectorAll<HTMLButtonElement>('button.cds--table-expand__button')[i];

    it('shows an expand button per row when a template is provided', () => {
      expect(el().querySelectorAll('button.cds--table-expand__button').length).toBe(3);
    });

    it('has no expand column without a template', async () => {
      host.withDetails.set(false);
      await flush();
      expect(el().querySelector('.cds--table-expand')).toBeNull();
    });

    it('can be switched off in the config', async () => {
      host.config.set({ pagination: false, expandable: false });
      await flush();
      expect(el().querySelector('.cds--table-expand')).toBeNull();
    });

    it('expands and collapses, with the row as template context', async () => {
      toggle(1).click();
      await flush();
      expect(el().querySelector('.details')!.textContent).toBe('Details for INV-1 (#1)');
      expect(toggle(1).getAttribute('aria-expanded')).toBe('true');
      expect(bodyRows()[1].classList).toContain('cds--expandable-row');

      toggle(1).click();
      await flush();
      expect(el().querySelector('.details')).toBeNull();
      expect(toggle(1).getAttribute('aria-expanded')).toBe('false');
    });

    it('lets several rows be open at once and reports each change', async () => {
      toggle(0).click();
      toggle(2).click();
      await flush();
      expect(el().querySelectorAll('.details').length).toBe(2);
      expect(host.expandEvents.map((e) => [e.row.id, e.expanded])).toEqual([
        ['INV-3', true],
        ['INV-2', true],
      ]);
    });

    it('links the button to the details row and spans every column', async () => {
      toggle(0).click();
      await flush();
      const details = el().querySelector('.ngcc--table-details')!;
      expect(toggle(0).getAttribute('aria-controls')).toBe(details.id);
      // expand + checkbox + 4 data columns
      expect(details.querySelector('td')!.getAttribute('colspan')).toBe('6');
    });

    it('does not select the row when the expand button is used', async () => {
      toggle(0).click();
      await flush();
      expect(host.selected).toEqual([]);
    });

    it('keeps the right row open after sorting', async () => {
      toggle(0).click(); // INV-3
      await flush();
      el().querySelectorAll<HTMLElement>('th button.cds--table-sort')[0].click();
      await flush();
      const open = el().querySelector('.ngcc--table-details')!.previousElementSibling!;
      expect(open.textContent).toContain('INV-3');
    });

    it('has no axe violations when a row is open', async () => {
      toggle(0).click();
      await flush();
      expect((await runAxe(el())).violations).toEqual([]);
    });
  });

  describe('inline status cell', () => {
    const tags = (): HTMLElement[] => Array.from(el().querySelectorAll('tbody ngcc-tag'));

    it('renders the value as a status tag with the text', () => {
      expect(tags().map((t) => t.textContent!.trim())).toEqual(['Pending', 'Running', 'Error']);
      expect(el().querySelectorAll('tbody .ngcc-tag__dot').length).toBe(3);
    });

    it('colors by built-in status names and honours statusMap', () => {
      const cls = (i: number): string => tags()[i].querySelector('span')!.className;
      expect(cls(0)).toContain('cds--tag--blue'); // statusMap
      expect(cls(1)).toContain('cds--tag--green'); // running
      expect(cls(2)).toContain('cds--tag--red'); // error
    });

    it('falls back to gray for unknown values', async () => {
      host.rows.set([{ id: 'x', client: 'x', amount: 1, status: 'Archived' }]);
      await flush();
      expect(tags()[0].querySelector('span')!.className).toContain('cds--tag--gray');
    });

    it('still sorts on the raw value', async () => {
      host.columns.update((cols) =>
        cols.map((c) => (c.key === 'status' ? { ...c, sortable: true } : c)),
      );
      await flush();
      const statusSort = el().querySelectorAll<HTMLElement>('th button.cds--table-sort')[3];
      statusSort.click();
      await flush();
      expect(tags().map((t) => t.textContent!.trim())).toEqual(['Error', 'Pending', 'Running']);
    });
  });

  describe('sorting', () => {
    it('sorts numbers numerically and cycles asc, desc, none', async () => {
      const amountSort = el().querySelectorAll<HTMLElement>('th button.cds--table-sort')[2];
      amountSort.click();
      await flush();
      expect(cellText()).toEqual(['10', '20', '30']);
      amountSort.click();
      await flush();
      expect(cellText()).toEqual(['30', '20', '10']);
      amountSort.click();
      await flush();
      expect(cellText()).toEqual(['30', '10', '20']);
    });
  });
});
