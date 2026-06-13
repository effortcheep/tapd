# TAPD CLI 参考

## 包信息

| 项 | 值 |
|----|-----|
| npm 包名 | `@effortcheep/tapd-cli` |
| 二进制名 | `tapd` |
| 入口 | `dist/cli.js`（Node 18+） |
| 源码入口 | `cli.ts`（Bun） |

## 认证检测（Agent 用）

Agent 通过以下命令判断用户是否已认证，**不参与认证过程**：

```bash
tapd auth
# 已认证：exit 0，stdout 含 "ok":true
# 未认证：exit 1，stderr 提示未配置凭证
```

未认证时，提示用户在自己的终端执行 `tapd auth` 或参考 `.env.example` 手动配置，完成后重试。

## 环境变量

凭证由用户在本地 `.env` 中配置，Agent 不得读取或索要：

| 变量 | 必填 | 说明 |
|------|------|------|
| `TAPD_API_USER` | 是 | API 账号 |
| `TAPD_API_PASSWORD` | 是 | API 口令 |
| `TAPD_WORKSPACE_ID` | 是 | 项目 ID（workspace） |
| `TAPD_BASE_URL` | 否 | 默认 `https://api.tapd.cn` |

`.env` 从**当前工作目录**加载。配置说明见 [API 配置指引](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html)。

## 输出 JSON 结构

### 查询成功

```json
{
  "data": [
    { "id": "...", "name": "...", "...": "..." }
  ]
}
```

`data` 为数组；字段与 TAPD Open API 返回一致。

## 分页行为

| 场景 | 行为 |
|------|------|
| 未指定 `--page` | 自动翻页，每页默认 200 条，直到取完 |
| 指定 `--page` | 只返回该页，不继续翻页 |
| `--limit` | 控制每页大小；与 `--page` 联用 |

## 迭代（Iteration）常用字段

| 字段 | 说明 |
|------|------|
| `id` | 迭代 ID，供 `stories --iteration-id` 使用 |
| `name` | 迭代名称，如 `Y26W23` |
| `startdate` / `enddate` | 起止日期 |
| `status` | 迭代状态 |
| `workspace_id` | 项目 ID |

API：[get_iterations](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html)

## 需求（Story）常用字段

| 字段 | 说明 |
|------|------|
| `id` | 需求 ID |
| `name` | 标题 |
| `status` | 状态 |
| `owner` | 处理人 |
| `creator` | 创建人 |
| `iteration_id` | 所属迭代 |
| `priority` / `priority_label` | 优先级 |
| `begin` / `due` | 计划起止 |
| `custom_field_*` | 自定义字段 |

API：[get_stories](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/story/get_stories.html)

## TAPD 查询语法

`--startdate`、`--enddate` 等参数**原样透传**给 TAPD API，支持比较运算符：

- `>2026-06-08` 大于
- `<2026-06-14` 小于
- 可组合用于日期范围筛选

详见：[使用必读](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/%E4%BD%BF%E7%94%A8%E5%BF%85%E8%AF%BB.html)

## stories API 映射

| CLI 参数 | API 参数 |
|----------|----------|
| `--iteration-id` | `iteration_id` |
| （默认） | `include_sub_iteration=1` |
| `--no-sub-iteration` | `include_sub_iteration=0` |
| `--limit` | `limit` |
| `--page` | `page` |

## 项目内 SDK（可选）

CLI 底层 SDK 也可在 TypeScript 中直接调用：

```ts
import { getTapd, getAllIterations, getAllStories } from './index.ts';

const client = getTapd();
const iterations = await getAllIterations(client, { name: 'Y26W23' });
const stories = await getAllStories(client, {
  iteration_id: '1143510167001001402',
  include_sub_iteration: '1',
});
```

Agent 优先用 CLI（无需改代码、输出稳定 JSON）；仅在需要集成到脚本/服务时考虑 SDK。

## 错误与退出码

- 所有失败：`stderr` 打印错误信息，`exit 1`
- 凭证/API 错误、参数缺失、未知命令均走同一模式
- 成功查询：`stdout` JSON，`exit 0`
