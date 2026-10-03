// 公司多智能体协同系统 - 共享类型定义
export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  skill: number;
  status: "working" | "resting" | "meeting" | "cooling" | "idle";
  avatar: string;
  coolingUntil?: number;
  tasksDone: number;
  tokensSpent: number;
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
  members: string[];
  constraints: string;
  tools: string[];
}

export interface Meeting {
  id: string;
  title: string;
  participants: string[];
  minutes: MeetingMinute[];
  startedAt: number;
  endedAt?: number;
}

export interface MeetingMinute {
  at: number;
  employeeId: string;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  assignee?: string;
  branch?: string;
  status: "backlog" | "todo" | "in_progress" | "in_review" | "done" | "rejected";
  pr?: PullRequest;
  estTokens?: number;
  storyPoints: number;
  parentTeam?: string;
}

export interface PullRequest {
  id: string;
  branch: string;
  author: string;
  reviewer: string;
  status: "open" | "approved" | "rejected" | "merged";
  comments: string[];
}

export interface AgileTeam {
  id: string;
  name: string;
  members: string[];
  ownerTask: string;
  formedAt: number;
  dissolvedAt?: number;
}

export interface GitState {
  branches: Record<string, { head: string; base: string }>;
  trunk: string;
  conflicts: Record<string, { branchA: string; branchB: string; file: string }>;
}

export interface Pitfall {
  id: string;
  title: string;
  context: string;
  lesson: string;
  addedBy: string;
  addedAt: number;
  tags: string[];
}

export interface AuditLog {
  at: number;
  actor: string;
  action: string;
  detail: string;
  checksum?: string;
}

export interface CompanyState {
  employees: Record<string, Employee>;
  departments: Record<string, Department>;
  meetings: Record<string, Meeting>;
  tasks: Record<string, Task>;
  teams: Record<string, AgileTeam>;
  git: GitState;
  pitfalls: Pitfall[];
  audit: AuditLog[];
  budget: {
    requestsPerMin: number;
    burst: number;
    usedMin: number;
    usedBurst: number;
    resetMinAt: number;
    resetBurstAt: number;
  };
  burndown: { total: number; done: number };
}
