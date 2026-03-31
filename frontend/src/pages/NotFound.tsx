import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="rounded-2xl bg-white p-8 text-center shadow-panel">
        <h1 className="text-3xl font-bold text-slate-800">404</h1>
        <p className="mt-2 text-slate-500">The page you requested was not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
