// 布局壳：侧边导航 + 顶栏控制 + 路由内容区
import { NavLink, Outlet } from "react-router-dom";
import { useUI, useApplyTheme, dispatch } from "../../state/companyStore";

const NAV = [
  { to: "/", label: "总览", icon: "🏢" },
  { to: "/building", label: "大楼 / 工位", icon: "🏬" },
  { to: "/tasks", label: "任务看板", icon: "📋" },
  { to: "/meetings", label: "会议室", icon: "💬" },
  { to: "/coffee", label: "咖啡室", icon: "☕" },
  { to: "/quota", label: "资源配额", icon: "⚡" },
  { to: "/media", label: "媒体生成", icon: "🎨" },
];

export function Layout() {
  const { startSim, stopSim, simRunning, theme, toggleTheme, standupLines } = useUI();
  useApplyTheme(theme);
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand"><span className="logo">🏢</span><span>Compony 公司协同</span></div>
        <nav className="app-nav" aria-label="主导航">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}
                     className={({ isActive }) => (isActive ? "active" : "").trim()}>
              <span aria-hidden="true">{n.icon}</span><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙 暗色" : "☀️ 亮色"}
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <button className={simRunning ? "btn btn-danger" : "btn btn-primary"}
                  onClick={() => (simRunning ? stopSim() : startSim())}>
            {simRunning ? "⏸ 暂停模拟" : "▶ 开始模拟"}
          </button>
          <button className="btn" onClick={() => dispatch("standup")}>📋 每日站会</button>
          <div className="grow" />
        </header>
        {standupLines.length > 0 && (
          <div className="standup-banner">
            <b>📋 站会纪要（{new Date().toISOString().slice(0, 10)}）</b>
            <ul>{standupLines.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </div>
        )}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
