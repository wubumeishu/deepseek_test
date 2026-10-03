// 敏捷小队：横向抽调不同部门员工组队（1PM+1UI+N开发+1测试）
import type { CompanyState } from "../types";

export function AgileBoard({ state, dispatch }: { state: CompanyState; dispatch: (a: string, p?: any) => void }) {
  const teams = Object.values(state.teams);
  const active = teams.filter(t => !t.dissolvedAt);
  return (
    <section className="compony-agile" aria-label="敏捷小队">
      <h3>敏捷小队（横向抽调，{active.length} 个进行中）</h3>
      {active.map(t => (
        <div key={t.id} className="team-card">
          <b>{t.name}</b> <span className="sub">（任务 {state.tasks[t.ownerTask]?.title}）</span>
          <div className="chips">
            {t.members.map(id => {
              const e = state.employees[id];
              return e ? <span key={id} className="chip">🐱 {e.name} · {e.role}</span> : null;
            })}
          </div>
          <div className="actions">
            <button className="btn" onClick={() => dispatch("dissolve_team", t.id)}>解散小队</button>
          </div>
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => dispatch("form_team", { name: "新小队", ownerTask: "", composition: { lead: 1, designer: 1, frontend: 1, qa: 1 } })}>
        + 抽调组建小队（1PM+1UI+1开发+1测试）
      </button>
    </section>
  );
}
