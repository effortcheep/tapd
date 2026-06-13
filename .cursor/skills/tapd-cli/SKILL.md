---
name: tapd-cli
description: >-
  操作 TAPD Open API 命令行工具 @effortcheep/tapd-cli：查询迭代与需求。
  在用户提到 tapd CLI、TAPD 迭代/需求查询、npx/bunx tapd、本周迭代、
  查 stories/iterations，或需要用命令行拉取 TAPD 数据时使用。
---

# TAPD CLI 使用指南

## 快速决策

```
需要 TAPD 数据？
├─ 先检测是否已认证 → 未认证则停止，提示用户自行认证
├─ 找迭代 → tapd iterations [--name | --startdate | --enddate]
└─ 找需求 → 先拿 iteration id，再 tapd stories --iteration-id <id>
```

## 安装与运行

| 场景 | 命令 |
|------|------|
| 一次性（Node） | `npx @effortcheep/tapd-cli <command>` |
| 一次性（Bun） | `bunx @effortcheep/tapd-cli <command>` |
| 全局安装 | `npm i -g @effortcheep/tapd-cli` → `tapd <command>` |
| 仓库本地开发 | `bun cli.ts <command>` 或 `bun run build && node dist/cli.js <command>` |

要求：**Node.js 18+**（发布产物）或 **Bun**（源码开发）。

## 前置检查：认证状态（Agent 必做）

执行任何查询前，先检测用户是否已完成认证：

```bash
tapd auth
```

- **exit 0** 且 stdout 含 `"ok":true` → 已认证，可继续查询
- **exit 1** 或报「未配置 TAPD 凭证」→ **立即停止**，不要继续查询

### 未认证时：只提示用户自行处理

向用户说明需在**自己的终端**完成认证，然后重试。示例话术：

> 检测到尚未配置 TAPD 凭证。请在你的终端执行 `tapd auth` 完成交互式登录，或参考 `.env.example` 手动创建 `.env` 后运行 `tapd auth` 验证。完成后告诉我，我再继续查询。

### Agent 禁止事项

- **禁止**向用户索要 API 账号、口令、项目 ID
- **禁止**代用户执行交互式 `tapd auth`（非 TTY 环境无法完成）
- **禁止**帮用户创建或填写 `.env`（含让用户把凭证粘贴到对话里）
- **禁止**读取、展示 `.env` 中的敏感值
- **禁止**猜测或编造凭证

认证是用户自行完成的操作，Agent 只负责检测状态与执行查询。

## 输出契约

| 情况 | stdout | stderr | exit |
|------|--------|--------|------|
| 查询成功 | `{"data":[...]}` JSON | — | 0 |
| 失败 | — | 人类可读错误 | 1 |
| 帮助 | 帮助文本 | — | 0 |

**解析规则**：只解析 **stdout** 的 JSON；不要把 stderr 当数据。

```bash
tapd iterations --name "Y26W23" | jq '.data[].id'
```

## 命令参考

### `tapd iterations`

| 参数 | 说明 |
|------|------|
| `--name <string>` | 迭代标题（TAPD 模糊匹配） |
| `--startdate <string>` | 开始时间，TAPD 语法原样透传，如 `>2026-06-08` |
| `--enddate <string>` | 结束时间，如 `<2026-06-14` |
| `--limit <n>` | 每页条数，默认 200 |
| `--page <n>` | 指定页码；**指定后不再自动翻页** |

默认**自动翻页**拉全量。快速探测时加 `--limit 5`。

### `tapd stories`

| 参数 | 说明 |
|------|------|
| `--iteration-id <id>` | **必填**，迭代 ID |
| `--no-sub-iteration` | 不含子迭代需求（默认包含） |
| `--limit <n>` | 每页条数，默认 200 |
| `--page <n>` | 指定页码；指定后不再自动翻页 |

## 标准工作流

### 1. 按名称查迭代 → 查需求

```bash
# 1) 找迭代
tapd iterations --name "Y26W23" | jq '.data[] | {id, name, startdate, enddate}'

# 2) 用 id 查需求
tapd stories --iteration-id 1143510167001001402 | jq '.data[] | {id, name, status, owner}'
```

### 2. 按日期范围查本周迭代

```bash
tapd iterations --startdate ">2026-06-08" --enddate "<2026-06-14"
```

日期运算符遵循 [TAPD 使用必读](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/%E4%BD%BF%E7%94%A8%E5%BF%85%E8%AF%BB.html)。

### 3. 只查主迭代需求（不含子迭代）

```bash
tapd stories --iteration-id <id> --no-sub-iteration
```

### 4. 手动分页（大数据量）

```bash
tapd iterations --limit 50 --page 1
tapd stories --iteration-id <id> --limit 100 --page 2
```

## Agent 执行清单

```
- [ ] 运行 tapd auth 检测认证；未通过则提示用户自行认证并停止
- [ ] 不向用户索要任何凭证
- [ ] 选对命令：iterations 找迭代，stories 找需求
- [ ] stories 必须先有 iteration-id
- [ ] 用 --limit 做试探，避免不必要的大响应
- [ ] 解析 stdout JSON，检查 exit code
```

## 常见错误

| 错误信息 | 原因 | Agent 处理 |
|----------|------|------------|
| 未配置 TAPD 凭证… | 用户未认证 | 提示用户自行 `tapd auth`，**停止** |
| 缺少必填参数 --iteration-id | stories 未传迭代 | 先 `iterations` 拿 id |
| TAPD API 错误: … | 凭证无效或 API 拒绝 | 提示用户检查 `.env` 并自行重新 `tapd auth`，**停止** |
| 未知命令: … | 命令拼写错误 | `tapd --help` |

## 帮助命令

```bash
tapd --help
tapd iterations --help
tapd stories --help
```

## 延伸阅读

- 更多命令示例：[examples.md](examples.md)
- 字段说明与 API 链接：[reference.md](reference.md)
- 项目 README：仓库根目录 `README.md`
