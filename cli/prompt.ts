import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { CredentialInput } from './credentials.ts';

async function question(rl: readline.Interface, label: string): Promise<string> {
  const answer = await rl.question(label);
  return answer.trim();
}

/** 交互式采集 TAPD 凭证（账号、口令、项目 ID） */
export async function promptCredentials(): Promise<CredentialInput> {
  const rl = readline.createInterface({ input, output });

  try {
    output.write('\n未检测到 TAPD 凭证，请登录：\n');
    const apiUser = await question(rl, 'API 账号: ');
    const apiPassword = await question(rl, 'API 口令: ');
    const workspaceId = await question(rl, '项目 ID: ');

    if (!apiUser || !apiPassword || !workspaceId) {
      throw new Error('账号、口令、项目 ID 均不能为空');
    }

    return { apiUser, apiPassword, workspaceId };
  } finally {
    rl.close();
  }
}
