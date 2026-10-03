// 仪表盘：燃尽图、产出统计、Git 状态、问题库、审计日志
import type { CompanyState } from "../types";

export function Dashboard({ state, dispatch }: { state: CompanyState; dispatch: (a: string, p?: any) => void }) {
  const tasks = Object.values(state.tasks);
  const done = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const remaining = state.burndown.total - state.burndown.done;
  const openPRs = tasks.filter(t => t.pr && t.pr.status === "open");
  const recentPits = state.pitfalls.slice(-5);
  const audit = state.audit.slice(-8);
  return (
    <section className="compony-dashboard" aria-label="仪表盘">
      <h3>仪表盘</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 12 }}>
        <div>任务 {done}/{total}</div>
        <div>剩余故事点 {remaining}</div>
        <div>待审 PR {openPRs.length}</div>
      </div>
      <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: total ? (done / total * 100) + "%" : "0%", background: "#4caf50" }} />
      </div>
      <h4>Git 分支</h4>
      <ul style={{ fontSize: 11, paddingLeft: 16 }}>
        {Object.keys(state.git.branches).map(b => <li key={b}>{b} → {state.git.branches[b].head}</li>)}
      </ul>
      <h4>问题库（最近）</h4>
      <ul style={{ fontSize: 11, paddingLeft: 16 }}>
        {recentPits.map(p => <li key={p.id}>{p.title}</li>)}
      </ul>
      <h4>审计日志（最近）</h4>
      <ul style={{ fontSize: 10, paddingLeft: 16, color: "#666" }}>
        {audit.map((a, i) => <li key={i}>[{a.action}] {a.detail}</li>)}
      </ul>
      <button onClick={() => dispatch("backup")}>备份快照</button>
    </section>
  );
}
