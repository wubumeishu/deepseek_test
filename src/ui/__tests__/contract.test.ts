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
  const re1 = /from\s*["']\.\.\//g;
  const lines = src.split("\n");
  for (const line of lines) {
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

describe("架构契约：状态层订阅引擎 tick", () => {
  it("companyStore.ts 使用 useSyncExternalStore", () => {
    const src = fs.readFileSync(path.join(srcDir, "state", "companyStore.ts"), "utf8");
    expect(src).toContain("useSyncExternalStore");
    expect(src).toContain("runCompanyDemo");
  });
});
