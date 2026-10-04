// 任务看板页：按状态分列
import { useCompanyState } from "../state/companyStore";

const COLS = [
  ["backlog", "待办池"], ["todo", "今日"], ["in_progress", "进行中"],
  ["in_review", "评审中"], ["done", "已完成"], ["rejected", "被退回"],
] as const;

export default function TasksPage() {
  const s = useCompanyState();
  if (!s) return <div className="empty-page">正在加载公司状态…</div>;
  return (
    <>
      <div className="page-header"><h2>任务看板</h2><span className="sub">按状态分列 · 拖拽待 M2.5</span></div>
      <div className="kanban">
        {COLS.map(([key, label]) => {
          const items = Object.values(s.tasks).filter(t => t.status === key);
          return (
            <div key={key} className="kanban-col">
              <div className="col-head">{label} <span className="count">{items.length}</span></div>
              {items.map(t => (
                <div key={t.id} className={"task-card status-" + t.status}>
                  <b>{t.title}</b>
                  <div className="sub">{s.employees[t.assignee]?.name ?? "未分配"} · {t.storyPoints} 点</div>
                  {t.pr && <span className="chip">PR #{t.pr.id}</span>}
                </div>
              ))}
              {items.length === 0 && <div className="col-empty">（空）</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
