import type { CompanyState } from "../types";
import { canSpend } from "./budget.ts";
import { decomposeTask, completeTask } from "./taskboard.ts";
import { endMeeting } from "./meeting.ts";
import { logAudit, backup } from "./audit.ts";

export interface SimConfig { tickMs: number; coolDownMs: number; autoCompleteRatio: number; }
export const DEFAULT_SIM: SimConfig = { tickMs: 5000, coolDownMs: 60_000, autoCompleteRatio: 0.15 };

// 每日站会：由 @goodandready/dsh-cron 驱动，这里是站会逻辑
export function dailyStandup(s: CompanyState): string[] {
  const lines: string[] = [];
  for (const t of Object.values(s.tasks)) {
    if (t.status === "in_progress" && t.assignee) {
      const e = s.employees[t.assignee];
      lines.push(e.name + "：昨天-" + t.status + " 今天-" + t.title + " 阻碍-" + (t.pr ? "待审查" : "无"));
    }
  }
  if (lines.length) s.audit.push({ at: Date.now(), actor: "system", action: "standup", detail: lines.join(" | ") });
  return lines;
}

// 推进一次模拟
export function tick(s: CompanyState, cfg: SimConfig = DEFAULT_SIM, now = Date.now()) {
  for (const e of Object.values(s.employees)) {
    if (e.status === "cooling" && e.coolingUntil && now >= e.coolingUntil) {
      e.status = "idle"; e.coolingUntil = undefined;
      logAudit(s, e.id, "cool_done", e.name + " 冷却结束");
    }
  }
  for (const t of Object.values(s.tasks)) {
    if (t.status === "backlog" && !t.assignee) {
      const dept = s.departments[t.owner];
      const idle = (dept?.members ?? []).map(id => s.employees[id]).filter(e => e && e.status === "idle").sort((a, b) => b.skill - a.skill)[0];
      if (idle && canSpend(s, t.estTokens ?? 1000, now)) {
        decomposeTask(s, t.id);
        t.status = "in_progress";
        idle.status = "working";
      }
    }
  }
  for (const t of Object.values(s.tasks)) {
    if (t.status === "in_progress" && Math.random() < cfg.autoCompleteRatio) {
      completeTask(s, t.id);
      const e = s.employees[t.assignee!];
      if (e) { e.status = "cooling"; e.coolingUntil = now + cfg.coolDownMs; }
    }
  }
  for (const m of Object.values(s.meetings)) {
    if (!m.endedAt && now - m.startedAt > 10 * 60_000) endMeeting(s, m.id);
  }
  const last = s.audit.find(a => a.action === "backup");
  if (!last || now - last.at > 5 * 60_000) backup(s);
  return s;
}

export function startSimulation(s: CompanyState, onTick?: (s: CompanyState) => void, cfg: SimConfig = DEFAULT_SIM): () => void {
  const id = setInterval(() => { tick(s, cfg); onTick?.(s); }, cfg.tickMs);
  return () => clearInterval(id);
}
