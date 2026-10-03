import type { CompanyState, Pitfall } from "../types";

export function recordPitfall(s: CompanyState, title: string, context: string, lesson: string, addedBy: string, tags: string[] = []): Pitfall {
  const p: Pitfall = {
    id: "pit_" + Math.random().toString(36).slice(2, 8),
    title, context, lesson, addedBy, addedAt: Date.now(), tags,
  };
  s.pitfalls.push(p);
  s.audit.push({ at: Date.now(), actor: addedBy, action: "pitfall", detail: title });
  return p;
}

export function findPitfall(s: CompanyState, keyword: string): Pitfall | undefined {
  const k = keyword.toLowerCase();
  return s.pitfalls.find(p => p.title.toLowerCase().includes(k) || p.lesson.toLowerCase().includes(k));
}
