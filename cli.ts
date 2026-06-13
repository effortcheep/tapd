#!/usr/bin/env bun

import { AUTH_HELP, ITERATIONS_HELP, STORIES_HELP, TOP_HELP } from './cli/help.ts';

function wantsHelp(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}

export async function run(args: string[]): Promise<number> {
  if (args.length === 0 || (args.length === 1 && wantsHelp(args))) {
    console.log(TOP_HELP);
    return 0;
  }

  const [command, ...rest] = args;

  if (command === 'auth') {
    if (wantsHelp(rest)) {
      console.log(AUTH_HELP);
      return 0;
    }
    try {
      const { runAuth } = await import('./cli/commands/auth.ts');
      const result = await runAuth();
      console.log(JSON.stringify(result));
      return 0;
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      return 1;
    }
  }

  if (command === 'iterations') {
    if (wantsHelp(rest)) {
      console.log(ITERATIONS_HELP);
      return 0;
    }
    try {
      const { parseIterationsArgs } = await import('./cli/parse-iterations.ts');
      const { runIterations } = await import('./cli/commands/iterations.ts');
      const result = await runIterations(parseIterationsArgs(rest));
      console.log(JSON.stringify(result));
      return 0;
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      return 1;
    }
  }

  if (command === 'stories') {
    if (wantsHelp(rest)) {
      console.log(STORIES_HELP);
      return 0;
    }
    try {
      const { parseStoriesArgs } = await import('./cli/parse-stories.ts');
      const { runStories } = await import('./cli/commands/stories.ts');
      const result = await runStories(parseStoriesArgs(rest));
      console.log(JSON.stringify(result));
      return 0;
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      return 1;
    }
  }

  console.error(`未知命令: ${command}`);
  return 1;
}

if (import.meta.main) {
  const code = await run(process.argv.slice(2));
  process.exit(code);
}
