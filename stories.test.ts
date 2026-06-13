import { describe, expect, test } from 'bun:test';
import type { TapdClient } from './client.ts';
import { getAllStories } from './stories.ts';
import type { Story } from './types.ts';

function story(id: string, iterationId = '100'): Story {
  return {
    id,
    name: `需求-${id}`,
    workspace_id: '1',
    status: 'open',
    owner: 'tester',
    creator: 'tester',
    created: '2026-01-01 00:00:00',
    modified: '2026-01-01 00:00:00',
    description: null,
    priority: 'P1',
    iteration_id: iterationId,
    begin: null,
    due: null,
    completed: null,
    developer: '',
    cc: '',
    module: '',
    version: '',
    category_id: '0',
    parent_id: '0',
    children_id: '|',
    ancestor_id: id,
    business_value: '0',
    effort: null,
    effort_completed: '0',
    remain: '0',
    exceed: '0',
  };
}

function stubClient(pages: Story[][]): TapdClient & { _calls: object[] } {
  const calls: object[] = [];
  return {
    config: {
      baseURL: 'https://api.tapd.cn',
      apiUser: 'u',
      apiPassword: 'p',
      workspaceId: '1',
    },
    async get(path: string, params: object) {
      calls.push(params);
      if (path !== '/stories') throw new Error(`unexpected path: ${path}`);
      const page = (params as { page?: number }).page ?? 1;
      const items = pages[page - 1] ?? [];
      return items.map((item) => ({ Story: item }));
    },
    _calls: calls,
  } as unknown as TapdClient & { _calls: object[] };
}

describe('getAllStories', () => {
  test('auto-paginates until a page returns fewer than limit', async () => {
    const client = stubClient([[story('1'), story('2')], [story('3')]]);

    const result = await getAllStories(client, {
      iteration_id: '100',
      include_sub_iteration: '1',
      limit: 2,
    });

    expect(result.map((s) => s.id)).toEqual(['1', '2', '3']);
    expect(client._calls).toHaveLength(2);
  });

  test('fetches only the requested page when page is set', async () => {
    const client = stubClient([[story('1'), story('2')], [story('3')]]);

    const result = await getAllStories(client, {
      iteration_id: '100',
      limit: 2,
      page: 2,
    });

    expect(result.map((s) => s.id)).toEqual(['3']);
    expect(client._calls).toHaveLength(1);
  });
});
