#!/usr/bin/env node
// Compony 每日站会：读 ~/.compony/state.json，输出三问纪要（昨天/今天/阻碍）
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import * as E from "../src/engine/index.ts";

const STATE_FILE = process.env.COMPONY_STATE ?? join(homedir(), ".compony", "state.json");
let s;
if (existsSync(STATE_FILE)) {
  s = JSON.parse(readFileSync(STATE_FILE, "utf8"));
} else {
  s = E.initCompany();
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

// 跑每日站会
const lines = E.dailyStandup(s);
console.log("📋 每日站会纪要（" + new Date().toISOString().slice(0, 10) + "）\n");
lines.forEach(l => console.log("  " + l));

// 记录到审计 + 备份
E.logAudit(s, "dsh-cron", "daily_standup", lines.length + " 条纪要");
E.backup(s);
mkdirSync(dirname(STATE_FILE), { recursive: true });
writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
console.log("\n✅ 站会已记录到审计 + 备份。state: " + STATE_FILE);
