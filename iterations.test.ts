import { describe, expect, test } from 'bun:test';
import type { TapdClient } from './client.ts';
import { getAllIterations } from './iterations.ts';
import type { Iteration } from './types.ts';

function iteration(id: string): Iteration {
  return {
    id,
    name: `迭代-${id}`,
    workspace_id: '1',
    description: null,
    startdate: '2026-01-01',
    enddate: '2026-01-07',
    status: 'open',
    creator: 'tester',
    created: '2026-01-01 00:00:00',
    modified: '2026-01-01 00:00:00',
    completed: null,
    locker: null,
  };
}

function stubClient(pages: Iteration[][]): TapdClient {
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
      if (path !== '/iterations') throw new Error(`unexpected path: ${path}`);
      const page = (params as { page?: number }).page ?? 1;
      const items = pages[page - 1] ?? [];
      return items.map((item) => ({ Iteration: item }));
    },
    // expose for assertions
    _calls: calls,
  } as unknown as TapdClient & { _calls: object[] };
}

describe('getAllIterations', () => {
  test('auto-paginates until a page returns fewer than limit', async () => {
    const client = stubClient([
      [iteration('1'), iteration('2')],
      [iteration('3')],
    ]);

    const result = await getAllIterations(client, { limit: 2 });

    expect(result.map((i) => i.id)).toEqual(['1', '2', '3']);
    expect((client as TapdClient & { _calls: object[] })._calls).toHaveLength(2);
  });

  test('fetches only the requested page when --page is set', async () => {
    const client = stubClient([
      [iteration('1'), iteration('2')],
      [iteration('3')],
    ]);

    const result = await getAllIterations(client, { limit: 2, page: 2 });

    expect(result.map((i) => i.id)).toEqual(['3']);
    expect((client as TapdClient & { _calls: object[] })._calls).toHaveLength(1);
  });
});
