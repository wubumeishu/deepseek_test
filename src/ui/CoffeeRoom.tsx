import type { CompanyState, Employee } from "../types";
import { EmployeeDesk } from "./Employee";

// 咖啡室：冷却的员工来此休息（模型限流/大消耗后冷却）
export function CoffeeRoom({ state }: { state: CompanyState }) {
  const cooling = Object.values(state.employees).filter(e => e.status === "cooling" || e.status === "resting");
  return (
    <section className="compony-coffee" aria-label="咖啡室">
      <h3>☕ 咖啡室 / 休息室（{cooling.length} 人）</h3>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {cooling.length === 0 && <span style={{ fontSize: 12, color: "#999" }}>此刻无人休息</span>}
        {cooling.map(e => <EmployeeDesk key={e.id} employee={e} />)}
      </div>
    </section>
  );
}
