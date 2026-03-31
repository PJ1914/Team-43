import { useEffect } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { useReportStore } from "../../hooks/useReportStore";

const ReviewReports = () => {
  const { reports, loadingReports, loadReports } = useReportStore();

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  if (loadingReports) {
    return <Spinner label="Loading reports..." />;
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-panel">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Review Reports</h1>
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Week</th>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Completion</th>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Status</th>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Preview</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.reportId} className="border-t border-slate-200">
              <td className="px-4 py-3 text-sm">{report.startDate} to {report.endDate}</td>
              <td className="px-4 py-3 text-sm">{report.completedSections}/{report.totalSections}</td>
              <td className="px-4 py-3 text-sm"><StatusBadge status={report.status} /></td>
              <td className="px-4 py-3 text-sm">
                <Link className="rounded-lg bg-brand-100 px-3 py-2 text-xs font-semibold text-brand-700" to={`/report/${report.reportId}/preview`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewReports;
