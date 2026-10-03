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
  // 桌上"本子高度"：按当前任务预计 token 缩放
  const noteH = task?.estTokens ? Math.min(64, Math.round(task.estTokens / 1000)) : 0;
  const showBubble = e.status === "working" || e.status === "cooling";
  return (
    <div className="compony-desk" style={{
      position: "relative", width: 96, height: 120, background: "#fafafa",
      border: "2px solid " + deskColor(e.status), borderRadius: 8, padding: 6,
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {showBubble && (
        <div style={{
          position: "absolute", top: -6, right: 2, background: "#fff",
          border: "1px solid #bbb", borderRadius: "50%", width: 26, height: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "#666",
        }}>{e.status === "cooling" ? "… 冷却" : "✦"}</div>
      )}
      {(e.avatar === "pm_cat" || e.avatar === "dev_cat" || e.avatar === "qa_cat") ? (
        <img src={"/assets/skins/" + e.avatar + ".png"} alt={e.name}
             style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }} />
      ) : (
        <div style={{ fontSize: 26 }}>{SKINS[e.avatar] ?? SKINS.default}</div>
      )}
      <div style={{ fontSize: 12, fontWeight: 600 }}>{e.name}</div>
      <div style={{ fontSize: 10, color: deskColor(e.status) }}>{STATUS_ZH[e.status]}</div>
      {noteH > 0 && (
        <div title={"预计 ~" + task?.estTokens + " tok"} style={{
          marginTop: "auto", width: 18, background: "#eceff1", borderRadius: 2,
          height: noteH, border: "1px solid #cfd8dc",
        }} />
      )}
    </div>
  );
}

function deskColor(status: string) {
  return { working: "#4caf50", resting: "#9e9e9e", meeting: "#2196f3", cooling: "#ff9800", idle: "#607d8b" }[status] ?? "#607d8b";
}
