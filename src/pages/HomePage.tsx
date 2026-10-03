// 总览页：关键指标 + 部门 + 最近事件
import { useCompanyState } from "../state/companyStore";

export default function HomePage() {
  const s = useCompanyState();
  const tasks = Object.values(s.tasks);
  const done = tasks.filter(t => t.status === "done").length;
  const depts = Object.values(s.departments);
  const recent = s.audit.slice(-5).reverse();
  return (
    <>
      <div className="page-header">
        <h2>总览</h2><span className="sub">公司运转快照（不随路由切换丢失）</span>
      </div>
      <div className="panel">
        <h3>关键指标</h3>
        <div className="stat-grid">
          <div className="stat-tile"><span className="label">员工</span><span className="value">{Object.values(s.employees).length}</span></div>
          <div className="stat-tile"><span className="label">部门</span><span className="value">{depts.length}</span></div>
          <div className="stat-tile"><span className="label">任务</span><span className="value">{done}<span className="delta"> / {tasks.length} 完成</span></span></div>
          <div className="stat-tile"><span className="label">燃尽</span><span className="value">{s.burndown.total ? Math.round(s.burndown.done / s.burndown.total * 100) : 0}%</span></div>
        </div>
      </div>
      <div className="panel">
        <h3>部门</h3>
        <ul className="list-plain">
          {depts.map(d => <li key={d.id}>{d.name} · {d.members.length} 人</li>)}
        </ul>
      </div>
      <div className="panel">
        <h3>最近事件</h3>
        <ul className="list-plain audit-list">
          {recent.map((a, i) => <li key={i}>[{a.action}] {a.detail}</li>)}
        </ul>
      </div>
    </>
  );
}
