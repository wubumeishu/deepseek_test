import type { CompanyState, PullRequest } from "../types";

export function openPR(s: CompanyState, taskId: string, reviewer: string): PullRequest {
  const t = s.tasks[taskId];
  if (!t || !t.branch) throw new Error("task has no branch");
  const pr: PullRequest = {
    id: "pr_" + t.id,
    branch: t.branch,
    author: t.assignee ?? "unknown",
    reviewer,
    status: "open",
    comments: [],
  };
  t.pr = pr;
  t.status = "in_review";
  s.audit.push({ at: Date.now(), actor: pr.author, action: "pr_open", detail: pr.branch + " -> main" });
  return pr;
}

export function reviewPR(s: CompanyState, prId: string, approve: boolean, comment: string) {
  const pr = Object.values(s.tasks).find(t => t.pr?.id === prId)?.pr;
  if (!pr) return;
  pr.comments.push(comment);
  if (approve) {
    pr.status = "approved";
    const conflictKey = pr.branch + "->main";
    if (s.git.conflicts[conflictKey]) {
      s.audit.push({ at: Date.now(), actor: "system", action: "conflict", detail: conflictKey });
      pr.status = "rejected";
    } else {
      pr.status = "merged";
      s.git.trunk = "main@rev" + Date.now();
      delete s.git.branches[pr.branch];
      s.audit.push({ at: Date.now(), actor: pr.reviewer, action: "pr_merge", detail: pr.branch });
    }
  } else {
    pr.status = "rejected";
    s.audit.push({ at: Date.now(), actor: pr.reviewer, action: "pr_reject", detail: comment });
  }
}

export function detectConflict(s: CompanyState, branchA: string, branchB: string, file: string) {
  s.git.conflicts[branchA + "|" + branchB] = { branchA, branchB, file };
  s.audit.push({ at: Date.now(), actor: "system", action: "conflict_detected", detail: branchA + " vs " + branchB + " @ " + file });
}
