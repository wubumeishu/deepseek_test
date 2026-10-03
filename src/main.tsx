import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { CompanyPanel } from "./ui/index";
import {
  runCompanyDemo, startSimulation, dailyStandup, DEFAULT_SIM,
  formTeam, dissolveTeam, startMeeting, addMinute, endMeeting,
  recordMedia, crossReview,
} from "./engine";
import type { CompanyState } from "./types";

const initialState = runCompanyDemo();
let stopSim: (() => void) | undefined;

function App() {
  const [state, setState] = useState<CompanyState>(initialState);
  const [running, setRunning] = useState(false);
  const [standupLines, setStandupLines] = useState<string[]>([]);

  useEffect(() => {
    if (running) stopSim = startSimulation(initialState, () => setState({ ...initialState }), DEFAULT_SIM);
    return () => { if (running) stopSim?.(); };
  }, [running]);

  const refresh = () => setState({ ...initialState });

  const dispatch = (action: string, payload?: any) => {
    switch (action) {
      case "start_sim": setRunning(true); break;
      case "stop_sim": setRunning(false); break;
      case "standup": {
        const lines = dailyStandup(initialState);
        setStandupLines(lines.length ? lines : ["（无进行中任务）"]);
        refresh(); break;
      }
      case "start_meeting": startMeeting(initialState, payload?.title ?? "新会议", payload?.participants ?? []); refresh(); break;
      case "add_minute": addMinute(initialState, payload?.meetingId, payload?.employeeId, payload?.text ?? "（发言）"); refresh(); break;
      case "end_meeting": { if (payload) endMeeting(initialState, payload); refresh(); break; }
      case "form_team": formTeam(initialState, payload?.name ?? "新小队", payload?.ownerTask ?? "", payload?.composition ?? { lead: 1, designer: 1, frontend: 1, qa: 1 }); refresh(); break;
      case "dissolve_team": dissolveTeam(initialState, payload); refresh(); break;
      case "record_media": recordMedia(initialState, { kind: payload?.kind ?? "image", prompt: payload?.prompt ?? "", url: payload?.url ?? "", model: payload?.model ?? "agnes" }); refresh(); break;
      case "cross_review": crossReview(initialState, payload?.taskId, payload?.reviewerId, payload?.approved, payload?.note); refresh(); break;
      default: refresh(); break;
    }
  };

  return (
    <>
      <div style={{ padding: 10, background: "#1e293b", color: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
        <b style={{ fontSize: 15 }}>{"🏢 Compony 公司协同"}</b>
        <button onClick={() => dispatch("start_sim")} disabled={running} style={{ marginLeft: "auto", padding: "4px 10px", cursor: "pointer" }}>{running ? "⏸ 暂停模拟" : "▶ 开始模拟"}</button>
        <button onClick={() => dispatch("stop_sim")} disabled={!running} style={{ padding: "4px 10px", cursor: "pointer" }}>停止</button>
        <button onClick={() => dispatch("standup")} style={{ padding: "4px 10px", cursor: "pointer" }}>{"📋 每日站会"}</button>
      </div>
      {standupLines.length > 0 && (
        <div style={{ margin: "6px 10px", padding: 8, background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 6, fontSize: 12 }}>
          <b>📋 站会纪要（{new Date().toISOString().slice(0, 10)}）</b>
          <ul style={{ paddingLeft: 16, margin: "4px 0" }}>
            {standupLines.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      )}
      <CompanyPanel state={state} dispatch={dispatch} />
    </>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
