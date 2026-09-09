import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

const groups = [
  {
    label: "Operations",
    links: [
      { to: "/", label: "Dashboard", icon: "📊", end: true },
      { to: "/stations", label: "Stations", icon: "🖥️" },
      { to: "/sessions", label: "Sessions", icon: "⏱️" },
      { to: "/pos", label: "POS & Extras", icon: "🧃" },
    ],
  },
  {
    label: "Billing & Inventory",
    links: [
      { to: "/payments", label: "Payments", icon: "💳" },
      { to: "/products", label: "Products & Stock", icon: "📦" },
    ],
  },
  {
    label: "Insights",
    links: [
      { to: "/customers", label: "Customers", icon: "👥" },
      { to: "/reports", label: "Reports", icon: "📈" },
    ],
  },
  {
    label: "Administration",
    admin: true,
    links: [
      { to: "/settings", label: "Settings", icon: "⚙️" },
      { to: "/users", label: "Staff", icon: "👤" },
    ],
  },
];

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="clock">
      <span>🕒</span>
      {now.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("sidebar-locked", open);
    return () => document.body.classList.remove("sidebar-locked");
  }, [open]);

  const initials = (user?.full_name || user?.username || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`app-shell ${open ? "sidebar-open" : ""}`}>
      <div className="backdrop" onClick={() => setOpen(false)} />
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">🖥️</span>
          <span>
            Cyber Cafe
            <small>Manager</small>
          </span>
        </div>
        <nav>
          {groups.map((g) =>
            g.admin && user?.role !== "admin"
              ? null
              : (
                <div key={g.label}>
                  <div className="nav-section">{g.label}</div>
                  {g.links.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      end={l.end}
                      title={l.label}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      <span className="nav-ico">{l.icon}</span>
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              )
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.full_name}</strong>
            <span className="role-badge">{user?.role}</span>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            ☰
          </button>
          <span className="brand" style={{ fontSize: 15 }}>
            <span className="brand-logo" style={{ width: 26, height: 26, fontSize: 14 }}>
              🖥️
            </span>
            Cyber Cafe
          </span>
          <div className="topbar-space" />
          <Clock />
          <div className="topbar-user">
            <span className="avatar">{initials}</span>
            <span className="who">
              <strong>{user?.full_name || user?.username}</strong>
              <span>{user?.role}</span>
            </span>
            <button className="btn ghost" onClick={logout}>
              Log out
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
