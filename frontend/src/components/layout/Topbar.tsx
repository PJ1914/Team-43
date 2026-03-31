import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuthStore } from "../../hooks/useAuthStore";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const profile = useAuthStore((state) => state.profile);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Weekly Reports</p>
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 truncate">
            {profile?.name ?? "User"}
          </h2>
        </div>
      </div>
      <button
        className="rounded-lg bg-slate-800 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-700 transition flex-shrink-0"
        onClick={() => signOut(auth)}
      >
        <span className="hidden sm:inline">Sign Out</span>
        <span className="sm:hidden">Sign Out</span>
      </button>
    </header>
  );
};

export default Topbar;
