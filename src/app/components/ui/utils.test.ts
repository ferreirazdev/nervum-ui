import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('merges single class string', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false, 'bar', null, undefined)).toBe('foo bar');
  });

  it('merges conditional classes via object', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('resolves Tailwind conflicts (later overrides earlier)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('combines arrays and strings', () => {
    expect(cn('a', ['b', 'c'])).toBe('a b c');
  });
});
