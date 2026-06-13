/**
 * TAPD 配置，从环境变量读取。
 * 认证说明：https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html
 */

export interface TapdConfig {
  baseURL: string;
  apiUser: string;
  apiPassword: string;
  workspaceId: string;
}

export function loadConfig(): TapdConfig {
  const apiUser = process.env.TAPD_API_USER?.trim();
  const apiPassword = process.env.TAPD_API_PASSWORD?.trim();
  const workspaceId = process.env.TAPD_WORKSPACE_ID?.trim();

  if (!apiUser || !apiPassword || !workspaceId) {
    throw new Error('未配置 TAPD 凭证，请先运行 tapd auth 登录，或参考 .env.example 创建 .env');
  }

  return {
    baseURL: process.env.TAPD_BASE_URL?.trim() || 'https://api.tapd.cn',
    apiUser,
    apiPassword,
    workspaceId,
  };
}

/** 默认配置单例，首次访问时从 env 加载（需已配置凭证） */
export function getConfig(): TapdConfig {
  return loadConfig();
}
