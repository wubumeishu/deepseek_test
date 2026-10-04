// Web 半体：把公司面板注入 DSH 右侧栏
import { CompanyPanel } from "../../../../src/ui/index";
import type { CompanyState } from "../../../../src/types";

export default function mountCompony(ctx: any) {
  // 在 DSH 右侧栏注册"公司"Tab
  const state: CompanyState = (ctx?.componyState) ?? defaultState();
  const dispatch = (action: string, payload?: any) => {
    ctx?.invoke?.("compony_tool", { action, payload });
  };
  ctx?.ui?.sidebar?.register?.({
    id: "compony",
    title: "公司",
    icon: "🏢",
    component: () => CompanyPanel({ state, dispatch }),
  });
}

function defaultState(): CompanyState {
  return {
    employees: {}, departments: {}, meetings: {}, tasks: {}, teams: {},
    git: { branches: {}, trunk: "main", conflicts: {}, commits: 0, bugs: 0 },
    pitfalls: [], media: [], audit: [],
    budget: { requestsPerMin: 160, burst: 1500, usedMin: 0, usedBurst: 0, resetMinAt: 0, resetBurstAt: 0 },
    burndown: { total: 0, done: 0 },
  };
}
