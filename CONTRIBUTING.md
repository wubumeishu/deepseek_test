# 贡献指南（Compony）

## 快速开始

```bash
git clone https://github.com/wubumeishu/deepseek_test
cd compony
npm install
npm run start:api      # 起 API（4174）
npm run serve:panel    # 起面板（4173，含 /api 反向代理）
```

浏览器打开 http://127.0.0.1:4173 即可。

## 测试

```bash
npm run test:full   # lint + test + smoke
```

## 架构约束（契约测试守护）

- **engine 零 IO**：`packages/engine` 不得 import 任何 `node:*` 内置 IO 模块
- **hooks 只能从 react 导入**（不得从 react-dom）
- **面板 API-only**：组件不直接 import engine，经 `src/api.ts` 调 API
- **设计令牌**：`src/ui` 内不硬编码色值，统一走 CSS 变量

详见 `src/ui/__tests__/contract.test.ts`。

## 提交规范

- 意图 / 范围 / 验证方式三段式
- 每个"完成"必须附可复现命令 + 真实输出
- 不降低验证标准；不静默覆盖合并冲突
