// 配额 + 仪表盘页
import { QuotaDashboard } from "../ui/QuotaDashboard";
import { Dashboard } from "../ui/Dashboard";
import { useCompanyState, dispatch } from "../state/companyStore";

export default function QuotaPage() {
  const s = useCompanyState();
  if (!s) return <div className="empty-page">正在加载公司状态…</div>;
  return (
    <>
      <div className="page-header"><h2>资源配额</h2><span className="sub">双窗口限流 + 全公司看板</span></div>
      <div className="panel"><QuotaDashboard state={s} /></div>
      <div className="panel"><Dashboard state={s} dispatch={dispatch} /></div>
    </>
  );
}
