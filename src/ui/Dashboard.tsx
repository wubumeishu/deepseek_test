// 仪表盘：燃尽图、产出统计、Git 状态、问题库、审计日志
import type { CompanyState } from "../types";

export function Dashboard({ state, dispatch }: { state: CompanyState; dispatch: (a: string, p?: any) => void }) {
  const tasks = Object.values(state.tasks);
  const done = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const remaining = state.burndown.total - state.burndown.done;
  const openPRs = tasks.filter(t => t.pr && t.pr.status === "open");
  const commits = state.git.commits ?? 0;
  const bugs = state.git.bugs ?? 0;
  const bdPct = state.burndown.total ? Math.round((state.burndown.done / state.burndown.total) * 100) : 0;
  const debtPct = total ? Math.round(tasks.filter(t => t.title.startsWith("[TECH-DEBT]")).reduce((a, t) => a + t.storyPoints, 0) / total * 100) : 0;
  const recentPits = state.pitfalls.slice(-5);
  const audit = state.audit.slice(-8);
  return (
    <section className="compony-dashboard" aria-label="仪表盘">
      <h3>仪表盘</h3>
      <div className="stat-grid">
        <div className="stat-tile"><span className="label">任务</span><span className="value">{done}<span className="delta"> / {total}</span></span></div>
        <div className="stat-tile"><span className="label">剩余故事点</span><span className="value">{remaining}</span></div>
        <div className="stat-tile"><span className="label">待审 PR</span><span className="value">{openPRs.length}</span></div>
        <div className="stat-tile"><span className="label">Git commits</span><span className="value">{commits}</span></div>
        <div className="stat-tile"><span className="label">Bug</span><span className="value">{bugs}</span></div>
        <div className="stat-tile"><span className="label">燃尽</span><span className="value">{bdPct}%</span></div>
        <div className="stat-tile"><span className="label">技术债</span><span className="value">{debtPct}%<span className="delta"> 目标 15-20%</span></span></div>
        <div className="stat-tile"><span className="label">交叉审查</span><span className="value">{Math.round(tasks.filter(t => t.crossReviewedBy).length / (total || 1) * 100)}%</span></div>
      </div>
      <div className="progress"><div style={{ width: total ? (done / total * 100) + "%" : "0%" }} /></div>
      <h4>Git 分支</h4>
      <ul className="list-plain">
        {Object.keys(state.git.branches).map(b => <li key={b}>{b} → {state.git.branches[b].head}</li>)}
      </ul>
      <h4>问题库（最近）</h4>
      <ul className="list-plain">
        {recentPits.map(p => <li key={p.id}>{p.title}</li>)}
      </ul>
      <h4>审计日志（最近）</h4>
      <ul className="list-plain audit-list">
        {audit.map((a, i) => <li key={i}>[{a.action}] {a.detail}</li>)}
      </ul>
      <button className="btn" onClick={() => dispatch("backup")}>备份快照</button>
    </section>
  );
}
