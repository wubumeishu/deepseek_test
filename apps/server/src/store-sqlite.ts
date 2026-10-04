// M3 持久化适配器：node:sqlite（Node 24 内置，零第三方依赖）。
// 替换 DSH host 的 ~/.compony/state.json —— 服务端不再依赖任何宿主即可完整运行。
import { DatabaseSync } from "node:sqlite";
import type { CompanyState, StateStore } from "../../../packages/protocol/src/index.ts";

export interface SqliteStoreOptions {
  /** 数据库文件路径（默认 compony.sqlite） */
  filePath?: string;
}

export class SqliteStore implements StateStore {
  private db: InstanceType<typeof DatabaseSync>;

  constructor(opts: SqliteStoreOptions = {}) {
    this.db = new DatabaseSync(opts.filePath ?? "compony.sqlite");
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, state TEXT NOT NULL, updated_at INTEGER NOT NULL);" +
      "CREATE TABLE IF NOT EXISTS backups (id TEXT PRIMARY KEY, state TEXT NOT NULL, created_at INTEGER NOT NULL);"
    );
    this.db.exec("PRAGMA journal_mode = WAL;");
  }

  load(sessionId: string): CompanyState | null {
    const row = this.db
      .prepare("SELECT state FROM sessions WHERE id = ?")
      .get(sessionId) as { state: string } | undefined;
    return row ? (JSON.parse(row.state) as CompanyState) : null;
  }

  save(sessionId: string, state: CompanyState): void {
    this.db
      .prepare("INSERT OR REPLACE INTO sessions (id, state, updated_at) VALUES (?, ?, ?)")
      .run(sessionId, JSON.stringify(state), Date.now());
  }

  delete(sessionId: string): void {
    this.db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  }

  backup(state: CompanyState): string {
    const id = "bk_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    this.db
      .prepare("INSERT INTO backups (id, state, created_at) VALUES (?, ?, ?)")
      .run(id, JSON.stringify(state), Date.now());
    return id;
  }

  listBackups(): { id: string; created_at: number }[] {
    return this.db
      .prepare("SELECT id, created_at FROM backups ORDER BY created_at DESC")
      .all() as { id: string; created_at: number }[];
  }

  close(): void {
    this.db.close();
  }
}
