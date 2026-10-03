import type { CompanyState, Department, Employee } from "../types";

export function initCompany(): CompanyState {
  return {
    employees: {}, departments: {}, meetings: {}, tasks: {}, teams: {},
    git: { branches: {}, trunk: "main", conflicts: {}, commits: 0, bugs: 0 },
    pitfalls: [],
  media: [], audit: [],
    budget: { requestsPerMin: 160, burst: 1500, usedMin: 0, usedBurst: 0, resetMinAt: 0, resetBurstAt: 0 },
    burndown: { total: 0, done: 0 },
  };
}

// 部门模板系统：可编辑 + 把常见部门打包成模板
export const DEPT_TEMPLATES: Record<string, Partial<Department>> = {
  product:  { name: "产品部", tools: ["pr_write", "backlog"], apiOnly: true, constraints: "需求单一来源; 技术债预留 15%-20%（每迭代清理）" },
  design:   { name: "设计部", tools: ["mockup", "design_review"], constraints: "交付 UI 规范" },
  frontend: { name: "前端部", tools: ["ui_build", "lint"], constraints: "遵循代码风格指南" },
  backend:  { name: "后端部", tools: ["api_build", "db_schema"], constraints: "模块物理隔离，仅经 API 通信" },
  qa:       { name: "测试部", tools: ["test_run", "bug_report"], constraints: "红灯不合并" },
  ops:      { name: "运维部", tools: ["deploy", "monitor"], constraints: "可观测性优先" },
};

export function addDepartment(s: CompanyState, id: string, template?: string): Department {
  const tpl = template ? DEPT_TEMPLATES[template] : undefined;
  const d: Department = {
    id, name: tpl?.name ?? id, members: [],
    constraints: tpl?.constraints ?? "", tools: tpl?.tools ?? [],
  };
  s.departments[id] = d;
  s.audit.push({ at: Date.now(), actor: "system", action: "dept_add", detail: "部门 " + d.name + " 建立" });
  return d;
}

// HR 招聘：可提前设置招聘条件（能力下限、皮肤）
export function hireEmployee(s: CompanyState, name: string, role: Employee["role"], dept: string, skill: number, avatar: string): Employee {
  const id = "e_" + Math.random().toString(36).slice(2, 8);
  const e: Employee = { id, name, role, dept, skill, status: "idle", avatar, tasksDone: 0, tokensSpent: 0 };
  s.employees[id] = e;
  s.departments[dept]?.members.push(id);
  s.audit.push({ at: Date.now(), actor: "system", action: "hire", detail: name + "(" + role + ") 加入 " + dept });
  return e;
}

export function trainEmployee(s: CompanyState, id: string): Employee {
  const e = s.employees[id];
  if (!e) throw new Error("unknown employee " + id);
  e.skill = Math.min(100, e.skill + 10);
  s.audit.push({ at: Date.now(), actor: "system", action: "train", detail: e.name + " 完成培训，能力 " + e.skill });
  return e;
}

// 部门负责人：点击查看当前 agent
export function setDepartmentHead(s: CompanyState, deptId: string, headId: string) {
  const d = s.departments[deptId];
  if (!d) return;
  d.headId = headId;
  s.audit.push({ at: Date.now(), actor: "system", action: "dept_head", detail: d.name + " 负责人: " + s.employees[headId]?.name });
}

// 编辑部门（自定义名称/约束/工具）
export function editDepartment(s: CompanyState, deptId: string, patch: Partial<Department>) {
  const d = s.departments[deptId];
  if (!d) return;
  Object.assign(d, patch);
  s.audit.push({ at: Date.now(), actor: "system", action: "dept_edit", detail: "部门 " + d.name + " 更新" });
}
