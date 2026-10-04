# AGENTS.md — apps/server

HTTP + SSE 服务层：挂载 engine + node:sqlite 持久化（M3）。

## 端点
- `GET  /api/state?session=<id>`   读取会话状态
- `POST /api/actions/:name?session=<id>`  领域动作（hire/task/team/meeting/...）
- `GET  /api/events?session=<id>`   SSE 流
- `GET  /api/health`                健康检查
- `POST /api/sessions/:id/backup`   快照
- `DELETE /api/sessions/:id`         删除会话

## 持久化
- `store-sqlite.ts` 实现 `StateStore` 端口（node:sqlite，零第三方依赖）
- 每个 sessionId 落 `compony.sqlite`（WAL 模式）；新会话首次访问种子并落盘
- 动作 / 模拟 tick 后 `persist()`（写入）

## 铁律
- 零第三方依赖（只用 node 内置 http + node:sqlite）
- `store-sqlite.ts` 必须实现 `packages/protocol` 的 `StateStore`（契约测试守护）
- 会话隔离：不同 sessionId 独立 state（persistence.test.ts 验证）

## 启动
```bash
npm run start:api   # node --experimental-strip-types apps/server/src/index.ts
```
