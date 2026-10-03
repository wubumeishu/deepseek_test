// 技术债预留：每迭代 15%-20% 时间用于清理技术债
import type { CompanyState } from "../types";

export function debtReserve(storyPoints: number, minPct = 0.15, maxPct = 0.2): { min: number; max: number } {
  return { min: storyPoints * minPct, max: storyPoints * maxPct };
}

export function recordDebtTask(s: CompanyState, title: string, owner: string, points: number): string {
  const taskId = "t_" + Math.random().toString(36).slice(2, 8);
  s.tasks[taskId] = {
    id: taskId,
    title: "[TECH-DEBT] " + title,
    owner,
    status: "todo",
    storyPoints: points,
    branch: "debt/" + taskId,
  } as any;
  s.audit.push({ at: Date.now(), actor: "system", action: "debt_record", detail: title });
  return taskId;
}

export function debtCompliance(totalPoints: number, debtPoints: number): boolean {
  if (!totalPoints) return true;
  const pct = debtPoints / totalPoints;
  return pct >= 0.15 && pct <= 0.2;
}
