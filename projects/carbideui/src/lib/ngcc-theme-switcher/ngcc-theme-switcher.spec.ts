import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccThemeSwitcher } from './ngcc-theme-switcher';
import { NgccThemeService } from './ngcc-theme.service';
import {
  NGCC_BUTTON_ALIGN_OPTIONS,
  NGCC_CORNER_STYLE_OPTIONS,
  NGCC_THEME_OPTIONS,
} from './ngcc-theme.types';

describe('NgccThemeSwitcher', () => {
  let fixture: ComponentFixture<NgccThemeSwitcher>;
  let service: NgccThemeService;

  const group = (n: number) =>
    fixture.debugElement
      .queryAll(By.css('[role="radiogroup"]'))
      [n].queryAll(By.css('[role="radio"]'));
  const radios = () => group(0);

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NgccThemeSwitcher],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    service = TestBed.inject(NgccThemeService);
    fixture = TestBed.createComponent(NgccThemeSwitcher);
    await fixture.whenStable();
  });

  it('offers exactly the four Carbon themes, separate from shape and alignment', () => {
    expect(NGCC_THEME_OPTIONS.map((o) => o.value)).toEqual(['white', 'g10', 'g90', 'g100']);
    expect(fixture.debugElement.queryAll(By.css('[role="radiogroup"]')).length).toBe(3);
    expect(group(1).length).toBe(NGCC_CORNER_STYLE_OPTIONS.length);
    expect(group(2).length).toBe(NGCC_BUTTON_ALIGN_OPTIONS.length);
  });

  it('renders one radio per theme with the current one checked', () => {
    expect(radios().length).toBe(NGCC_THEME_OPTIONS.length);
    const checked = radios().filter((r) => r.nativeElement.getAttribute('aria-checked') === 'true');
    expect(checked.length).toBe(1);
    expect(checked[0].nativeElement.getAttribute('aria-label')).toContain('White');
  });

  it('uses a roving tabindex', () => {
    const tabbable = radios().filter((r) => r.nativeElement.tabIndex === 0);
    expect(tabbable.length).toBe(1);
  });

  it('applies the theme and emits on click', async () => {
    const emitted: string[] = [];
    fixture.componentInstance.themeChange.subscribe((t) => emitted.push(t));

    radios()[3].nativeElement.click(); // g100
    await fixture.whenStable();

    expect(service.theme()).toBe('g100');
    expect(document.documentElement.getAttribute('data-carbon-theme')).toBe('g100');
    expect(emitted).toEqual(['g100']);
    expect(radios()[3].nativeElement.getAttribute('aria-checked')).toBe('true');
  });

  it('supports arrow-key navigation with wrap-around', async () => {
    const press = (key: string): void =>
      radios()
        .find((r) => r.nativeElement.tabIndex === 0)!
        .nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    press('ArrowLeft');
    await fixture.whenStable();
    expect(service.theme()).toBe('g100');

    press('Home');
    await fixture.whenStable();
    expect(service.theme()).toBe('white');
  });

  it('changes corner style independently and emits', async () => {
    const emitted: string[] = [];
    fixture.componentInstance.cornerStyleChange.subscribe((v) => emitted.push(v));
    service.setTheme('g90');

    group(1)[2].nativeElement.click(); // curved
    await fixture.whenStable();

    expect(service.cornerStyle()).toBe('curved');
    expect(service.theme()).toBe('g90');
    expect(document.documentElement.getAttribute('data-corner-style')).toBe('curved');
    expect(group(1)[2].nativeElement.getAttribute('aria-checked')).toBe('true');
    expect(emitted).toEqual(['curved']);
  });

  it('changes button alignment independently and emits', async () => {
    const emitted: string[] = [];
    fixture.componentInstance.buttonAlignChange.subscribe((v) => emitted.push(v));

    group(2)[1].nativeElement.click(); // centered
    await fixture.whenStable();

    expect(service.buttonAlign()).toBe('centered');
    expect(service.cornerStyle()).toBe('square');
    expect(document.documentElement.getAttribute('data-button-align')).toBe('centered');
    expect(emitted).toEqual(['centered']);
  });

  it('supports arrow keys in the corner and alignment groups', async () => {
    const press = (n: number, key: string): void =>
      group(n)
        .find((r) => r.nativeElement.tabIndex === 0)!
        .nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    press(1, 'ArrowRight');
    await fixture.whenStable();
    expect(service.cornerStyle()).toBe('rounded');

    press(2, 'End');
    await fixture.whenStable();
    expect(service.buttonAlign()).toBe('centered');
  });

  it('hides categories through inputs', async () => {
    fixture.componentRef.setInput('showCornerStyle', false);
    fixture.componentRef.setInput('showButtonAlign', false);
    await fixture.whenStable();
    expect(fixture.debugElement.queryAll(By.css('[role="radiogroup"]')).length).toBe(1);
  });

  it('limits options through the themes input', async () => {
    fixture.componentRef.setInput('themes', ['white', 'g100']);
    await fixture.whenStable();
    expect(radios().length).toBe(2);
  });

  it('toggles follow-system and announces status', async () => {
    const checkbox = fixture.debugElement.query(By.css('input[type=checkbox]')).nativeElement;
    checkbox.click();
    await fixture.whenStable();

    expect(service.followSystem()).toBe(true);
    expect(fixture.debugElement.query(By.css('[role=status]')).nativeElement.textContent).toContain(
      'Matching system',
    );
  });

  it('reflects theme changes made elsewhere (e.g. another tab)', async () => {
    service.setTheme('g90');
    await fixture.whenStable();
    expect(radios()[2].nativeElement.getAttribute('aria-checked')).toBe('true');
  });
});
