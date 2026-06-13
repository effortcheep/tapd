import { chmodSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const outdir = join(root, 'dist');

const result = await Bun.build({
  entrypoints: [join(root, 'cli.ts')],
  outdir,
  target: 'node',
});

if (!result.success || result.outputs.length === 0) {
  console.error(result.logs);
  process.exit(1);
}

const outfile = result.outputs[0]!.path;
let code = readFileSync(outfile, 'utf8').replace(/^#![^\n]*\n/, '');
writeFileSync(outfile, `#!/usr/bin/env node\n${code}`);
chmodSync(outfile, 0o755);

console.log(`built ${outfile}`);
