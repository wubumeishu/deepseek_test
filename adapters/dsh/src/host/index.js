// DSH host 入口（Node 24 原生 import .ts）
import * as E from "../../../../packages/engine/src/index.ts";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

const STATE_FILE = process.env.COMPONY_STATE ?? join(homedir(), ".compony", "state.json");

function loadState() {
  if (existsSync(STATE_FILE)) {
    try { return JSON.parse(readFileSync(STATE_FILE, "utf8")); } catch {}
  }
  return E.initCompany();
}
function saveState(s) {
  try { mkdirSync(dirname(STATE_FILE), { recursive: true }); writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); } catch {}
}

export default {
  id: "compony",
  name: "Compony 公司协同",
  tools: [
    {
      name: "compony_state",
      description: "读取公司当前状态（员工/部门/任务/团队/会议/Git/问题库/审计/预算）",
      input: { type: "object" },
      run: async () => {
        const s = loadState();
        return {
          employees: Object.keys(s.employees).length,
          departments: Object.values(s.departments).map(d => ({ id: d.id, name: d.name, head: d.headId, size: d.members.length })),
          tasks: Object.values(s.tasks).map(t => ({ id: t.id, title: t.title, status: t.status, owner: t.owner, assignee: t.assignee, branch: t.branch, pr: t.pr?.status })),
          teams: Object.values(s.teams).map(t => ({ id: t.id, name: t.name, size: t.members.length, dissolved: !!t.dissolvedAt })),
          activeMeetings: Object.values(s.meetings).filter(m => !m.endedAt).length,
          openPRs: Object.values(s.tasks).filter(t => t.pr?.status === "open").length,
          pitfalls: s.pitfalls.length,
          audit: s.audit.slice(-5),
          burndown: s.burndown,
          budget: s.budget,
        };
      },
    },
    {
      name: "compony_hire",
      description: "招聘员工到指定部门（可提前设能力/皮肤/角色）",
      input: { type: "object", properties: { name: { type: "string" }, role: { type: "string", enum: ["product", "designer", "frontend", "backend", "qa", "lead"] }, dept: { type: "string" }, skill: { type: "number" }, avatar: { type: "string" } }, required: ["name", "role", "dept"] },
      run: async (a) => {
        const s = loadState();
        if (!s.departments[a.dept]) E.addDepartment(s, a.dept);
        const e = E.hireEmployee(s, a.name, a.role, a.dept, a.skill ?? 50, a.avatar ?? "cat_default");
        saveState(s);
        return { hired: e, skill: e.skill, dept: a.dept };
      },
    },
    {
      name: "compony_task",
      description: "创建任务到部门并拆解到具体员工（自动拉 Git 分支）",
      input: { type: "object", properties: { title: { type: "string" }, ownerDept: { type: "string" }, storyPoints: { type: "number" }, estTokens: { type: "number" } }, required: ["title", "ownerDept"] },
      run: async (a) => {
        const s = loadState();
        if (!s.departments[a.ownerDept]) E.addDepartment(s, a.ownerDept);
        const t = E.createTask(s, a.title, a.ownerDept, a.storyPoints ?? 1, a.estTokens);
        E.decomposeTask(s, t.id);
        saveState(s);
        return { task: t, assignee: s.employees[t.assignee] ? s.employees[t.assignee].name : undefined, branch: t.branch };
      },
    },
    {
      name: "compony_meeting",
      description: "发起跨部门会议（员工到会议室讨论，非任务分配）",
      input: { type: "object", properties: { title: { type: "string" }, participants: { type: "array", items: { type: "string" } } }, required: ["title", "participants"] },
      run: async (a) => {
        const s = loadState();
        const m = E.startMeeting(s, a.title, a.participants);
        saveState(s);
        return { meeting: m };
      },
    },
    {
      name: "compony_agile",
      description: "横向抽调不同部门员工组成敏捷小队",
      input: { type: "object", properties: { name: { type: "string" }, ownerTask: { type: "string" }, composition: { type: "object" } }, required: ["name", "ownerTask", "composition"] },
      run: async (a) => {
        const s = loadState();
        const team = E.formTeam(s, a.name, a.ownerTask, a.composition);
        saveState(s);
        return { team };
      },
    },
    {
      name: "compony_review",
      description: "强制代码审查：批准/打回 PR，触发冲突检测",
      input: { type: "object", properties: { prId: { type: "string" }, approve: { type: "boolean" }, comment: { type: "string" } }, required: ["prId", "approve"] },
      run: async (a) => {
        const s = loadState();
        E.reviewPR(s, a.prId, a.approve, a.comment ?? "");
        saveState(s);
        return { reviewed: a.prId, approve: a.approve };
      },
    },
    {
      name: "compony_pitfall",
      description: "记录踩坑到问题库（可检索复用）",
      input: { type: "object", properties: { title: { type: "string" }, context: { type: "string" }, lesson: { type: "string" }, tags: { type: "array", items: { type: "string" } } }, required: ["title", "lesson"] },
      run: async (a) => {
        const s = loadState();
        const p = E.recordPitfall(s, a.title, a.context ?? "", a.lesson, "system", a.tags ?? []);
        saveState(s);
        return { pitfall: p };
      },
    },
    {
      name: "compony_backup",
      description: "备份公司状态快照（防捣蛋鬼，可回溯）",
      input: { type: "object" },
      run: async () => {
        const s = loadState();
        const id = E.backup(s);
        saveState(s);
        return { backupId: id, stateFile: STATE_FILE };
      },
    },
    {
      name: "compony_cross_review",
      description: "交叉审查：另一位同事审查某任务（不能审查自己的），确保无人不可替代",
      input: {
        type: "object",
        properties: {
          taskId: { type: "string" },
          reviewerId: { type: "string" },
          approved: { type: "boolean" },
          note: { type: "string" },
        },
        required: ["taskId", "reviewerId", "approved"],
      },
      run: async (a) => {
        const s = loadState();
        const ok = E.crossReview(s, a.taskId, a.reviewerId, a.approved, a.note);
        saveState(s);
        return { reviewed: a.taskId, approved: a.approved, ok, coverage: E.crossReviewCoverage(s) + "%" };
      },
    },
    {
      name: "compony_media",
      description: "生成 UI 素材（文生图/图生图/文生视频，走 agnes-ai-image/agones-ai-video 技能，QuotaGuard 池）",
      input: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["image", "video"] },
          prompt: { type: "string" },
        },
        required: ["kind", "prompt"],
      },
      run: async (a) => {
        const s = loadState();
        const m = E.recordMedia(s, { kind: a.kind, prompt: a.prompt, url: "", model: a.kind === "image" ? "agnes-image-2.5-flash" : "agnes-video-2.5", createdById: "ui-designer" });
        saveState(s);
        return { media: m, note: "实际生成由 DSH 的 agnes-ai-image/agnes-ai-video 技能执行；本工具登记产物" };
      },
    },
  ],
};