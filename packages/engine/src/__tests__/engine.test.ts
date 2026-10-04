import { describe, it, expect } from "vitest";
import { runCompanyDemo } from "../index";

describe("compony engine", () => {
  it("完成 招聘->任务->拆解->组队->会议->PR->审查->踩坑->备份 闭环", () => {
    const s = runCompanyDemo();
    expect(Object.keys(s.employees).length).toBe(5);
    expect(Object.keys(s.departments).length).toBe(5);
    const loginTask = Object.values(s.tasks).find(t => t.title === "登录模块")!;
    expect(loginTask.assignee).toBeTruthy();
    expect(loginTask.branch).toMatch(/feat\//);
    expect(loginTask.pr?.status).toBe("merged");
    // 合并后该分支从 git.branches 清除（正确行为）
    expect(s.git.branches[loginTask.branch]).toBeUndefined();
    const m = Object.values(s.meetings)[0];
    expect(m.minutes.length).toBe(3);
    expect(s.pitfalls.length).toBeGreaterThan(0);
    expect(s.audit.some(a => a.action === "backup")).toBe(true);
    expect(s.burndown.total).toBe(8);
  });

  it("资源预算窗口重置", () => {
    const s = runCompanyDemo();
    s.budget.resetMinAt = 0;
    s.budget.usedMin = 150;
    expect(s.budget.requestsPerMin).toBe(160);
  });
});