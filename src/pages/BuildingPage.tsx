// 大楼 + 工位页
import { BuildingView } from "../ui/BuildingView";
import { Workstations } from "../ui/Workstations";
import { useCompanyState } from "../state/companyStore";

export default function BuildingPage() {
  const s = useCompanyState();
  if (!s) return <div className="empty-page">正在加载公司状态…</div>;
  return (
    <>
      <div className="page-header"><h2>大楼 / 工位</h2><span className="sub">按员工与部门数缩放</span></div>
      <div className="panel"><BuildingView state={s} /></div>
      <div className="panel"><Workstations state={s} /></div>
    </>
  );
}
