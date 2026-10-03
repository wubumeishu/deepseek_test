import { initCompany, addDepartment, hireEmployee, trainEmployee, DEPT_TEMPLATES, setDepartmentHead, editDepartment } from "./company.ts";
import { createTask, decomposeTask, completeTask } from "./taskboard.ts";
import { formTeam, dissolveTeam } from "./agile.ts";
import { startMeeting, addMinute, endMeeting } from "./meeting.ts";
import { openPR, reviewPR, detectConflict } from "./gitflow.ts";
import { recordPitfall, findPitfall } from "./memory.ts";
import { logAudit, backup, recentAudit } from "./audit.ts";
import { canSpend } from "./budget.ts";
import { tick, startSimulation, dailyStandup, DEFAULT_SIM } from "./simulation.ts";

export {
  initCompany, addDepartment, hireEmployee, trainEmployee, DEPT_TEMPLATES, setDepartmentHead, editDepartment,
  createTask, decomposeTask, completeTask,
  formTeam, dissolveTeam,
  startMeeting, addMinute, endMeeting,
  openPR, reviewPR, detectConflict,
  recordPitfall, findPitfall,
  logAudit, backup, recentAudit,
  canSpend,
  tick, startSimulation, dailyStandup, DEFAULT_SIM,
};
export type { CompanyState } from "../types";

export function runCompanyDemo() {
  const s = initCompany();
  addDepartment(s, "product", "product");
  addDepartment(s, "design", "design");
  addDepartment(s, "frontend", "frontend");
  addDepartment(s, "backend", "backend");
  addDepartment(s, "qa", "qa");
  setDepartmentHead(s, "backend", Object.keys(s.employees)[0] ?? "");
  const pm = hireEmployee(s, "花花", "product", "product", 80, "cat_fluffy");
  const ui = hireEmployee(s, "球球", "designer", "design", 75, "cat_orange");
  const fe = hireEmployee(s, "煤球", "frontend", "frontend", 85, "cat_black");
  const be = hireEmployee(s, "汤圆", "backend", "backend", 88, "cat_white");
  const qa = hireEmployee(s, "布丁", "qa", "qa", 70, "cat_brown");
  trainEmployee(s, qa.id);
  setDepartmentHead(s, "backend", be.id);
  setDepartmentHead(s, "qa", qa.id);
  const t1 = createTask(s, "登录模块", "backend", 5, 18000);
  const t2 = createTask(s, "首页 UI", "frontend", 3, 42000);
  decomposeTask(s, t1.id);
  decomposeTask(s, t2.id);
  formTeam(s, "冲刺1", t1.id, { lead: 1, designer: 1, frontend: 1, qa: 1 });
  const m = startMeeting(s, "登录方案对齐", [pm.id, be.id, qa.id]);
  addMinute(s, m.id, pm.id, "要支持 OAuth + 邮箱");
  addMinute(s, m.id, be.id, "后端出 /auth 接口，物理隔离");
  addMinute(s, m.id, qa.id, "测试补全 401 用例");
  endMeeting(s, m.id);
  const pr = openPR(s, t1.id, be.id);
  reviewPR(s, pr.id, true, "逻辑 OK，合并");
  recordPitfall(s, "OAuth 回调丢 state", "state 没进 session", "state 存 session 并在回调校验", be.id, ["auth"]);
  backup(s);
  return s;
}
