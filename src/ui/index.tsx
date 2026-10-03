// 公司面板入口：组装完整布局
import type { CompanyState } from "../types";
import { BuildingView } from "./BuildingView";
import { Workstations } from "./Workstations";
import { CoffeeRoom } from "./CoffeeRoom";
import { MeetingRoom } from "./MeetingRoom";
import { Dashboard } from "./Dashboard";
import { MediaPanel } from "./MediaPanel";
import { QuotaDashboard } from "./QuotaDashboard";
import { AgileBoard } from "./AgileBoard";

export interface ComposePanelProps {
  state: CompanyState;
  dispatch: (action: string, payload?: any) => void;
}

export function CompanyPanel({ state, dispatch }: ComposePanelProps) {
  return (
    <div className="compony-root" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 10, fontFamily: "system-ui, sans-serif" }}>
      <BuildingView state={state} />
      <Workstations state={state} />
      <CoffeeRoom state={state} />
      <MeetingRoom state={state} dispatch={dispatch} />
      <AgileBoard state={state} dispatch={dispatch} />
      <QuotaDashboard state={state} />
      <MediaPanel state={state} dispatch={dispatch} />
      <Dashboard state={state} dispatch={dispatch} />
    </div>
  );
}