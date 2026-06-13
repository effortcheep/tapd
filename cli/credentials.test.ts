import { describe, expect, test } from 'bun:test';
import { resolveCredentials, tryLoadConfig } from './credentials.ts';

describe('tryLoadConfig', () => {
  test('returns null when credentials incomplete', () => {
    expect(tryLoadConfig({})).toBeNull();
    expect(tryLoadConfig({ TAPD_API_USER: 'u' })).toBeNull();
  });

  test('returns config when all credentials present', () => {
    const cfg = tryLoadConfig({
      TAPD_API_USER: 'user',
      TAPD_API_PASSWORD: 'pass',
      TAPD_WORKSPACE_ID: '123',
    });
    expect(cfg).toEqual({
      baseURL: 'https://api.tapd.cn',
      apiUser: 'user',
      apiPassword: 'pass',
      workspaceId: '123',
    });
  });
});

describe('resolveCredentials', () => {
  test('uses env when credentials are complete', async () => {
    const { config, source } = await resolveCredentials(
      async () => {
        throw new Error('should not prompt');
      },
      {
        TAPD_API_USER: 'user',
        TAPD_API_PASSWORD: 'pass',
        TAPD_WORKSPACE_ID: '123',
      },
      false,
    );

    expect(source).toBe('env');
    expect(config.apiUser).toBe('user');
  });

  test('prompts when env missing and stdin is TTY', async () => {
    const { config, source } = await resolveCredentials(
      async () => ({
        apiUser: 'prompted',
        apiPassword: 'secret',
        workspaceId: '999',
      }),
      {},
      true,
    );

    expect(source).toBe('prompt');
    expect(config.apiUser).toBe('prompted');
  });

  test('errors when env missing and not a TTY', async () => {
    await expect(
      resolveCredentials(async () => ({ apiUser: 'x', apiPassword: 'y', workspaceId: 'z' }), {}, false),
    ).rejects.toThrow('交互式登录');
  });
});
