// Compony HTTP 服务层：零第三方依赖（Node 内置 http），挂载 engine。
// 端点：
//   GET  /api/state        读取当前 CompanyState
//   POST /api/actions/:name  驱动一个领域动作（hire / task / standup / ...）
//   GET  /api/events       SSE 流（每次动作 / tick 后推送 state 快照）
//   GET  /api/health       健康检查
import { createServer } from "node:http";
import {
  runCompanyDemo, dailyStandup, startSimulation, DEFAULT_SIM,
  hireEmployee, createTask, formTeam, startMeeting, recordPitfall, crossReview,
} from "../../../packages/engine/src/index.ts";
import type { CompanyState } from "../../../packages/protocol/src/index.ts";

// 会话隔离最小实现：sessionId -> 独立 state
const sessions = new Map<string, CompanyState>();
function getSession(id?: string): CompanyState {
  const key = id ?? "default";
  if (!sessions.has(key)) sessions.set(key, runCompanyDemo());
  return sessions.get(key)!;
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
  broadcast(sessionId, s);
  return { ok: true };
}

// 后台模拟 tick：每 5s 推进一次并广播
const simStop = startSimulation(getSession("default"), () => {
  broadcast("default", getSession("default"));
}, DEFAULT_SIM);
process.on("SIGINT", simStop);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const sessionId = url.searchParams.get("session") ?? "default";

  if (url.pathname === "/api/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, sessions: sessions.size }));
    return;
  }

  if (url.pathname === "/api/state" && req.method === "GET") {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify({ sessionId, state: getSession(sessionId) }));
    return;
  }

  // 匹配 /api/actions/<name>
  const parts = url.pathname.split("/");
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
  console.log("Compony API 服务已启动: http://127.0.0.1:" + PORT + "/api/state");
});

export default server;