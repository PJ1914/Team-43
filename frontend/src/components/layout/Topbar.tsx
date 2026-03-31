import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuthStore } from "../../hooks/useAuthStore";

const Topbar = () => {
  const profile = useAuthStore((state) => state.profile);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <p className="text-sm text-slate-500">Collaborative Weekly Report Management</p>
        <h2 className="text-lg font-bold text-slate-800">Welcome, {profile?.name ?? "User"}</h2>
      </div>
      <button
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        onClick={() => signOut(auth)}
      >
        Sign Out
      </button>
    </header>
  );
};

export default Topbar;
