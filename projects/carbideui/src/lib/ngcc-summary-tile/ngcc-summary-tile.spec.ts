import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgccSummaryTile, NgccSummaryItem } from './ngcc-summary-tile';
import { NgccTag } from '../ngcc-tag/ngcc-tag';
import { runAxe } from '../../test-utils/a11y';

@Component({
  imports: [NgccSummaryTile, NgccTag],
  template: `
    <ngcc-summary-tile heading="Plan" [items]="items()" [columns]="columns()">
      <ngcc-tag ngccSummaryStatus type="green">Valid</ngcc-tag>
      <p class="extra">Estimated 12 EUR / month</p>
    </ngcc-summary-tile>
  `,
})
class HostComponent {
  items = signal<NgccSummaryItem[]>([
    { label: 'Region', value: 'eu-west-1' },
    { label: 'Disk', value: 0 },
    { label: 'Owner', value: null },
    { label: 'Notes', value: '   ' },
  ]);
  columns = signal(1);
}

describe('NgccSummaryTile', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const flush = (): Promise<void> => fixture.whenStable();

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

  const rows = (): { label: string; value: string; empty: boolean }[] =>
    Array.from(el().querySelectorAll('.ngcc--summary-tile__row')).map((r) => ({
      label: r.querySelector('dt')!.textContent!.trim(),
      value: r.querySelector('dd')!.textContent!.trim(),
      empty: r.querySelector('dd')!.classList.contains('ngcc--summary-tile__value--empty'),
    }));

  it('renders a description list inside the tile with the heading', () => {
    expect(el().querySelector('.ngcc-tile__heading')!.textContent).toContain('Plan');
    expect(el().querySelectorAll('dl > div > dt').length).toBe(4);
  });

  it('shows values, including a zero', () => {
    expect(rows()[0]).toEqual({ label: 'Region', value: 'eu-west-1', empty: false });
    expect(rows()[1]).toEqual({ label: 'Disk', value: '0', empty: false });
  });

  it('marks null and blank values as empty and reads them as "Not set"', () => {
    expect(rows()[2].empty).toBe(true);
    expect(rows()[3].empty).toBe(true);
    const dd = el().querySelectorAll('.ngcc--summary-tile__value--empty')[0];
    expect(dd.querySelector('[aria-hidden="true"]')!.textContent).toBe('—');
    expect(dd.querySelector('.cds--visually-hidden')!.textContent).toBe('Not set');
  });

  it('projects the status tag into the header and other content into the body', () => {
    expect(el().querySelector('.ngcc-tile__header ngcc-tag')!.textContent).toContain('Valid');
    expect(el().querySelector('.ngcc-tile__body .extra')).not.toBeNull();
  });

  it('updates live and sets the column count', async () => {
    host.items.set([{ label: 'Region', value: 'us-east-1' }]);
    host.columns.set(2);
    await flush();
    expect(rows()).toEqual([{ label: 'Region', value: 'us-east-1', empty: false }]);
    expect(
      el().querySelector<HTMLElement>('dl')!.style.getPropertyValue('--ngcc-summary-columns'),
    ).toBe('2');
  });

  it('has no axe violations', async () => {
    expect((await runAxe(el())).violations).toEqual([]);
  });
});
