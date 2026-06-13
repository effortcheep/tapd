import type { TapdClient } from './client.ts';
import { unwrapTAPDList } from './client.ts';
import type { GetIterationsParams, Iteration } from './types.ts';

const DEFAULT_PAGE_LIMIT = 200;

/**
 * 获取迭代列表
 * @see https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html
 */
export async function getIterations(
  client: TapdClient,
  params: GetIterationsParams = {},
): Promise<Iteration[]> {
  const data = await client.get<unknown>('/iterations', params);
  return unwrapTAPDList<Iteration>(data, 'Iteration');
}

export type GetAllIterationsParams = Omit<GetIterationsParams, 'limit' | 'page'> & {
  limit?: number;
  page?: number;
};

/** 获取迭代：默认自动翻页；指定 page 时只取该页 */
export async function getAllIterations(
  client: TapdClient,
  params: GetAllIterationsParams = {},
): Promise<Iteration[]> {
  const { limit: userLimit, page: userPage, ...filters } = params;
  const pageSize = userLimit ?? DEFAULT_PAGE_LIMIT;

  if (userPage !== undefined) {
    return getIterations(client, { ...filters, limit: pageSize, page: userPage });
  }

  const all: Iteration[] = [];
  for (let page = 1; ; page++) {
    const batch = await getIterations(client, { ...filters, limit: pageSize, page });
    all.push(...batch);
    if (batch.length < pageSize) break;
  }
  return all;
}

/**
 * 获取迭代数量
 * @see https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html
 */
export async function getIterationsCount(
  client: TapdClient,
  params: Omit<GetIterationsParams, 'limit' | 'page' | 'order' | 'fields'> = {},
): Promise<number> {
  const data = await client.get<{ count: number }>('/iterations/count', params);
  return Number(data.count);
}
