// 交叉审查自动化：每个员工写的文档/代码被另一位同事审查，确保无人不可替代
import type { CompanyState } from "@compony/protocol";

// 给任务记录一次交叉审查（reviewer 不能是 owner 本人）
export function crossReview(s: CompanyState, taskId: string, reviewerId: string, approved: boolean, note?: string): boolean {
  const task = s.tasks[taskId];
  if (!task) return false;
  if (task.owner === reviewerId) {
    s.audit.push({ at: Date.now(), actor: reviewerId, action: "cross_review_reject", detail: "不能审查自己的任务" });
    return false;
  }
  task.crossReviewedBy = reviewerId;
  s.audit.push({ at: Date.now(), actor: reviewerId, action: "cross_review", detail: (approved ? "approved" : "rejected") + " " + taskId + (note ? "：" + note : "") });
  if (!approved && task.pr) task.pr.status = "rejected";
  return approved;
}

// 团队交叉审查覆盖率（被交叉审查的任务占比）
export function crossReviewCoverage(s: CompanyState): number {
  const tasks = Object.values(s.tasks);
  if (!tasks.length) return 1;
  const reviewed = tasks.filter(t => t.crossReviewedBy).length;
  return Math.round((reviewed / tasks.length) * 100);
}