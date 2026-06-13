import { loadConfig } from '../../config.ts';
import { TapdClient } from '../../client.ts';
import { getAllIterations } from '../../iterations.ts';

export interface IterationsQuery {
  name?: string;
  startdate?: string;
  enddate?: string;
  limit?: number;
  page?: number;
}

export async function runIterations(query: IterationsQuery = {}) {
  const config = loadConfig();
  const client = new TapdClient(config);
  const data = await getAllIterations(client, query);
  return { data };
}
