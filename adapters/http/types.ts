// M3 领域能力端口契约
export interface CapabilityPort {
  /** 能力标识（state/hire/task/...） */
  id: string;
  /** 引擎侧入口（纯函数或描述） */
  engine: string;
  /** HTTP 路由 */
  route: string;
  /** HTTP 方法 */
  method: "GET" | "POST" | "DELETE";
  /** 人类可读说明 */
  desc: string;
}
