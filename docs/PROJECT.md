# Compony — 公司多智能体协同系统 · 项目目标与设计文档

> 文档版本：v1.0（2026-10-04）
> 项目根目录：`I:\deepseek\compony`
> Git 远程：https://github.com/wubumeishu/deepseek_test（分支 main，commit 06f06da）

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
| 12 | UI 生成（文生图/图生图/文生视频） | 🔶 | 已安装 agnes-ai-image / agnes-ai-video 技能（C:\\Users\\Administrator\\.agents\\skills\\），测试通过 |
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

- ✅ 引擎 10 模块全部实现，**闭环冒烟测试 13/13 通过**（`engine-smoke.mjs`）
- ✅ 前端 8 组件 + Vite 入口，已接 `startSimulation` 实时循环 + 站会按钮
- ✅ DSH 插件骨架完整（8 个 `compony_*` host 工具 + 右侧"公司"Tab）
- ✅ Git 仓库干净推送到 GitHub（39 文件，`git fsck` 无损坏对象）
- 🔶 待完成（见下方路线图）
- 🆕 agnes-ai-image / agnes-ai-video 技能已安装并测试通过（文生图✅ / 图生图✅ / 视频⚠️上游队列满）

---

## 五、路线图（优先级排序）

**P0 — 让系统真正跑起来**
1. 装 dev 依赖（react/vite/vitest/tsdown）并 `npm run dev` 起面板验证
2. 把 `dsh-plugin` 装进 web profile，跑通 8 个 `compony_*` 工具
3. 持久化 `~/.compony/state.json` 读写闭环

**P1 — 补齐核心需求**
4. UI 生成（文生图/图生图/文生视频）✅ 技能已装+测试通过，待接入面板 UI
5. 看板完善（Git commits 计数 / Bug 计数 / 燃尽图实时）
6. Lint 自动拦截 + 自动测试守护（红灯不合并）
7. 技术债 15%-20% 预留机制

**P2 — 长期运转**
8. 配 dsh-cron 每日站会
9. 接 dsh-context 配额仪表盘
10. 架构物理隔离（微服务仅 API 通信）落地
11. 交叉审查 + 详尽开发文档自动化

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
