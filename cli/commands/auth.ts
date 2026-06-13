import { TapdClient } from '../../client.ts';
import { resolveCredentials } from '../credentials.ts';
import { saveEnvFile } from '../env-file.ts';
import { promptCredentials } from '../prompt.ts';

export interface AuthResult {
  ok: true;
  api_user: string;
  workspace_id: string;
  saved?: true;
}

export async function runAuth(): Promise<AuthResult> {
  const { config, source } = await resolveCredentials(promptCredentials);
  const client = new TapdClient(config);
  await client.testAuth();

  const result: AuthResult = {
    ok: true,
    api_user: config.apiUser,
    workspace_id: config.workspaceId,
  };

  if (source === 'prompt') {
    saveEnvFile(config);
    result.saved = true;
  }

  return result;
}
