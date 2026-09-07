import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/stations", label: "Stations" },
  { to: "/sessions", label: "Sessions" },
  { to: "/pos", label: "POS & Extras" },
  { to: "/customers", label: "Customers" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">🖥️ Cyber Cafe</div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.full_name}</strong>
            <span className="role-badge">{user?.role}</span>
          </div>
          <button className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
