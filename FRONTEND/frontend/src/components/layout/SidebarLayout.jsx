import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function SidebarLayout({
  title,
  navItems,
  children,
  onLogout,
  variant = "student", // "student" | "instructor"
}) {
  const location = useLocation();
  const { user } = useAuth();

  /* ======================
     COLOR CONTROL
  ====================== */
  const activeBg =
    variant === "student"
      ? "bg-orange-500 text-white"
      : "bg-blue-600 text-white";

  const roleColor =
    variant === "student" ? "text-orange-300" : "text-blue-300";

  return (
    <div className="min-h-screen flex">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 flex flex-col bg-gradient-to-b from-[#0B1220] to-[#111827] text-white">
        {/* APP TITLE */}
        <div className="px-6 py-5 text-xl font-bold border-b border-white/10">
          {title}
        </div>

        {/* ROLE LABEL (OPTIONAL, SAFE) */}
        {user && (
          <div className="px-6 pt-4">
            <p
              className={`text-xs uppercase tracking-wide ${roleColor}`}
            >
              {user.role}
            </p>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "block px-4 py-2 rounded-md text-sm font-medium transition",
                  isActive || location.pathname === item.to
                    ? activeBg
                    : "hover:bg-white/10",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-1 px-8 py-6 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}