# Compony → 独立项目：差距分析与优化路线

> 参考对象：[dataelement/Clawith](https://github.com/dataelement/Clawith)（Apache-2.0，多智能体协作平台）
> 本文只记录**结论与可执行路线**，不复制对方代码。

---

## 一、Clawith 做对了什么（值得借鉴的 6 点）

| # | 做法 | 为什么有价值 |
|---|---|---|
| 1 | **设计令牌层**：`index.css` 8309 行，全部颜色/间距/字号/圆角/阴影/过渡收敛为 CSS 变量（Linear 风暗色） | 视觉一致性的唯一来源；换主题只改变量。这是"产品感"与"demo 感"的分水岭 |
| 2 | **路由 + 布局壳**：`App.tsx` 全量 `lazy()` + `ProtectedRoute`/`CompanyAdminRoute` + `ErrorBoundary` + `Suspense` | 每个页面独立 chunk；权限与鉴权集中在路由层，不下沉到组件 |
| 3 | **状态分层**：Zustand 只放 UI/会话状态（`sidebarCollapsed`、`token`），服务端数据交给 TanStack Query | 服务端状态与 UI 状态不混。缓存、重试、失效有统一归属 |
| 4 | **契约测试**：`node --test tests/*.test.mjs`，27 个测试**读源码做正则断言架构不变量**（例：`markdownRendererSecurity.test.mjs` 断言 `sanitizeCodeLanguage` 必须存在且被调用） | 不测"函数返回值"，测"架构约束不被绕过"。正好防我们刚踩的"打包成功但白屏" |
| 5 | **分层 AGENTS.md**：root / backend / frontend / scripts 各一份，就近约束；提出"每个事实只有一个权威所有者" | 让多智能体/多人协作时边界清晰，改动落在正确的层 |
| 6 | **交付工程化**：`docker-compose.yml` + `docker-compose.ci.yml` + `deploy/nginx` + `helm/` + `setup.sh` + `restart.sh` | 别人 `git clone` 后一条命令就能跑起来 —— 这是"独立项目"的门槛 |

**目录骨架（可借鉴）**：
```
frontend/src/{pages,components,services,stores,hooks,utils,types,i18n,styles}
frontend/tests/*.test.mjs        # 契约测试
backend/app/{api,services,models,dao,schemas,core}
deploy/ + helm/ + docker-compose*.yml
.specify/                        # 规格驱动工作流模板
```

### ⚠️ 不要照抄的地方

`frontend/AGENTS.md` 声称技术栈是「React 18, Tailwind CSS, shadcn/ui」，
但 `frontend/package.json` 实际是 **React 19、无 Tailwind、无 shadcn**（样式是 8309 行手写 CSS）。
**它自己的文档已经漂移了。** 照抄技术栈声明会踩坑；要以其 `package.json` 为准。

---

## 二、Compony 现状盘点（硬数据）

```
src/            28 文件 / 1084 行   （engine 14 个模块 + ui 10 个组件 + types）
dsh-plugin/      2 文件 /  244 行
scripts/         2 文件 /  106 行
测试             1 个（engine.test.ts 28 行）+ smoke + render-check
```

**已有优势（不要推翻）**
- `src/engine/*` 是**纯函数、零依赖**的领域逻辑（公司/任务板/敏捷/评审/债务/配额/媒体），这是最值钱的资产
- 三重防护已在位：eslint 导入守卫 + jsdom 渲染冒烟 + CI
- 引擎冒烟 15/15 通过，说明领域逻辑闭环是完整的

**核心短板（按严重度）**

| 严重度 | 问题 | 证据 |
|---|---|---|
| 🔴 致命 | **宿主耦合**：运行时宿主是 DSH。面板靠 DSH 后台 job 托管，工具靠 DSH 插件暴露 | 反复出现"服务被回收 → 拒连" |
| 🔴 致命 | **无服务端**：`runCompanyDemo()` 在浏览器里同步执行，状态活在内存 | `main.tsx:10`；刷新即重置 |
| 🟠 高 | **无持久化**：仅有 `~/.compony/state.json`，多端/多用户不可能 | — |
| 🟠 高 | **前端零工程化**：无路由、无状态管理、无数据层、无 i18n、无设计令牌，内联 style 散落 | 组件 16–51 行，全内联样式 |
| 🟡 中 | 视图与领域状态纠缠：`setState({ ...initialState })` 手工重刷 | `main.tsx` 的 `refresh()` |
| 🟡 中 | 契约测试缺失：只有 1 个单元测试 | 刚补的 render-check 是雏形 |

---

## 三、差距矩阵

| 能力 | Clawith | Compony 现状 | 目标 |
|---|---|---|---|
| 设计令牌 | ✅ 8309 行 CSS 变量 | ❌ 内联 style | M1 |
| 路由 / 布局壳 | ✅ react-router v7 + lazy | ❌ 单页瀑布流 | M1 |
| 状态分层 | ✅ Zustand + TanStack Query | ❌ useState 手工重刷 | M1 |
| i18n | ✅ 6 语言 | ❌ 中文硬编码 | M1（骨架） |
| 契约测试 | ✅ 27 个 | 🟡 1 个 | M1 |
| **API 服务层** | ✅ FastAPI 46 模块 | ❌ 无 | **M2** |
| **包边界** | ✅ backend/frontend 分离 | ❌ 混在一个 package | **M2** |
| 持久化 | ✅ PG + alembic | 🟡 单文件 JSON | M3 |
| **宿主解耦** | ✅ 独立 Web 应用 | ❌ 挂在 DSH 上 | **M3** |
| 容器化交付 | ✅ compose + helm + nginx | ❌ 无 | M4 |
| 开源门面 | ✅ README×6 + LICENSE + CONTRIBUTING | 🟡 README 55 行 | M4 |

---

## 四、优化路线（4 个里程碑）

### M1 · 前端工程化（视觉立刻从 demo → 产品）｜0.5–1 天

1. **`src/styles/tokens.css`**：颜色/间距/字号/圆角/阴影/过渡全套 CSS 变量 + 暗色主题
2. **删掉全部内联 style**，改为语义化 class（`.panel` / `.employee-card` / `.kanban-col`）
3. 引入 `react-router-dom`：`Layout`（侧边栏 + 顶栏）+ 懒加载页面
   `/ dashboard · /building · /tasks · /meetings · /coffee · /quota · /media`
4. **状态分层**：Zustand 放 UI 状态；`useSyncExternalStore` 订阅引擎 tick（替代 `setState({...})`）
5. 契约测试 3 个：令牌无硬编码色值 / 组件不直接 import engine / 每页都有 lazy

**验收**：7 个路由可导航；切换页面不丢模拟状态；`check:render` 覆盖路由渲染。

### M2 · 拆包 + 服务层（"独立"的分水岭）｜1–2 天

```
packages/engine/   纯领域逻辑（现 src/engine 平移，零依赖，node+浏览器双跑）
packages/protocol/ 共享类型 + HTTP 契约（现 src/types.ts 演进）
apps/server/       HTTP + SSE，挂载 engine
apps/web/          只消费 API，不再 import engine
adapters/dsh/      现 dsh-plugin 平移
```
- pnpm workspace；`engine` 保持纯函数，**不允许** import 任何 IO
- `apps/web` 加 `api/` 层，禁止组件直接 fetch
- 服务端提供 `GET /api/state`、`POST /api/actions/:name`、`GET /api/events`(SSE)

**验收**：`curl` 能驱动完整公司流程；web 端删掉 engine 依赖后功能不减。

### M3 · 持久化 + 宿主解耦（真正独立）｜2–3 天

1. SQLite（`better-sqlite3` + drizzle）持久化，替换 `~/.compony/state.json`
2. 把 10 个领域能力定义为**端口**，提供两个适配器：
   - `adapters/dsh`（DSH 插件）
   - `adapters/http`（REST + OpenAPI）
   → **DSH 降级为可选消费者，不再是宿主**
3. 多租户/会话隔离的最小实现（sessionId → 独立 state）

**验收**：不启动 DSH 也能完整运行；`docker run` 单容器起服务。

### M4 · 交付与开源门面｜1–2 天

`Dockerfile` + `docker-compose.yml` + `deploy/nginx.conf`；README（含架构图、一键启动、截图）；
LICENSE；CONTRIBUTING；分层 AGENTS.md（root / engine / web / server）。

**验收**：全新机器 `git clone` → 一条命令 → 浏览器可用。

---

## 五、立即可做的 5 个小改动（低成本高回报）

1. `npm run build` 改名为 `build:plugin`，消除"构建面板却构建了插件"的陷阱
2. 把 `src/ui/*` 的内联 style 抽到 `src/styles/`（M1 的 80% 收益，20% 工作量）
3. 补 3 个契约测试（防回归），复用 `render-check.mjs` 的模式
4. README 重写为门面：一句话定位 + 架构图 + 一键启动 + 截图
5. 给 `start-panel.cmd` 加"开机自启"选项（需用户授权写 Startup 目录）

---

## 六、结论

Compony 现在的准确定位是：**「一个 DSH 插件 + 一个演示面板」**，而不是独立项目。

- **领域逻辑（engine）已经是独立项目的料** —— 纯函数、零依赖、有测试
- **缺的是外壳**：服务层、包边界、持久化、前端工程化
- **解耦的钥匙是 M2 拆包**：engine 抽成包之后，DSH 和 HTTP 都只是它的适配器
- **最快的观感提升是 M1**：设计令牌 + 路由，一天内从 demo 变产品

建议顺序：**M1 → M2 → M3 → M4**（先让外壳像产品，再让架构独立，最后交付）。
