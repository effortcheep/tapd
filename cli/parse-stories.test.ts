import { describe, expect, test } from 'bun:test';
import { toStoriesApiParams } from './parse-stories.ts';

describe('toStoriesApiParams', () => {
  test('includes sub-iterations by default', () => {
    const params = toStoriesApiParams({ iterationId: '123' });
    expect(params.include_sub_iteration).toBe('1');
    expect(params.iteration_id).toBe('123');
  });

  test('excludes sub-iterations when --no-sub-iteration', () => {
    const params = toStoriesApiParams({ iterationId: '123', noSubIteration: true });
    expect(params.include_sub_iteration).toBe('0');
  });
});
