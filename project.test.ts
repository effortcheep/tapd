import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = import.meta.dir;

describe('legacy scripts removed', () => {
  test('this-week.ts no longer exists', () => {
    expect(existsSync(join(ROOT, 'this-week.ts'))).toBe(false);
  });

  test('workflow.ts no longer exists', () => {
    expect(existsSync(join(ROOT, 'workflow.ts'))).toBe(false);
  });

  test('date.ts no longer exists', () => {
    expect(existsSync(join(ROOT, 'date.ts'))).toBe(false);
  });
});

describe('README documents CLI', () => {
  test('mentions all three commands and help usage', () => {
    const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');

    expect(readme).toContain('tapd auth');
    expect(readme).toContain('tapd iterations');
    expect(readme).toContain('tapd stories');
    expect(readme).toContain('--help');
    expect(readme).toContain('npx @effortcheep/tapd-cli');
    expect(readme).toContain('bunx @effortcheep/tapd-cli');
  });
});

describe('package.json scripts', () => {
  test('is configured for npm publish', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('@effortcheep/tapd-cli');
    expect(pkg.scripts.build).toBe('bun scripts/build-cli.ts');
    expect(pkg.scripts.test).toBe('bun test');
    expect(pkg.bin.tapd).toBe('./dist/cli.js');
    expect(pkg.private).toBeUndefined();
  });
});

describe('built CLI for Node', () => {
  test('dist/cli.js has node shebang and responds to --help', async () => {
    const cliPath = join(ROOT, 'dist/cli.js');
    if (!existsSync(cliPath)) return;

    const head = readFileSync(cliPath, 'utf8').split('\n')[0];
    expect(head).toBe('#!/usr/bin/env node');

    const proc = Bun.spawn(['node', cliPath, '--help'], { stdout: 'pipe', stderr: 'pipe' });
    const [stdout, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      proc.exited,
    ]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('auth');
  });
});
