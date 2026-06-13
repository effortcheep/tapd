import { loadConfig } from './config.ts';
import { TapdClient } from './client.ts';
import { getIterations, getIterationsCount } from './iterations.ts';
import { getStories, getStoriesCount } from './stories.ts';

export { loadConfig, getConfig, type TapdConfig } from './config.ts';
export { TapdClient, createHttpClient, unwrapTAPDList } from './client.ts';
export { getStories, getStoriesCount, getAllStories } from './stories.ts';
export { getIterations, getIterationsCount, getAllIterations } from './iterations.ts';
export type * from './types.ts';

let _client: TapdClient | undefined;

/** 使用 .env 配置的默认客户端（懒加载，需已登录或配置 .env） */
export function getTapd(): TapdClient {
  if (!_client) _client = new TapdClient(loadConfig());
  return _client;
}

/** @deprecated 使用 getTapd()，避免无 .env 时导入即报错 */
export const tapd = new Proxy({} as TapdClient, {
  get(_target, prop) {
    return Reflect.get(getTapd(), prop);
  },
});
