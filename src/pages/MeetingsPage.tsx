// 会议室 + 敏捷小队页
import { MeetingRoom } from "../ui/MeetingRoom";
import { AgileBoard } from "../ui/AgileBoard";
import { useCompanyState, dispatch } from "../state/companyStore";

export default function MeetingsPage() {
  const s = useCompanyState();
  return (
    <>
      <div className="page-header"><h2>会议室</h2><span className="sub">跨部门讨论 + 敏捷小队</span></div>
      <div className="panel"><MeetingRoom state={s} dispatch={dispatch} /></div>
      <div className="panel"><AgileBoard state={s} dispatch={dispatch} /></div>
    </>
  );
}
