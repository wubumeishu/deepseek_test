// 任务看板页：按状态分列
import { useCompanyState } from "../state/companyStore";

const COLS = [
  ["backlog", "待办池"], ["todo", "今日"], ["in_progress", "进行中"],
  ["in_review", "评审中"], ["done", "已完成"], ["rejected", "被退回"],
] as const;

export default function TasksPage() {
  const s = useCompanyState();
  return (
    <>
      <div className="page-header"><h2>任务看板</h2><span className="sub">按状态分列</span></div>
      <div className="panel">
        <div className="kanban">
          {COLS.map(([key, label]) => {
            const items = Object.values(s.tasks).filter(t => t.status === key);
            return (
              <div key={key} className="kanban-col">
                <h4>{label}（{items.length}）</h4>
                {items.map(t => (
                  <div key={t.id} className="team-card">
                    <b>{t.title}</b>
                    <div className="sub">负责人 {t.owner} · {t.storyPoints} 点</div>
                    {t.assignee && s.employees[t.assignee] && (
                      <div className="sub">指派 → {s.employees[t.assignee].name}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
