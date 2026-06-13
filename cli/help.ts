export const TOP_HELP = `tapd - TAPD Open API CLI

环境变量（.env）:
  TAPD_API_USER       API 账号
  TAPD_API_PASSWORD   API 口令
  TAPD_WORKSPACE_ID   项目 ID
  TAPD_BASE_URL       可选，默认 https://api.tapd.cn

命令:
  auth         登录并验证 API 凭证
  iterations   查询迭代
  stories      查询需求（需指定迭代）

运行 tapd <command> --help 查看子命令详情。
`;

export const AUTH_HELP = `tapd auth - 登录并验证 TAPD API 凭证

无 .env 时进入交互式登录，依次输入 API 账号、口令、项目 ID。
验证成功后自动写入当前目录 .env，后续命令可直接使用。

若已配置 .env 或环境变量，则直接验证，不重复提示输入。

成功时 stdout 输出 JSON:
  { "ok": true, "api_user": "<账号>", "workspace_id": "<项目ID>", "saved": true }
  saved 字段仅交互登录首次写入 .env 时出现。

失败时 stderr 输出错误信息，exit 1。

文档: https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html
`;

export const ITERATIONS_HELP = `tapd iterations - 查询迭代

参数:
  --name <string>        标题（支持 TAPD 模糊匹配）
  --startdate <string>   开始时间（原样透传 TAPD 语法，如 >2026-06-08）
  --enddate <string>     结束时间（原样透传 TAPD 语法，如 <2026-06-14）
  --limit <number>       每页条数，默认 200；与 --page 联用时不自动翻页
  --page <number>        指定页码；指定后只返回该页，不自动翻页

默认自动翻页拉取全量数据。成功时 stdout 输出:
  { "data": [ { "id": "...", "name": "...", ... } ] }

需已登录（tapd auth）或配置 .env。

文档: https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html
`;

export const STORIES_HELP = `tapd stories - 查询需求

参数:
  --iteration-id <id>    迭代 ID（必填）
  --no-sub-iteration     不包含子迭代需求（默认包含）
  --limit <number>       每页条数，默认 200；与 --page 联用时不自动翻页
  --page <number>        指定页码；指定后只返回该页，不自动翻页

默认自动翻页拉取全量数据。成功时 stdout 输出:
  { "data": [ { "id": "...", "name": "...", ... } ] }

需已登录（tapd auth）或配置 .env。

文档: https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/story/get_stories.html
`;
