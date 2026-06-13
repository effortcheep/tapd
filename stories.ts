import type { TapdClient } from './client.ts';
import { unwrapTAPDList } from './client.ts';
import type { GetStoriesParams, Story } from './types.ts';

const DEFAULT_PAGE_LIMIT = 200;

/**
 * 获取需求列表
 * @see https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/story/get_stories.html
 */
export async function getStories(
  client: TapdClient,
  params: GetStoriesParams = {},
): Promise<Story[]> {
  const data = await client.get<unknown>('/stories', params);
  return unwrapTAPDList<Story>(data, 'Story');
}

export type GetAllStoriesParams = Omit<GetStoriesParams, 'limit' | 'page'> & {
  limit?: number;
  page?: number;
};

/** 获取需求：默认自动翻页；指定 page 时只取该页 */
export async function getAllStories(
  client: TapdClient,
  params: GetAllStoriesParams = {},
): Promise<Story[]> {
  const { limit: userLimit, page: userPage, ...filters } = params;
  const pageSize = userLimit ?? DEFAULT_PAGE_LIMIT;

  if (userPage !== undefined) {
    return getStories(client, { ...filters, limit: pageSize, page: userPage });
  }

  const all: Story[] = [];
  for (let page = 1; ; page++) {
    const batch = await getStories(client, { ...filters, limit: pageSize, page });
    all.push(...batch);
    if (batch.length < pageSize) break;
  }
  return all;
}

/**
 * 获取需求数量
 * @see https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/story/get_stories.html
 */
export async function getStoriesCount(
  client: TapdClient,
  params: Omit<GetStoriesParams, 'limit' | 'page' | 'order' | 'fields'> = {},
): Promise<number> {
  const data = await client.get<{ count: number }>('/stories/count', params);
  return Number(data.count);
}
