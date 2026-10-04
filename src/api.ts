// M2.3 API 客户端层：panel 唯一允许调用 fetch / EventSource 的入口。
// 组件层（src/pages/*, src/ui/*）禁止直接 fetch（契约测试守卫）。
// 默认走 dev server proxy（/api -> http://127.0.0.1:4174/api）。
import type { CompanyState } from "./types";

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? "/api";

// ---- 读取 ----
export async function fetchState(sessionId?: string): Promise<CompanyState> {
  const qs = sessionId ? "?session=" + encodeURIComponent(sessionId) : "";
  const r = await fetch(API_BASE + "/state" + qs, { cache: "no-store" });
  if (!r.ok) throw new Error("GET /api/state -> " + r.status);
  const j = (await r.json()) as { state: CompanyState };
  return j.state;
}

// ---- 动作 ----
export async function postAction(
  name: string,
  payload?: Record<string, unknown>,
  sessionId?: string,
): Promise<{ ok: boolean; message?: string }> {
  const qs = sessionId ? "?session=" + encodeURIComponent(sessionId) : "";
  const r = await fetch(API_BASE + "/actions/" + name + qs, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {}),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("POST /api/actions/" + name + " -> " + r.status);
  return (await r.json()) as { ok: boolean; message?: string };
}

// ---- SSE 订阅 ----
// 返回取消函数。每次收到 state 快照调用 onState。
export function subscribeEvents(
  onState: (state: CompanyState) => void,
  onStatus?: (s: "connecting" | "open" | "closed") => void,
  sessionId?: string,
): () => void {
  const qs = sessionId ? "?session=" + encodeURIComponent(sessionId) : "";
  const es = new EventSource(API_BASE + "/events" + qs);
  es.onopen = () => onStatus?.("open");
  es.onerror = () => onStatus?.("closed");
  es.onmessage = (ev: MessageEvent<string>) => {
    try {
      const j = JSON.parse(ev.data) as { state: CompanyState };
      if (j && j.state) onState(j.state);
    } catch {
      /* 忽略脏帧 */
    }
  };
  return () => es.close();
}

// ---- 健康检查 ----
export async function healthCheck(): Promise<{ ok: boolean; sessions: number }> {
  const r = await fetch(API_BASE + "/health", { cache: "no-store" });
  if (!r.ok) throw new Error("GET /api/health -> " + r.status);
  return (await r.json()) as { ok: boolean; sessions: number };
}
