import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import {
  NGCC_AVATAR_SIZES,
  NgccAvatarShape,
  NgccAvatarSize,
  ngccInitials,
} from './ngcc-avatar.types';

/** Backgrounds that keep white initials at 7:1 or better (Carbon 70 / 80 palette). */
const PALETTE = [
  '#0043ce',
  '#8a3ffc',
  '#005d5d',
  '#9f1853',
  '#00539a',
  '#0e6027',
  '#6929c4',
  '#a2191f',
] as const;

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

/**
 * User or client avatar: a photo when `src` loads, otherwise initials on a color that is stable
 * for that name, otherwise a person icon.
 *
 * Accessible name is the `name`. Set `decorative` when the name is printed next to it.
 */
@Component({
  selector: 'ngcc-avatar',
  standalone: true,
  imports: [NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngcc-avatar',
    '[class.ngcc-avatar--square]': "shape() === 'square'",
    '[style.width.px]': 'px()',
    '[style.height.px]': 'px()',
    '[style.font-size.px]': 'fontPx()',
    '[style.background]': 'showImage() ? null : background()',
    '[attr.role]': "decorative() ? null : 'img'",
    '[attr.aria-label]': 'decorative() ? null : accessibleName()',
    '[attr.aria-hidden]': "decorative() ? 'true' : null",
  },
  styleUrl: './ngcc-avatar.scss',
  template: `
    @if (showImage()) {
      <img class="ngcc-avatar__image" [src]="src()" alt="" (error)="failed.set(true)" />
    } @else if (initials()) {
      <span class="ngcc-avatar__initials" aria-hidden="true">{{ initials() }}</span>
    } @else {
      <ngcc-icon name="user" [size]="iconSize()" [decorative]="true" />
    }
  `,
})
export class NgccAvatar {
  readonly name = input('');
  readonly src = input('');
  readonly size = input<NgccAvatarSize>('md');
  readonly shape = input<NgccAvatarShape>('circle');
  /** Hide from assistive technology, e.g. when the name is shown beside the avatar. */
  readonly decorative = input(false);

  protected readonly failed = signal(false);

  protected readonly px = computed(() => NGCC_AVATAR_SIZES[this.size()]);
  protected readonly fontPx = computed(() => Math.round(this.px() * 0.4));
  protected readonly iconSize = computed(() => (this.px() >= 48 ? 'lg' : 'sm') as 'sm' | 'lg');
  protected readonly initials = computed(() => ngccInitials(this.name()));
  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly background = computed(() =>
    this.name()
      ? PALETTE[hash(this.name()) % PALETTE.length]
      : 'var(--cds-icon-secondary, #525252)',
  );
  protected readonly accessibleName = computed(() => this.name() || 'User');
}
