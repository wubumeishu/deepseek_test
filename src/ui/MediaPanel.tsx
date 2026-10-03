// 媒体生成面板：文生图/图生图/文生视频（agnes-ai-image / agnes-ai-video 技能）
import { useState } from "react";
import type { CompanyState } from "../types";

export function MediaPanel({ state, dispatch }: { state: CompanyState; dispatch: (a: string, p?: any) => void }) {
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<"image" | "video">("image");
  const media = (state.media || []).slice(-6).reverse();

  function submit() {
    if (!prompt.trim()) return;
    dispatch("record_media", { kind, prompt, url: "", model: kind === "image" ? "agnes-image-2.5-flash" : "agnes-video-2.5" });
    setPrompt("");
  }

  return (
    <section className="compony-media" aria-label="媒体生成">
      <h3>🎨 UI 生成（文生图/文生视频）</h3>
      <div className="kind-toggle">
        <button className={"btn" + (kind === "image" ? " on" : "")} onClick={() => setKind("image")}>🖼 图</button>
        <button className={"btn" + (kind === "video" ? " on" : "")} onClick={() => setKind("video")}>🎬 视频</button>
      </div>
      <div className="media-form">
        <input className="input" value={prompt} onChange={e => setPrompt(e.target.value)}
               placeholder="描述要生成的素材（员工皮肤/看板封面…）" />
        <button className="btn btn-primary" onClick={submit}>生成</button>
      </div>
      {media.length > 0 && (
        <div className="media-list">
          <b>最近生成：</b>
          <ul>
            {media.map(m => (
              <li key={m.id}>{m.kind === "image" ? "🖼" : "🎬"} {m.prompt} <i>({m.model})</i></li>
            ))}
          </ul>
        </div>
      )}
      <p className="quota-hint">走 agnes-ai-image / agnes-ai-video 技能（QuotaGuard 号池 127.0.0.1:8901）</p>
    </section>
  );
}
