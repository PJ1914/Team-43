import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import AppShell from "./components/layout/AppShell";
import Spinner from "./components/ui/Spinner";
import { initAuthListener, useAuthStore } from "./hooks/useAuthStore";
import { useConfigStore } from "./hooks/useConfigStore";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import SelectWeek from "./pages/Report/SelectWeek";
import ReportHome from "./pages/Report/ReportHome";
import SectionPage from "./pages/Sections/SectionPage";
import ReportPreview from "./pages/Preview/ReportPreview";
import ManageUsers from "./pages/Admin/ManageUsers";
import ReviewReports from "./pages/Admin/ReviewReports";
import NotFound from "./pages/NotFound";
import { Role } from "./types";

const Protected = () => {
  const { firebaseUser, isLoading } = useAuthStore();
  if (isLoading) {
    return <div className="p-8"><Spinner label="Checking session..." /></div>;
  }
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const RoleProtected = ({ roles }: { roles: Role[] }) => {
  const profile = useAuthStore((state) => state.profile);
  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const App = () => {
  const loadConfig = useConfigStore((state) => state.loadConfig);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    // Load configuration on app start
    void loadConfig();
    return () => unsubscribe();
  }, [loadConfig]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Protected />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report/select-week" element={<SelectWeek />} />
          <Route path="/report/:weekId" element={<ReportHome />} />
          <Route path="/report/:weekId/section/:sectionId" element={<SectionPage />} />
          <Route path="/report/:weekId/preview" element={<ReportPreview />} />

          <Route element={<RoleProtected roles={["admin", "coordinator"]} />}>
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/reports" element={<ReviewReports />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
