import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/employees", label: "Employees" },
  { to: "/insights", label: "Insights" },
];

export function Layout() {
  const { logout, timescale, setTimescale } = useAuth();

  return (
    <div className="min-h-screen flex font-sans">
      <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <h1 className="text-lg font-semibold font-display">ACME Salary</h1>
          <p className="text-xs text-muted mt-0.5">HR Manager Console</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-bg hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6">
          {/* Segmented Pay timescale toggle control */}
          <div className="flex items-center bg-bg rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setTimescale("annual")}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
                timescale === "annual"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Annual
            </button>
            <button
              onClick={() => setTimescale("monthly")}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
                timescale === "monthly"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">Signed in as HR Manager</span>
            <button
              onClick={logout}
              className="text-xs font-semibold text-muted hover:text-ink px-2.5 py-1.5 rounded-lg border border-border hover:bg-bg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-bg/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
