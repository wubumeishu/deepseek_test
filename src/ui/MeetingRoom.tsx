// 会议室：跨部门讨论（非任务分配）
import type { CompanyState } from "../types";

export function MeetingRoom({ state, dispatch }: { state: CompanyState; dispatch: (a: string, p?: any) => void }) {
  const meetings = Object.values(state.meetings);
  const active = meetings.filter(m => !m.endedAt);
  return (
    <section className="compony-meeting" aria-label="会议室">
      <h3>会议室（{active.length} 进行中）</h3>
      {active.map(m => (
        <div key={m.id} style={{ border: "1px solid #ccc", borderRadius: 6, padding: 6, marginBottom: 6 }}>
          <b>{m.title}</b>
          <div>{m.participants.map(id => state.employees[id]?.name).join(" · ")}</div>
          <div style={{ margin: "4px 0" }}>
          <b style={{ fontSize: 11 }}>最近发言：</b>
          <ul style={{ margin: "2px 0", paddingLeft: 18 }}>
            {m.minutes.slice(-3).map(((min, i) => (
              <li key={i}>{state.employees[min.employeeId]?.name}：{min.text}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <button onClick={() => dispatch("add_minute", { meetingId: m.id, employeeId: m.participants[0], text: "..." })}>+ 发言</button>
            <button onClick={() => dispatch("end_meeting", m.id)}>结束会议</button>
          </div>
        </div>
      ))}
      <button onClick={() => dispatch("start_meeting", { title: "新会议", participants: [] })}>+ 发起会议</button>
    </section>
  );
}