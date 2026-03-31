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
    { 
      to: "/dashboard", 
      label: "Dashboard", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      roles: ["admin", "coordinator", "faculty"] 
    },
    { 
      to: "/report/select-week", 
      label: "Create Report", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      roles: ["coordinator", "faculty"] 
    },
    { 
      to: "/admin/users", 
      label: "Users", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      roles: ["admin", "coordinator"] 
    },
    { 
      to: "/admin/reports", 
      label: "Reviews", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      roles: ["admin", "coordinator"] 
    },
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
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
              {link.icon}
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
