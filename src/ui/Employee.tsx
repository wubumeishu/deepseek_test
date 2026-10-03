// 员工工位：猫咪皮肤、状态、思考泡泡、桌上本子高度（待办 token 估算）
import type { Employee, Task } from "../types";

const SKINS: Record<string, string> = {
  cat_fluffy: "🐈", cat_orange: "🐈‍⬛", cat_black: "🐈‍⬛", cat_white: "🐈",
  cat_brown: "🐈", default: "🐱",
};
const STATUS_ZH: Record<string, string> = {
  working: "工作中", resting: "休息", meeting: "开会", cooling: "冷却中", idle: "空闲",
};

export function EmployeeDesk({ employee: e, task }: { employee: Employee; task?: Task }) {
  const noteH = task?.estTokens ? Math.min(64, Math.round(task.estTokens / 1000)) : 0;
  const showBubble = e.status === "working" || e.status === "cooling";
  const isImg = e.avatar === "pm_cat" || e.avatar === "dev_cat" || e.avatar === "qa_cat";
  return (
    <div className={"desk status-" + e.status}>
      {showBubble && <div className="bubble">{e.status === "cooling" ? "… 冷却" : "✦"}</div>}
      {isImg ? (
        <img className="avatar-img" src={"/assets/skins/" + e.avatar + ".png"} alt={e.name} />
      ) : (
        <div className="avatar-emoji">{SKINS[e.avatar] ?? SKINS.default}</div>
      )}
      <div className="name">{e.name}</div>
      <div className="status-line">{STATUS_ZH[e.status]}</div>
      {noteH > 0 && <div className="note" title={"预计 ~" + task?.estTokens + " tok"} style={{ height: noteH }} />}
    </div>
  );
}
