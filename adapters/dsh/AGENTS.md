# AGENTS.md — adapters/dsh（DSH 宿主侧，可选消费者）

DSH 插件：注册 `compony_*` 工具驱动公司系统。M3 起 DSH **不再是宿主**，
只是众多消费者之一；服务端（apps/server）是默认宿主。

## 结构
- `src/host/index.ts` —— 10 个 compoon_* 宿主工具（相对 import engine/protocol）
- `src/web/client.ts`  —— 面板客户端（DSH 托管的静态服务版本）
- `src/store-json.ts`   —— JSON 文件版 StateStore（DSH 侧持久化）

## 铁律
- 跨包用**相对路径** import（pnpm workspace 解析被 ACL 阻断）
- 构建：`tsdown` 双入口（host + web），见根 `tsdown.config.ts`
