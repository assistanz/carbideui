import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';

/**
 * Brand prefix + product name link in the header.
 *
 * <ngcc-header-name brand="CarbideUI" productName="My App" href="/" />
 */
@Component({
  selector: 'ngcc-header-name',
  standalone: true,
  imports: [],
  templateUrl: './ngcc-header-name.html',
  styleUrls: ['./ngcc-header-name.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' },
})
export class NgccHeaderName implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brand']) this._brand.set(changes['brand'].currentValue ?? 'CarbideUI');
    if (changes['productName']) this._productName.set(changes['productName'].currentValue ?? '');
    if (changes['href']) this._href.set(changes['href'].currentValue ?? '/');
  }

  /** Brand prefix, e.g. "CarbideUI" */
  @Input() brand = 'CarbideUI';
  private readonly _brand = signal('CarbideUI');
  /** Product / suite name shown after the brand */
  @Input() productName = '';
  private readonly _productName = signal('');
  /** Link destination */
  @Input() href = '/';
  private readonly _href = signal('/');

  /** Combined title attribute for accessibility */
  readonly titleAttr = computed(() =>
    [this._brand(), this._productName()].filter(Boolean).join(' '),
  );
}
