# PRD: TAPD CLI 命令行工具

## Problem Statement

当前 TAPD 项目以 Bun 脚本方式运行（`bun run index.ts`、`bun run this-week.ts`），输出格式不统一（文本摘要 vs JSON），缺少标准的子命令结构和参数说明。用户无法通过命令行快速完成「验证凭证 → 查迭代 → 查需求」的固定流程，也难以在脚本/管道中稳定消费输出（如配合 `jq`）。

用户需要一个可安装的 CLI 工具，提供清晰的子命令、`--help` 说明，以及统一的 JSON 输出契约。

## Solution

将项目重构为单一 CLI 入口 `tapd`，注册为可执行命令（`package.json` bin）。提供三个子命令：

1. **`tapd auth`** — 验证 `.env` 中已有 TAPD API 凭证是否有效
2. **`tapd iterations`** — 按条件查询迭代，支持 `name`、`startdate`、`enddate` 筛选
3. **`tapd stories`** — 按 `iteration_id` 查询需求（必填）

所有查询命令默认自动翻页获取全量数据，输出拍平后的完整 JSON；成功时仅 stdout 输出 JSON，失败时 stderr 输出人类可读错误并以非 0 退出。

每个命令及顶层入口均提供 `--help` / `-h` 说明。

## User Stories

1. As a 开发者, I want to run `tapd auth` to verify my API credentials, so that I can confirm `.env` is configured correctly before querying data.
2. As a 开发者, I want `tapd auth` to output JSON on success, so that I can use the result in automation scripts.
3. As a 开发者, I want credentials to remain in `.env` / environment variables, so that I do not need interactive login and CI pipelines work without prompts.
4. As a 开发者, I want to install the CLI via `package.json` bin as `tapd`, so that I can invoke it from anywhere after linking or global install.
5. As a 开发者, I want to run `bun run cli.ts` during local development, so that I can test without global install.
6. As a 开发者, I want `tapd --help` to list all available subcommands with brief descriptions, so that I can discover functionality quickly.
7. As a 开发者, I want `tapd auth --help` to explain what the command does and what JSON shape it returns, so that I understand the output contract.
8. As a 开发者, I want `tapd iterations --help` to document all supported flags (`--name`, `--startdate`, `--enddate`, `--limit`, `--page`), so that I know how to filter and paginate.
9. As a 开发者, I want `tapd stories --help` to document required `--iteration-id` and optional pagination/sub-iteration flags, so that I avoid missing required parameters.
10. As a 开发者, I want `--help` on an unknown command to suggest valid commands, so that typos are easy to recover from.
11. As a 开发者, I want `tapd iterations --name "Y26W23"` to filter iterations by title, so that I can find a specific sprint by name.
12. As a 开发者, I want `tapd iterations --startdate` and `--enddate` to pass values directly to TAPD API, so that I can use TAPD native query operators (`>`, `<`, `~`).
13. As a 开发者, I want `tapd iterations` with no filters to return all iterations in the workspace, so that I can get a full list when needed.
14. As a 开发者, I want iteration results as flattened JSON `{ "data": [ {...}, ... ] }` with all API fields, so that downstream tools receive complete entity data.
15. As a 开发者, I want `tapd stories --iteration-id <id>` to return all stories under that iteration, so that I can inspect sprint backlog programmatically.
16. As a 开发者, I want `iteration_id` to be required for `tapd stories`, so that I do not accidentally fetch the entire project's stories.
17. As a 开发者, I want sub-iteration stories included by default (`include_sub_iteration=1`), so that nested iteration data is not missed.
18. As a 开发者, I want `--no-sub-iteration` to disable sub-iteration inclusion, so that I can get only direct stories when needed.
19. As a 开发者, I want query commands to auto-paginate by default (limit=200 per page), so that I receive complete datasets without manual paging.
20. As a 开发者, I want `--limit` and `--page` flags to override auto-pagination, so that I can fetch a specific page for debugging or large datasets.
21. As a 开发者, I want successful command output to go only to stdout as valid JSON, so that I can pipe to `jq` reliably.
22. As a 开发者, I want errors to go to stderr as human-readable messages with non-zero exit code, so that pipelines fail clearly without polluting stdout JSON.
23. As a 开发者, I want missing `.env` variables to produce a clear error mentioning `.env.example`, so that setup mistakes are obvious.
24. As a 开发者, I want TAPD API errors (status ≠ 1) surfaced as readable stderr messages, so that I can diagnose permission or parameter issues.
25. As a 开发者, I want the SDK layer (`TapdClient`, `getStories`, `getIterations`) to remain importable as a library, so that programmatic use is still possible alongside CLI.
26. As a 开发者, I want standalone scripts (`this-week.ts`, `workflow.ts`, `date.ts`) removed, so that the project has a single CLI entry and less duplication.
27. As a 开发者, I want `index.ts` to serve only as the library export surface without a demo `main()`, so that library and CLI concerns are separated.
28. As a 运维/脚本编写者, I want `tapd iterations --startdate ">2026-06-08" --enddate "<2026-06-14"` to find iterations overlapping a date range, so that I can query by week without custom scripts.
29. As a 脚本编写者, I want consistent JSON key naming (`data` array wrapper), so that all three commands follow the same output schema.
30. As a 新用户, I want README updated with CLI usage and help examples, so that onboarding does not require reading source code.

## Implementation Decisions

### CLI 入口与命令结构

- 新增 CLI 入口模块，通过 `package.json` 的 `bin` 字段注册为 `tapd` 可执行命令。
- 子命令：`auth`、`iterations`、`stories`（英文复数，与 TAPD API 资源名一致）。
- 无子命令或未知子命令时：打印顶层 `--help` 并以非 0 退出。
- 参数解析使用 Bun 内置 `parseArgs`（或等价轻量方案），不引入重型 CLI 框架。

### `--help` 设计

三层 help 结构：

| 层级 | 触发 | 内容 |
|------|------|------|
| 顶层 | `tapd`、`tapd --help`、`tapd -h` | 工具简介、环境变量说明、子命令列表及一行描述 |
| 子命令 | `tapd <cmd> --help` | 命令说明、参数表（flag / 类型 / 是否必填 / 说明）、输出 JSON 示例、TAPD 文档链接 |
| 缺参 | 如 `tapd stories` 无 `--iteration-id` | stderr 提示缺少必填参数，并建议运行 `tapd stories --help` |

**顶层 help 示例结构：**

```
tapd - TAPD Open API CLI

环境变量（.env）:
  TAPD_API_USER       API 账号
  TAPD_API_PASSWORD   API 口令
  TAPD_WORKSPACE_ID   项目 ID
  TAPD_BASE_URL       可选，默认 https://api.tapd.cn

命令:
  auth         验证 API 凭证
  iterations   查询迭代
  stories      查询需求（需指定迭代）

运行 tapd <command> --help 查看子命令详情。
```

**`tapd iterations --help` 须说明：**
- `--name`：标题，支持 TAPD 模糊匹配
- `--startdate` / `--enddate`：日期筛选，**原样透传** TAPD 查询语法（支持 `>2026-06-08`、`<2026-06-14`、`2026-06-01~2026-06-30`）
- `--limit` / `--page`：分页；默认自动翻页拉取全量，指定 `--page` 时只取该页

**`tapd stories --help` 须说明：**
- `--iteration-id`：**必填**
- `--no-sub-iteration`：默认包含子迭代需求，加此 flag 关闭
- `--limit` / `--page`：同 iterations

### 认证命令 (`auth`)

- 读取 `.env` 中 `TAPD_API_USER`、`TAPD_API_PASSWORD`、`TAPD_WORKSPACE_ID`。
- 调用 TAPD `/quickstart/testauth` 验证凭证。
- 成功 stdout JSON：

```json
{
  "ok": true,
  "api_user": "<账号>",
  "workspace_id": "<项目ID>"
}
```

- 不做交互式登录、不写入 `.env`。

### 迭代查询命令 (`iterations`)

- 调用 TAPD `GET /iterations`，自动注入 `workspace_id`。
- 支持筛选参数：`name`、`startdate`、`enddate`（CLI flag 值原样作为 query param）。
- 不传 `fields`，返回 API 全字段。
- 响应拍平：`{ "Story": {...} }` → 直接对象，包装为 `{ "data": [...] }`。
- 分页：默认 `limit=200` 循环翻页直到返回条数 < limit；若用户指定 `--page`，则只请求该页且不自动翻页。

### 需求查询命令 (`stories`)

- 调用 TAPD `GET /stories`，自动注入 `workspace_id`。
- `--iteration-id` 必填，缺失时 stderr 报错并 exit 1。
- 默认 `include_sub_iteration=1`；`--no-sub-iteration` 时设为 `0`。
- 不传 `fields`，全字段返回，拍平为 `{ "data": [...] }`。
- 分页策略同 `iterations`。

### SDK 层保留

- 保留现有模块：`TapdClient`、`config`、`getStories`、`getIterations`、`unwrapTAPDList`、类型定义。
- CLI 层调用 SDK，不重复实现 HTTP 逻辑。
- 在 SDK 的 stories/iterations 模块中抽取可复用的「自动翻页拉取全量」函数，供 CLI 使用。
- `index.ts` 仅作库导出入口，移除 demo `main()`。

### 清理

- 删除 `this-week.ts`、`workflow.ts`、`date.ts`（业务逻辑由 CLI 参数组合替代）。
- 更新 `README.md`：CLI 安装、三个命令示例、help 用法。

### 错误处理契约

| 场景 | stdout | stderr | exit code |
|------|--------|--------|-----------|
| 成功 | JSON | 空 | 0 |
| 缺环境变量 | 空 | `缺少环境变量 TAPD_API_USER，请复制 .env.example 为 .env 并填写` | 1 |
| 缺必填参数 | 空 | `缺少必填参数 --iteration-id，运行 tapd stories --help 查看用法` | 1 |
| TAPD API 错误 | 空 | `TAPD API 错误: <info>` | 1 |
| 网络错误 | 空 | `[tapd] GET /stories failed: ECONNRESET` 等 | 1 |
| `--help` | help 文本 | 空 | 0 |

## Testing Decisions

### 测试原则

- 只测**外部可观察行为**（stdout/stderr 内容、exit code、help 文本），不测内部 parseArgs 实现细节。
- 优先使用**最高层接缝**：直接对 CLI 入口进程做集成测试（`Bun.spawn` 运行 `cli.ts`），避免 mock HTTP 层除非必要。
- 需要网络的分支（真实 TAPD 调用）与纯本地分支（help、缺参、缺 env）分开。

### 建议测试接缝（请确认是否符合预期）

| 接缝 | 测什么 | 是否需要网络 |
|------|--------|-------------|
| **CLI 进程**（推荐主接缝） | 各命令 stdout JSON 结构、exit code、help 输出 | help/缺参/缺 env 不需要；auth/iterations/stories 可选集成测试 |
| **SDK 翻页函数** | 给定 mock client 或 stub，验证多页合并逻辑 | 不需要 |
| **unwrapTAPDList** | 拍平 `[{ Story: {} }]` 输入 | 不需要（已有纯函数，适合单元测） |

**推荐测试矩阵（无网络部分必做）：**

1. `tapd --help` → exit 0，输出含三个子命令名
2. `tapd auth --help` / `tapd iterations --help` / `tapd stories --help` → exit 0，输出含对应 flag 说明
3. `tapd unknown` → exit 1，stderr 提示未知命令
4. `tapd stories`（无 `--iteration-id`）→ exit 1，stderr 提示缺参并指向 `--help`
5. 无 `.env` 时 `tapd auth` → exit 1，stderr 提示缺少环境变量

**可选集成测试（有 `.env` / CI secret 时）：**

6. `tapd auth` → exit 0，stdout JSON `ok: true`
7. `tapd iterations --limit 1` → exit 0，stdout JSON `data` 为数组
8. `tapd stories --iteration-id <已知ID>` → exit 0，stdout JSON `data` 为数组

### 测试工具

- 使用 Bun 内置 `bun:test`。
- 测试文件放在项目测试目录，命名与 CLI 命令对应。

### Prior art

- 当前项目无测试文件；`unwrapTAPDList`、`TapdClient.unwrap` 为现有可复用纯逻辑接缝。
- HTTP 层已有 axios interceptor 打日志，测试时 stderr 可能含 `[tapd]` 日志，断言应只针对业务错误消息。

## Out of Scope

- 交互式登录 / 写入 `.env` 的 `auth --setup` 流程
- `tapd this-week` 或任何「本周」硬编码业务命令
- 需求的 `name`、`status` 等除 `iteration_id` 外的筛选参数
- 迭代的 `status`、`creator` 等除 `name`/`startdate`/`enddate` 外的筛选参数
- POST / 创建 / 更新类写操作
- 输出格式选项（如 `--format table`、`--yaml`）
- 全局 `--json` flag（默认即 JSON，无需开关）
- stderr JSON 错误格式
- Shell 补全（bash/zsh completion）
- 发布到 npm registry

## Further Notes

- TAPD 时间查询语法参考：[使用必读](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/%E4%BD%BF%E7%94%A8%E5%BF%85%E8%AF%BB.html)
- 认证说明：[API 配置指引](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html)
- 迭代 API：[get_iterations](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html)
- 需求 API：[get_stories](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/story/get_stories.html)
- 现有 HTTP 客户端已关闭 keep-alive，CLI 层应继续复用，避免 ECONNRESET。
- `auth` 成功 JSON 中的 `api_password` 来自 TAPD testauth 响应时**不应**输出到 CLI（仅输出 `ok`、`api_user`、`workspace_id`），避免泄漏。
