# Compony 🏢 模拟公司多智能体协同平台

> 一个以"公司"为模型的多智能体协同系统：员工、部门、任务板、敏捷小队、会议室、
> Git 工作流、踩坑沉淀、审计日志、资源配额 —— 全部由纯函数引擎驱动，
> 经 HTTP API + SSE 暴露，前端面板可驱动完整公司流程。
>
> **M3 起独立运行**：无需 DSH 宿主，`docker run` 单容器即可起服务；
> SQLite 持久化，会话隔离，重启不丢状态。

---

## 定位

Compony 不是 DSH 插件了。它是一个**可独立部署的多智能体协同平台**：

- **领域逻辑**（`packages/engine`）：纯函数、零依赖、零 IO，node + 浏览器双跑
- **服务层**（`apps/server`）：Node 内置 http + node:sqlite，零第三方依赖
- **前端面板**（`apps/web`）：React + Vite，只消费 API（不直接碰 engine）
- **适配器**（`adapters/`）：DSH（可选）与 HTTP（一等公民）互为等价消费者

---

## 一键启动
### 方式 0：最快一条命令（无需 Docker）

```bash
git clone https://github.com/wubumeishu/deepseek_test compony
cd compony
npm install
npm start        # 起 API(4174) + 面板(4173 含 /api 代理) + SQLite 持久化
```

浏览器打开 **http://127.0.0.1:4173/** 即可。


### 方式 A：本地 Node 24

```bash
git clone https://github.com/wubumeishu/deepseek_test compony
cd compony
npm install

# 起 API（4174）
npm run start:api

# 起面板（4173，含 /api 反向代理）
npm run serve:panel
```

浏览器打开 **http://127.0.0.1:4173** 即可驱动公司流程。

### 方式 B：Docker 单容器（M4）

```bash
git clone https://github.com/wubumeishu/deepseek_test compony
cd compony
docker compose up -d
```

- 面板：**http://127.0.0.1:4173**（含 /api 反向代理）
- API：**http://127.0.0.1:4174**（含 SSE）
- SQLite 数据卷 `compony-data`（重启不丢状态）

### 方式 C：Dockerfile 直接构建

```bash
docker build -t compony .
docker run -d -p 4173:4173 -p 4174:4174 -v compony-data:/data compony
```

---

## 架构图

```
                    ┌─────────────────────────────────────────────┐
                    │              消费者（等价）                 │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
                    │  │  apps/   │  │adapters/ │  │ CLI /    │  │
                    │  │  web     │  │ dsh(可选)│  │ CI / 任意│  │
                    │  │ (面板)   │  │ (DSH宿主)│  │ 客户端   │  │
                    │  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
                    └───────┼──────────────┼──────────────┼───────┘
                            │              │              │
                            ▼              ▼              ▼
                    ┌─────────────────────────────────────────────┐
                    │      adapters/http（10 能力 <-> REST）      │
                    │      GET /api/state · POST /api/actions/:   │
                    │      GET /api/events(SSE) · backup · delete │
                    └─────────────────────┬───────────────────────┘
                                          ▼
                    ┌─────────────────────────────────────────────┐
                    │           apps/server（HTTP + SSE）          │
                    │  零第三方依赖 · 会话隔离 · 模拟 tick         │
                    └───────────────┬───────────────┬─────────────┘
                                    │               │
                    ┌───────────────┴───┐   ┌──────┴──────────────┐
                    │ StateStore 端口   │   │ @compony/engine     │
                    │ (packages/protocol)│   │ (纯函数 · 零 IO)    │
                    └─────────┬─────────┘   └─────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼                               ▼
   ┌─────────────────────┐         ┌─────────────────────┐
   │ adapters/dsh        │         │ apps/server         │
   │ JsonFileStore       │         │ SqliteStore         │
   │ (~/.compony/state)  │         │ (compony.sqlite WAL) │
   └─────────────────────┘         └─────────────────────┘
```

---

## 截图

各路由真实渲染（jsdom 验证 7/7，DOM 1068 字节 / 36 元素 / 0 运行时错误）：

| 路由 | 截图 | 说明 |
|---|---|---|
| `/` | [首页](screenshots/home.png) | 总览 + 每日站会 |
| `/building` | [大楼](screenshots/building.png) | 大楼 / 工位 / 猫咪员工 |
| `/tasks` | [任务看板](screenshots/tasks.png) | 燃尽 / 分支 / 问题库 / 审计 |
| `/meetings` | [会议室](screenshots/meetings.png) | 跨部门讨论 |
| `/coffee` | [咖啡室](screenshots/coffee.png) | 模型冷却休息室 |
| `/quota` | [资源配额](screenshots/quota.png) | 160/分钟 + 1500/5h |
| `/media` | [媒体生成](screenshots/media.png) | 文生图 / 图生图 / 文生视频 |

> 截图目录 `screenshots/` 含 `README.md` 说明生成方式；首版待补 PNG 文件。

---

## 领域能力（10 个，端口化）

| 能力 | 引擎入口 | HTTP 路由 | 说明 |
|---|---|---|---|
| state | StateStore.load | `GET /api/state` | 读取公司状态 |
| hire | hireEmployee | `POST /api/actions/hire` | 招聘员工 |
| task | createTask | `POST /api/actions/task` | 创建任务 |
| team | formTeam | `POST /api/actions/form_team` | 组建敏捷小队 |
| meeting | startMeeting | `POST /api/actions/start_meeting` | 发起会议 |
| pitfall | recordPitfall | `POST /api/actions/pitfall` | 沉淀踩坑 |
| review | crossReview | `POST /api/actions/cross_review` | 交叉审查 PR |
| standup | dailyStandup | `POST /api/actions/standup` | 每日站会 |
| events | SSE 广播 | `GET /api/events` | 订阅状态流 |
| backup | SqliteStore.backup | `POST /api/sessions/:id/backup` | 快照备份 |

完整映射见 `adapters/http/port.ts`（单一权威事实）。

---

## 目录结构

```
compony/
├─ packages/
│  ├─ engine/          纯领域逻辑（零依赖零 IO）
│  │  ├─ company.ts   公司架构/部门/HR
│  │  ├─ taskboard.ts 任务拆解 + Git 分支
│  │  ├─ agile.ts     敏捷小队
│  │  ├─ meeting.ts   会议室
│  │  ├─ gitflow.ts   PR 强制审查/冲突
│  │  ├─ memory.ts    踩坑沉淀
│  │  ├─ audit.ts     审计日志/备份防篡改
│  │  ├─ budget.ts    资源配额
│  │  ├─ simulation.ts 模拟 tick
│  │  └─ ...          media/debt/monitor/review
│  └─ protocol/        共享类型 + StateStore 端口 + HTTP 契约
├─ apps/
│  ├─ server/          HTTP + SSE + SQLite 持久化（零第三方依赖）
│  │  ├─ index.ts     路由 / 会话隔离 / 模拟 tick
│  │  ├─ store-sqlite.ts  SqliteStore（实现 StateStore）
│  │  └─ __tests__/persistence.test.ts
│  └─ web/             前端面板（React + Vite，API-only）
├─ adapters/
│  ├─ dsh/             DSH 宿主侧（可选消费者）
│  └─ http/            10 能力 <-> REST 路由声明
├─ src/               面板源码（ui/styles/state/api）
├─ Dockerfile         单容器交付
├─ docker-compose.yml 一键起容器
├─ deploy/nginx.conf  反向代理配置
└─ AGENTS.md          分层协作契约
```

---

## 测试与验证门禁

```bash
npm run test:full   # lint + vitest(38 测试) + 引擎冒烟(15 断言)
```

| 层 | 内容 | 数量 |
|---|---|---|
| L1 单元 | `packages/engine` 引擎测试 | 2 |
| L1 契约 | `src/ui/__tests__/contract.test.ts`（架构不变量） | 33 |
| L1 持久化 | `apps/server` SQLite roundtrip + 会话隔离 | 3 |
| L1 冒烟 | `engine-smoke.mjs` 引擎闭环 | 15 断言 |
| L2 渲染 | `scripts/render-check.mjs`（React 挂载 + 7 路由） | — |
| L3 持久化 | 重启后 SQLite 状态保留（手动验证） | — |

**pre-commit 钩子 + CI 双拦截**：红灯不合并。

---

## 刻意不做的

- **多租户鉴权**：当前是"会话隔离"（sessionId -> 独立 state），不做用户级鉴权
- **WebSocket**：用 SSE 单向流替代（动作是客户端发起的 POST，状态是服务端广播）
- **i18n**：中文硬编码（M1 骨架已留位，未填多语言）
- **Tailwind / shadcn**：手写 8309 行设计令牌 CSS（与参考对象一致，不引入框架）

---

## 许可

MIT（见 `LICENSE`）。