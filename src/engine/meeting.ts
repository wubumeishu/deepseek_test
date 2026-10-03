import type { CompanyState, Meeting } from "../types";

export function startMeeting(s: CompanyState, title: string, participants: string[]): Meeting {
  const id = "m_" + Math.random().toString(36).slice(2, 8);
  const m: Meeting = { id, title, participants, minutes: [], startedAt: Date.now() };
  s.meetings[id] = m;
  for (const p of participants) {
    const e = s.employees[p];
    if (e) e.status = "meeting";
  }
  s.audit.push({ at: Date.now(), actor: "system", action: "meeting_start", detail: title });
  return m;
}

export function addMinute(s: CompanyState, meetingId: string, employeeId: string, text: string) {
  const m = s.meetings[meetingId];
  if (!m) return;
  m.minutes.push({ at: Date.now(), employeeId, text });
}

export function endMeeting(s: CompanyState, meetingId: string) {
  const m = s.meetings[meetingId];
  if (!m) return;
  m.endedAt = Date.now();
  for (const p of m.participants) {
    const e = s.employees[p];
    if (e && e.status === "meeting") e.status = "idle";
  }
  s.audit.push({ at: Date.now(), actor: "system", action: "meeting_end", detail: m.title });
}
