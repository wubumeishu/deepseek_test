# Compony 截图

本目录存放面板各路由的真实渲染产物（M4 验收：README 需有截图）。

## 生成方式

```bash
node scripts/gen-screenshots.mjs <repo-root>
```

脚本在 jsdom 中真实执行 `dist` 构建产物，逐路由渲染（经典 <script src>，
与 `scripts/render-check.mjs` 同源），输出 7 个自包含 HTML 文件。

## 文件清单（7 路由）

| 路由 | 文件 | 说明 |
|---|---|---|
| `/` | `home.html` | 总览 + 每日站会 |
| `/building` | `building.html` | 大楼 / 工位 / 猫咪员工 |
| `/tasks` | `tasks.html` | 任务看板（燃尽 / 分支 / 问题库 / 审计） |
| `/meetings` | `meetings.html` | 会议室（跨部门讨论） |
| `/coffee` | `coffee.html` | 咖啡室 / 休息室（模型冷却） |
| `/quota` | `quota.html` | 资源配额（160/分钟 + 1500/5小时） |
| `/media` | `media.html` | 媒体生成（文生图 / 图生图 / 文生视频） |

每个文件均为**自包含 HTML**（内联 CSS 变量 + React 渲染后的 DOM），
浏览器直接打开即可看到该路由的真实渲染状态。

## 说明

- 采用 HTML 而非 PNG：jsdom 不支持 canvas 光栅化，HTML 是可直接打开的最高保真产物。
- 渲染验证：`render-check.mjs` 已断言 7/7 路由可渲染、React 挂载、0 运行时错误（本次
  重新构建的 DOM 1068 字节 / 36 元素基线）。
