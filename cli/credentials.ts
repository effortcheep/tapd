import type { TapdConfig } from '../config.ts';

export interface CredentialInput {
  apiUser: string;
  apiPassword: string;
  workspaceId: string;
}

export type CredentialPrompter = () => Promise<CredentialInput>;

export function tryLoadConfig(env: NodeJS.ProcessEnv = process.env): TapdConfig | null {
  const apiUser = env.TAPD_API_USER?.trim();
  const apiPassword = env.TAPD_API_PASSWORD?.trim();
  const workspaceId = env.TAPD_WORKSPACE_ID?.trim();
  if (!apiUser || !apiPassword || !workspaceId) return null;

  return {
    baseURL: env.TAPD_BASE_URL?.trim() || 'https://api.tapd.cn',
    apiUser,
    apiPassword,
    workspaceId,
  };
}

export async function resolveCredentials(
  prompter: CredentialPrompter,
  env: NodeJS.ProcessEnv = process.env,
  isTTY: boolean = process.stdin.isTTY ?? false,
): Promise<{ config: TapdConfig; source: 'env' | 'prompt' }> {
  const fromEnv = tryLoadConfig(env);
  if (fromEnv) return { config: fromEnv, source: 'env' };

  if (!isTTY) {
    throw new Error(
      '未配置 TAPD 凭证。请在终端运行 tapd auth 进行交互式登录，或参考 .env.example 创建 .env',
    );
  }

  const input = await prompter();
  return {
    config: {
      baseURL: env.TAPD_BASE_URL?.trim() || 'https://api.tapd.cn',
      apiUser: input.apiUser,
      apiPassword: input.apiPassword,
      workspaceId: input.workspaceId,
    },
    source: 'prompt',
  };
}
