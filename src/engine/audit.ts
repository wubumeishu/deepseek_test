import type { CompanyState, AuditLog } from "../types";

export function logAudit(s: CompanyState, actor: string, action: string, detail: string, checksum?: string) {
  const entry: AuditLog = { at: Date.now(), actor, action, detail, checksum };
  s.audit.push(entry);
  return entry;
}

export function backup(s: CompanyState): string {
  const json = JSON.stringify(s);
  let h = 0;
  for (let i = 0; i < json.length; i++) { h = (h * 31 + json.charCodeAt(i)) | 0; }
  const entry = logAudit(s, "system", "backup", "state snapshot", String(h));
  return entry.detail + ":" + String(h);
}

export function recentAudit(s: CompanyState, n = 20): AuditLog[] {
  return s.audit.slice(-n);
}
