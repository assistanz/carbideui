import {
  Directive,
  ElementRef,
  effect,
  OnDestroy,
  viewChild,
  computed,
  inject,
  signal,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import type { Chart } from '@carbon/charts';
import { NgccColorThemeService } from '../ngcc-color-theme/ngcc-color-theme.service';

@Directive()
export abstract class NgccBaseChart<TOptions extends object> implements OnDestroy, OnChanges {
  @Input() data: Record<string, unknown>[] = [];
  @Input() options: TOptions = {} as TOptions;
  @Input() loading = false;
  @Input() noDataMessage = 'No data available';
  @Input() ariaLabel = 'Chart placeholder';

  // Internal state signals
  protected readonly _data = signal<Record<string, unknown>[]>([]);
  protected readonly _options = signal<TOptions>({} as TOptions);
  protected readonly _loading = signal<boolean>(false);
  protected readonly _noDataMessage = signal<string>('No data available');
  protected readonly _ariaLabel = signal<string>('Chart placeholder');

  protected readonly chartContainer = viewChild<ElementRef>('chartContainer');
  protected chart?: Chart;
  protected resizeObserver?: ResizeObserver;
  protected readonly colorThemeService = inject(NgccColorThemeService);

  protected readonly hasData = computed<boolean>(
    () => !this._loading() && this._data()?.length > 0,
  );

  protected readonly chartHeight = computed<string>(() => {
    const opts = this._options() as unknown as Record<string, unknown>;
    return (opts?.['height'] as string) || '300px';
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this._data.set(changes['data'].currentValue ?? []);
    }

    if (changes['options']) {
      this._options.set(changes['options'].currentValue ?? ({} as TOptions));
    }

    if (changes['loading']) {
      this._loading.set(changes['loading'].currentValue ?? false);
    }

    if (changes['noDataMessage']) {
      this._noDataMessage.set(changes['noDataMessage'].currentValue ?? 'No data available');
    }

    if (changes['ariaLabel']) {
      this._ariaLabel.set(changes['ariaLabel'].currentValue ?? 'Chart placeholder');
    }
  }

  constructor() {
    effect((): void => {
      const theme = this.colorThemeService.baseTheme();

      if (this.chart) {
        const currentOpts = this.chart.model.getOptions();
        this.chart.model.setOptions({ ...currentOpts, theme });
        this.chart.update();
      }
    });
  }

  protected observeResize(el: HTMLElement): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver((): void => {
      try {
        (this.chart as unknown as { resize?: () => void })?.resize?.();
      } catch {
        this.chart?.update();
      }
    });

    this.resizeObserver.observe(el);
  }

  protected destroyChart(): void {
    try {
      (this.chart as unknown as { destroy?: () => void })?.destroy?.();
    } catch {
      console.warn('[NgccBaseChart] destroy failed');
    }

    this.chart = undefined;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  protected abstract initChart(el: HTMLElement): void;

  // Template accessors
  getData(): Record<string, unknown>[] {
    return this._data();
  }

  getOptions(): TOptions {
    return this._options();
  }
}
