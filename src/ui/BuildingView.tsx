// 公司大楼/小房间视图：根据员工数与部门数缩放
import type { CompanyState } from "../types";

export function BuildingView({ state }: { state: CompanyState }) {
  const employees = Object.values(state.employees);
  const depts = Object.values(state.departments);
  // 规模决定是"小房间"还是"大楼"
  const scale = employees.length > 12 || depts.length > 4 ? "building" : "room";
  const statusColor: Record<string, string> = {
    working: "#4caf50", resting: "#9e9e9e", meeting: "#2196f3", cooling: "#ff9800", idle: "#607d8b",
  };
  return (
    <section className={"compony-building composy-" + scale} aria-label="公司场景">
      <h3>{scale === "building" ? "公司大楼" : "小房间"}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {employees.map(e => (
          <div key={e.id} className="compony-employee" style={{
            border: "2px solid " + statusColor[e.status], borderRadius: 6,
            padding: 4, width: 84, textAlign: "center", background: "#fafafa",
          }}>
            <div style={{ fontSize: 22 }}>{"🐱"}</div>
            <div style={{ fontSize: 11 }}>{e.name}</div>
            <div style={{ fontSize: 10, color: statusColor[e.status] }}>{e.status}</div>
            {e.estTokens != null && <div style={{ fontSize: 9 }}>~{e.estTokens} tok</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
