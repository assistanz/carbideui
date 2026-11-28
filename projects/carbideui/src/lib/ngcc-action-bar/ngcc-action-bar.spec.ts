import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgccActionBar } from './ngcc-action-bar';
import { runAxe } from '../../test-utils/a11y';

@Component({
  imports: [NgccActionBar],
  template: `
    <ngcc-action-bar [fixed]="fixed()" [elevated]="elevated()" ariaLabel="Save changes">
      <span ngccActionBarStatus>{{ status() }}</span>
      <button type="button" id="cancel">Cancel</button>
      <button type="button" id="save">Save</button>
    </ngcc-action-bar>
  `,
})
class HostComponent {
  fixed = signal(false);
  elevated = signal(true);
  status = signal('3 fields need attention');
}

describe('NgccActionBar', () => {
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

  it('is a named group with a status area and an actions area', () => {
    const group = el().querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-label')).toBe('Save changes');
    expect(group.querySelector('.ngcc--action-bar__status')!.textContent).toContain('3 fields');
    expect(group.querySelectorAll('.ngcc--action-bar__actions button').length).toBe(2);
  });

  it('announces status changes politely without moving focus', async () => {
    const status = el().querySelector('[role="status"]')!;
    expect(status.getAttribute('aria-live')).toBe('polite');
    el().querySelector<HTMLElement>('#save')!.focus();
    host.status.set('Saved');
    await flush();
    expect(status.textContent).toContain('Saved');
    expect(document.activeElement!.id).toBe('save');
  });

  it('keeps the actions in DOM order for a natural tab order', () => {
    const ids = Array.from(el().querySelectorAll('button')).map((b) => b.id);
    expect(ids).toEqual(['cancel', 'save']);
  });

  it('sticks to the container by default, with no spacer', () => {
    expect(el().querySelector('ngcc-action-bar')!.classList).not.toContain(
      'ngcc--action-bar--fixed',
    );
    expect(el().querySelector('.ngcc--action-bar__spacer')).toBeNull();
  });

  it('pins to the viewport when fixed and keeps a spacer so content is never covered', async () => {
    host.fixed.set(true);
    await flush();
    expect(el().querySelector('ngcc-action-bar')!.classList).toContain('ngcc--action-bar--fixed');
    const spacer = el().querySelector<HTMLElement>('.ngcc--action-bar__spacer')!;
    expect(spacer.getAttribute('aria-hidden')).toBe('true');
    expect(spacer.style.blockSize).toBeTruthy();
  });

  it('can drop the shadow', async () => {
    host.elevated.set(false);
    await flush();
    expect(el().querySelector('.ngcc--action-bar')!.classList).not.toContain(
      'ngcc--action-bar--elevated',
    );
  });

  it('has no axe violations', async () => {
    expect((await runAxe(el())).violations).toEqual([]);
  });
});
