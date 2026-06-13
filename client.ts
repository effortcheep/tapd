import axios, { type AxiosInstance } from 'axios';
import { Agent as HttpAgent } from 'node:http';
import { Agent as HttpsAgent } from 'node:https';
import type { TapdConfig } from './config.ts';
import type { TapdResponse } from './types.ts';

/**
 * TAPD API 客户端
 * 认证方式：HTTP Basic Auth (api_user / api_password)
 * 文档：https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html
 *
 * 注意：Node 19+ 的 http.globalAgent 默认 keepAlive=true，axios 会复用它。
 * TAPD 侧 idle timeout 通常更短，连接被单方关闭后复用会抛 ECONNRESET。
 * 显式关掉 keep-alive 走短连接，简单且足够稳定。
 */
export function createHttpClient(cfg: TapdConfig): AxiosInstance {
  const http = axios.create({
    baseURL: cfg.baseURL,
    auth: {
      username: cfg.apiUser,
      password: cfg.apiPassword,
    },
    timeout: 15_000,
    httpAgent: new HttpAgent({ keepAlive: false }),
    httpsAgent: new HttpsAgent({ keepAlive: false }),
  });

  http.interceptors.response.use(
    (r) => r,
    (err) => {
      const c = err.config || {};
      const url = c.url || c.baseURL;
      const method = (c.method || 'get').toUpperCase();
      console.error(`[tapd] ${method} ${url} failed:`, err.code || err.message);
      return Promise.reject(err);
    },
  );

  return http;
}

/** 把 TAPD 风格的 [{ Xxx: {...} }] 拍平为 [...] */
export function unwrapTAPDList<T>(payload: unknown, key: string): T[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) => (item as Record<string, T>)?.[key])
    .filter(Boolean) as T[];
}

export class TapdClient {
  readonly config: TapdConfig;
  private readonly http: AxiosInstance;

  constructor(cfg: TapdConfig) {
    this.config = cfg;
    this.http = createHttpClient(cfg);
  }

  /** 校验 API 账号口令是否有效 */
  async testAuth() {
    const res = await this.http.get<TapdResponse<import('./types.ts').AuthTestResult>>(
      '/quickstart/testauth',
    );
    return this.unwrap(res.data);
  }

  /** 通用 GET：自动注入 workspace_id，校验 status */
  async get<T>(path: string, params: object = {}): Promise<T> {
    const res = await this.http.get<TapdResponse<T>>(path, {
      params: { workspace_id: this.config.workspaceId, ...params },
    });
    return this.unwrap(res.data);
  }

  private unwrap<T>(body: TapdResponse<T>): T {
    if (body.status !== 1) {
      throw new Error(`TAPD API 错误: ${body.info || 'unknown'}`);
    }
    return body.data;
  }
}
