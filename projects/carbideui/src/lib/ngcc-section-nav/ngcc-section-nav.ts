import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  NGCC_SECTION_NAV_DEFAULT_LABELS,
  NgccSectionNavItem,
  NgccSectionNavLabels,
} from './ngcc-section-nav.types';

/**
 * Sticky "on this page" list for long forms and detail pages. It follows scrolling, jumps to a
 * section on click, and can flag sections with errors or warnings.
 *
 * ```html
 * <ngcc-section-nav [sections]="sections" [(active)]="current" [offset]="64" />
 * <section id="basics"><h2>Basics</h2>…</section>
 * ```
 *
 * `offset` is the height of anything fixed at the top (a header), so a section is "current" once it
 * passes below it and is not hidden behind it after a jump. The target gets focus after a jump so
 * keyboard and screen reader users land in the section. The links are real anchors, so the list also
 * works before scripts run.
 */
@Component({
  selector: 'ngcc-section-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block',
    '[class.ngcc--section-nav--sticky]': 'sticky()',
    '[style.--ngcc-section-nav-top.px]': 'offset() + 16',
  },
  styleUrl: './ngcc-section-nav.scss',
  template: `
    <nav class="ngcc--section-nav" [attr.aria-label]="ariaLabel()">
      <ul class="ngcc--section-nav__list">
        @for (section of sections(); track section.id) {
          <li>
            <a
              class="ngcc--section-nav__link"
              [class.ngcc--section-nav__link--active]="active() === section.id"
              [attr.href]="'#' + section.id"
              [attr.aria-current]="active() === section.id ? 'location' : null"
              (click)="jump($event, section)"
            >
              <span class="ngcc--section-nav__label">{{ section.label }}</span>
              @if (section.status) {
                <span
                  class="ngcc--section-nav__status ngcc--section-nav__status--{{ section.status }}"
                  aria-hidden="true"
                ></span>
                <span class="cds--visually-hidden">, {{ text()[section.status] }}</span>
              }
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class NgccSectionNav {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | null = null;
  private readonly visible = new Set<string>();
  private readonly ready = signal(false);

  readonly sections = input.required<NgccSectionNavItem[]>();
  /** Id of the current section (two-way). Follows scrolling by itself. */
  readonly active = model<string | null>(null);
  readonly ariaLabel = input('On this page');
  /** Height in px of fixed content at the top of the page. */
  readonly offset = input(0);
  readonly sticky = input(true);
  readonly labels = input<Partial<NgccSectionNavLabels>>({});

  /** The user jumped to a section. */
  readonly sectionSelected = output<string>();

  protected readonly text = computed<NgccSectionNavLabels>(() => ({
    ...NGCC_SECTION_NAV_DEFAULT_LABELS,
    ...this.labels(),
  }));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
    // The sections live outside this component's view, so wait until the page has rendered.
    afterNextRender(() => this.ready.set(true));
    effect(() => {
      if (!this.ready()) return;
      this.sections();
      this.offset();
      this.observe();
    });
    // Without a current section, start on the first.
    effect(() => {
      const list = this.sections();
      if (this.active() === null && list.length) this.active.set(list[0].id);
    });
  }

  /** Re-reads the section elements, for sections added to the page after this list rendered. */
  refresh(): void {
    this.observe();
  }

  private observe(): void {
    this.observer?.disconnect();
    this.visible.clear();
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') return;
    // The "reading line" is just below the fixed header and a little way into the page.
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) this.visible.add(e.target.id);
          else this.visible.delete(e.target.id);
        }
        const first = this.sections().find((s) => this.visible.has(s.id));
        if (first && first.id !== this.active()) this.active.set(first.id);
      },
      { rootMargin: `-${this.offset()}px 0px -60% 0px` },
    );
    for (const s of this.sections()) {
      const el = document.getElementById(s.id);
      if (el) this.observer.observe(el);
    }
  }

  protected jump(event: Event, section: NgccSectionNavItem): void {
    const target = this.isBrowser ? document.getElementById(section.id) : null;
    if (!target) return;
    event.preventDefault();
    this.active.set(section.id);
    this.sectionSelected.emit(section.id);
    target.style.scrollMarginTop = `${this.offset()}px`;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}
