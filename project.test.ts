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
    expect(readme).toContain('bun link');
  });
});

describe('package.json scripts', () => {
  test('includes test script', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts.test).toBe('bun test');
    expect(pkg.bin.tapd).toBe('./cli.ts');
  });
});
