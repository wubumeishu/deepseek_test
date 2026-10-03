import type { CompanyState } from "../types";
import { EmployeeDesk } from "./Employee";

export function Workstations({ state }: { state: CompanyState }) {
  const depts = Object.values(state.departments);
  return (
    <section className="compony-workstations" aria-label="员工工位">
      {depts.map(d => {
        const members = d.members.map(id => state.employees[id]).filter(Boolean) as any[];
        if (!members.length) return null;
        return (
          <div key={d.id} className="dept-group">
            <div className="dept-head">
              {d.name}
              {d.headId && <span className="sub">（负责人 {state.employees[d.headId]?.name}）</span>}
            </div>
            <div className="desk-grid">
              {members.map(e => {
                const task = Object.values(state.tasks).find(t => t.assignee === e.id && t.status !== "done");
                return <EmployeeDesk key={e.id} employee={e} task={task} />;
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
