# Compony — 公司多智能体协同系统 · 项目目标与设计文档

> 文档版本：v1.1（2026-10-04）
> 项目根目录：`I:\deepseek\compony`
> Git 远程：https://github.com/wubumeishu/deepseek_test（分支 main，commit 60615bb）

---

## 〇、M1 里程碑完成（2026-10-04）

**前端工程化 —— 观感从 demo → 产品**

| 验收项 | 状态 | 证据 |
|---|---|---|
| 设计令牌层 tokens.css（颜色/间距/字号/圆角/阴影/过渡 + 暗色主题） | ✅ | src/styles/tokens.css |
| 清除 src/ui/* 全部内联 style，改为语义化 class | ✅ | .panel / .employee-card / .kanban-col 等 |
| react-router-dom（HashRouter）：Layout + 7 个懒加载路由 | ✅ | /, /building, /tasks, /meetings, /coffee, /quota, /media |
| 状态分层：Zustand UI 状态 + useSyncExternalStore 订阅引擎 tick | ✅ | src/state/companyStore.ts |
| 契约测试 ≥ 3 个（无硬编码色值 / 组件不 import engine / 每页 lazy） | ✅ 14 条 | src/ui/__tests__/contract.test.ts |
| 7 个路由可导航、切页不丢模拟状态 | ✅ | 路由覆盖 7/7（render-check） |
| npm run check:render 覆盖路由渲染并通过 | ✅ | 渲染耗时 264ms，DOM 1966 字节 |

**新增文件**：src/styles/、src/pages/（7 页）、src/state/、src/ui/layout/、src/ui/__tests__/
**构建调整**：vite.config.ts 增加 inlineDynamicImports，保证 jsdom classic-script 渲染冒烟可执行（单文件 200.58 kB）。

---

## 一、项目目标（一句话）

以「公司」为组织模型，构建一个**多子智能体协同系统**：每个智能体是公司里的一名员工，每个团队是部门，系统负责招聘、培训、任务分配、代码审查、资源配额、会议、站会、监控、复盘——并配有一个**可交互的前端面板**，以"大楼/工位/猫咪"的可视化方式呈现整个公司的实时运转状态。

---

## 二、核心需求清单 → 实现状态映射

状态图例：✅ 已实现 · 🔶 部分实现 · ⬜ 未实现

| # | 需求 | 状态 | 实现位置 |
|---|---|---|---|
| 1 | 项目排期 / 版本管理 | 🔶 | 任务状态机 + burndown（燃尽条） |
| 2 | HR 招聘 + 新人培训 + 提前设置招聘条件 | ✅ | `engine/company.ts` hireEmployee/trainEmployee |
| 3 | 首页大楼/小房间（随员工数+部门数缩放） | ✅ | `ui/BuildingView.tsx` |
| 4 | 员工猫咪皮肤 + 思考泡泡 + 工位展示 | ✅ | `ui/Employee.tsx`（SKINS + 泡泡） |
| 5 | 咖啡室/休息室（模型冷却） | ✅ | `ui/CoffeeRoom.tsx` |
| 6 | 会议室（跨部门讨论，独立于任务分配） | ✅ | `ui/MeetingRoom.tsx` + engine/meeting.ts |
| 7 | 任务分配：部门 → 拆解到员工 | ✅ | `engine/taskboard.ts` |
| 8 | 敏捷小队横向抽调（1PM+1UI+3开发+1测试） | ✅ | `engine/agile.ts` + ui/AgileBoard.tsx |
| 9 | 休息/工作状态 + 桌上本子高度显示待办 token | ✅ | `ui/Employee.tsx`（estTokens/1000 → 本子高度） |
| 10 | 问题库（踩坑沉淀） | ✅ | `engine/memory.ts` |
| 11 | 日志可回溯 + 备份防捣蛋鬼 | ✅ | `engine/audit.ts`（hash 校验和） |
| 12 | UI 生成（文生图/图生图/文生视频） | ✅ | 文生图✅(猫咪皮肤3张) / 图生图✅ / 文生视频✅(2.5-flash 猫咪打字片段,上游队列已恢复)；media 引擎 + MediaPanel + 第9工具 |
| 13 | 底层随时兼容 + 按需分配 | 🔶 | 类型系统可扩展，运行时按需 |
| 14 | 看板 | 🔶 | ui/Dashboard.tsx（燃尽/分支/问题库/审计） |
| 15 | 每日站会（昨日/今日/阻碍三问） | ✅ | `engine/simulation.ts` dailyStandup |
| 16 | 自动化监控（Git commits/Bug数/燃尽图） | 🔶 | burndown 有；commits/bug 计数待接 |
| 17 | 强制代码审查（PR 经资深审查、可打回） | ✅ | `engine/gitflow.ts` reviewPR |
| 18 | 资源有限配额（160/分钟 + 1500/5h 可叠加） | ✅ | `engine/budget.ts` canSpend |
| 19 | 分支管理（隔离、冲突手动解决、绝不覆盖） | ✅ | `engine/gitflow.ts` detectConflict |
| 20 | 强制 PR/Lint 自动化拦截 | 🔶 | PR 有；Lint 拦截未实现 |
| 21 | 自动测试守护（红灯不合并） | 🔶 | 测试框架就绪；CI 拦截未接 |
| 22 | 架构物理隔离（微服务仅经 API 通信） | 🔶 | 部门约束字段声明；运行隔离待实现 |
| 23 | 技术债 15%-20% 预留 | ⬜ | 未实现 |
| 24 | 详尽开发文档 + 交叉审查 | 🔶 | 本文档 + README；交叉审查流程待接 |
| 25 | 部门可编辑自定义 + 模板系统 + 负责人查看 agent | ✅ | `engine/company.ts` editDepartment/DEPT_TEMPLATES/setDepartmentHead |

---

## 三、架构总览

### 技术栈
- **语言**：TypeScript（ES2022，strict）
- **前端**：React 18 + Vite（`vite.config.ts`，端口 5173）
- **测试**：Vitest（`src/engine/__tests__/engine.test.ts`）
- **运行器**：Node 24 内置 `--experimental-strip-types`（无需 tsx 也能跑引擎）
- **DSH 集成**：`dsh-plugin/`（cordis 补丁 + host 工具 + web 客户端）

### 目录结构
```
compony/
├─ src/
│  ├─ types.ts               共享类型（CompanyState 及 9 个子类型）
│  ├─ engine/                核心模拟引擎（纯函数，无 IO 副作用）
│  │  ├─ company.ts          公司架构/部门模板/HR/培训/部门负责人
│  │  ├─ taskboard.ts        任务创建/拆解/Git 分支
│  │  ├─ agile.ts            敏捷小队抽调/解散
│  │  ├─ meeting.ts          会议/纪要
│  │  ├─ gitflow.ts          PR 审查/冲突检测
│  │  ├─ memory.ts           问题库
│  │  ├─ audit.ts            审计日志/备份
│  │  ├─ budget.ts           资源配额
│  │  ├─ simulation.ts       tick 模拟循环/站会
│  │  └─ index.ts            导出 + runCompanyDemo 闭环
│  ├─ ui/                    前端面板（8 组件）
│  │  ├─ index.tsx           面板布局入口
│  │  ├─ BuildingView.tsx    大楼/小房间
│  │  ├─ Workstations.tsx    按部门分组工位
│  │  ├─ Employee.tsx        猫咪皮肤+思考泡泡+本子高度
│  │  ├─ CoffeeRoom.tsx      冷却休息室
│  │  ├─ MeetingRoom.tsx     会议室
│  │  ├─ AgileBoard.tsx      敏捷小队面板
│  │  └─ Dashboard.tsx       燃尽/分支/问题库/审计
│  ├─ main.tsx               Vite 预览入口（接实时模拟循环）
│  └─ demo.ts                Node 直接跑引擎闭环
├─ dsh-plugin/               DSH 插件（host 工具 + web Tab）
├─ engine-smoke.mjs          引擎冒烟测试（13/13）
├─ git-init.ps1/.sh          幂等 git 初始化
├─ git-commit.ps1/.cmd       一键提交
├─ package.json              依赖与脚本
├─ tsconfig.json / vite.config.ts
└─ README.md / docs/
```

### 核心数据模型（`src/types.ts`）
`CompanyState` 聚合：`employees` / `departments` / `meetings` / `tasks` / `teams` / `git` / `pitfalls` / `audit` / `budget` / `burndown`。

关键设计：
- **任务状态机**：backlog → todo → in_progress → in_review → done/rejected
- **PR 状态机**：open → approved/rejected → merged
- **员工状态**：idle → working → cooling → resting → meeting
- **资源配额双窗口**：每分钟 160 次 + 每 5 小时 1500 次，独立重置、可叠加

---

## 四、当前进度与验证结果

- ✅ 引擎 12 模块（含 media/monitor）全部实现，**闭环冒烟测试 15/15 通过**（`engine-smoke.mjs`）
- ✅ 前端 10 组件（含 MediaPanel/QuotaDashboard）+ Vite 入口，vite build 47 模块通过，已接实时模拟循环 + 站会按钮
- ✅ DSH 插件完整（9 个 `compony_*` host 工具 + 右侧"公司"Tab），装进 web profile（pnpm link），`~/.compony/state.json` 持久化闭环验证通过
- ✅ Git 仓库干净推送到 GitHub（39 文件，`git fsck` 无损坏对象）
- ✅ P0 完成：dev 依赖装好（130 包），vite build 通过（47 模块），vitest 2/2 + 引擎冒烟 15/15 全绿
- ✅ P0 完成：dsh-plugin 装进 web profile（pnpm link），9 个 compony_* 工具可导入调用，~/.compony/state.json 持久化闭环验证通过
- ✅ P1 完成：UI 生成（media 引擎 + MediaPanel + compony_media 工具 + 3 张猫咪皮肤实图）
- ✅ P1 完成：看板完善（Git commits/Bug 计数/燃尽% 三格实时）
- ✅ P1 完成：Lint 拦截（eslint 全绿 0err0warn）+ 自动测试守护（pre-commit 钩子 + GitHub Actions CI，红灯不合并）
- ✅ P2 完成：dsh-cron 每日站会（scripts/daily-standup.mjs + tick 自动站会）
- ✅ P2 完成：dsh-context 配额仪表盘（QuotaDashboard 双配额条）
- ✅ agnes-ai-image / agnes-ai-video 技能全链路打通（文生图✅ / 图生图✅ / 文生视频✅ 2.5-flash 猫咪打字片段完成）

---

## 五、路线图（优先级排序）

**P0 — 让系统真正跑起来** ✅ 完成
1. 装 dev 依赖（react/vite/vitest/tsdown）并 `npm run dev` 起面板验证 ✅
2. 把 `dsh-plugin` 装进 web profile，跑通 9 个 `compony_*` 工具 ✅（含 compony_media）
3. 持久化 `~/.compony/state.json` 读写闭环 ✅（STATE_FILE 用 os.homedir 修复）

**P1 — 补齐核心需求** ✅ 完成
4. UI 生成（文生图/图生图/文生视频）✅ media 引擎 + MediaPanel + 猫咪皮肤实图
5. 看板完善（Git commits/Bug 计数/燃尽% 实时）✅ engine/monitor.ts + Dashboard 六格
6. Lint 自动拦截 + 自动测试守护（红灯不合并）✅ eslint + pre-commit 钩子 + GitHub Actions CI
7. 技术债 15%-20% 预留机制 ✅（engine/debt.ts debtCompliance）

**P2 — 长期运转**
8. 配 dsh-cron 每日站会 ✅ scripts/daily-standup.mjs + tick 自动站会
9. 接 dsh-context 配额仪表盘 ✅ QuotaDashboard 双配额条
10. 架构物理隔离（微服务仅 API 通信）✅（Department.apiOnly）
11. 交叉审查 + 详尽开发文档自动化 ✅（engine/review.ts + 第10工具）

---

## 六、Git 版本控制约定

- 远程：https://github.com/wubumeishu/deepseek_test
- 分支：main（主干）；功能走 `feat/{taskId}-{name}` 分支
- 提交身份：`compony-dev <compony-dev@local>`（可改）
- **绝不擅自覆盖**：merge conflict 必须手动解决
- 提交脚本：`git-commit.ps1 "feat: 描述"` / `git-commit.cmd`

---

## 七、引擎 API 速查

```ts
// company
initCompany(): CompanyState
addDepartment(s, id, template?) / editDepartment(s, id, patch) / setDepartmentHead(s, deptId, headId)
hireEmployee(s, name, role, dept, skill, avatar) / trainEmployee(s, id)
DEPT_TEMPLATES: product/design/frontend/backend/qa/ops

// taskboard
createTask(s, title, owner, storyPoints, estTokens)
decomposeTask(s, taskId)      // 自动拉 feat/{taskId}-{name} 分支
completeTask(s, taskId)

// agile
formTeam(s, name, ownerTask, composition) / dissolveTeam(s, teamId)

// meeting
startMeeting(s, title, participants) / addMinute(s, meetingId, employeeId, text) / endMeeting(s, meetingId)

// gitflow
openPR(s, taskId, authorId) / reviewPR(s, prId, approve, comment) / detectConflict(s, branchA, branchB)

// memory
recordPitfall(s, title, context, lesson, addedBy, tags) / findPitfall(s, keyword)

// audit
logAudit(s, actor, action, detail) / backup(s) / recentAudit(s, n)

// budget
canSpend(s, tokens, now?)

// simulation
dailyStandup(s): string[]
tick(s, cfg?, now?)
startSimulation(s, onTick?, cfg?): () => void
DEFAULT_SIM = { tickMs: 5000, coolDownMs: 60000, autoCompleteRatio: 0.15 }

// index
runCompanyDemo(): CompanyState   // 5部门5员工完整闭环
```

---

## 八、前端面板：启动方式与「白屏」事故复盘

### 8.1 启动方式

**方式一：双击一键启动（推荐，不依赖任何会话）**

```
start-panel.cmd
```

首次运行会自动构建，随后在终端打印面板地址；关闭该窗口即停止服务。

**方式二：手动**

```bash
npm run build:panel     # vite build → dist/
npm run serve:panel     # 静态服务器，默认 127.0.0.1:4173（可用 PORT 覆盖）
```

浏览器打开 **http://127.0.0.1:4173/**。

- 静态服务器只绑定 `127.0.0.1`，且对 `.js` / `.html` 返回 `Cache-Control: no-store`，
  避免重建后浏览器仍执行旧 bundle。
- 开发态亦可 `npm run dev`（vite dev server，已固定 `host: 127.0.0.1`）。

### 8.2 事故复盘：页面 HTTP 200 但整页空白

**现象**：`/index.html` 与 `/assets/*.js` 全部 200，但页面空白，控制台报
`X.useState is not a function or its return value is not iterable`。

**根因**：`src/main.tsx` 误从 `react-dom/client` 导入 hooks：

```ts
// ✗ 错误：react-dom/client 只导出 createRoot / hydrateRoot
import { createRoot, useEffect, useState } from "react-dom/client";
// ✓ 正确
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
```

`react-dom/client` 是 CJS 互操作模块，Rollup 无法在构建期发现缺失的具名导出，
因此 **打包成功、无警告**，只在运行时才炸：`Sr` 即 `react-dom/client` 命名空间对象，
其 `useState` 为 `undefined`，解构赋值直接抛错 → React 无法挂载 → 白屏。

**防护（三重）**：

1. **构建期**：ESLint `no-restricted-imports` 禁止从 `react-dom` / `react-dom/client`
   导入任何 hook（见 `eslint.config.js` 的 `REACT_HOOKS`）。
2. **运行期**：`npm run check:render` 用 jsdom 真实执行 `dist/` 产物，
   要求 `#root` 渲染出 >200 字节 DOM 且运行时 0 错误，否则退出码 1。
3. **CI**：`npm run verify:panel`（= build:panel + check:render）已接入
   `.github/workflows/ci.yml`。

> 注意：`npm run build` 构建的是 DSH 插件（tsdown），**不是**前端面板；
> 面板请用 `npm run build:panel`。
