// 配额仪表盘：每分钟 160 次 + 每 5 小时 1500 次（效果1+2 可叠加）
import type { CompanyState } from "../types";

export function QuotaDashboard({ state }: { state: CompanyState }) {
  const b = state.budget;
  const minLeft = Math.max(0, b.requestsPerMin - b.usedMin);
  const burstLeft = Math.max(0, b.burst - b.usedBurst);
  const minPct = b.requestsPerMin ? (b.usedMin / b.requestsPerMin * 100) : 0;
  const burstPct = b.burst ? (b.usedBurst / b.burst * 100) : 0;

  function bar(pct: number, kind: "danger" | "success" | "neutral") {
    const cls = pct > 80 && kind === "neutral" ? "danger" : kind;
    return <div className="bar"><div className={cls} style={{ width: Math.min(100, pct) + "%" }} /></div>;
  }

  return (
    <section className="compony-quota" aria-label="资源配额">
      <h3>⚡ 资源配额（效果1+2 可叠加）</h3>
      <div className="quota-grid">
        <div>
          <div className="quota-row"><span>每分钟 {b.requestsPerMin} 次（效果1）</span><span>余 {minLeft}</span></div>
          {bar(minPct, "neutral")}
        </div>
        <div>
          <div className="quota-row"><span>每 5h {b.burst} 次（效果2）</span><span>余 {burstLeft}</span></div>
          {bar(burstPct, "success")}
        </div>
      </div>
      <p className="quota-hint">低价值需求排期、紧急事快速做；保护基层员工不被无效工作压垮。</p>
    </section>
  );
}
