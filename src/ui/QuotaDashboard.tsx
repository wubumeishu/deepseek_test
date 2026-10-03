// 配额仪表盘：每分钟 160 次 + 每 5 小时 1500 次（效果1+2 可叠加）
import type { CompanyState } from "../types";

export function QuotaDashboard({ state }: { state: CompanyState }) {
  const b = state.budget;
  const minLeft = Math.max(0, b.requestsPerMin - b.usedMin);
  const burstLeft = Math.max(0, b.burst - b.usedBurst);
  const minPct = b.requestsPerMin ? (b.usedMin / b.requestsPerMin * 100) : 0;
  const burstPct = b.burst ? (b.usedBurst / b.burst * 100) : 0;

  function bar(pct: number, color: string) {
    return (
      <div style={{ height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: Math.min(100, pct) + "%", background: color, transition: "width .3s" }} />
      </div>
    );
  }

  return (
    <section className="compony-quota" aria-label="资源配额" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
      <h3>⚡ 资源配额（效果1+2 可叠加）</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>每分钟 {b.requestsPerMin} 次（效果1）</span>
            <span>余 {minLeft}</span>
          </div>
          {bar(minPct, minPct > 80 ? "#f44336" : "#2196f3")}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>每 5h {b.burst} 次（效果2）</span>
            <span>余 {burstLeft}</span>
          </div>
          {bar(burstPct, burstPct > 80 ? "#f44336" : "#4caf50")}
        </div>
      </div>
      <p style={{ fontSize: 10, color: "#888", margin: "4px 0 0" }}>
        低价值需求排期、紧急事快速做；保护基层员工不被无效工作压垮。
      </p>
    </section>
  );
}
