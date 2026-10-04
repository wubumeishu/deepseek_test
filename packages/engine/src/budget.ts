import type { CompanyState } from "@compony/protocol";
const MIN = 60_000;
const FIVE_H = 5 * 3600_000;

export function canSpend(s: CompanyState, tokens: number, now = Date.now()): boolean {
  if (s.budget.resetMinAt && now - s.budget.resetMinAt >= MIN) { s.budget.usedMin = 0; s.budget.resetMinAt = now; }
  if (s.budget.resetBurstAt && now - s.budget.resetBurstAt >= FIVE_H) { s.budget.usedBurst = 0; s.budget.resetBurstAt = now; }
  const ok = s.budget.usedMin + tokens <= s.budget.requestsPerMin
    && s.budget.usedBurst + tokens <= s.budget.burst;
  if (ok) { s.budget.usedMin += tokens; s.budget.usedBurst += tokens; }
  return ok;
}