// 自动化监控：Git commits / Bug 数 / 燃尽图（供仪表盘实时显示）
import type { CompanyState } from "@compony/protocol";

export function commitCount(s: CompanyState): number {
  return s.git.commits ?? 0;
}

export function bugCount(s: CompanyState): number {
  return s.git.bugs ?? 0;
}

export function burndownPct(s: CompanyState): number {
  const total = s.burndown.total || 0;
  if (!total) return 0;
  return Math.round((s.burndown.done / total) * 100);
}

// 记录一次 commit（提交守护后调用）
export function recordCommit(s: CompanyState, msg?: string): void {
  s.git.commits = (s.git.commits ?? 0) + 1;
  if (msg) s.audit.push({ at: Date.now(), actor: "system", action: "git_commit", detail: msg });
}

// 记录一个 Bug（测试红灯 / 审查打回）
export function recordBug(s: CompanyState, detail: string): void {
  s.git.bugs = (s.git.bugs ?? 0) + 1;
  s.audit.push({ at: Date.now(), actor: "system", action: "bug_found", detail });
}