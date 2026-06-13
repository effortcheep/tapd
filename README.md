# tapd

TAPD Open API 命令行工具与 TypeScript SDK，基于 [Bun](https://bun.com) 运行。

## 安装

```bash
bun install
bun link          # 可选，全局注册 tapd 命令
```

本地开发可直接运行：

```bash
bun cli.ts <command>
```

## 快速开始

首次使用，在终端登录（无 `.env` 时会交互式输入账号、口令、项目 ID，验证成功后写入 `.env`）：

```bash
tapd auth
```

已有 `.env` 时直接验证：

```bash
cp .env.example .env   # 手动配置时
tapd auth
```

## CLI 命令

所有查询命令成功时 stdout 输出 JSON，可配合 `jq`：

```bash
tapd iterations --name "Y26W23" | jq '.data[].name'
```

### `tapd auth` — 登录并验证凭证

```bash
tapd auth
tapd auth --help
```

成功输出：

```json
{ "ok": true, "api_user": "...", "workspace_id": "...", "saved": true }
```

`saved` 仅在交互式登录首次写入 `.env` 时出现。

### `tapd iterations` — 查询迭代

```bash
# 全部迭代（自动翻页）
tapd iterations

# 按名称
tapd iterations --name "Y26W23"

# 按日期（TAPD 语法原样透传）
tapd iterations --startdate ">2026-06-08" --enddate "<2026-06-14"

# 手动分页
tapd iterations --limit 10 --page 2

tapd iterations --help
```

### `tapd stories` — 查询需求

```bash
# 某迭代下全部需求（默认含子迭代，自动翻页）
tapd stories --iteration-id 1143510167001001402

# 不含子迭代
tapd stories --iteration-id 1143510167001001402 --no-sub-iteration

tapd stories --help
```

### 查看帮助

```bash
tapd --help
tapd auth --help
tapd iterations --help
tapd stories --help
```

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `TAPD_API_USER` | API 账号 |
| `TAPD_API_PASSWORD` | API 口令 |
| `TAPD_WORKSPACE_ID` | 项目 ID |
| `TAPD_BASE_URL` | 可选，默认 `https://api.tapd.cn` |

认证说明：[API 配置指引](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html)

## 测试

```bash
bun test
```

## SDK 用法

```ts
import { getTapd, getAllIterations, getAllStories } from './index.ts';

const client = getTapd();

const iterations = await getAllIterations(client, { name: 'Y26W23' });
const stories = await getAllStories(client, {
  iteration_id: '1143510167001001402',
  include_sub_iteration: '1',
});
```

## curl 示例

```bash
set -a && source .env && set +a

curl -u "$TAPD_API_USER:$TAPD_API_PASSWORD" \
  "$TAPD_BASE_URL/quickstart/testauth"

curl -u "$TAPD_API_USER:$TAPD_API_PASSWORD" \
  "$TAPD_BASE_URL/iterations?workspace_id=$TAPD_WORKSPACE_ID"

curl -u "$TAPD_API_USER:$TAPD_API_PASSWORD" \
  "$TAPD_BASE_URL/stories?workspace_id=$TAPD_WORKSPACE_ID&iteration_id=ITERATION_ID&include_sub_iteration=1"
```

## API 文档

- [获取需求](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/story/get_stories.html)
- [获取迭代](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html)
- [使用必读（查询语法、分页等）](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/%E4%BD%BF%E7%94%A8%E5%BF%85%E8%AF%BB.html)
