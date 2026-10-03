// 中央状态层：引擎 CompanyState 提升到模块级，用 useSyncExternalStore 订阅。
// 替代旧的 setState({...}) 手工重刷——路由切换 / tick 推进都不丢状态。
import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import {
  runCompanyDemo, startSimulation, dailyStandup, DEFAULT_SIM,
  formTeam, dissolveTeam, startMeeting, addMinute, endMeeting,
  recordMedia, crossReview,
} from "../engine";
import type { CompanyState } from "../types";

// ---- 引擎状态（模块级单例）----
export const engineState: CompanyState = runCompanyDemo();

let stopSim: (() => void) | undefined;
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  for (const l of listeners) l();
}
export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function getState(): CompanyState { return engineState; }
export function getSnapshot(): number { return version; }

// ---- UI 状态（Zustand）----
interface UIState {
  simRunning: boolean;
  standupLines: string[];
  theme: "light" | "dark";
  startSim: () => void;
  stopSim: () => void;
  setStandupLines: (lines: string[]) => void;
  toggleTheme: () => void;
}

export const useUI = create<UIState>((set, get) => ({
  simRunning: false,
  standupLines: [],
  theme: "light",
  startSim: () => {
    if (get().simRunning) return;
    stopSim = startSimulation(engineState, () => emit(), DEFAULT_SIM);
    set({ simRunning: true });
  },
  stopSim: () => {
    stopSim?.();
    stopSim = undefined;
    set({ simRunning: false });
  },
  setStandupLines: (lines) => set({ standupLines: lines }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
}));

// ---- dispatch：动作统一走这里，改完引擎后 emit ----
export function dispatch(action: string, payload?: any) {
  switch (action) {
    case "standup": {
      const lines = dailyStandup(engineState);
      useUI.getState().setStandupLines(lines.length ? lines : ["（无进行中任务）"]);
      emit();
      break;
    }
    case "start_meeting":
      startMeeting(engineState, payload?.title ?? "新会议", payload?.participants ?? []);
      emit();
      break;
    case "add_minute":
      addMinute(engineState, payload?.meetingId, payload?.employeeId, payload?.text ?? "（发言）");
      emit();
      break;
    case "end_meeting":
      if (payload) {
        endMeeting(engineState, payload);
        emit();
      }
      break;
    case "form_team":
      formTeam(engineState, payload?.name ?? "新小队", payload?.ownerTask ?? "", payload?.composition ?? { lead: 1, designer: 1, frontend: 1, qa: 1 });
      emit();
      break;
    case "dissolve_team":
      dissolveTeam(engineState, payload);
      emit();
      break;
    case "record_media":
      recordMedia(engineState, { kind: payload?.kind ?? "image", prompt: payload?.prompt ?? "", url: payload?.url ?? "", model: payload?.model ?? "agnes" });
      emit();
      break;
    case "cross_review":
      crossReview(engineState, payload?.taskId, payload?.reviewerId, payload?.approved, payload?.note);
      emit();
      break;
    default:
      emit();
      break;
  }
}

// 引擎状态经 useSyncExternalStore 订阅：tick 推进 → emit → 组件自动刷新
export function useCompanyState(): CompanyState {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return getState();
}

// 应用级副作用：把 theme 落到根节点 data 属性
export function useApplyTheme(theme: "light" | "dark") {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}
