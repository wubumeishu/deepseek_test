#!/usr/bin/env node
// Compony 一条命令起完整平台（API 4174 + 面板 4173 含 /api 反向代理 + SQLite 持久化）。
// 等价于 §10 M4 验收「git clone → 一条命令 → 浏览器可用」。
// 用法： node start-compony.mjs   →  浏览器开 http://127.0.0.1:4173/

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPort = process.env.COMPONY_PORT || "4174";
const panelPort = process.env.PORT || "4173";
const dbPath = process.env.COMPONY_DB || path.join(__dirname, "compony.sqlite");

const common = { cwd: __dirname, stdio: "inherit", env: { ...process.env } };

console.log("Compony 平台启动中…");
console.log("  API  → http://127.0.0.1:" + apiPort + "/api/state");
console.log("  面板  → http://127.0.0.1:" + panelPort + "/");
console.log("  存储  → " + dbPath);
console.log("  Ctrl+C 停止两个服务。\n");

const api = spawn(process.execPath, ["--experimental-strip-types", "apps/server/src/index.ts"], {
  ...common,
  env: { ...process.env, COMPONY_PORT: apiPort, COMPONY_DB: dbPath },
});
const panel = spawn(process.execPath, ["static-server.mjs"], {
  ...common,
  env: { ...process.env, PORT: panelPort, COMPONY_API_PORT: apiPort },
});

function shutdown(code) {
  api.kill();
  panel.kill();
  setTimeout(() => process.exit(code ?? 0), 300).unref();
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
api.on("exit", (c) => shutdown(c ?? 0));
panel.on("exit", (c) => { if (c) shutdown(c ?? 0); });
