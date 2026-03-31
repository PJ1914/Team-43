import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../hooks/useAuthStore";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { profile } = useAuthStore();
  const userRole = profile?.role || "faculty";

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "coordinator", "faculty"] },
    { to: "/report/select-week", label: "Create Report", icon: "📝", roles: ["coordinator", "faculty"] },
    { to: "/admin/users", label: "Users", icon: "👥", roles: ["admin", "coordinator"] },
    { to: "/admin/reports", label: "Reviews", icon: "✓", roles: ["admin", "coordinator"] },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-72 border-r border-slate-200 bg-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
      <div className="p-4 lg:p-5">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-extrabold text-brand-700">BVRIT</h1>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            ✕
          </button>
        </div>
        
        <nav className="space-y-1.5">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span className="truncate">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* User info badge */}
      {profile && (
        <div className="mt-auto p-4 lg:p-5 border-t border-slate-200">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">User</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{profile.name}</p>
            <p className="text-xs text-slate-600 truncate">{profile.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                {profile.role}
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {profile.department}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
};

export default Sidebar;
