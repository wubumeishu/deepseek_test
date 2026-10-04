// M2.3 中央状态层（API-only）：不再 import engine。
// 初值由 api.ts fetchState() 拉取；后续状态更新走 SSE subscribeEvents()。
// UI 状态（simRunning / standupLines / theme / apiReady / apiError）仍用 Zustand。
// 组件用 useCompanyState() 读 CompanyState，用 dispatch() 发动作。
import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import type { CompanyState } from "../types";
import { fetchState, postAction, subscribeEvents, healthCheck } from "../api";

// ---- API 状态（模块级单例）----
let state: CompanyState | null = null;
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
export function getState(): CompanyState | null { return state; }
export function getSnapshot(): number { return version; }
export function isReady(): boolean { return state !== null; }

// 初始化：拉取首屏 state（必须在组件 mount 后调用一次）
export async function initCompany(): Promise<void> {
  if (state) return; // 已初始化
  state = await fetchState();
  emit();
}

// SSE 持续订阅（在模块顶层调用一次，避免重复连接）
let sseCleanup: (() => void) | null = null;
export function startSSE(): void {
  if (sseCleanup) return;
  sseCleanup = subscribeEvents(
    (newState) => { state = newState; emit(); },
  );
}
export function stopSSE(): void {
  if (sseCleanup) { sseCleanup(); sseCleanup = null; }
}

// ---- UI 状态（Zustand）----
interface UIState {
  simRunning: boolean;
  standupLines: string[];
  theme: "light" | "dark";
  apiReady: boolean;
  apiError: string | null;
  markApiReady: () => void;
  setApiError: (msg: string) => void;
  startSim: () => void;
  stopSim: () => void;
  setStandupLines: (lines: string[]) => void;
  toggleTheme: () => void;
}

export const useUI = create<UIState>((set) => ({
  simRunning: false,
  standupLines: [],
  theme: "light",
  apiReady: false,
  apiError: null,
  markApiReady: () => set({ apiReady: true, apiError: null }),
  setApiError: (msg) => set({ apiError: msg }),
  startSim: () => set({ simRunning: true }),
  stopSim: () => set({ simRunning: false }),
  setStandupLines: (lines) => set({ standupLines: lines }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
}));

// ---- dispatch：动作统一走 API ----
export async function dispatch(action: string, payload?: any): Promise<void> {
  switch (action) {
    case "standup":
      await postAction("standup", {}, payload?.sessionId);
      break;
    case "start_meeting":
      await postAction("start_meeting", { title: payload?.title, participants: payload?.participants ?? [] }, payload?.sessionId);
      break;
    case "form_team":
      await postAction("form_team", { name: payload?.name, ownerTask: payload?.ownerTask, composition: payload?.composition }, payload?.sessionId);
      break;
    case "cross_review":
      await postAction("cross_review", { taskId: payload?.taskId, reviewerId: payload?.reviewerId, approved: payload?.approved, note: payload?.note }, payload?.sessionId);
      break;
    default:
      break;
  }
}

// 健康检查（可选，用于诊断）
export { healthCheck };

// 引擎状态经 useSyncExternalStore 订阅：SSE tick → emit → 组件自动刷新
export function useCompanyState(): CompanyState | null {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return getState();
}

// 应用级副作用：把 theme 落到根节点 data 属性
export function useApplyTheme(theme: "light" | "dark") {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}
