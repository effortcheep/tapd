import { parseArgs } from 'node:util';

export interface StoriesCliArgs {
  iterationId?: string;
  noSubIteration?: boolean;
  limit?: number;
  page?: number;
}

export function parseStoriesArgs(argv: string[]): StoriesCliArgs {
  const { values } = parseArgs({
    args: argv,
    options: {
      'iteration-id': { type: 'string' },
      'no-sub-iteration': { type: 'boolean' },
      limit: { type: 'string' },
      page: { type: 'string' },
    },
    allowPositionals: false,
    strict: false,
  });

  const result: StoriesCliArgs = {};
  if (typeof values['iteration-id'] === 'string') {
    result.iterationId = values['iteration-id'];
  }
  if (values['no-sub-iteration'] === true) {
    result.noSubIteration = true;
  }
  if (typeof values.limit === 'string') result.limit = Number(values.limit);
  if (typeof values.page === 'string') result.page = Number(values.page);
  return result;
}

export function validateStoriesArgs(args: StoriesCliArgs): string {
  if (!args.iterationId?.trim()) {
    return '缺少必填参数 --iteration-id，运行 tapd stories --help 查看用法';
  }
  return '';
}

export function toStoriesApiParams(args: StoriesCliArgs) {
  return {
    iteration_id: args.iterationId!.trim(),
    include_sub_iteration: args.noSubIteration ? '0' : '1',
    limit: args.limit,
    page: args.page,
  };
}
