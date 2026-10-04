# AGENTS.md — apps/web（面板）

Vite + React + Zustand + HashRouter。M2.3 起**只消费 API**，不直接 import engine。

## 铁律
- 组件经 `src/api.ts` 调 API（fetchState/postAction/subscribeEvents），不直接 fetch
- React hooks 只能从 `"react"` 导入（不得从 react-dom）
- 7 个路由页面全部 `lazy()` 加载（契约测试守护）
- 设计令牌：内联 style 抽到 `src/styles/tokens.css`，不硬编码色值

## 构建
```bash
npm run build:panel    # vite build（面板专用，勿用 build）
npm run check:render   # jsdom 渲染冒烟（React 挂载 + 7 路由）
```
vite dev 绑 [::1]，需 `--host 127.0.0.1`。
