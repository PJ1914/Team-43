import { Link } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { useReportStore } from "../../hooks/useReportStore";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useEffect } from "react";

const Dashboard = () => {
  const { reports, loadingReports, loadReports } = useReportStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const userRole = profile?.role || "faculty";
  const isAdmin = userRole === "admin";
  const isCoordinator = userRole === "coordinator";
  const isFaculty = userRole === "faculty";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-panel">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Weekly Reports Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isFaculty && `Track progress for ${profile?.department} department reports.`}
            {isCoordinator && "Review and manage all departmental reports."}
            {isAdmin && "Monitor and manage all reports across departments."}
          </p>
        </div>
        {(isFaculty || isCoordinator) && (
          <Link to="/report/select-week" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            + Create Weekly Report
          </Link>
        )}
      </div>

      {loadingReports ? (
        <Spinner label="Loading reports..." />
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold text-slate-700">No Weekly Reports Yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              {isFaculty && "Create your first weekly report to start tracking departmental activities across all 17 sections."}
              {isCoordinator && "No reports have been created yet. Create a report to start tracking activities."}
              {isAdmin && "No reports in the system. Faculty and coordinators can create reports."}
            </p>
            {(isFaculty || isCoordinator) && (
              <Link to="/report/select-week" className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Create First Report
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Week Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.reportId}>
                  <td className="px-4 py-3 text-sm font-semibold text-brand-700">{report.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{report.startDate} to {report.endDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-brand-600" style={{ width: `${(report.completedSections / report.totalSections) * 100}%` }}></div>
                      </div>
                      <span className="text-xs">{report.completedSections}/{report.totalSections}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm"><StatusBadge status={report.status} /></td>
                  <td className="px-4 py-3 text-sm">
                    <Link className="rounded-lg bg-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-200" to={`/report/${report.reportId}`}>
                      {isFaculty ? "View & Edit" : "Review"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
