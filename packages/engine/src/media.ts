// 媒体生成：文生图/图生图/文生视频（agnes-ai-image / agnes-ai-video 技能）
import type { CompanyState, MediaAsset } from "@compony/protocol";

// 通过 DSH 的 agnes-ai-image / agnes-ai-video 技能生成
// 实际调用由 host 工具或前端 fetch 走；引擎只记录产物
export function recordMedia(s: CompanyState, a: Omit<MediaAsset, "id" | "createdAt">): MediaAsset {
  const m: MediaAsset = { id: "m_" + Math.random().toString(36).slice(2, 8), createdAt: Date.now(), ...a };
  s.media = s.media || [];
  s.media.push(m);
  return m;
}

export function listMedia(s: CompanyState, kind?: MediaAsset["kind"]): MediaAsset[] {
  const arr = s.media || [];
  return kind ? arr.filter(m => m.kind === kind) : arr;
}