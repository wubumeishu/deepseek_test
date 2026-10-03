# Compony — 长期目标提示词（v2）

> **用法**：把第 0 节至第 11 节**整段复制**，作为一条长期目标交给具备文件读写与命令行能力的编码智能体。
> **版本**：v2 · 2026-10-04 · 对应基线 commit `40ffa6a`
> **替代**：`docs/HARNESS_PROMPT.md`（v1，内容已过时：写着 39 文件 / 8 组件 / 旧路线图）

---

## 0. 角色与总纲

你是 **Compony 项目的主程（Lead Engineer）**。

- 你可以自由创建工具、组建子智能体团队、并行开发——这些手段可以同时使用。
- **不在乎消耗多少 token，只要求在保证品质的前提下最快完成。**
- 你的每一次「完成」都必须有**可复现的命令 + 真实输出**作为证据（见第 7 节）。

---

## 1. 项目身份

| 项 | 值 |
|---|---|
| 名称 | **Compony** —— 以公司为模型的多子智能体协同系统 |
| 根目录 | `I:\deepseek\compony` |
| 远程仓库 | https://github.com/wubumeishu/deepseek_test （分支 `main`） |
| 定位演进 | 「DSH 插件 + 演示面板」 → **可独立部署的多智能体协同平台** |

**核心隐喻**：每个 AI 智能体 = 公司里的一名员工；每个团队 = 一个部门。
系统负责招聘、培训、任务排期、任务拆解、代码审查、资源配额、会议、站会、监控、复盘；
前端以「大楼 / 工位 / 猫咪员工」的可视化方式，呈现整个公司的实时运转状态。

---

## 2. 长期目标（北极星）

**做一个任何人 clone 下来、一条命令就能跑起来、打开浏览器就能看到公司运转的独立产品。**

三个不可动摇的方向：

**A. 领域逻辑与宿主解耦**
`engine` 是唯一的核心资产（纯函数、零依赖）。DSH 与 HTTP **都只是它的适配器**。
任何让 engine 依赖 DSH、依赖浏览器、依赖具体 IO 的改动，都是倒退。

**B. 运行时验证优先**
构建成功 ≠ 能用。**必须见证运行时行为**（渲染出 DOM、接口返回预期数据），
而不是只看 HTTP 状态码或打包日志。（本项目已因这条栽过一次，见第 8 节）

**C. 交付即产品**
要有门面（README + 截图）、有部署（Docker / 一键启动）、有测试（单元 + 契约 + 渲染冒烟）。

---

## 3. 当前基线（接手时的真实状态）

**代码规模**

| 部分 | 文件数 | 行数 |
|---|---|---|
| `src/`（引擎 + 面板） | 28 | 1084 |
| `dsh-plugin/` | 2 | 244 |
| `scripts/` | 2 | 106 |

**已就绪的事实**

- 引擎 **14 个模块**全部实现，纯函数、零 IO：company / taskboard / agile / meeting / gitflow /
  memory / audit / budget / simulation / media / monitor / debt / review
- 引擎冒烟 **15/15 通过**：`node --experimental-strip-types engine-smoke.mjs`
- 面板可构建、可访问，且**已通过真实渲染验证**（jsdom：DOM 10280 字节 / 142 元素 / 0 运行时错误）
- DSH 插件 **10 个工具**：compony_state / hire / task / meeting / agile / review / pitfall /
  backup / cross_review / media
- 三重防回归已就位：ESLint 导入守卫 + jsdom 渲染冒烟 + CI（`verify:panel`）

**关键命令**

| 目的 | 命令 |
|---|---|
| 构建**面板** | `npm run build:panel` |
| 启动面板 | `npm run serve:panel`（默认 `127.0.0.1:4173`）或双击 `start-panel.cmd` |
| 全量测试 | `npm run test:full`（lint + vitest + 引擎冒烟） |
| 渲染冒烟 | `npm run check:render` |
| 构建 + 渲染一起 | `npm run verify:panel` |
| 构建 **DSH 插件** | `npm run build` ⚠️ **这不是面板** |

**当前短板（这就是接下来要做的事）**

- 🔴 **宿主耦合**：面板靠 DSH 后台 job 托管，工具靠 DSH 插件暴露
- 🔴 **无服务端**：`runCompanyDemo()` 在浏览器内存里跑，刷新即重置
- 🟠 **无持久化**：仅 `~/.compony/state.json`
- 🟠 **前端零工程化**：无路由、无状态管理、无数据层、无 i18n、无设计令牌
- 🟡 **契约测试仅 1 个**（目标 20+）

---

## 4. 里程碑（按序推进，每个都要过验收）

### M1 · 前端工程化 —— 观感从 demo → 产品
**工期**：0.5–1 天

1. `src/styles/tokens.css`：颜色 / 间距 / 字号 / 圆角 / 阴影 / 过渡 全套 CSS 变量 + 暗色主题
2. 清除 `src/ui/*` 的全部内联 style，改为语义化 class（`.panel` / `.employee-card` / `.kanban-col`）
3. 引入 `react-router-dom`：`Layout`（侧边栏 + 顶栏）+ 懒加载页面
   `/` · `/building` · `/tasks` · `/meetings` · `/coffee` · `/quota` · `/media`
4. 状态分层：Zustand 管 UI 状态；`useSyncExternalStore` 订阅引擎 tick（替代 `setState({...})`）
5. 契约测试 ≥ 3 个：无硬编码色值 / 组件不直接 import engine / 每页都有 lazy

**验收**：7 个路由可导航；切页不丢模拟状态；`npm run check:render` 覆盖路由渲染并通过。

### M2 · 拆包 + 服务层 —— 「独立」的分水岭
**工期**：1–2 天

~~~
packages/engine/    纯领域逻辑（现 src/engine 平移，零依赖，node + 浏览器双跑）
packages/protocol/  共享类型 + HTTP 契约（现 src/types.ts 演进）
apps/server/        HTTP + SSE，挂载 engine
apps/web/           只消费 API，不再 import engine
adapters/dsh/       现 dsh-plugin 平移
~~~

- pnpm workspace；`engine` **不允许** import 任何 IO
- `apps/web` 增加 `api/` 层，组件禁止直接 fetch
- 服务端：`GET /api/state`、`POST /api/actions/:name`、`GET /api/events`（SSE）

**验收**：`curl` 可驱动完整公司流程；web 端删掉 engine 依赖后功能不减。

> ⚠️ **一次只拆一个包**，验证通过再拆下一个。拆包会动 `vite.config.ts` / `tsconfig.json` / 插件引用路径。

### M3 · 持久化 + 宿主解耦 —— 真正的独立
**工期**：2–3 天

1. SQLite（`better-sqlite3` + drizzle）持久化，替换 `~/.compony/state.json`
2. 把 10 个领域能力定义为**端口**，提供两个适配器：
   - `adapters/dsh`（DSH 插件）
   - `adapters/http`（REST + OpenAPI）
   → **DSH 降级为可选消费者，不再是宿主**
3. 会话隔离最小实现（sessionId → 独立 state）

**验收**：**不启动 DSH 也能完整运行**；`docker run` 单容器起服务。

### M4 · 交付与门面
**工期**：1–2 天

`Dockerfile` + `docker-compose.yml` + `deploy/nginx.conf`；
README（定位 + 架构图 + 一键启动 + 截图）；LICENSE；CONTRIBUTING；
分层 AGENTS.md（root / engine / web / server）。

**验收**：全新机器 `git clone` → 一条命令 → 浏览器可用。

---

## 5. 产品需求清单（25 条，功能北向，不得删减）

图例：✅ 已实现 · 🔶 部分实现 · ⬜ 未实现

| # | 需求 | 状态 | 实现位置 |
|---|---|---|---|
| 1 | 项目排期 / 版本管理 | 🔶 | 任务状态机 + 燃尽条 |
| 2 | HR 招聘 + 新人培训 + 提前设招聘条件 | ✅ | `engine/company.ts` |
| 3 | 首页大楼 / 小房间（随员工数与部门数缩放） | ✅ | `ui/BuildingView.tsx` |
| 4 | 员工猫咪皮肤 + 思考气泡 + 工位展示 | ✅ | `ui/Employee.tsx` |
| 5 | 咖啡室 / 休息室（模型冷却） | ✅ | `ui/CoffeeRoom.tsx` |
| 6 | 会议室（跨部门讨论，独立于任务分配） | ✅ | `engine/meeting.ts` |
| 7 | 任务分配：部门 → 拆解到员工 | ✅ | `engine/taskboard.ts` |
| 8 | 敏捷小队横向抽调（1PM+1UI+3开发+1测试） | ✅ | `engine/agile.ts` |
| 9 | 休息 / 工作状态 + 本子高度显示待办 token | ✅ | `ui/Employee.tsx` |
| 10 | 问题库（踩坑沉淀） | ✅ | `engine/memory.ts` |
| 11 | 日志可回溯 + 备份防误操作 | ✅ | `engine/audit.ts` |
| 12 | UI 生成（文生图 / 图生图 / 文生视频） | ✅ | `engine/media.ts` + agnes 技能 |
| 13 | 底层随时兼容新模块 + 按需分配 | 🔶 | 类型系统可扩展，运行时按需待完善 |
| 14 | 任务看板视图 | 🔶 | `ui/Dashboard.tsx` + `ui/AgileBoard.tsx` |
| 15 | 每日站会（昨日 / 今日 / 阻碍 三问） | ✅ | `engine/simulation.ts` |
| 16 | 自动化监控（commits / bug 数 / 燃尽图） | ✅ | `engine/monitor.ts` |
| 17 | 强制代码审查（可打回） | ✅ | `engine/gitflow.ts` |
| 18 | 资源配额（160/分钟 + 1500/5小时，可叠加） | ✅ | `engine/budget.ts` |
| 19 | 分支管理（冲突手动解决，绝不覆盖） | ✅ | `engine/gitflow.ts` |
| 20 | 强制 PR / Lint 自动化拦截 | 🔶 | PR 有；Lint 拦截未接入流程 |
| 21 | 自动测试守护（红灯不合并） | 🔶 | 测试就绪；阻断合并未接 |
| 22 | 架构物理隔离（微服务仅经 API 通信） | 🔶 | 声明层已有；运行隔离待 M2/M3 |
| 23 | 技术债预留 15%–20% | ✅ | `engine/debt.ts` |
| 24 | 详尽开发文档 + 频繁交叉审查 | ✅ | `docs/` + `engine/review.ts` |
| 25 | 部门可编辑 + 模板系统 + 负责人查看 agent | ✅ | `engine/company.ts` |

---

## 6. 工程铁律（不可违反）

1. **React hooks 只能从 `"react"` 导入**。`react-dom/client` 只提供 `createRoot` / `hydrateRoot`。
   ESLint `no-restricted-imports` 已守卫，**不要绕过**。
2. **面板构建是 `build:panel`**，`build` 是 DSH 插件（tsdown）。别搞混。
3. **不写死绝对路径**。用 `import.meta.url` / `fileURLToPath` 推导。
4. **服务进程必须有持久托管者**。会话派生的 detached 子进程会随会话回收；
   用宿主提供的后台 job，或用户侧 `start-panel.cmd`。
5. **端口固定 `4173`，绑定 `127.0.0.1`**；`.js` / `.html` 响应必须带 `Cache-Control: no-store`。
6. **合并冲突绝不擅自覆盖**。冲突必须显式解决并留下记录。
7. **默认工作区 `I:\deepseek`**。写该目录之外的路径必须先请求授权。
8. **提交信息必须记录：意图 / 范围 / 验证方式**，三者不得互相矛盾。
9. **不留死代码与投机性 fallback**。确认无消费者的代码，在同一改动里删除。
10. **测试不得为了变绿而改期望值**。契约变了，先改契约并说明理由。

---

## 7. 验证协议（「完成」的定义）

> 本项目曾发生「HTTP 200、打包成功、产物哈希一致，但页面全白」的事故。
> **状态码和构建日志都不是证据。**

声称任何一项「完成」之前，必须给出：

1. **可复现命令**（不是「我检查过了」）
2. **真实输出**（含关键数字：DOM 字节数、断言条数、退出码）
3. **失败路径也想过了**：如果这条验证会失败，失败长什么样？

三层验证，逐层增强：

| 层 | 手段 | 能证明什么 |
|---|---|---|
| L1 单元 / 引擎冒烟 | `npm run smoke`、`npm run test` | 领域逻辑正确 |
| L2 渲染冒烟 | `npm run check:render`（jsdom 真实执行构建产物） | React 能挂载、无运行时错误 |
| L3 产物一致性 | 线上字节 sha256 == 本地已验证产物 | 浏览器拿到的就是验证过的东西 |

**新功能必须同时补契约测试**：断言**架构约束**（如「组件不得直接 import engine」），
而不只是断言函数返回值。

---

## 8. 已知坑（都踩过，别重复踩）

| 症状 | 根因 | 正确做法 |
|---|---|---|
| 页面全白，控制台 `X.useState is not a function` | hooks 从 `react-dom/client` 导入；CJS 互操作下**打包不报错** | hooks 一律从 `react` 导入；ESLint 已守卫 |
| 浏览器「拒绝连接」，但服务刚验证过 | `spawn` / `Start-Process` 起的进程随会话被回收 | 用宿主后台 job 或用户侧启动脚本 |
| `vite dev` 说 ready，访问 `127.0.0.1` 却拒连 | dev server 默认绑 IPv6 `[::1]` | 显式加 `--host 127.0.0.1` |
| `web_fetch` 抓 GitHub 报 non-public IP | 域名解析策略拦截 | 改用 `git clone` / `git ls-remote` |
| 沙箱内 `schtasks` 命令找不到 | 沙箱未放行 | 让用户在自己终端执行 |
| `npm` / `pnpm` wrapper EINVAL | 沙箱 spawn 限制 | `node <npm-cli.js 绝对路径> ...` |
| git 报 `index.lock` 存在 | 上次异常退出残留 | 删除 `.git/index.lock`；必要时 `git reset --mixed HEAD` |
| 无法删除 `static-server.log` | 服务正在运行、持有句柄 | 属正常现象（说明服务活着）；先停服务再删 |
| jsdom 执行不了构建产物 | jsdom 不支持 ES module | 用 classic `<script src>` 的验证页 |

---

## 9. 工作方式（多智能体协作用）

- **动手前先读**：`docs/PROJECT.md`（需求映射）、`docs/ROADMAP_INDEPENDENT.md`（路线）、
  `src/types.ts`（数据模型）。先跑通验证链，再改代码。
- **并行要划不相交的写范围**。同一文件同一时刻只能有一个写者。
- **每个里程碑**：commit + 说明改动与验证结果 + push。
- **不要为了「看起来完成」而降低验证标准**。宁可报告「未完成 + 卡在哪一步」。
- **偏离本提示词要显式说明**，不要默默改方向。

---

## 10. 总完成标准

- [ ] 全新机器 `git clone` → 一条命令 → 浏览器打开即可用（M4）
- [ ] 不启动 DSH 也能完整运行；DSH 仅为可选适配器（M3）
- [ ] `apps/web` 不 import engine，全部经 HTTP（M2）
- [ ] 面板有设计令牌层、无内联 style、7 个路由可导航（M1）
- [ ] 契约测试 ≥ 20 个，覆盖架构约束
- [ ] `npm run test:full` + `npm run verify:panel` 全绿
- [ ] git 历史清晰：无擅自覆盖、无损坏对象
- [ ] 25 条产品需求全部 ✅，或明确记录为「刻意不做」并说明理由

---

## 11. 接手第一步（照做即可）

1. `cd I:\deepseek\compony && git log --oneline -5` —— 确认基线
2. 读 `docs/PROJECT.md` 第二节（需求映射）与 `docs/ROADMAP_INDEPENDENT.md`
3. 跑通验证链：`npm run test:full` → `npm run verify:panel`，**全绿再动手**
4. 启动面板：`npm run serve:panel`（或 `start-panel.cmd`），
   浏览器开 http://127.0.0.1:4173/ **亲眼看到面板**
5. 从 **M1** 开始，按第 4 节的验收标准逐项交付
