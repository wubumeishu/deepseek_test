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
          <div key={d.id} style={{ marginBottom: 8 }}>
            <h4 style={{ margin: "4px 0", fontSize: 13 }}>
              {d.name}
              {d.headId && <span style={{ color: "#888", fontWeight: 400, fontSize: 11 }}>（负责人 {state.employees[d.headId]?.name}）</span>}
            </h4>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
