# AGENTS.md — Compony（根）

## 定位
Compony 是"模拟公司多智能体协同平台"。M3 起它**独立运行**：DSH 不再是宿主，
HTTP API（node:sqlite 持久化）是默认宿主；DSH 只是可选的消费者适配器。

## 包边界（一个事实只有一个所有者）
- `packages/engine`   —— 纯领域逻辑，零 IO 零第三方依赖（node+浏览器双跑）
- `packages/protocol` —— 共享类型 + HTTP 契约 + StateStore 端口
- `apps/server`       —— HTTP + SSE 服务，挂载 engine + SQLite 持久化
- `apps/web`          —— 前端面板，只消费 API（不直接 import engine）
- `adapters/dsh`      —— DSH 宿主侧适配器（JSON 文件存储，可选）
- `adapters/http`     —— HTTP 领域能力端口声明（10 能力 <-> REST 路由）

## 铁律
- engine 零 IO：不得 import `node:fs`/`node:os`/`node:child_process`（契约测试守护）
- React hooks 只能从 `"react"` 导入（不得从 react-dom）
- 面板 API-only：组件经 `src/api.ts` 调 API，不直接 fetch / 不 import engine
- 设计令牌：`src/ui` 不硬编码色值，走 CSS 变量
- 无硬编码绝对路径：用 `import.meta.url`/`fileURLToPath` 推导

## 验证门禁（不可削弱）
```bash
npm run test:full   # lint + vitest(契约+单元+持久化) + 引擎冒烟 15/15
```
pre-commit 钩子 + CI 双拦截，红灯不合并。

## 提交规范
意图 / 范围 / 验证方式；每个"完成"附可复现命令 + 真实输出。
