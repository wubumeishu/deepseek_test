// M3 持久化契约测试：SQLite 端口重启后保留会话状态（宿主解耦的关键证据）
import { describe, it, expect, afterAll } from "vitest";
import { tmpdir } from "node:os";
import path from "node:path";
import fs from "node:fs";
import { SqliteStore } from "../store-sqlite.ts";
import { runCompanyDemo, hireEmployee } from "../../../../packages/engine/src/index.ts";

const dbPath = path.join(tmpdir(), "compony-m3-" + Date.now() + ".sqlite");

describe("M3 持久化：SQLite 端口 roundtrip + 会话隔离", () => {
  it("重启后 default 会话状态保留（持久化成功）", () => {
    const store1 = new SqliteStore({ filePath: dbPath });
    let s = store1.load("default");
    if (!s) s = runCompanyDemo();
    hireEmployee(s, "持久化测试员", "qa", "qa", 55, "cat_test");
    const employeesBefore = Object.keys(s.employees).length;
    store1.save("default", s);
    store1.close();
    const store2 = new SqliteStore({ filePath: dbPath });
    const s2 = store2.load("default");
    expect(s2).not.toBeNull();
    expect(Object.keys(s2!.employees).length).toBe(employeesBefore);
    expect(Object.values(s2!.employees).some((e) => e.name === "持久化测试员")).toBe(true);
    store2.close();
  });
  it("会话隔离：不同 sessionId 互不影响", () => {
    const store = new SqliteStore({ filePath: dbPath });
    let sB = store.load("branch");
    if (!sB) sB = runCompanyDemo();
    hireEmployee(sB, "分支员工", "qa", "qa", 50, "cat_red");
    store.save("branch", sB);
    const sA = store.load("default");
    expect(Object.values(sA!.employees).some((e) => e.name === "分支员工")).toBe(false);
    store.close();
  });
  it("备份可列出（可回溯）", () => {
    const store = new SqliteStore({ filePath: dbPath });
    const s = store.load("default") ?? runCompanyDemo();
    const id = store.backup(s);
    expect(id).toMatch(/^bk_/);
    expect(store.listBackups().length).toBeGreaterThanOrEqual(1);
    store.close();
  });
  afterAll(() => {
    try { fs.rmSync(dbPath, { force: true }); } catch { /* ignore if file already gone */ }
  });
});
