import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccStatTile } from './ngcc-stat-tile';

describe('NgccStatTile', () => {
  let fixture: ComponentFixture<NgccStatTile>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccStatTile],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(NgccStatTile);
    fixture.componentRef.setInput('label', 'Users');
    fixture.componentRef.setInput('value', 12);
  });

  it('renders label and value without a delta', async () => {
    await fixture.whenStable();
    expect(el().textContent).toContain('Users');
    expect(el().textContent).toContain('12');
    expect(el().querySelector('.ngcc-stat__delta')).toBeNull();
  });

  it('infers trend from a numeric delta and colors by sentiment', async () => {
    fixture.componentRef.setInput('delta', 5);
    await fixture.whenStable();
    const tile = el().querySelector<HTMLElement>('.ngcc-stat')!;
    expect(tile.style.getPropertyValue('--ngcc-stat-delta')).toContain('success');

    fixture.componentRef.setInput('trendSentiment', 'positive-down');
    await fixture.whenStable();
    expect(tile.style.getPropertyValue('--ngcc-stat-delta')).toContain('error');
  });

  it('sets the accent from status', async () => {
    fixture.componentRef.setInput('status', 'warning');
    await fixture.whenStable();
    expect(
      el().querySelector<HTMLElement>('.ngcc-stat')!.style.getPropertyValue('--ngcc-stat-accent'),
    ).toContain('warning');
  });

  describe('sparkline', () => {
    const spark = () => el().querySelector('ngcc-sparkline');

    it('shows no sparkline by default', async () => {
      await fixture.whenStable();
      expect(spark()).toBeNull();
    });

    it('draws a sparkline under the value when a series is given', async () => {
      fixture.componentRef.setInput('sparkline', [1, 2, 3, 5, 8]);
      await fixture.whenStable();
      expect(spark()).not.toBeNull();
      expect(spark()!.querySelector('.ngcc-sparkline__area')).not.toBeNull(); // area by default
    });

    it('supports line and bar styles', async () => {
      fixture.componentRef.setInput('sparkline', [1, 2, 3]);
      fixture.componentRef.setInput('sparklineType', 'bar');
      await fixture.whenStable();
      expect(spark()!.querySelectorAll('.ngcc-sparkline__bar').length).toBe(3);
    });

    it('colors the trend by the tile sentiment, like the delta', async () => {
      fixture.componentRef.setInput('sparkline', [10, 4, 2]);
      fixture.componentRef.setInput('trendSentiment', 'positive-down'); // falling cost is good
      await fixture.whenStable();
      expect(spark()!.querySelector('svg')!.style.color).toContain('--cds-support-success');
    });

    it('follows the tile status when set', async () => {
      fixture.componentRef.setInput('sparkline', [1, 2, 3]);
      fixture.componentRef.setInput('status', 'error');
      await fixture.whenStable();
      expect(spark()!.querySelector('svg')!.style.color).toContain('--cds-support-error');
    });

    it('gives the trend a text alternative, overridable', async () => {
      fixture.componentRef.setInput('sparkline', [1, 2, 3]);
      await fixture.whenStable();
      expect(spark()!.querySelector('svg')!.getAttribute('aria-label')).toContain(
        'Trend over 3 points',
      );

      fixture.componentRef.setInput('sparklineLabel', 'Active users, last 3 weeks');
      await fixture.whenStable();
      expect(spark()!.querySelector('svg')!.getAttribute('aria-label')).toBe(
        'Active users, last 3 weeks',
      );
    });
  });
});
