import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccCodeSnippetComponent } from './ngcc-code-snippet';
import { NgccCodeSnippetType } from './ngcc-code-snippet.types';
import { runAxe } from '../../test-utils/a11y';

@Component({
  template: `
    <ngcc-code-snippet
      [type]="type"
      [code]="code"
      [disabled]="disabled"
      [hideCopyButton]="hideCopyButton"
      [wrapText]="wrapText"
      [light]="light"
      [skeleton]="skeleton"
      [feedback]="feedback"
      [feedbackTimeout]="feedbackTimeout"
      [showMoreText]="showMoreText"
      [showLessText]="showLessText"
      [copyButtonDescription]="copyButtonDescription"
      [ariaLabel]="ariaLabel"
      [maxCollapsedNumberOfRows]="maxCollapsedNumberOfRows"
      [maxExpandedNumberOfRows]="maxExpandedNumberOfRows"
    />
  `,
  standalone: true,
  imports: [NgccCodeSnippetComponent],
})
class TestHostComponent {
  type: NgccCodeSnippetType = 'single';
  code = 'npm install';
  disabled = false;
  hideCopyButton = false;
  wrapText = false;
  light = false;
  skeleton = false;
  feedback = 'Copied!';
  feedbackTimeout = 2000;
  showMoreText = 'Show more';
  showLessText = 'Show less';
  copyButtonDescription = 'Copy to clipboard';
  ariaLabel = '';
  maxCollapsedNumberOfRows = 15;
  maxExpandedNumberOfRows = 0;
}

const MULTI_CODE = `line 1\nline 2\nline 3\nline 4\nline 5`;

describe('NgccCodeSnippetComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let clipboardMock: { writeText: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    clipboardMock = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, 'clipboard', {
      value: clipboardMock,
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  function detectChanges(): void {
    fixture.detectChanges();
  }

  function getSnippet(): HTMLElement {
    return fixture.nativeElement.querySelector('.cds--snippet');
  }

  function getCopyButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.cds--copy-btn');
  }

  function getExpandButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.cds--snippet-btn--expand');
  }

  function getContainer(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.cds--snippet-container');
  }

  function getSnippetComponent(): NgccCodeSnippetComponent {
    return fixture.debugElement.query(By.directive(NgccCodeSnippetComponent))
      .componentInstance as NgccCodeSnippetComponent;
  }

  // ─── Core rendering ─────────────────────────────────────────────────────

  describe('Core rendering', () => {
    it('creates the component', () => {
      detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('renders the cds--snippet element', () => {
      detectChanges();
      expect(getSnippet()).toBeTruthy();
    });

    it('renders the code string in the container', () => {
      host.code = 'echo hello';
      detectChanges();
      const code = fixture.nativeElement.querySelector('code');
      expect(code.textContent.trim()).toBe('echo hello');
    });
  });

  // ─── Inline variant ─────────────────────────────────────────────────────

  describe('Inline variant', () => {
    beforeEach(() => {
      host.type = 'inline';
    });

    it('renders a button with cds--snippet--inline class', () => {
      detectChanges();
      const btn = fixture.nativeElement.querySelector('button.cds--snippet--inline');
      expect(btn).toBeTruthy();
    });

    it('displays the code inside a <code> element', () => {
      host.code = 'node --version';
      detectChanges();
      const code = fixture.nativeElement.querySelector('.cds--snippet--inline code');
      expect(code.textContent.trim()).toBe('node --version');
    });

    it('has aria-label from copyButtonDescription', () => {
      host.copyButtonDescription = 'Copy command';
      detectChanges();
      const btn = fixture.nativeElement.querySelector('button.cds--snippet--inline');
      expect(btn.getAttribute('aria-label')).toBe('Copy command');
    });

    it('is disabled when disabled input is true', () => {
      host.disabled = true;
      detectChanges();
      const btn = fixture.nativeElement.querySelector('button.cds--snippet--inline');
      expect(btn.classList).toContain('cds--snippet--disabled');
      expect(btn.hasAttribute('disabled')).toBe(true);
    });

    it('applies light class when light is true', () => {
      host.light = true;
      detectChanges();
      expect(getSnippet().classList).toContain('cds--snippet--light');
    });
  });

  // ─── Single variant ─────────────────────────────────────────────────────

  describe('Single variant', () => {
    it('renders cds--snippet--single container', () => {
      detectChanges();
      expect(getSnippet().classList).toContain('cds--snippet--single');
    });

    it('renders the scrollable container with tabindex', () => {
      detectChanges();
      const container = getContainer();
      expect(container).toBeTruthy();
      expect(container?.getAttribute('tabindex')).toBe('0');
    });

    it('renders the copy button by default', () => {
      detectChanges();
      expect(getCopyButton()).toBeTruthy();
    });

    it('hides the copy button when hideCopyButton is true', () => {
      host.hideCopyButton = true;
      detectChanges();
      expect(getCopyButton()).toBeNull();
      expect(getSnippet().classList).toContain('cds--snippet--no-copy');
    });

    it('applies disabled class when disabled', () => {
      host.disabled = true;
      detectChanges();
      expect(getSnippet().classList).toContain('cds--snippet--disabled');
    });

    it('applies light class when light is true', () => {
      host.light = true;
      detectChanges();
      expect(getSnippet().classList).toContain('cds--snippet--light');
    });

    it('uses ariaLabel on the container when provided', () => {
      host.ariaLabel = 'Install command';
      detectChanges();
      expect(getContainer()?.getAttribute('aria-label')).toBe('Install command');
    });

    it('falls back to code string as aria-label when ariaLabel is empty', () => {
      host.ariaLabel = '';
      host.code = 'npm install';
      detectChanges();
      expect(getContainer()?.getAttribute('aria-label')).toBe('npm install');
    });
  });

  // ─── Multi variant ───────────────────────────────────────────────────────

  describe('Multi variant', () => {
    beforeEach(() => {
      host.type = 'multi';
    });

    it('renders cds--snippet--multi container', () => {
      detectChanges();
      expect(getSnippet().classList).toContain('cds--snippet--multi');
    });

    it('renders a <pre> element inside the container', () => {
      detectChanges();
      expect(fixture.nativeElement.querySelector('pre')).toBeTruthy();
    });

    it('renders the expand button', () => {
      host.code = MULTI_CODE;
      host.maxCollapsedNumberOfRows = 2;
      detectChanges();
      expect(getExpandButton()).toBeTruthy();
    });

    it('hides the expand button when content fits within maxCollapsedNumberOfRows', () => {
      host.code = 'short';
      host.maxCollapsedNumberOfRows = 15;
      detectChanges();
      expect(getExpandButton()?.classList).toContain('cds--snippet-btn--expand--hide');
    });

    it('shows "Show more" text when collapsed', () => {
      host.code = MULTI_CODE;
      host.maxCollapsedNumberOfRows = 2;
      host.showMoreText = 'Expand';
      detectChanges();
      expect(getExpandButton()?.textContent?.trim()).toContain('Expand');
    });

    it('toggles to "Show less" text when expanded', () => {
      host.code = MULTI_CODE;
      host.maxCollapsedNumberOfRows = 2;
      host.showLessText = 'Collapse';
      detectChanges();
      getExpandButton()?.click();
      detectChanges();
      expect(getExpandButton()?.textContent?.trim()).toContain('Collapse');
    });

    it('adds cds--snippet--expand class when expanded', () => {
      host.code = MULTI_CODE;
      host.maxCollapsedNumberOfRows = 2;
      detectChanges();
      getExpandButton()?.click();
      detectChanges();
      expect(getSnippet().classList).toContain('cds--snippet--expand');
    });

    it('updates isExpanded signal to true when expanded', () => {
      host.code = MULTI_CODE;
      host.maxCollapsedNumberOfRows = 2;
      detectChanges();
      getExpandButton()?.click();
      detectChanges();
      expect(getSnippetComponent().isExpanded()).toBe(true);
    });

    it('updates isExpanded signal to false when collapsed again', () => {
      host.code = MULTI_CODE;
      host.maxCollapsedNumberOfRows = 2;
      detectChanges();
      getExpandButton()?.click();
      detectChanges();
      getExpandButton()?.click();
      detectChanges();
      expect(getSnippetComponent().isExpanded()).toBe(false);
    });

    it('applies wrapText class when wrapText is true', () => {
      host.wrapText = true;
      detectChanges();
      expect(getSnippet().classList).toContain('cds--snippet--wraptext');
    });

    it('does not expand when disabled', () => {
      host.code = MULTI_CODE;
      host.maxCollapsedNumberOfRows = 2;
      host.disabled = true;
      detectChanges();
      getExpandButton()?.click();
      detectChanges();
      expect(getSnippet().classList).not.toContain('cds--snippet--expand');
    });

    it('applies max-height style to container based on maxCollapsedNumberOfRows', () => {
      host.maxCollapsedNumberOfRows = 10;
      detectChanges();
      const container = getContainer();
      expect(container?.style.maxHeight).toBe('15rem'); // default 15 rows
    });
  });

  // ─── Copy functionality ──────────────────────────────────────────────────

  describe('Copy functionality', () => {
    it('calls clipboard.writeText with the code when copy button clicked', async () => {
      host.code = 'git status';
      detectChanges();
      getCopyButton()?.click();
      await fixture.whenStable();
      expect(clipboardMock.writeText).toHaveBeenCalledWith('git status');
    });

    it('shows popover open class after copy', async () => {
      detectChanges();
      getCopyButton()?.click();
      await fixture.whenStable();
      detectChanges();
      const popoverContainer = fixture.nativeElement.querySelector('.cds--popover-container');
      expect(popoverContainer?.classList).toContain('cds--popover--open');
    });

    it('clears isCopying after feedbackTimeout', async () => {
      host.feedbackTimeout = 100;
      detectChanges();
      getCopyButton()?.click();
      await fixture.whenStable();
      detectChanges();
      expect(getSnippetComponent().isCopying()).toBe(true);
      await new Promise((r) => setTimeout(r, 150));
      detectChanges();
      expect(getSnippetComponent().isCopying()).toBe(false);
    });

    it('does not copy when disabled', async () => {
      host.disabled = true;
      host.type = 'inline';
      detectChanges();
      fixture.nativeElement.querySelector('button.cds--snippet--inline')?.click();
      await fixture.whenStable();
      expect(clipboardMock.writeText).not.toHaveBeenCalled();
    });

    it('copy button has correct aria-label', () => {
      host.copyButtonDescription = 'Copy snippet';
      detectChanges();
      expect(getCopyButton()?.getAttribute('aria-label')).toBe('Copy snippet');
    });
  });

  // ─── Skeleton state ──────────────────────────────────────────────────────

  describe('Skeleton state', () => {
    it('renders single skeleton when type is single and skeleton is true', () => {
      host.skeleton = true;
      host.type = 'single';
      detectChanges();
      const el = fixture.nativeElement.querySelector('.cds--snippet--single.cds--skeleton');
      expect(el).toBeTruthy();
    });

    it('renders multi skeleton when type is multi and skeleton is true', () => {
      host.skeleton = true;
      host.type = 'multi';
      detectChanges();
      const el = fixture.nativeElement.querySelector('.cds--snippet--multi.cds--skeleton');
      expect(el).toBeTruthy();
    });

    it('renders inline skeleton when type is inline and skeleton is true', () => {
      host.skeleton = true;
      host.type = 'inline';
      detectChanges();
      const el = fixture.nativeElement.querySelector('.cds--snippet--inline.cds--skeleton');
      expect(el).toBeTruthy();
    });

    it('renders three spans for multi skeleton inside the container', () => {
      host.skeleton = true;
      host.type = 'multi';
      detectChanges();
      const spans = fixture.nativeElement.querySelectorAll(
        '.cds--snippet--multi.cds--skeleton .cds--snippet-container > span',
      );
      expect(spans.length).toBe(3);
    });

    it('does not render the copy button in skeleton state', () => {
      host.skeleton = true;
      detectChanges();
      expect(getCopyButton()).toBeNull();
    });
  });

  // ─── Component instance signals ─────────────────────────────────────────

  describe('Component signals', () => {
    it('needsExpansion is false for single variant', () => {
      detectChanges();
      expect(getSnippetComponent().needsExpansion()).toBe(false);
    });

    it('needsExpansion is true when multi code exceeds maxCollapsedNumberOfRows', () => {
      host.type = 'multi';
      host.code = MULTI_CODE; // 5 lines
      host.maxCollapsedNumberOfRows = 3;
      detectChanges();
      expect(getSnippetComponent().needsExpansion()).toBe(true);
    });

    it('containerMaxHeight returns null for non-multi types', () => {
      detectChanges();
      expect(getSnippetComponent().containerMaxHeight()).toBeNull();
    });

    it('containerMaxHeight returns rem value for multi type', () => {
      host.type = 'multi';
      host.maxCollapsedNumberOfRows = 10;
      detectChanges();
      expect(getSnippetComponent().containerMaxHeight()).toBe('15rem');
    });
  });

  // ─── Accessibility ───────────────────────────────────────────────────────

  describe('Accessibility', () => {
    // ── axe — no violations ─────────────────────────────────────────────────

    describe('axe — no violations', () => {
      it('single variant has no axe violations', async () => {
        host.type = 'single';
        host.code = 'npm install';
        host.ariaLabel = 'Install command';
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('single variant without copy button has no axe violations', async () => {
        host.type = 'single';
        host.code = 'npm install';
        host.ariaLabel = 'Install command';
        host.hideCopyButton = true;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('single disabled variant has no axe violations', async () => {
        host.type = 'single';
        host.code = 'npm install';
        host.ariaLabel = 'Install command';
        host.disabled = true;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('inline variant has no axe violations', async () => {
        host.type = 'inline';
        host.code = 'npm install';
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('inline disabled variant has no axe violations', async () => {
        host.type = 'inline';
        host.code = 'npm install';
        host.disabled = true;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('multi variant (collapsed) has no axe violations', async () => {
        host.type = 'multi';
        host.code = MULTI_CODE;
        host.ariaLabel = 'Sample code';
        host.maxCollapsedNumberOfRows = 2;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('multi variant (expanded) has no axe violations', async () => {
        host.type = 'multi';
        host.code = MULTI_CODE;
        host.ariaLabel = 'Sample code';
        host.maxCollapsedNumberOfRows = 2;
        detectChanges();
        getExpandButton()?.click();
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('multi variant with wrapText has no axe violations', async () => {
        host.type = 'multi';
        host.code = MULTI_CODE;
        host.ariaLabel = 'Sample code';
        host.wrapText = true;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('single skeleton state has no axe violations', async () => {
        host.type = 'single';
        host.skeleton = true;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('multi skeleton state has no axe violations', async () => {
        host.type = 'multi';
        host.skeleton = true;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });

      it('inline skeleton state has no axe violations', async () => {
        host.type = 'inline';
        host.skeleton = true;
        detectChanges();
        const results = await runAxe(fixture.nativeElement);
        expect(results).toHaveNoViolations();
      });
    });

    // ── Copy button ARIA attributes ─────────────────────────────────────────

    describe('Copy button ARIA attributes', () => {
      it('copy button has aria-label from copyButtonDescription', () => {
        host.copyButtonDescription = 'Copy to clipboard';
        detectChanges();
        expect(getCopyButton()?.getAttribute('aria-label')).toBe('Copy to clipboard');
      });

      it('copy button has aria-live="polite" for live region announcements', () => {
        detectChanges();
        expect(getCopyButton()?.getAttribute('aria-live')).toBe('polite');
      });

      it('copy button has type="button" to prevent accidental form submission', () => {
        detectChanges();
        expect(getCopyButton()?.getAttribute('type')).toBe('button');
      });

      it('copy button has disabled attribute when disabled', () => {
        host.disabled = true;
        detectChanges();
        expect(getCopyButton()?.hasAttribute('disabled')).toBe(true);
      });

      it('copy button does not have disabled attribute when enabled', () => {
        detectChanges();
        expect(getCopyButton()?.hasAttribute('disabled')).toBe(false);
      });

      it('feedback popover has aria-hidden="true" so screen readers skip the tooltip shell', () => {
        detectChanges();
        const popover = fixture.nativeElement.querySelector('.cds--popover');
        expect(popover?.getAttribute('aria-hidden')).toBe('true');
      });
    });

    // ── Inline variant ARIA attributes ──────────────────────────────────────

    describe('Inline variant ARIA attributes', () => {
      beforeEach(() => {
        host.type = 'inline';
      });

      it('inline button has aria-label from copyButtonDescription', () => {
        host.copyButtonDescription = 'Copy command';
        detectChanges();
        const btn = fixture.nativeElement.querySelector('button.cds--snippet--inline');
        expect(btn?.getAttribute('aria-label')).toBe('Copy command');
      });

      it('inline button has aria-live="polite"', () => {
        detectChanges();
        const btn = fixture.nativeElement.querySelector('button.cds--snippet--inline');
        expect(btn?.getAttribute('aria-live')).toBe('polite');
      });

      it('inline button has type="button"', () => {
        detectChanges();
        const btn = fixture.nativeElement.querySelector('button.cds--snippet--inline');
        expect(btn?.getAttribute('type')).toBe('button');
      });

      it('inline button has disabled attribute when disabled', () => {
        host.disabled = true;
        detectChanges();
        const btn = fixture.nativeElement.querySelector('button.cds--snippet--inline');
        expect(btn?.hasAttribute('disabled')).toBe(true);
      });
    });

    // ── Code container ARIA attributes ──────────────────────────────────────

    describe('Code container ARIA attributes', () => {
      it('single container has role="textbox"', () => {
        detectChanges();
        expect(getContainer()?.getAttribute('role')).toBe('textbox');
      });

      it('single container has aria-readonly="true"', () => {
        detectChanges();
        expect(getContainer()?.getAttribute('aria-readonly')).toBe('true');
      });

      it('single container has tabindex="0" for keyboard focus', () => {
        detectChanges();
        expect(getContainer()?.getAttribute('tabindex')).toBe('0');
      });

      it('single container aria-label uses ariaLabel input when provided', () => {
        host.ariaLabel = 'Install command';
        detectChanges();
        expect(getContainer()?.getAttribute('aria-label')).toBe('Install command');
      });

      it('single container aria-label falls back to code string when ariaLabel is empty', () => {
        host.ariaLabel = '';
        host.code = 'npm ci';
        detectChanges();
        expect(getContainer()?.getAttribute('aria-label')).toBe('npm ci');
      });

      it('multi container has role="textbox"', () => {
        host.type = 'multi';
        detectChanges();
        expect(getContainer()?.getAttribute('role')).toBe('textbox');
      });

      it('multi container has aria-multiline="true"', () => {
        host.type = 'multi';
        detectChanges();
        expect(getContainer()?.getAttribute('aria-multiline')).toBe('true');
      });

      it('multi container has aria-readonly="true"', () => {
        host.type = 'multi';
        detectChanges();
        expect(getContainer()?.getAttribute('aria-readonly')).toBe('true');
      });

      it('multi container has tabindex="0"', () => {
        host.type = 'multi';
        detectChanges();
        expect(getContainer()?.getAttribute('tabindex')).toBe('0');
      });

      it('multi container aria-label uses ariaLabel input when provided', () => {
        host.type = 'multi';
        host.ariaLabel = 'Sample code block';
        detectChanges();
        expect(getContainer()?.getAttribute('aria-label')).toBe('Sample code block');
      });

      it('multi container aria-label falls back to code string when ariaLabel is empty', () => {
        host.type = 'multi';
        host.ariaLabel = '';
        host.code = MULTI_CODE;
        detectChanges();
        expect(getContainer()?.getAttribute('aria-label')).toBe(MULTI_CODE);
      });
    });

    // ── Expand button ARIA attributes ───────────────────────────────────────

    describe('Expand button ARIA attributes', () => {
      beforeEach(() => {
        host.type = 'multi';
        host.code = MULTI_CODE;
        host.maxCollapsedNumberOfRows = 2;
      });

      it('expand button has type="button"', () => {
        detectChanges();
        expect(getExpandButton()?.getAttribute('type')).toBe('button');
      });

      it('expand button has aria-expanded="false" when collapsed', () => {
        detectChanges();
        expect(getExpandButton()?.getAttribute('aria-expanded')).toBe('false');
      });

      it('expand button has aria-expanded="true" after expanding', () => {
        detectChanges();
        getExpandButton()?.click();
        detectChanges();
        expect(getExpandButton()?.getAttribute('aria-expanded')).toBe('true');
      });

      it('expand button has aria-expanded="false" after collapsing again', () => {
        detectChanges();
        getExpandButton()?.click();
        detectChanges();
        getExpandButton()?.click();
        detectChanges();
        expect(getExpandButton()?.getAttribute('aria-expanded')).toBe('false');
      });

      it('expand button has disabled attribute when disabled', () => {
        host.disabled = true;
        detectChanges();
        expect(getExpandButton()?.hasAttribute('disabled')).toBe(true);
      });

      it('expand button does not have disabled attribute when enabled', () => {
        detectChanges();
        expect(getExpandButton()?.hasAttribute('disabled')).toBe(false);
      });
    });

    // ── Skeleton — no interactive elements ─────────────────────────────────

    describe('Skeleton — no interactive elements', () => {
      it('renders no buttons in single skeleton state', () => {
        host.skeleton = true;
        host.type = 'single';
        detectChanges();
        expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
      });

      it('renders no buttons in multi skeleton state', () => {
        host.skeleton = true;
        host.type = 'multi';
        detectChanges();
        expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
      });

      it('renders no buttons in inline skeleton state', () => {
        host.skeleton = true;
        host.type = 'inline';
        detectChanges();
        expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
      });
    });
  });
});
