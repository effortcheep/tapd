import { loadConfig } from '../../config.ts';
import { TapdClient } from '../../client.ts';
import { getAllStories } from '../../stories.ts';
import type { StoriesCliArgs } from '../parse-stories.ts';
import { toStoriesApiParams, validateStoriesArgs } from '../parse-stories.ts';

export async function runStories(args: StoriesCliArgs) {
  const error = validateStoriesArgs(args);
  if (error) throw new Error(error);

  const config = loadConfig();
  const client = new TapdClient(config);
  const data = await getAllStories(client, toStoriesApiParams(args));
  return { data };
}
