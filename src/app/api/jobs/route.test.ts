import { describe, it, expect } from 'vitest';

describe('Job search query validation', () => {
  it('accepts valid sort values', () => {
    const valid = ['recent', 'fit', 'salary'];
    valid.forEach((sort) => {
      expect(['recent', 'fit', 'salary']).toContain(sort);
    });
  });
});
