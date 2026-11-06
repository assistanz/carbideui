import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgccFormField } from './ngcc-form-field';
import { NgccInput } from '../ngcc-input/ngcc-input-text/ngcc-input';

@Component({
  imports: [NgccFormField, NgccInput],
  template: `<ngcc-form-field label="Name"><ngcc-input label="Name" /></ngcc-form-field>
    <ngcc-form-field label="Other"><ngcc-input label="Other" /></ngcc-form-field>`,
})
class NestedHost {}

@Component({
  imports: [NgccFormField],
  template: `<ngcc-form-field label="Native"><input /></ngcc-form-field>`,
})
class NativeHost {}

describe('NgccFormField nesting guard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('warns once in dev mode when it wraps a component with its own label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const f = TestBed.createComponent(NestedHost);
    await f.whenStable();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('own label');
    warn.mockRestore();
  });

  it('stays quiet around native controls', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const f = TestBed.createComponent(NativeHost);
    await f.whenStable();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
