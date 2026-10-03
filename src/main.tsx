import { createRoot, useEffect, useState } from "react-dom/client";
import { CompanyPanel } from "./ui/index";
import {
  runCompanyDemo, startSimulation, dailyStandup, DEFAULT_SIM,
  formTeam, dissolveTeam, startMeeting, addMinute,
} from "./engine";
import type { CompanyState } from "./types";

const initialState = runCompanyDemo();
let stopSim: (() => void) | undefined;

function App() {
  const [state, setState] = useState<CompanyState>(initialState);
  const [running, setRunning] = useState(false);

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
        alert("每日站会：\n" + (lines.join("\n") || "（无进行中任务）"));
        refresh(); break;
      }
      case "start_meeting": {
        startMeeting(initialState, payload?.title ?? "新会议", payload?.participants ?? []);
        refresh(); break;
      }
      case "add_minute": {
        addMinute(initialState, payload?.meetingId, payload?.employeeId, payload?.text ?? "（发言）");
        refresh(); break;
      }
      case "end_meeting": break; // engine endMeeting 在面板简化版里可后续接
      case "form_team": {
        formTeam(initialState, payload?.name ?? "新小队", payload?.ownerTask ?? "", payload?.composition ?? { lead: 1, designer: 1, frontend: 1, qa: 1 });
        refresh(); break;
      }
      case "dissolve_team": {
        dissolveTeam(initialState, payload);
        refresh(); break;
      }
      default: refresh();
    }
  };

  return (
    <>
      <div style={{ padding: 10, background: "#1e293b", color: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
        <b style={{ fontSize: 15 }}>{"🏢 Compony 公司协同"}</b>
        <button onClick={() => dispatch("start_sim")} disabled={running} style={{ marginLeft: "auto" }}>{running ? "⏸ 暂停模拟" : "▶ 开始模拟"}</button>
        <button onClick={() => dispatch("stop_sim")} disabled={!running}>停止</button>
        <button onClick={() => dispatch("standup")}>{"📋 每日站会"}</button>
      </div>
      <CompanyPanel state={state} dispatch={dispatch} />
    </>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
