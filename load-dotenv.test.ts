import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { loadDotEnv } from './load-dotenv.ts';

const envKeys = ['TAPD_API_USER', 'TAPD_API_PASSWORD', 'TAPD_WORKSPACE_ID'] as const;

describe('loadDotEnv', () => {
  let dir: string;

  afterEach(() => {
    for (const key of envKeys) delete process.env[key];
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  test('loads variables from .env without overriding existing env', () => {
    dir = mkdtempSync(join(tmpdir(), 'tapd-dotenv-'));
    writeFileSync(
      join(dir, '.env'),
      '# comment\nTAPD_API_USER=from_file\nTAPD_API_PASSWORD=secret\nTAPD_WORKSPACE_ID=123\n',
    );

    for (const key of envKeys) delete process.env[key];
    process.env.TAPD_API_USER = 'from_env';
    loadDotEnv(dir);

    expect(process.env.TAPD_API_USER).toBe('from_env');
    expect(process.env.TAPD_API_PASSWORD).toBe('secret');
    expect(process.env.TAPD_WORKSPACE_ID).toBe('123');
  });
});
