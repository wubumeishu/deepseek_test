# AGENTS.md — packages/engine

纯领域逻辑：公司/任务板/敏捷/会议/Git 流/踩坑/审计/预算/模拟/媒体/债务/交叉审查。

## 铁律
- **零依赖、零 IO**：不 import 任何 `node:*` 或第三方包；只产出纯函数
- 所有状态变更就地修改传入的 `CompanyState`（副作用显式化）
- `runCompanyDemo()` 是种子工厂，幂等可重放

## 测试
`src/__tests__/engine.test.ts`（vitest）+ 根 `engine-smoke.mjs`（15 断言冒烟）。
改领域逻辑后必须 `node --experimental-strip-types engine-smoke.mjs` 全绿。
