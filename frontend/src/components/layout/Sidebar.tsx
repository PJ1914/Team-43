import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../hooks/useAuthStore";

const Sidebar = () => {
  const { profile } = useAuthStore();
  const userRole = profile?.role || "faculty";

  const links = [
    { to: "/dashboard", label: "Dashboard", roles: ["admin", "coordinator", "faculty"] },
    { to: "/report/select-week", label: "Create Weekly Report", roles: ["coordinator", "faculty"] },
    { to: "/admin/users", label: "Manage Users", roles: ["admin", "coordinator"] },
    { to: "/admin/reports", label: "Review Reports", roles: ["admin", "coordinator"] },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(userRole));

  return (
    <aside className="w-72 border-r border-slate-200 bg-white p-5">
      <h1 className="mb-8 text-2xl font-extrabold text-brand-700">BVRIT BuildSphere</h1>
      <nav className="space-y-2">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      
      {/* User info badge */}
      {profile && (
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current User</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{profile.name}</p>
          <p className="text-xs text-slate-600">{profile.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {profile.role}
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {profile.department}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
