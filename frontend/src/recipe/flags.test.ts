import { describe, expect, it } from 'vitest';
import { flagForCuisine } from './flags';
import { pageSizeFor } from './layoutPreference';

describe('flagForCuisine', () => {
  it('matches TheMealDB area names and country names', () => {
    expect(flagForCuisine('Brazilian')?.code).toBe('br');
    expect(flagForCuisine('Brazil')?.code).toBe('br');
    expect(flagForCuisine('Italian')?.code).toBe('it');
    expect(flagForCuisine('British')?.code).toBe('gb');
    expect(flagForCuisine('American')?.code).toBe('us');
    expect(flagForCuisine('  Thai ')?.color).toBe('#a51931');
    expect(flagForCuisine('Antiguan, Barbudan')?.code).toBe('ag');
  });

  it('has no flag for an unknown region', () => {
    expect(flagForCuisine('Unknown')).toBeNull();
    expect(flagForCuisine('')).toBeNull();
  });
});

describe('pageSizeFor', () => {
  it('loads more recipes in the denser layouts', () => {
    expect(pageSizeFor('card')).toBe(12);
    expect(pageSizeFor('list')).toBe(24);
    expect(pageSizeFor('compact')).toBe(24);
  });
});
