import * as sass from 'sass';
import { resolve } from 'node:path';

/**
 * Contract tests for the global theme overrides. They compile the partials on their own
 * (no Carbon) so they stay fast, and guard the rules that matter:
 * square emits no overrides, every listed component is covered, and nothing hard-codes
 * a shape inside a feature component's selector scope.
 */
const compile = (file: string): string =>
  sass.compile(resolve(__dirname, file), { style: 'expanded' }).css;

describe('theme-corners', () => {
  const css = compile('_theme-corners.scss');

  it('defines the spec radii per corner style', () => {
    expect(css).toMatch(/\[data-corner-style=square\][^}]*--ngcc-radius-button: 0;/);
    expect(css).toMatch(
      /\[data-corner-style=rounded\][^}]*--ngcc-radius-button: 4px;[^}]*--ngcc-radius-input: 4px;[^}]*--ngcc-radius-container: 8px;/,
    );
    expect(css).toMatch(
      /\[data-corner-style=curved\][^}]*--ngcc-radius-button: 999px;[^}]*--ngcc-radius-input: 24px;[^}]*--ngcc-radius-container: 16px;/,
    );
  });

  it('emits no component overrides for square (Carbon default stays untouched)', () => {
    const squareRules = css.split('}').filter((r) => /data-corner-style=square\]/.test(r));
    expect(squareRules.every((r) => !r.includes('.cds--'))).toBe(true);
    expect(css).not.toMatch(/data-corner-style=square\][^{]*\.cds--/);
  });

  it('aliases the tokens that existing components already read', () => {
    expect(css).toContain('--sb--button-corner-radius: var(--ngcc-radius-button)');
    expect(css).toContain('--ngcc--input-corner-radius: var(--ngcc-radius-input)');
  });

  it.each([
    ['.cds--btn', 'button'],
    ['.cds--text-input', 'input'],
    ['.cds--search-input', 'input'],
    ['.cds--select-input', 'input'],
    ['.cds--list-box', 'input'],
    ['.cds--content-switcher', 'button'],
  ])('rounds control %s with the control radius', (selector, kind) => {
    const rule = css
      .split('}')
      .find((r) => new RegExp(`${selector.replace('.', '\\.')}(,|\\s*\\{)`).test(r));
    expect(rule, selector).toBeDefined();
    expect(rule).toContain(`var(--ngcc-radius-${kind})`);
  });

  it.each([
    '.cds--modal-container',
    '.cds--tile',
    '.cds--toast-notification',
    '.cds--popover-content',
    '.cds--overflow-menu-options',
    '.cds--header-panel',
    '.cds--list-box__menu',
    '.cds--header__submenu .cds--header__menu',
    '.cds--data-table-container',
  ])('rounds container %s with the container radius', (selector) => {
    const rules = css.split('}').filter((r) => r.includes(selector));
    expect(
      rules.some((r) => r.includes('var(--ngcc-radius-container)')),
      selector,
    ).toBe(true);
  });

  it('leaves tags and checkboxes alone', () => {
    expect(css).not.toContain('.cds--tag');
    expect(css).not.toContain('.cds--checkbox');
  });

  it('keeps modal footer buttons square so the container clips them', () => {
    expect(css).toMatch(/\.cds--modal-footer \.cds--btn\s*\{\s*border-radius: 0;/);
  });

  it('wins over component styles by specificity, not !important', () => {
    expect(css).not.toContain('!important');
  });
});

describe('theme-button-align', () => {
  const css = compile('_theme-button-align.scss');

  it('only emits rules for centered (left is Carbon default)', () => {
    expect(css).toContain('[data-button-align=centered]');
    expect(css).not.toContain('data-button-align=left');
  });

  it('centers label + icon with an 8px gap and balanced padding', () => {
    expect(css).toContain('justify-content: center;');
    expect(css).toContain('gap: 0.5rem;');
    expect(css).toMatch(
      /padding-inline: calc\(var\(--cds-layout-density-padding-inline-local\) - 0\.0625rem\)/,
    );
  });

  it('never targets icon-only buttons', () => {
    expect(css).toContain(':not(.cds--btn--icon-only)');
  });

  it('is independent of corner style', () => {
    expect(css).not.toContain('corner');
    expect(css).not.toContain('border-radius');
  });
});

describe('content-switcher', () => {
  const css = compile('_content-switcher.scss');

  it('styles wrapped options by position, not by Carbon sibling selectors', () => {
    expect(css).toMatch(
      /ngcc-content-switcher-option:first-child > \.cds--content-switcher-btn \{/,
    );
    expect(css).toMatch(/ngcc-content-switcher-option:last-child > \.cds--content-switcher-btn \{/);
  });

  it('restores the divider between neighbours', () => {
    expect(css).toMatch(
      /ngcc-content-switcher-option:not\(:first-child\) > \.cds--content-switcher-btn::before \{\s*background-color: var\(--cds-border-subtle\)/,
    );
  });

  it('sizes options as equal columns that never go below their label', () => {
    expect(css).toMatch(/:has\(> ngcc-content-switcher-option\) \{\s*display: grid;/);
    expect(css).toContain('grid-auto-columns: 1fr;');
    expect(css).not.toMatch(/ngcc-content-switcher-option \{[^}]*min-inline-size: 0/);
  });

  it('out-ranks Carbon first/last-child rules (0,4,0) by doubling the container class', () => {
    expect(css).toContain('.cds--content-switcher.cds--content-switcher:not(');
  });

  it('draws no per-segment borders, the container outline is the only one', () => {
    expect(css).toMatch(/> \.cds--content-switcher-btn \{\s*border-block: 0;\s*border-radius: 0;/);
  });

  it('follows the corner style token, square included', () => {
    expect(css).toMatch(/border-end-start-radius: var\(--ngcc-radius-button\)/);
    expect(css).toMatch(/border-start-end-radius: var\(--ngcc-radius-button\)/);
    expect(css).toMatch(/\{\s*border-radius: var\(--ngcc-radius-button\);\s*overflow: hidden;/);
    expect(css).not.toContain('0.25rem');
  });

  it('shows the focus ring for keyboard focus only', () => {
    expect(css).toContain(':focus:not(:focus-visible)');
    expect(css).toContain(':focus-visible:hover::after');
  });

  it('does not use !important', () => {
    expect(css).not.toContain('!important');
  });
});
