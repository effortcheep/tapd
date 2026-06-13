# TAPD CLI 示例

> **认证**：以下示例假设用户已在本地完成认证（`.env` 已配置且 `tapd auth` 通过）。Agent 不应参与认证流程。

## 安装

```bash
# 不安装，直接跑
npx @effortcheep/tapd-cli --help
bunx @effortcheep/tapd-cli --help

# 全局安装
npm install -g @effortcheep/tapd-cli
tapd --help
```

## 迭代查询

```bash
# 全部迭代（自动翻页，可能较慢）
tapd iterations

# 按名称
tapd iterations --name "Y26W23"

# 按日期范围（TAPD 比较语法）
tapd iterations --startdate ">2026-06-08" --enddate "<2026-06-14"

# 快速看几条
tapd iterations --limit 5 | jq '.data[].name'

# 手动分页
tapd iterations --limit 10 --page 2
```

### jq 常用

```bash
# 迭代 id + 名称
tapd iterations --name "Y26W23" | jq '.data[] | {id, name}'

# 当前进行中的迭代（按 status 过滤，字段值因项目配置而异）
tapd iterations | jq '.data[] | select(.status == "open") | {id, name, startdate, enddate}'
```

## 需求查询

```bash
# 某迭代下全部需求（含子迭代）
tapd stories --iteration-id 1143510167001001402

# 不含子迭代
tapd stories --iteration-id 1143510167001001402 --no-sub-iteration

# 配合 jq
tapd stories --iteration-id 1143510167001001402 \
  | jq '.data[] | {id, name, status, owner, priority}'

# 统计数量
tapd stories --iteration-id 1143510167001001402 | jq '.data | length'
```

## 组合工作流

### 本周迭代下的所有需求

```bash
# 1. 查本周迭代
ITER_JSON=$(tapd iterations --startdate ">2026-06-08" --enddate "<2026-06-14")
echo "$ITER_JSON" | jq '.data[] | {id, name}'

# 2. 取第一个迭代 id 查需求（示例）
ITER_ID=$(echo "$ITER_JSON" | jq -r '.data[0].id')
tapd stories --iteration-id "$ITER_ID" | jq '.data[] | {id, name, status}'
```

### 在脚本中使用

```bash
#!/usr/bin/env bash
set -euo pipefail

# 前提：用户已自行完成认证
tapd auth > /dev/null || { echo "请先运行 tapd auth"; exit 1; }

ITER_ID=$(tapd iterations --name "Y26W23" | jq -r '.data[0].id')
tapd stories --iteration-id "$ITER_ID" | jq '.data'
```

## 本地开发

```bash
bun install
bun cli.ts iterations --limit 3
bun run build && node dist/cli.js stories --iteration-id <id> --limit 5
```

## curl 等价（调试用，需用户自行配置 .env）

```bash
set -a && source .env && set +a

curl -u "$TAPD_API_USER:$TAPD_API_PASSWORD" \
  "$TAPD_BASE_URL/iterations?workspace_id=$TAPD_WORKSPACE_ID&name=Y26W23"

curl -u "$TAPD_API_USER:$TAPD_API_PASSWORD" \
  "$TAPD_BASE_URL/stories?workspace_id=$TAPD_WORKSPACE_ID&iteration_id=ITERATION_ID&include_sub_iteration=1"
```
