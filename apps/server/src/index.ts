// Compony HTTP 服务层：零第三方依赖（Node 内置 http + node:sqlite），挂载 engine。
// M3：持久化（SQLite）+ 宿主解耦（DSH 不再是宿主，服务端可独立运行）。
// 端点：
//   GET  /api/state                 读取会话 CompanyState（?session=<id>）
//   POST /api/actions/:name         驱动一个领域动作（hire / task / standup / ...）
//   GET  /api/events                SSE 流（每次动作 / tick 后推送 state 快照）
//   GET  /api/health                健康检查
//   POST   /api/sessions/:id/backup  快照备份（可回溯）
//   DELETE /api/sessions/:id         删除会话
// 持久化：每个 sessionId 落到 compony.sqlite；新会话首次访问用 runCompanyDemo() 种子。
import { createServer } from "node:http";
import {
  runCompanyDemo, dailyStandup, startSimulation, DEFAULT_SIM,
  hireEmployee, createTask, formTeam, startMeeting, recordPitfall, crossReview,
} from "../../../packages/engine/src/index.ts";
import type { CompanyState } from "../../../packages/protocol/src/index.ts";
import { SqliteStore } from "./store-sqlite.ts";

// 持久化端口：SQLite 适配器（宿主无关，零第三方依赖）
const store = new SqliteStore({ filePath: process.env.COMPONY_DB ?? "compony.sqlite" });

// 会话隔离 + 持久化：sessionId -> 独立 state（首次从 DB 加载，无则种子并落盘）
const sessions = new Map<string, CompanyState>();
function getSession(id?: string): CompanyState {
  const key = id ?? "default";
  if (sessions.has(key)) return sessions.get(key)!;
  let s = store.load(key);
  if (!s) { s = runCompanyDemo(); }
  sessions.set(key, s);
  store.save(key, s);
  return s;
}
function persist(key: string): void {
  const s = sessions.get(key);
  if (s) store.save(key, s);
}

// SSE 广播器
type SSEClient = { send: (payload: string) => void; closed: boolean };
const sseClients = new Set<SSEClient>();
function broadcast(sessionId: string, state: CompanyState) {
  const payload = JSON.stringify({ type: "state", sessionId, state });
  for (const c of sseClients) if (!c.closed) c.send(payload);
}

// 动作映射：/api/actions/:name -> 引擎纯函数
function applyAction(sessionId: string, name: string, payload: any): { ok: boolean; message?: string } {
  const s = getSession(sessionId);
  switch (name) {
    case "standup":     dailyStandup(s); break;
    case "hire":
      hireEmployee(s, payload?.name ?? "新员工", payload?.role ?? "frontend",
                   payload?.dept ?? "frontend", payload?.skill ?? 60, payload?.avatar ?? "cat_default");
      break;
    case "task":
      createTask(s, payload?.title ?? "新任务", payload?.owner ?? "backend",
                 payload?.storyPoints ?? 3, payload?.estTokens ?? 5000);
      break;
    case "form_team":
      formTeam(s, payload?.name ?? "新小队", payload?.ownerTask ?? "",
               payload?.composition ?? { lead: 1, designer: 1, frontend: 1, qa: 1 });
      break;
    case "start_meeting":
      startMeeting(s, payload?.title ?? "新会议", payload?.participants ?? []);
      break;
    case "pitfall":
      recordPitfall(s, payload?.title ?? "新踩坑", payload?.context ?? "",
                    payload?.lesson ?? "", payload?.addedBy ?? "system", payload?.tags ?? []);
      break;
    case "cross_review":
      crossReview(s, payload?.taskId, payload?.reviewerId, payload?.approved ?? true, payload?.note);
      break;
    default:
      return { ok: false, message: "unknown action: " + name };
  }
  persist(sessionId);
  broadcast(sessionId, s);
  return { ok: true };
}

// 后台模拟 tick：每 5s 推进一次并广播（default 会话）
const simStop = startSimulation(getSession("default"), () => {
  persist("default");
  broadcast("default", getSession("default"));
}, DEFAULT_SIM);
process.on("SIGINT", simStop);

function sessionRefFrom(parts: string[]): string | null {
  // /api/sessions/<id> 或 /api/sessions/<id>/backup
  return parts.length >= 4 && parts[1] === "api" && parts[2] === "sessions" ? parts[3] : null;
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const parts = url.pathname.split("/");
  const sessionId = url.searchParams.get("session") ?? "default";

  if (url.pathname === "/api/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, sessions: sessions.size, persisted: true }));
    return;
  }

  if (url.pathname === "/api/state" && req.method === "GET") {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify({ sessionId, state: getSession(sessionId) }));
    return;
  }

  // POST /api/actions/<name>
  if (parts.length === 4 && parts[1] === "api" && parts[2] === "actions" && req.method === "POST") {
    const actionName = parts[3];
    let body = "";
    req.on("data", (c: Buffer) => { body += c; });
    req.on("end", () => {
      let payload: any = {};
      try { if (body) payload = JSON.parse(body); } catch { payload = {}; }
      const result = applyAction(sessionId, actionName, payload);
      res.writeHead(result.ok ? 200 : 400, { "content-type": "application/json" });
      res.end(JSON.stringify({ sessionId, ...result }));
    });
    return;
  }

  // POST /api/sessions/<id>/backup
  const sessId = sessionRefFrom(parts);
  if (sessId && parts.length === 5 && parts[4] === "backup" && req.method === "POST") {
    const s = getSession(sessId);
    const id = store.backup(s);
    persist(sessId);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ sessionId: sessId, backupId: id, backups: store.listBackups().length }));
    return;
  }

  // DELETE /api/sessions/<id>
  if (sessId && parts.length === 4 && req.method === "DELETE") {
    sessions.delete(sessId);
    store.delete(sessId);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ deleted: sessId }));
    return;
  }

  if (url.pathname === "/api/events" && req.method === "GET") {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      "connection": "keep-alive",
      "access-control-allow-origin": "*",
    });
    res.write("retry: 2000\n\n");
    const client: SSEClient = {
      send: (payload: string) => { res.write("data: " + payload + "\n\n"); },
      closed: false,
    };
    sseClients.add(client);
    client.send(JSON.stringify({ type: "state", sessionId, state: getSession(sessionId) }));
    req.on("close", () => { client.closed = true; sseClients.delete(client); });
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

const PORT = Number(process.env.COMPONY_PORT ?? 4174);
server.listen(PORT, "127.0.0.1", () => {
  console.log("Compony API 服务已启动（M3 持久化）: http://127.0.0.1:" + PORT + "/api/state");
});

process.on("SIGTERM", () => { try { store.close(); } catch { /* ignore close errors on shutdown */ } process.exit(0); });

export default server;
export { store, sessions };