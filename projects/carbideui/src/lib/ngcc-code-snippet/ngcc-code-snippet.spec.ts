import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccCodeSnippetComponent } from './ngcc-code-snippet';
import { NgccCodeSnippetType } from './ngcc-code-snippet.types';

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
});
