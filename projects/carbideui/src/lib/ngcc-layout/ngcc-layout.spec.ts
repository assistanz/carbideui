import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccGridSpanDirective, NgccPageGrid } from './ngcc-page-grid';
import { NgccPanelGrid } from './ngcc-panel-grid';
import { NgccGridGap } from './ngcc-layout.types';

@Component({
  imports: [NgccPageGrid, NgccGridSpanDirective, NgccPanelGrid],
  template: `
    <ngcc-page-grid [gap]="gap()">
      <div class="a" ngccGridSpan [sm]="4" [md]="4" [lg]="3">a</div>
      <div class="b" ngccGridSpan [lg]="8" [start]="5">b</div>
      <div class="c">c</div>
    </ngcc-page-grid>
    <ngcc-panel-grid [columns]="3" min="12rem" gap="wide"
      ><div>1</div>
      <div>2</div></ngcc-panel-grid
    >
  `,
})
class HostComponent {
  gap = signal<NgccGridGap>('default');
}

describe('layout helpers', () => {
  let fixture: ComponentFixture<HostComponent>;
  const q = (css: string): HTMLElement => fixture.nativeElement.querySelector(css);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  describe('ngcc-page-grid', () => {
    it('carries the grid class and the default gap', () => {
      expect(q('ngcc-page-grid').classList).toContain('ngcc-page-grid');
      expect(q('ngcc-page-grid').style.getPropertyValue('--ngcc-grid-gap')).toBe('1rem');
    });

    it('changes the gap', async () => {
      fixture.componentInstance.gap.set('condensed');
      await fixture.whenStable();
      expect(q('ngcc-page-grid').style.getPropertyValue('--ngcc-grid-gap')).toBe('0.5rem');
    });

    it('sets the span for each breakpoint on the item', () => {
      const a = q('.a');
      expect(a.style.getPropertyValue('--ngcc-col-sm')).toBe('span 4');
      expect(a.style.getPropertyValue('--ngcc-col-md')).toBe('span 4');
      expect(a.style.getPropertyValue('--ngcc-col-lg')).toBe('span 3');
    });

    it('can pin where an item starts on large screens', () => {
      expect(q('.b').style.getPropertyValue('--ngcc-col-lg')).toBe('5 / span 8');
    });

    it('leaves breakpoints you did not set at full width', () => {
      expect(q('.b').style.getPropertyValue('--ngcc-col-sm')).toBe('');
      expect(q('.c').style.getPropertyValue('--ngcc-col-lg')).toBe('');
    });
  });

  describe('ngcc-panel-grid', () => {
    it('passes the column count, minimum width and gap as CSS variables', () => {
      const g = q('ngcc-panel-grid');
      expect(g.classList).toContain('ngcc-panel-grid');
      expect(g.style.getPropertyValue('--ngcc-panel-cols')).toBe('3');
      expect(g.style.getPropertyValue('--ngcc-panel-min')).toBe('12rem');
      expect(g.style.getPropertyValue('--ngcc-grid-gap')).toBe('2rem');
    });
  });
});
