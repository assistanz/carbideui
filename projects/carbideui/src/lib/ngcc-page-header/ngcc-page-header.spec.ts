import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgccPageHeader } from './ngcc-page-header';
import { runAxe } from '../../test-utils/a11y';

@Component({
  imports: [NgccPageHeader],
  template: `
    <ngcc-page-header
      title="Invoices"
      description="All invoices for this account"
      [breadcrumbs]="[{ label: 'Billing', href: '/billing' }, { label: 'Invoices' }]"
    >
      <span ngccPageMeta class="meta">Updated 5 min ago</span>
      <button ngccPageActions class="cds--btn cds--btn--primary" type="button">Create</button>
    </ngcc-page-header>
  `,
})
class HostComponent {}

describe('NgccPageHeader', () => {
  let fixture: ComponentFixture<NgccPageHeader>;
  const set = async (inputs: Record<string, unknown>): Promise<void> => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
  };
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccPageHeader, HostComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(NgccPageHeader);
    fixture.componentRef.setInput('title', 'Clients');
    await fixture.whenStable();
  });

  it('renders the title as the single h1', () => {
    const h1 = el().querySelectorAll('h1');
    expect(h1.length).toBe(1);
    expect(h1[0].textContent).toBe('Clients');
  });

  it('shows the description only when given', async () => {
    expect(el().querySelector('.ngcc-page-header__description')).toBeNull();
    await set({ description: 'Everyone you bill' });
    expect(el().querySelector('.ngcc-page-header__description')!.textContent).toBe(
      'Everyone you bill',
    );
  });

  it('shows breadcrumbs with the last item as the current page', async () => {
    expect(el().querySelector('ngcc-breadcrumb')).toBeNull();
    await set({
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Clients' }],
      breadcrumbLabel: 'You are here',
    });
    expect(el().querySelector('nav')!.getAttribute('aria-label')).toBe('You are here');
    expect(el().querySelector('[aria-current="page"]')!.textContent).toContain('Clients');
  });

  it('shows a skeleton instead of the title while loading', async () => {
    await set({ loading: true });
    expect(el().querySelector('h1')).toBeNull();
    expect(el().querySelector('ngcc-skeleton')).not.toBeNull();
  });

  it('projects actions, meta and tabs into their slots', () => {
    const host = TestBed.createComponent(HostComponent);
    host.detectChanges();
    const root = host.nativeElement as HTMLElement;
    expect(root.querySelector('.ngcc-page-header__actions button')!.textContent).toBe('Create');
    expect(root.querySelector('.ngcc-page-header__meta .meta')).not.toBeNull();
  });

  it('has no axe violations, with breadcrumbs and actions', async () => {
    const host = TestBed.createComponent(HostComponent);
    await host.whenStable();
    expect((await runAxe(host.nativeElement)).violations).toEqual([]);
  });
});
