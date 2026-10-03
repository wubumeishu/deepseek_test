# Compony — 模拟公司多智能体协同系统

以"公司"为模型的多子智能体协同系统，带前端面板。作为 DSH 插件运行。

## 版本控制（git，本机执行）

### 初始化（一次）

DSH 沙箱内无法 spawn git，请在**本机**任选其一：

```powershell
# Windows PowerShell
cd I:\deepseek\compony
\./git-init.ps1
```
```
# 或手动
cd I:\deepseek\compony
git init -b main
git config user.name "compony-dev" && git config user.email "compony-dev@local"
git add -A
git commit -m "feat: 公司多智能体协同系统初版"
```

### 每次提交

`powershell
cd I:\deepseek\compony
.git-commit.ps1 "feat: 描述本次改动"   # 或 .\git-commit.cmd（CMD）
# 不带参数则自动根据 diff 生成提交信息
`


## 目录结构

```
compony/
├─ src/
│  ├─ types.ts            共享类型（Company/Department/Employee/Task/Meeting/Git/Pitfall/Audit）
│  ├─ engine/             核心模拟引擎
│  │  ├─ company.ts       公司架构/部门模板/HR/培训
│  │  ├─ taskboard.ts     任务分配 + 拆解 + Git 分支
│  │  ├─ agile.ts         敏捷小队横向抽调
│  │  ├─ meeting.ts       会议室跨部门讨论
│  │  ├─ gitflow.ts       PR 强制审查/冲突检测
│  │  ├─ memory.ts        问题库（踩坑沉淀）
│  │  ├─ audit.ts         日志回溯/备份防篡改
│  │  ├─ budget.ts        资源预算（每分钟160/每5h1500 效果1+2 叠加）
│  │  ├─ simulation.ts    模拟循环 tick（员工冷却/领任务/完成/会议/备份）