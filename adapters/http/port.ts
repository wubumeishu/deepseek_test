// M3 领域能力端口（HTTP 适配器）：10 个领域能力 <-> REST 路由 的声明式映射。
// 这是"端口"的 HTTP 侧：engine 的纯函数通过它暴露为可被任意客户端（web/CLI/CI）消费的 REST 契约。
// adapters/dsh 是同一组端口的 DSH 侧实现；两者互为等价消费者，DSH 因此降级为可选。
import type { CapabilityPort } from "./types.ts";

export const HTTP_CAPABILITIES: CapabilityPort[] = [
  { id: "state",   engine: "runCompanyDemo/StateStore.load", route: "/api/state",              method: "GET",  desc: "读取公司状态" },
  { id: "hire",    engine: "hireEmployee",                    route: "/api/actions/hire",       method: "POST", desc: "招聘员工" },
  { id: "task",    engine: "createTask",                      route: "/api/actions/task",       method: "POST", desc: "创建任务" },
  { id: "team",    engine: "formTeam",                         route: "/api/actions/form_team",  method: "POST", desc: "组建敏捷小队" },
  { id: "meeting", engine: "startMeeting",                    route: "/api/actions/start_meeting", method: "POST", desc: "发起会议" },
  { id: "pitfall", engine: "recordPitfall",                   route: "/api/actions/pitfall",    method: "POST", desc: "沉淀踩坑" },
  { id: "review",  engine: "crossReview",                     route: "/api/actions/cross_review", method: "POST", desc: "交叉审查 PR" },
  { id: "standup", engine: "dailyStandup",                    route: "/api/actions/standup",    method: "POST", desc: "每日站会" },
  { id: "events",  engine: "SSE 广播",                         route: "/api/events",             method: "GET",  desc: "订阅状态变更流" },
  { id: "backup",  engine: "SqliteStore.backup",              route: "/api/sessions/:id/backup", method: "POST", desc: "快照备份" },
];

export function routeForCapability(id: string): CapabilityPort | undefined {
  return HTTP_CAPABILITIES.find((c) => c.id === id);
}
