// 媒体生成页
import { MediaPanel } from "../ui/MediaPanel";
import { useCompanyState, dispatch } from "../state/companyStore";

export default function MediaPage() {
  const s = useCompanyState();
  return (
    <>
      <div className="page-header"><h2>媒体生成</h2><span className="sub">文生图 / 文生视频</span></div>
      <div className="panel"><MediaPanel state={s} dispatch={dispatch} /></div>
    </>
  );
}
