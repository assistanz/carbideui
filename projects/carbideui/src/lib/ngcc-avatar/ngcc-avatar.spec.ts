import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccAvatar } from './ngcc-avatar';
import { ngccInitials } from './ngcc-avatar.types';
import { runAxe } from '../../test-utils/a11y';

describe('ngccInitials', () => {
  it('uses the first and last word', () => {
    expect(ngccInitials('Ada Lovelace')).toBe('AL');
    expect(ngccInitials('  grace  brewster  hopper ')).toBe('GH');
  });
  it('handles one word, empty and non-latin names', () => {
    expect(ngccInitials('ada')).toBe('A');
    expect(ngccInitials('   ')).toBe('');
    expect(ngccInitials('李 雷')).toBe('李雷');
  });
});

describe('NgccAvatar', () => {
  let fixture: ComponentFixture<NgccAvatar>;
  const set = async (inputs: Record<string, unknown>): Promise<void> => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
  };
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccAvatar],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(NgccAvatar);
    await set({ name: 'Ada Lovelace' });
  });

  it('shows initials and names the avatar', () => {
    expect(el().textContent!.trim()).toBe('AL');
    expect(el().getAttribute('role')).toBe('img');
    expect(el().getAttribute('aria-label')).toBe('Ada Lovelace');
  });

  it('gives the same name the same color, and spreads different names', async () => {
    const color = el().style.background;
    await set({ name: 'Ada Lovelace' });
    expect(el().style.background).toBe(color);
    const colors = new Set<string>();
    for (const n of ['Ada', 'Bob', 'Cy', 'Di', 'Ed', 'Flo', 'Gus', 'Hal', 'Ivy', 'Jo']) {
      await set({ name: n });
      colors.add(el().style.background);
    }
    expect(colors.size).toBeGreaterThan(2);
  });

  it('sizes in pixels', async () => {
    expect(el().style.width).toBe('40px');
    await set({ size: 'xl' });
    expect(el().style.width).toBe('64px');
    expect(el().style.height).toBe('64px');
    await set({ size: 'xs' });
    expect(el().style.width).toBe('24px');
  });

  it('can be square', async () => {
    await set({ shape: 'square' });
    expect(el().classList).toContain('ngcc-avatar--square');
  });

  it('shows the photo, and falls back to initials if it fails to load', async () => {
    await set({ src: 'https://example.invalid/ada.png' });
    const img = el().querySelector('img')!;
    expect(img.getAttribute('src')).toBe('https://example.invalid/ada.png');
    expect(img.getAttribute('alt')).toBe('');
    img.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(el().querySelector('img')).toBeNull();
    expect(el().textContent!.trim()).toBe('AL');
  });

  it('shows a person icon when there is no name', async () => {
    await set({ name: '' });
    expect(el().querySelector('ngcc-icon')).not.toBeNull();
    expect(el().getAttribute('aria-label')).toBe('User');
  });

  it('can be decorative', async () => {
    await set({ decorative: true });
    expect(el().getAttribute('aria-hidden')).toBe('true');
    expect(el().getAttribute('role')).toBeNull();
    expect(el().getAttribute('aria-label')).toBeNull();
  });

  it('has no axe violations', async () => {
    expect((await runAxe(el())).violations).toEqual([]);
  });
});
