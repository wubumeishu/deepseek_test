# AGENTS.md — adapters/http（HTTP 领域能力端口）

声明式映射：10 个领域能力 <-> REST 路由（M3 宿主解耦的 HTTP 侧）。
`apps/server` 据此路由；`apps/web` 据此调用。与 adapters/dsh 互为等价消费者。

## 文件
- `types.ts`  —— `CapabilityPort` 契约
- `port.ts`   —— `HTTP_CAPABILITIES`（10 能力）+ `routeForCapability(id)`

## 说明
这是"端口"而非"实现"：真正的 HTTP 实现在 apps/server（零第三方依赖）。
本包让"哪个能力走哪条路由"成为单一权威事实，避免 DSH 与 server 漂移。
