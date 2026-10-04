import type { CompanyState, AgileTeam } from "@compony/protocol";

export function formTeam(s: CompanyState, name: string, ownerTask: string, composition: Record<string, number>): AgileTeam {
  const id = "team_" + Math.random().toString(36).slice(2, 8);
  const members: string[] = [];
  for (const [role, count] of Object.entries(composition)) {
    const pool = Object.values(s.employees).filter(e => e.role === role);
    for (let i = 0; i < count && i < pool.length; i++) members.push(pool[i].id);
  }
  const team: AgileTeam = { id, name, members, ownerTask, formedAt: Date.now() };
  s.teams[id] = team;
  s.audit.push({ at: Date.now(), actor: "system", action: "team_form", detail: name + " 抽调 " + members.length + " 人：" + members.join(",") });
  return team;
}

export function dissolveTeam(s: CompanyState, teamId: string) {
  const t = s.teams[teamId];
  if (!t) return;
  t.dissolvedAt = Date.now();
  s.audit.push({ at: Date.now(), actor: "system", action: "team_dissolve", detail: t.name });
}