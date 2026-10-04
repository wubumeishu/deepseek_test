// 咖啡室 / 休息室页
import { CoffeeRoom } from "../ui/CoffeeRoom";
import { useCompanyState } from "../state/companyStore";

export default function CoffeePage() {
  const s = useCompanyState();
  if (!s) return <div className="empty-page">正在加载公司状态…</div>;
  return (
    <>
      <div className="page-header"><h2>咖啡室</h2><span className="sub">冷却 / 休息的员工在此</span></div>
      <div className="panel"><CoffeeRoom state={s} /></div>
    </>
  );
}
