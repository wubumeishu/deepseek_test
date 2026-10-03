// 公司大楼/小房间视图：根据员工数与部门数缩放
import type { CompanyState } from "../types";

export function BuildingView({ state }: { state: CompanyState }) {
  const employees = Object.values(state.employees);
  const depts = Object.values(state.departments);
  const scale = employees.length > 12 || depts.length > 4 ? "building" : "room";
  return (
    <section className={"compony-building composy-" + scale} aria-label="公司场景">
      <h3>{scale === "building" ? "公司大楼" : "小房间"}</h3>
      <div className="building-grid">
        {employees.map(e => (
          <div key={e.id} className={"employee-card status-" + e.status}>
            <div className="emoji">🐱</div>
            <div className="name">{e.name}</div>
            <div className="status">{e.status}</div>
            {e.estTokens != null && <div className="tokens">~{e.estTokens} tok</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
