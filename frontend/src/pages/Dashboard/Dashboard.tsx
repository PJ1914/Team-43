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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl lg:rounded-2xl bg-white p-4 sm:p-5 lg:p-6 shadow-panel">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">Dashboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isFaculty && `Track ${profile?.department} reports`}
            {isCoordinator && "Manage departmental reports"}
            {isAdmin && "Monitor all reports"}
          </p>
        </div>
        {(isFaculty || isCoordinator) && (
          <Link to="/report/select-week" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition whitespace-nowrap text-center">
            + New Report
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
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {reports.map((report) => (
              <div key={report.reportId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-brand-700">{report.department}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{report.startDate} to {report.endDate}</p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-brand-600" style={{ width: `${(report.completedSections / report.totalSections) * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-600">{report.completedSections}/{report.totalSections}</span>
                </div>
                <Link 
                  className="block text-center rounded-lg bg-brand-100 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-200 transition" 
                  to={`/report/${report.reportId}`}
                >
                  {isFaculty ? "View & Edit" : "Review"}
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
            <div className="overflow-x-auto">
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
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
