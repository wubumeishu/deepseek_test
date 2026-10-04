// 架构契约测试：断言不变量，而非函数返回值。
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiDir = path.resolve(__dirname, "..");
const srcDir = path.resolve(__dirname, "../..");

function readUi(rel: string): string {
  return fs.readFileSync(path.join(uiDir, rel), "utf8");
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") out.push(...walk(p));
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

// 检测文件是否从 "…/engine" 直接 import
function hasEngineImport(src: string): boolean {
  for (const line of src.split("\n")) {
    if (/from\s*["'][^"']*engine["']/.test(line) && !line.includes("types")) return true;
  }
  return false;
}

// 检测文件是否从 react-dom 导入 hook
function importsHookFromReactDom(src: string, hookName: string): boolean {
  const marker = hookName;
  for (const line of src.split("\n")) {
    if (!line.includes(marker)) continue;
    if (/from\s*["']react-dom/.test(line)) return true;
  }
  return false;
}

describe("架构契约：组件层不得直接 import engine", () => {
  const uiFiles = [
    "BuildingView.tsx", "Workstations.tsx", "Employee.tsx", "CoffeeRoom.tsx",
    "MeetingRoom.tsx", "AgileBoard.tsx", "QuotaDashboard.tsx", "MediaPanel.tsx",
    "Dashboard.tsx", "layout/Layout.tsx",
  ];

  for (const f of uiFiles) {
    it(f + " 不得直接 import engine", () => {
      const src = readUi(f);
      expect(hasEngineImport(src), f + " 中发现了 engine 直接导入").toBe(false);
    });
  }
});

describe("架构契约：设计令牌无硬编码色值（ui/* 内）", () => {
  const ALLOWED = new Set([
    "#fff", "#ffffff", "#eee", "#fafafa",
    "#fff8e1", "#ffe082",
    "#eef2ff", "#334155", "#1e2545", "#cbd5e1",
    "#4caf50", "#9e9e9e", "#2196f3", "#ff9800", "#607d8b",
    "#f44336", "#888", "#999", "#666", "#ccc", "#ddd", "#bbb",
    "#1b1f24", "#f5f6f8", "#4d441f", "#2a2617",
  ]);

  it("ui/* 组件中的颜色字面量必须走 CSS 变量或白名单", () => {
    const violations: string[] = [];
    const colorRe = /["']#([0-9a-fA-F]{3,8})["']/g;
    for (const file of walk(uiDir)) {
      if (file.includes("__tests__")) continue;
      const src = fs.readFileSync(file, "utf8");
      colorRe.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = colorRe.exec(src)) !== null) {
        const hex = ("#" + m[1]).toLowerCase();
        if (!ALLOWED.has(hex)) violations.push(path.relative(uiDir, file) + ": " + hex);
      }
    }
    expect(violations, "发现硬编码色值：\n" + violations.join("\n")).toHaveLength(0);
  });
});

describe("架构契约：每个路由页面都 lazy 加载", () => {
  it("main.tsx 中 7 个页面全部 lazy() 导入", () => {
    const src = fs.readFileSync(path.join(srcDir, "main.tsx"), "utf8");
    const lazyCount = (src.match(/lazy\(\(\)\s*=>\s*import/g) || []).length;
    expect(lazyCount, "应至少 7 个 lazy 页面，实际 " + lazyCount).toBeGreaterThanOrEqual(7);
  });
});

describe("架构契约：hooks 必须从 react 导入", () => {
  it("src/** 中不得从 react-dom* 导入 hook", () => {
    const hookNames = ["useState", "useEffect", "useMemo", "useCallback", "useRef", "useReducer", "useContext"];
    for (const file of walk(srcDir)) {
      const src = fs.readFileSync(file, "utf8");
      for (const h of hookNames) {
        if (importsHookFromReactDom(src, h)) {
          throw new Error(path.relative(srcDir, file) + " 从 react-dom* 导入 hook: " + h);
        }
      }
    }
  });
});

describe("架构契约：状态层经 API 同步（M2.3）", () => {
  it("companyStore.ts 使用 useSyncExternalStore + fetchState（不再直接 import engine）", () => {
    const src = fs.readFileSync(path.join(srcDir, "state", "companyStore.ts"), "utf8");
    expect(src).toContain("useSyncExternalStore");
    expect(src).toContain("fetchState");
    expect(src).not.toContain("runCompanyDemo");
  });
});

describe("架构契约：面板禁止直接 import engine（M2.3 API-only）", () => {
  const panelFiles = walk(srcDir).filter(f => {
    const rel = path.relative(srcDir, f).replace(/\\/g, "/");
    return (rel.startsWith("ui/") || rel.startsWith("pages/")) && !f.includes("__tests__");
  });
  it("src/ui/* 与 src/pages/* 中不得 import engine", () => {
    const violations: string[] = [];
    for (const file of panelFiles) {
      const src = fs.readFileSync(file, "utf8");
      if (hasEngineImport(src)) violations.push(path.relative(srcDir, file));
    }
    expect(violations, "直接 import engine: \n" + violations.join("\n")).toHaveLength(0);
  });
});

describe("架构契约：src/api.ts 导出必备 API 函数（M2.3）", () => {
  it("api.ts 必须导出 fetchState / postAction / subscribeEvents", () => {
    const src = fs.readFileSync(path.join(srcDir, "api.ts"), "utf8");
    expect(src).toContain("export async function fetchState");
    expect(src).toContain("export async function postAction");
    expect(src).toContain("export function subscribeEvents");
  });
});

// ── M3 架构契约：宿主解耦 + 持久化端口 ─────────────────────────
describe("架构契约：engine 保持零 IO（宿主解耦）", () => {
  const engineDir = path.resolve(srcDir, "../packages/engine/src");
  const engineFiles = walk(engineDir).filter((f) => !f.includes("__tests__"));
  it.each(engineFiles)("engine 文件不得 import node:fs/os/child_process: %s", (f) => {
    const src = fs.readFileSync(f, "utf8");
    expect(src).not.toMatch(/from\s*["']node:(fs|os|child_process|http)/);
  });
});

describe("架构契约：StateStore 端口在 protocol 中定义", () => {
  it("protocol 导出 StateStore 接口（load/save）", () => {
    const proto = fs.readFileSync(path.resolve(srcDir, "../packages/protocol/src/index.ts"), "utf8");
    expect(proto).toContain("export interface StateStore");
    expect(proto).toContain("load(sessionId: string)");
    expect(proto).toContain("save(sessionId: string, state: CompanyState)");
  });
});

describe("架构契约：服务端用 SQLite 持久化（不依赖宿主）", () => {
  const serverDir = path.resolve(srcDir, "../apps/server/src");
  it("server 实现 StateStore 端口（SqliteStore）", () => {
    const store = fs.readFileSync(path.join(serverDir, "store-sqlite.ts"), "utf8");
    expect(store).toContain("implements StateStore");
    expect(store).toContain("node:sqlite");
  });
  it("server 的 getSession 先查 store.load（持久化）", () => {
    const idx = fs.readFileSync(path.join(serverDir, "index.ts"), "utf8");
    expect(idx).toContain("store.load");
    expect(idx).toContain("store.save");
  });
});
