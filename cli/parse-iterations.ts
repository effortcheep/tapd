import { parseArgs } from 'node:util';

export interface IterationsCliArgs {
  name?: string;
  startdate?: string;
  enddate?: string;
  limit?: number;
  page?: number;
}

export function parseIterationsArgs(argv: string[]): IterationsCliArgs {
  const { values } = parseArgs({
    args: argv,
    options: {
      name: { type: 'string' },
      startdate: { type: 'string' },
      enddate: { type: 'string' },
      limit: { type: 'string' },
      page: { type: 'string' },
    },
    allowPositionals: false,
    strict: false,
  });

  const result: IterationsCliArgs = {};
  if (typeof values.name === 'string') result.name = values.name;
  if (typeof values.startdate === 'string') result.startdate = values.startdate;
  if (typeof values.enddate === 'string') result.enddate = values.enddate;
  if (typeof values.limit === 'string') result.limit = Number(values.limit);
  if (typeof values.page === 'string') result.page = Number(values.page);
  return result;
}
