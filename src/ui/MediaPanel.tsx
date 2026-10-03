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
    <section className="compony-media" aria-label="媒体生成" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
      <h3>🎨 UI 生成（文生图/文生视频）</h3>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        <button onClick={() => setKind("image")} style={{ background: kind === "image" ? "#4caf50" : "#eee", color: kind === "image" ? "#fff" : "#333", border: "none", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>🖼 图</button>
        <button onClick={() => setKind("video")} style={{ background: kind === "video" ? "#4caf50" : "#eee", color: kind === "video" ? "#fff" : "#333", border: "none", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>🎬 视频</button>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="描述要生成的素材（员工皮肤/看板封面…）"
          style={{ flex: 1, padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12 }}
        />
        <button onClick={submit} style={{ padding: "4px 12px", background: "#2196f3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>生成</button>
      </div>
      {media.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <b style={{ fontSize: 11 }}>最近生成：</b>
          <ul style={{ fontSize: 11, paddingLeft: 16, margin: "4px 0" }}>
            {media.map(m => (
              <li key={m.id}>
                {m.kind === "image" ? "🖼" : "🎬"} {m.prompt} <i style={{ color: "#999" }}>({m.model})</i>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p style={{ fontSize: 10, color: "#888", margin: "4px 0 0" }}>
        走 agnes-ai-image / agnes-ai-video 技能（QuotaGuard 号池 127.0.0.1:8901）
      </p>
    </section>
  );
}
