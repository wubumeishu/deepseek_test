// 入口：HashRouter（静态部署友好，无需服务端 SPA 重写）+ 懒加载页面 + 布局壳
// hooks 一律从 "react" 导入（ESLint 守卫，防白屏事故）
// M2.3: 面板不再 import engine，改走 API（apps/server）
import { createRoot } from "react-dom/client";
import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./styles/tokens.css";
import "./styles/panel.css";
import { Layout } from "./ui/layout/Layout";
import { initCompany, startSSE } from "./state/companyStore";

const HomePage = lazy(() => import("./pages/HomePage"));
const BuildingPage = lazy(() => import("./pages/BuildingPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const MeetingsPage = lazy(() => import("./pages/MeetingsPage"));
const CoffeePage = lazy(() => import("./pages/CoffeePage"));
const QuotaPage = lazy(() => import("./pages/QuotaPage"));
const MediaPage = lazy(() => import("./pages/MediaPage"));

// API 初始化：拉取首屏 state + 建立 SSE 长连接
function useApiBootstrap() {
  useEffect(() => {
    let cancelled = false;
    initCompany()
      .then(() => { if (!cancelled) startSSE(); })
      .catch(() => { /* API 不可达时静默降级（面板显示空白） */ });
    return () => { cancelled = true; };
  }, []);
}

function App() {
  useApiBootstrap();
  return (
    <HashRouter>
      <Suspense fallback={<div className="empty-page">加载中…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="building" element={<BuildingPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="coffee" element={<CoffeePage />} />
            <Route path="quota" element={<QuotaPage />} />
            <Route path="media" element={<MediaPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
