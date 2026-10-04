import type { CompanyState, Task } from "@compony/protocol";

export function createTask(s: CompanyState, title: string, owner: string, storyPoints: number, estTokens?: number): Task {
  const id = "t_" + Math.random().toString(36).slice(2, 8);
  const t: Task = {
    id, title, owner, status: "backlog", storyPoints, estTokens,
  };
  s.tasks[id] = t;
  s.burndown.total += storyPoints;
  s.audit.push({ at: Date.now(), actor: "system", action: "create_task", detail: title });
  return t;
}

export function decomposeTask(s: CompanyState, taskId: string): Task {
  const t = s.tasks[taskId];
  if (!t) throw new Error("unknown task");
  const dept = s.departments[t.owner];
  const members = (dept?.members.map(id => s.employees[id]).filter(Boolean) ?? []);
  if (!members.length) return t;
  const pick = members.filter(e => e.status === "idle").sort((a, b) => b.skill - a.skill)[0] ?? members[0];
  t.assignee = pick.id;
  t.status = "todo";
  const branch = "feat/" + t.id + "-" + pick.name;
  t.branch = branch;
  s.git.branches[branch] = { head: s.git.trunk, base: s.git.trunk };
  s.audit.push({ at: Date.now(), actor: pick.id, action: "branch", detail: pick.name + " 拉出分支 " + branch });
  return t;
}

export function completeTask(s: CompanyState, taskId: string) {
  const t = s.tasks[taskId];
  if (t) {
    t.status = "done";
    s.burndown.done += t.storyPoints;
    if (t.assignee) {
      const e = s.employees[t.assignee];
      if (e) { e.tasksDone += 1; e.status = "idle"; }
    }
    s.audit.push({ at: Date.now(), actor: t.assignee ?? "system", action: "task_done", detail: t.title });
  }
}