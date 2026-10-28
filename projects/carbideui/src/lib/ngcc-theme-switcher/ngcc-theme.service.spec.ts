import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgccThemeService } from './ngcc-theme.service';
import { provideNgccTheme } from '../ngcc-color-theme/ngcc-theme.providers';

function mockMatchMedia(initialDark: boolean) {
  let listener: ((e: { matches: boolean }) => void) | null = null;
  const query = {
    matches: initialDark,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => (listener = cb),
    removeEventListener: () => (listener = null),
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(query as unknown as MediaQueryList);
  return (dark: boolean) => listener?.({ matches: dark });
}

describe('NgccThemeService', () => {
  const create = (config = {}) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideNgccTheme(config)] });
    return TestBed.inject(NgccThemeService);
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.removeAttribute('data-carbon-theme');
  });

  afterEach(() => vi.restoreAllMocks());

  it('applies the default theme immediately', () => {
    const service = create();
    expect(service.theme()).toBe('white');
    expect(document.documentElement.getAttribute('data-carbon-theme')).toBe('white');
  });

  it('sets the theme, color-scheme and persists it', () => {
    const service = create();
    service.setTheme('g100');
    TestBed.tick();

    expect(service.getTheme()).toBe('g100');
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-carbon-theme')).toBe('g100');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(JSON.parse(localStorage.getItem('ngcc-theme')!).theme).toBe('g100');
  });

  it('restores a persisted theme', () => {
    localStorage.setItem('ngcc-theme', JSON.stringify({ theme: 'g90', followSystem: false }));
    expect(create().theme()).toBe('g90');
  });

  it('restores the original bare-string format', () => {
    localStorage.setItem('ngcc-theme', 'g90');
    expect(create().theme()).toBe('g90');
  });

  it('migrates old shape names stored as a bare string', () => {
    localStorage.setItem('ngcc-theme', 'curved');
    const service = create();
    expect(service.theme()).toBe('white');
    expect(service.cornerStyle()).toBe('curved');
    expect(service.buttonAlign()).toBe('left');
    // rewritten in the new format
    expect(JSON.parse(localStorage.getItem('ngcc-theme')!)).toMatchObject({
      version: 2,
      theme: 'white',
      cornerStyle: 'curved',
    });
  });

  it('migrates old shape names stored as v1 JSON', () => {
    localStorage.setItem('ngcc-theme', JSON.stringify({ theme: 'centered', followSystem: false }));
    const service = create();
    expect(service.theme()).toBe('white');
    expect(service.buttonAlign()).toBe('centered');
    expect(service.cornerStyle()).toBe('square');
  });

  it('migrates a legacy sessionStorage shape name', () => {
    sessionStorage.setItem('ngcc-theme', 'rounded');
    const service = create();
    expect(service.cornerStyle()).toBe('rounded');
    expect(sessionStorage.getItem('ngcc-theme')).toBeNull();
  });

  it('keeps a stored v1 color theme and fills the new settings with defaults', () => {
    localStorage.setItem('ngcc-theme', JSON.stringify({ theme: 'g100', followSystem: false }));
    const service = create();
    expect(service.theme()).toBe('g100');
    expect(service.cornerStyle()).toBe('square');
    expect(service.buttonAlign()).toBe('left');
  });

  it('migrates the legacy sessionStorage value into localStorage', () => {
    sessionStorage.setItem('ngcc-theme', 'g90');
    expect(create().theme()).toBe('g90');
    expect(JSON.parse(localStorage.getItem('ngcc-theme')!).theme).toBe('g90');
    expect(sessionStorage.getItem('ngcc-theme')).toBeNull();
  });

  it('prefers the new store over a stale legacy value', () => {
    localStorage.setItem('ngcc-theme', JSON.stringify({ theme: 'g100', followSystem: false }));
    sessionStorage.setItem('ngcc-theme', 'g10');
    expect(create().theme()).toBe('g100');
  });

  it('ignores corrupt or unknown persisted values', () => {
    localStorage.setItem('ngcc-theme', '{not json');
    expect(create().theme()).toBe('white');
    localStorage.setItem('ngcc-theme', JSON.stringify({ theme: 'neon' }));
    expect(create().theme()).toBe('white');
  });

  it('writes all three attributes and keeps them independent', () => {
    const service = create();
    const root = document.documentElement;
    expect(root.getAttribute('data-corner-style')).toBe('square');
    expect(root.getAttribute('data-button-align')).toBe('left');

    service.setCornerStyle('curved');
    service.setButtonAlign('centered');
    service.setTheme('g90');
    TestBed.tick();

    expect(root.getAttribute('data-carbon-theme')).toBe('g90');
    expect(root.getAttribute('data-corner-style')).toBe('curved');
    expect(root.getAttribute('data-button-align')).toBe('centered');

    service.setTheme('white'); // choosing a color must not reset shape or alignment
    expect(service.cornerStyle()).toBe('curved');
    expect(service.buttonAlign()).toBe('centered');
  });

  it('never writes a legacy name to data-carbon-theme', () => {
    const service = create();
    service.setTheme('rounded');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-carbon-theme')).toBe('white');
    expect(document.documentElement.getAttribute('data-corner-style')).toBe('rounded');
  });

  it('setTheme with an old combined name only changes the part it names', () => {
    const service = create();
    service.setButtonAlign('centered');
    service.setTheme('rounded');
    expect(service.cornerStyle()).toBe('rounded');
    expect(service.buttonAlign()).toBe('centered');
  });

  it('persists corner style and button alignment', () => {
    const service = create();
    service.setCornerStyle('rounded');
    service.setButtonAlign('centered');
    expect(JSON.parse(localStorage.getItem('ngcc-theme')!)).toMatchObject({
      version: 2,
      cornerStyle: 'rounded',
      buttonAlign: 'centered',
    });
    expect(create().cornerStyle()).toBe('rounded');
  });

  it('ignores invalid corner style / alignment values', () => {
    const service = create();
    service.setCornerStyle('blob' as never);
    service.setButtonAlign('right' as never);
    expect(service.cornerStyle()).toBe('square');
    expect(service.buttonAlign()).toBe('left');

    localStorage.setItem(
      'ngcc-theme',
      JSON.stringify({ version: 2, theme: 'g10', cornerStyle: 'blob', buttonAlign: 7 }),
    );
    const restored = create();
    expect(restored.theme()).toBe('g10');
    expect(restored.cornerStyle()).toBe('square');
    expect(restored.buttonAlign()).toBe('left');
  });

  it('honours configured defaults for the new settings', () => {
    const service = create({ defaultCornerStyle: 'rounded', defaultButtonAlign: 'centered' });
    expect(service.cornerStyle()).toBe('rounded');
    expect(service.buttonAlign()).toBe('centered');
  });

  it('rejects unknown theme names', () => {
    const service = create();
    service.setTheme('neon' as never);
    expect(service.theme()).toBe('white');
  });

  it('honours storage: none', () => {
    const service = create({ storage: 'none' });
    service.setTheme('g10');
    expect(localStorage.getItem('ngcc-theme')).toBeNull();
  });

  it('follows the system preference live and stops when a theme is picked', () => {
    const emit = mockMatchMedia(false);
    const service = create({ followSystem: true });
    expect(service.theme()).toBe('white');

    emit(true);
    expect(service.theme()).toBe('g100');
    expect(service.followSystem()).toBe(true);

    service.setTheme('g10');
    emit(false);
    expect(service.followSystem()).toBe(false);
    expect(service.theme()).toBe('g10');
  });

  it('keeps the visible theme when follow-system is switched off', () => {
    mockMatchMedia(true);
    const service = create({ followSystem: true });
    expect(service.theme()).toBe('g100');
    service.setFollowSystem(false);
    expect(service.theme()).toBe('g100');
  });

  it('toggles between light and dark', () => {
    const service = create();
    service.toggleDarkMode();
    expect(service.theme()).toBe('g100');
    service.toggleDarkMode();
    expect(service.theme()).toBe('white');
  });

  it('syncs from other tabs via the storage event', () => {
    const service = create();
    const event = Object.assign(new Event('storage'), {
      key: 'ngcc-theme',
      newValue: JSON.stringify({
        version: 2,
        theme: 'g90',
        followSystem: false,
        cornerStyle: 'curved',
        buttonAlign: 'centered',
      }),
    });
    window.dispatchEvent(event);
    expect(service.theme()).toBe('g90');
    expect(service.cornerStyle()).toBe('curved');
    expect(service.buttonAlign()).toBe('centered');
  });

  it('reset clears persistence and returns to defaults', () => {
    const service = create();
    service.setTheme('g90');
    service.setCornerStyle('curved');
    service.reset();
    expect(service.theme()).toBe('white');
    expect(service.cornerStyle()).toBe('square');
    expect(localStorage.getItem('ngcc-theme')).toBeNull();
  });

  it('provideNgccTheme applies the theme at start-up without anything injecting the service', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideNgccTheme({
          defaultTheme: 'g10',
          defaultCornerStyle: 'rounded',
          defaultButtonAlign: 'centered',
        }),
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    const root = document.documentElement;
    expect(root.getAttribute('data-carbon-theme')).toBe('g10');
    expect(root.getAttribute('data-corner-style')).toBe('rounded');
    expect(root.getAttribute('data-button-align')).toBe('centered');
  });
});
