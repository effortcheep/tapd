import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';

const CLI = join(import.meta.dir, 'cli.ts');

async function runCli(
  args: string[],
  options?: {
    env?: Record<string, string | undefined>;
    /** 不继承父进程环境，用于测试缺 env 场景 */
    isolated?: boolean;
  },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const merged: Record<string, string | undefined> = options?.isolated
    ? { PATH: process.env.PATH ?? '/usr/bin:/bin' }
    : { ...process.env };

  if (options?.env) {
    for (const [key, value] of Object.entries(options.env)) {
      if (value === undefined) delete merged[key];
      else merged[key] = value;
    }
  }

  const proc = Bun.spawn(['bun', CLI, ...args], {
    cwd: options?.isolated ? '/tmp' : process.cwd(),
    env: merged as Record<string, string>,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

describe('tapd --help', () => {
  test('prints subcommands and exits 0', async () => {
    const { stdout, exitCode } = await runCli(['--help']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('auth');
    expect(stdout).toContain('iterations');
    expect(stdout).toContain('stories');
  });
});

describe('unknown command', () => {
  test('prints error and exits 1', async () => {
    const { stderr, exitCode } = await runCli(['unknown']);

    expect(exitCode).toBe(1);
    expect(stderr).toContain('未知命令');
  });
});

describe('tapd auth --help', () => {
  test('prints auth usage and exits 0', async () => {
    const { stdout, exitCode } = await runCli(['auth', '--help']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('auth');
    expect(stdout).toContain('ok');
    expect(stdout).toContain('api_user');
    expect(stdout).toContain('workspace_id');
  });
});

describe('tapd auth without env', () => {
  test('errors in non-interactive mode and hints interactive login', async () => {
    const { stdout, stderr, exitCode } = await runCli(['auth'], { isolated: true });

    expect(exitCode).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toContain('交互式登录');
  });
});

describe('tapd auth with credentials', () => {
  test('outputs ok JSON and exits 0', async () => {
    const hasEnv =
      process.env.TAPD_API_USER &&
      process.env.TAPD_API_PASSWORD &&
      process.env.TAPD_WORKSPACE_ID;
    if (!hasEnv) return;

    const { stdout, stderr, exitCode } = await runCli(['auth']);

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    const body = JSON.parse(stdout);
    expect(body.ok).toBe(true);
    expect(body.api_user).toBe(process.env.TAPD_API_USER);
    expect(body.workspace_id).toBe(process.env.TAPD_WORKSPACE_ID);
    expect(body.api_password).toBeUndefined();
  });
});

describe('tapd iterations --help', () => {
  test('prints iterations usage and exits 0', async () => {
    const { stdout, exitCode } = await runCli(['iterations', '--help']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('iterations');
    expect(stdout).toContain('--name');
    expect(stdout).toContain('--startdate');
    expect(stdout).toContain('--enddate');
    expect(stdout).toContain('--limit');
    expect(stdout).toContain('--page');
  });
});

describe('tapd iterations without credentials', () => {
  test('errors when not configured', async () => {
    const { stdout, stderr, exitCode } = await runCli(['iterations'], { isolated: true });

    expect(exitCode).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/tapd auth|\.env/);
  });
});

describe('tapd iterations with credentials', () => {
  test('outputs data JSON array with --limit 1', async () => {
    const hasEnv =
      process.env.TAPD_API_USER &&
      process.env.TAPD_API_PASSWORD &&
      process.env.TAPD_WORKSPACE_ID;
    if (!hasEnv) return;

    const { stdout, stderr, exitCode } = await runCli(['iterations', '--limit', '1', '--page', '1']);

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    const body = JSON.parse(stdout);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(1);
    if (body.data.length === 1) {
      expect(body.data[0].id).toBeDefined();
      expect(body.data[0].name).toBeDefined();
    }
  });
});

describe('tapd stories --help', () => {
  test('prints stories usage and exits 0', async () => {
    const { stdout, exitCode } = await runCli(['stories', '--help']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('stories');
    expect(stdout).toContain('--iteration-id');
    expect(stdout).toContain('--no-sub-iteration');
    expect(stdout).toContain('--limit');
    expect(stdout).toContain('--page');
  });
});

describe('tapd stories without iteration-id', () => {
  test('errors and hints --help', async () => {
    const { stdout, stderr, exitCode } = await runCli(['stories']);

    expect(exitCode).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toContain('--iteration-id');
    expect(stderr).toContain('--help');
  });
});

describe('tapd stories with credentials', () => {
  test('outputs data JSON for an iteration', async () => {
    const hasEnv =
      process.env.TAPD_API_USER &&
      process.env.TAPD_API_PASSWORD &&
      process.env.TAPD_WORKSPACE_ID;
    if (!hasEnv) return;

    const iterRes = await runCli(['iterations', '--limit', '1', '--page', '1']);
    const iterBody = JSON.parse(iterRes.stdout);
    if (!iterBody.data?.length) return;

    const iterationId = iterBody.data[0].id;
    const { stdout, stderr, exitCode } = await runCli([
      'stories',
      '--iteration-id',
      iterationId,
      '--limit',
      '1',
      '--page',
      '1',
    ]);

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    const body = JSON.parse(stdout);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].id).toBeDefined();
    expect(body.data[0].name).toBeDefined();
    expect(body.data[0].iteration_id).toBe(iterationId);
  });
});
